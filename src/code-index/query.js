/**
 * Code index queries - references, callers and file dependencies from a SCIP index
 *
 * Reads `<project>/.scip/index.scip` (built by ./indexer.js) and answers "who references /
 * calls / instantiates / requires X" and file dependency questions with compiler-accurate
 * cross-file resolution, including CommonJS `module.exports = { X }`.
 *
 * CLI: bin/musubi-code.js (`musubi-code refs|callers|deps|dependents|symbols`).
 *
 * @module code-index/query
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ensureFresh, toPosix } = require('./indexer');

const BINDINGS_MODULE = '@sourcegraph/scip-typescript/dist/src/scip.js';
const DEFINITION_ROLE = 1;
const NON_ENTITY_KINDS = new Set(['module', 'parameter', 'type-parameter']);
const CALL_LIKE_TAGS = new Set(['new', 'extends', 'call', 'ref', 'super']);

// ---------------------------------------------------------------------------
// SCIP symbol grammar: <scheme> ' ' <manager> ' ' <package> ' ' <version> ' ' <descriptors>
// ---------------------------------------------------------------------------

const SIMPLE_NAME_CHAR = /[A-Za-z0-9_+\-$]/;

/**
 * Parse the descriptor part of a SCIP symbol.
 * @param {string} text
 * @returns {Array<{name: string, kind: string, disambiguator?: string}>|null}
 */
function parseDescriptors(text) {
  const out = [];
  let i = 0;
  const readName = () => {
    if (text[i] === '`') {
      let name = '';
      i += 1;
      while (i < text.length) {
        if (text[i] === '`') {
          if (text[i + 1] === '`') {
            name += '`';
            i += 2;
            continue;
          }
          i += 1;
          return name;
        }
        name += text[i];
        i += 1;
      }
      return null;
    }
    let name = '';
    while (i < text.length && SIMPLE_NAME_CHAR.test(text[i])) {
      name += text[i];
      i += 1;
    }
    return name;
  };

  while (i < text.length) {
    if (text[i] === '[' || text[i] === '(') {
      const close = text[i] === '[' ? ']' : ')';
      const kind = text[i] === '[' ? 'typeParameter' : 'parameter';
      i += 1;
      const name = readName();
      if (name === null || text[i] !== close) return null;
      i += 1;
      out.push({ name, kind });
      continue;
    }
    const name = readName();
    if (name === null || name === '') return null;
    const suffix = text[i];
    const simple = { '/': 'namespace', '#': 'type', '.': 'term', ':': 'meta', '!': 'macro' };
    if (simple[suffix]) {
      out.push({ name, kind: simple[suffix] });
      i += 1;
    } else if (suffix === '(') {
      let disambiguator = '';
      i += 1;
      while (i < text.length && text[i] !== ')') {
        disambiguator += text[i];
        i += 1;
      }
      if (text[i] !== ')' || text[i + 1] !== '.') return null;
      i += 2;
      out.push({ name, kind: 'method', disambiguator });
    } else {
      return null;
    }
  }
  return out;
}

/**
 * Parse a SCIP symbol string. Returns null for local symbols.
 * @param {string} symbol
 * @returns {{scheme: string, manager: string, package: string, version: string, descriptors: Array}|null}
 */
function parseSymbol(symbol) {
  if (!symbol || symbol.startsWith('local ')) return null;
  const header = [];
  let i = 0;
  while (header.length < 4) {
    let field = '';
    for (;;) {
      if (i >= symbol.length) return null;
      if (symbol[i] === ' ') {
        if (symbol[i + 1] === ' ') {
          field += ' ';
          i += 2;
          continue;
        }
        i += 1;
        break;
      }
      field += symbol[i];
      i += 1;
    }
    header.push(field);
  }
  const descriptors = parseDescriptors(symbol.slice(i));
  if (!descriptors) return null;
  const [scheme, manager, pkg, version] = header;
  return { scheme, manager, package: pkg, version, descriptors };
}

/**
 * scip-typescript appends a counter to object-literal property names (`name0:`).
 * @param {string} metaName
 * @param {string} name
 */
function metaNameMatches(metaName, name) {
  return metaName.startsWith(name) && /^\d+$/.test(metaName.slice(name.length));
}

function stripMetaCounter(metaName) {
  const stripped = metaName.replace(/\d+$/, '');
  return stripped || metaName;
}

/**
 * Human-oriented description of a parsed symbol.
 * @param {object} parsed - result of parseSymbol
 * @returns {{file: string, names: string[], kind: string, lastKind: string|null, display: string}}
 */
function describeSymbol(parsed) {
  const descriptors = parsed.descriptors;
  let k = 0;
  const namespaces = [];
  while (k < descriptors.length && descriptors[k].kind === 'namespace') {
    namespaces.push(descriptors[k].name);
    k += 1;
  }
  const members = descriptors.slice(k);
  const named = members.filter(d => d.kind !== 'parameter' && d.kind !== 'typeParameter');
  const last = members[members.length - 1] || null;
  let kind;
  if (!last) kind = 'module';
  else if (last.kind === 'parameter') kind = 'parameter';
  else if (last.kind === 'typeParameter') kind = 'type-parameter';
  else if (last.kind === 'type') kind = 'class';
  else if (last.kind === 'method') {
    if (last.name === '<constructor>') kind = 'constructor';
    else kind = named.length > 1 ? 'method' : 'function';
  } else if (last.kind === 'term') kind = named.length > 1 ? 'property' : 'variable';
  else if (last.kind === 'meta') kind = 'property';
  else kind = last.kind;

  const names = named.map(d => d.name);
  const shown = named.map(d =>
    d.kind === 'meta'
      ? stripMetaCounter(d.name)
      : d.name === '<constructor>'
        ? 'constructor'
        : d.name
  );
  return {
    file: namespaces.join('/'),
    names,
    kind,
    lastKind: last ? last.kind : null,
    display: shown.join('.') || namespaces.join('/'),
  };
}

/**
 * Split a query such as `Foo`, `Foo.bar`, `Foo#bar` or `Foo.constructor`.
 * @param {string} query
 * @returns {string[]}
 */
function splitQuery(query) {
  return String(query)
    .split(/[.#]/)
    .filter(Boolean)
    .map(part => (part === 'constructor' ? '<constructor>' : part));
}

function namesMatch(info, parts) {
  if (info.names.length < parts.length) return false;
  const offset = info.names.length - parts.length;
  return parts.every((part, j) => {
    const name = info.names[offset + j];
    if (name === part) return true;
    const isLast = j === parts.length - 1;
    return isLast && info.lastKind === 'meta' && metaNameMatches(name, part);
  });
}

/**
 * Tag a reference by its syntactic role. The reference itself is compiler-resolved;
 * the tag is a reading aid derived from the surrounding source text.
 * @param {string[]} lines - source lines of the file
 * @param {number} line - zero-based line
 * @param {number} startCol
 * @param {number} endCol
 * @param {string} kind - kind of the referenced symbol
 * @returns {string}
 */
function classifyReference(lines, line, startCol, endCol, kind) {
  const text = lines[line] || '';
  const before = text.slice(0, startCol);
  const after = text.slice(endCol);
  const token = text.slice(startCol, endCol);

  if (kind === 'module') {
    if (/\brequire\s*\(\s*$/.test(before)) return 'require';
    if (
      /\bimport\s*\(\s*$/.test(before) ||
      /\bfrom\s*$/.test(before) ||
      /^\s*import\b/.test(text)
    ) {
      return 'import';
    }
    return 'ref';
  }
  if (token === 'super') return 'super';
  if (/\bnew\s+(?:[\w$]+\.)*$/.test(before)) return 'new';
  if (/\bextends\s+(?:[\w$]+\.)*$/.test(before)) return 'extends';
  if (/^\s*import\b/.test(text)) return 'import';
  if (/\brequire\s*\(/.test(after) && /^\s*(?:const|let|var)\b/.test(text)) return 'require';
  if (/(?:^|[^\w$.])(?:module\.)?exports\b/.test(before)) return 'export';
  if (/^\s*(?:\?\.)?\(/.test(after) || /^\s*\.(?:call|apply|bind)\s*\(/.test(after)) return 'call';

  // A bare name inside a multi-line `const { ... } = require()`, import or `module.exports = {`.
  if (/^\s*[\w$]+\s*(?::\s*[\w$]+\s*)?,?\s*$/.test(text)) {
    for (let j = line - 1; j >= 0 && j >= line - 60; j--) {
      const previous = lines[j];
      if (/(?:^|[^\w$.])(?:module\.)?exports\s*=\s*\{\s*$/.test(previous)) return 'export';
      if (/^\s*(?:const|let|var)\s*\{\s*$/.test(previous) || /^\s*import\s*\{\s*$/.test(previous)) {
        for (let n = line; n < lines.length && n <= line + 60; n++) {
          if (/}\s*=\s*require\s*\(/.test(lines[n])) return 'require';
          if (/}\s*from\s*['"]/.test(lines[n])) return 'import';
          if (/}/.test(lines[n])) break;
        }
        break;
      }
      if (/[{}]/.test(previous)) break;
    }
  }
  return 'ref';
}

// ---------------------------------------------------------------------------
// Index model
// ---------------------------------------------------------------------------

function toRange(r) {
  return r.length === 3
    ? { sl: r[0], sc: r[1], el: r[0], ec: r[2] }
    : { sl: r[0], sc: r[1], el: r[2], ec: r[3] };
}

function rangeContains(range, line, col) {
  const afterStart = line > range.sl || (line === range.sl && col >= range.sc);
  const beforeEnd = line < range.el || (line === range.el && col <= range.ec);
  return afterStart && beforeEnd;
}

/**
 * Load the generated protobuf bindings that ship with scip-typescript.
 * @param {string} root
 */
function loadBindings(root) {
  let modulePath;
  try {
    modulePath = require.resolve(BINDINGS_MODULE, { paths: [__dirname, root] });
  } catch {
    throw new Error(
      '@sourcegraph/scip-typescript is missing from the MUSUBI installation; reinstall MUSUBI'
    );
  }
  const bindings = require(modulePath);
  if (!bindings.scip || !bindings.scip.Index) {
    throw new Error(
      `${BINDINGS_MODULE} no longer exports scip.Index; pin scip-typescript to 0.4.x`
    );
  }
  return bindings.scip;
}

/**
 * Build the in-memory model from a decoded SCIP index.
 * @param {object} index - scip.Index
 * @param {string} root - project root, used to read source lines
 */
function buildModel(index, root) {
  const docs = new Map();
  const definitions = new Map();
  const references = new Map();
  for (const document of index.documents) {
    const file = document.relative_path.replace(/\\/g, '/');
    const doc = { file, defs: [], refs: [], moduleSymbol: null, scopes: null };
    docs.set(file, doc);
    for (const occurrence of document.occurrences) {
      const symbol = occurrence.symbol;
      if (!symbol || symbol.startsWith('local ')) continue;
      const range = toRange(occurrence.range);
      if (occurrence.symbol_roles & DEFINITION_ROLE) {
        const enclosing = occurrence.enclosing_range;
        const def = {
          symbol,
          file,
          range,
          enclosing: enclosing && enclosing.length ? toRange(enclosing) : null,
        };
        if (!definitions.has(symbol)) definitions.set(symbol, def);
        doc.defs.push(def);
        if (symbol.endsWith('/') && !doc.moduleSymbol) doc.moduleSymbol = symbol;
      } else {
        const ref = { symbol, file, range };
        doc.refs.push(ref);
        if (!references.has(symbol)) references.set(symbol, []);
        references.get(symbol).push(ref);
      }
    }
  }
  const model = { root, docs, definitions, references, infoCache: new Map(), lineCache: new Map() };
  model.projectPackages = new Set();
  for (const symbol of definitions.keys()) {
    const info = symbolInfo(model, symbol);
    if (info) model.projectPackages.add(info.package);
  }
  return model;
}

function symbolInfo(model, symbol) {
  if (!model.infoCache.has(symbol)) {
    const parsed = parseSymbol(symbol);
    model.infoCache.set(
      symbol,
      parsed ? { ...describeSymbol(parsed), package: parsed.package } : null
    );
  }
  return model.infoCache.get(symbol);
}

function sourceLines(model, file) {
  if (!model.lineCache.has(file)) {
    let lines = [];
    try {
      lines = fs.readFileSync(path.join(model.root, file), 'utf8').split(/\r?\n/);
    } catch {
      // File deleted since indexing.
    }
    model.lineCache.set(file, lines);
  }
  return model.lineCache.get(file);
}

/**
 * Innermost named definition (function, method, class, ...) whose body contains a position.
 */
function enclosingDefinition(model, file, line, col) {
  const doc = model.docs.get(file);
  if (!doc) return null;
  if (!doc.scopes) {
    doc.scopes = doc.defs
      .filter(def => {
        if (!def.enclosing) return false;
        const info = symbolInfo(model, def.symbol);
        return info && !NON_ENTITY_KINDS.has(info.kind);
      })
      .map(def => ({
        def,
        size:
          (def.enclosing.el - def.enclosing.sl) * 100000 + (def.enclosing.ec - def.enclosing.sc),
      }))
      .sort((a, b) => a.size - b.size);
  }
  const scope = doc.scopes.find(s => rangeContains(s.def.enclosing, line, col));
  return scope ? scope.def : null;
}

function isExportDefinition(model, def) {
  const text = sourceLines(model, def.file)[def.range.sl] || '';
  if (/(?:^|[^\w$.])(?:module\.)?exports\b/.test(text)) return true;
  return (
    classifyReference(
      sourceLines(model, def.file),
      def.range.sl,
      def.range.sc,
      def.range.ec,
      ''
    ) === 'export'
  );
}

/**
 * `const Name = require('./x')` and import bindings are aliases of another file's export.
 */
function isAliasBinding(model, def, info) {
  if (info.kind !== 'variable') return false;
  const text = sourceLines(model, def.file)[def.range.sl] || '';
  return /\brequire\s*\(/.test(text) || /^\s*import\b/.test(text);
}

/**
 * Resolve a query to definitions in the index, grouping a class with its constructor
 * and with the `module.exports = { Name }` property that destructured requires point to.
 * @returns {Array<{symbol: string, def: object, info: object, related: Array<{symbol: string, role: string}>, defaultExportOf: string|null}>}
 */
function findEntities(model, query, { file = null, includeProperties = false } = {}) {
  const parts = splitQuery(query);
  if (parts.length === 0) return [];
  const fileFilter = file ? toPosix(file).replace(/^\.\//, '') : null;
  const matched = [];
  for (const [symbol, def] of model.definitions) {
    const info = symbolInfo(model, symbol);
    if (!info || NON_ENTITY_KINDS.has(info.kind)) continue;
    if (fileFilter && !def.file.includes(fileFilter)) continue;
    if (!namesMatch(info, parts)) continue;
    if (info.lastKind === 'meta' && !includeProperties && !isExportDefinition(model, def)) continue;
    matched.push({ symbol, def, info });
  }

  const entities = matched
    .filter(m => m.info.lastKind !== 'meta')
    .map(m => ({ ...m, related: [], defaultExportOf: null }));
  for (const meta of matched.filter(m => m.info.lastKind === 'meta')) {
    const metaName = meta.info.names[meta.info.names.length - 1];
    const host = entities.find(
      e =>
        e.def.file === meta.def.file &&
        e.info.names.length === 1 &&
        metaNameMatches(metaName, e.info.names[0])
    );
    if (host) host.related.push({ symbol: meta.symbol, role: 'export' });
    else entities.push({ ...meta, related: [], defaultExportOf: null });
  }

  for (const entity of entities) {
    if (entity.info.kind === 'class') {
      const ctor = `${entity.symbol}\`<constructor>\`().`;
      if (model.definitions.has(ctor) || model.references.has(ctor)) {
        entity.related.push({ symbol: ctor, role: 'constructor' });
      }
    }
    // `module.exports = Name;` makes every require of the module a require of Name.
    if (entity.info.names.length === 1) {
      const name = entity.info.names[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const lines = sourceLines(model, entity.def.file);
      const pattern = new RegExp(`(?:^|[^\\w$.])module\\.exports\\s*=\\s*${name}\\s*;?\\s*$`);
      const doc = model.docs.get(entity.def.file);
      if (doc && doc.moduleSymbol && lines.some(text => pattern.test(text))) {
        entity.defaultExportOf = doc.moduleSymbol;
      }
    }
  }
  // Alias bindings are shown only when nothing else matches.
  const definitions = entities.filter(entity => !isAliasBinding(model, entity.def, entity.info));
  const result = definitions.length ? definitions : entities;
  return result.sort(
    (a, b) => a.def.file.localeCompare(b.def.file) || a.def.range.sl - b.def.range.sl
  );
}

function annotate(model, ref) {
  const info = symbolInfo(model, ref.symbol);
  const lines = sourceLines(model, ref.file);
  const scope = enclosingDefinition(model, ref.file, ref.range.sl, ref.range.sc);
  const scopeInfo = scope ? symbolInfo(model, scope.symbol) : null;
  return {
    file: ref.file,
    line: ref.range.sl + 1,
    column: ref.range.sc + 1,
    tag: classifyReference(lines, ref.range.sl, ref.range.sc, ref.range.ec, info ? info.kind : ''),
    caller: scopeInfo ? scopeInfo.display : null,
    text: (lines[ref.range.sl] || '').trim(),
  };
}

/**
 * All references to an entity, including its constructor, export property and, for
 * `module.exports = Name`, the require()/import sites of its module in other files.
 */
function entityReferences(model, entity) {
  const seen = new Set();
  const out = [];
  const add = ref => {
    const key = `${ref.file}:${ref.range.sl}:${ref.range.sc}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(annotate(model, ref));
  };
  for (const symbol of [entity.symbol, ...entity.related.map(r => r.symbol)]) {
    for (const ref of model.references.get(symbol) || []) add(ref);
  }
  if (entity.defaultExportOf) {
    for (const ref of model.references.get(entity.defaultExportOf) || []) {
      if (ref.file !== entity.def.file) add(ref);
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
}

function entitySummary(entity) {
  return {
    name: entity.info.display,
    kind: entity.info.kind,
    file: entity.def.file,
    line: entity.def.range.sl + 1,
    symbol: entity.symbol,
  };
}

function refsQuery(model, query, opts) {
  return findEntities(model, query, opts).map(entity => ({
    ...entitySummary(entity),
    references: entityReferences(model, entity),
  }));
}

function callersQuery(model, query, opts) {
  return refsQuery(model, query, opts).map(result => {
    const groups = new Map();
    for (const ref of result.references) {
      if (!CALL_LIKE_TAGS.has(ref.tag)) continue;
      const caller = ref.caller || '(top level)';
      const key = `${ref.file}\u0000${caller}`;
      if (!groups.has(key)) groups.set(key, { file: ref.file, caller, tags: new Set(), lines: [] });
      const group = groups.get(key);
      group.tags.add(ref.tag);
      group.lines.push(ref.line);
    }
    const { references: _references, ...summary } = result;
    return {
      ...summary,
      callers: [...groups.values()].map(g => ({ ...g, tags: [...g.tags] })),
    };
  });
}

/**
 * Resolve a file argument to a path relative to the project root that exists in the index.
 */
function resolveFile(model, fileArg) {
  const candidates = [
    toPosix(path.relative(model.root, path.resolve(process.cwd(), fileArg))),
    toPosix(path.relative(model.root, path.resolve(model.root, fileArg))),
    toPosix(fileArg).replace(/^\.\//, ''),
  ];
  for (const candidate of candidates) if (model.docs.has(candidate)) return candidate;
  const suffix = toPosix(fileArg).replace(/^\.\//, '');
  const matches = [...model.docs.keys()].filter(f => f === suffix || f.endsWith(`/${suffix}`));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(`"${fileArg}" matches several indexed files:\n  ${matches.join('\n  ')}`);
  }
  throw new Error(`"${fileArg}" is not in the index (check the "scip.roots" setting)`);
}

function depsQuery(model, fileArg) {
  const file = resolveFile(model, fileArg);
  const doc = model.docs.get(file);
  const local = new Map();
  const external = new Map();
  for (const ref of doc.refs) {
    const def = model.definitions.get(ref.symbol);
    if (def) {
      if (def.file === file) continue;
      if (!local.has(def.file))
        local.set(def.file, { file: def.file, symbols: new Set(), required: false });
      const entry = local.get(def.file);
      const info = symbolInfo(model, ref.symbol);
      if (info && info.kind === 'module') {
        const tag = classifyReference(
          sourceLines(model, file),
          ref.range.sl,
          ref.range.sc,
          ref.range.ec,
          'module'
        );
        if (tag === 'require' || tag === 'import') entry.required = true;
      } else {
        entry.symbols.add(ref.symbol);
      }
    } else {
      const info = symbolInfo(model, ref.symbol);
      if (!info || !info.package || info.package === '.') continue;
      // `typescript` holds the lib.d.ts globals (Object, JSON, ...), not a real dependency.
      if (model.projectPackages.has(info.package) || info.package === 'typescript') continue;
      const name = info.package === '@types/node' ? 'node (built-ins)' : info.package;
      external.set(name, (external.get(name) || 0) + 1);
    }
  }
  return {
    file,
    files: [...local.values()]
      .map(e => ({ file: e.file, required: e.required, symbols: e.symbols.size }))
      .sort((a, b) => a.file.localeCompare(b.file)),
    packages: [...external.entries()]
      .map(([name, references]) => ({ name, references }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function dependentsQuery(model, fileArg) {
  const file = resolveFile(model, fileArg);
  const users = new Map();
  for (const doc of model.docs.values()) {
    if (doc.file === file) continue;
    for (const ref of doc.refs) {
      const def = model.definitions.get(ref.symbol);
      if (!def || def.file !== file) continue;
      if (!users.has(doc.file))
        users.set(doc.file, { file: doc.file, symbols: new Set(), required: false });
      const entry = users.get(doc.file);
      const info = symbolInfo(model, ref.symbol);
      if (info && info.kind === 'module') entry.required = true;
      else if (info) entry.symbols.add(info.display);
    }
  }
  return {
    file,
    dependents: [...users.values()]
      .map(e => ({ file: e.file, required: e.required, symbols: [...e.symbols].sort() }))
      .sort((a, b) => a.file.localeCompare(b.file)),
  };
}

function symbolsQuery(model, fileArg) {
  const file = resolveFile(model, fileArg);
  const doc = model.docs.get(file);
  const out = [];
  for (const def of doc.defs) {
    const info = symbolInfo(model, def.symbol);
    if (!info || NON_ENTITY_KINDS.has(info.kind)) continue;
    if (info.lastKind === 'meta' && !isExportDefinition(model, def)) continue;
    if (info.kind === 'variable' && !def.enclosing) continue;
    out.push({ name: info.display, kind: info.kind, line: def.range.sl + 1 });
  }
  return { file, symbols: out.sort((a, b) => a.line - b.line) };
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/**
 * Definition names for the grep reminder hook (./hint.js), keyed by the last name part:
 * classes, functions, methods, module-level variables and exported properties, as `refs`
 * finds them. Class fields, other object-literal properties, constructors and alias bindings
 * are left out, so that common words such as `name` or `path` do not match.
 * @param {object} model
 * @returns {Object<string, Array<{name: string, kind: string, file: string, line: number}>>}
 *   a prototype-free object
 */
function definitionNames(model) {
  const byName = new Map();
  for (const [symbol, def] of model.definitions) {
    const info = symbolInfo(model, symbol);
    if (!info || NON_ENTITY_KINDS.has(info.kind) || info.kind === 'constructor') continue;
    const isMeta = info.lastKind === 'meta';
    if (isMeta ? !isExportDefinition(model, def) : info.kind === 'property') continue;
    if (isAliasBinding(model, def, info)) continue;
    const last = info.names[info.names.length - 1];
    const name = isMeta ? stripMetaCounter(last) : last;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push({
      name: info.display,
      kind: info.kind,
      file: def.file,
      line: def.range.sl + 1,
      isMeta,
    });
  }
  const out = Object.create(null);
  for (const name of [...byName.keys()].sort()) {
    const entries = byName.get(name);
    // An export property in the file that defines the name is that definition (findEntities).
    out[name] = entries
      .filter(e => !e.isMeta || !entries.some(o => !o.isMeta && o.file === e.file))
      .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
      .map(({ name: display, kind, file, line }) => ({ name: display, kind, file, line }));
  }
  return out;
}

/**
 * Names similar to a query that found nothing, for a "did you mean" hint.
 * @param {object} model
 * @param {string} query
 * @returns {string[]}
 */
function suggestNames(model, query) {
  const wanted = splitQuery(query).pop();
  if (!wanted) return [];
  const lower = wanted.toLowerCase();
  const names = new Set();
  for (const symbol of model.definitions.keys()) {
    const info = symbolInfo(model, symbol);
    if (!info || NON_ENTITY_KINDS.has(info.kind) || info.lastKind === 'meta') continue;
    const name = (info.names[info.names.length - 1] || '').toLowerCase();
    const prefix = Math.min(5, lower.length, name.length);
    const similar =
      name.includes(lower) ||
      (name.length >= 4 && lower.includes(name)) ||
      (prefix >= 4 && name.slice(0, prefix) === lower.slice(0, prefix));
    if (name && similar) names.add(info.display);
    if (names.size >= 10) break;
  }
  return [...names];
}

/**
 * Load a project's index as a query model, refreshing it first unless disabled.
 * @param {object} cfg - from indexer.loadConfig
 * @param {object} [opts]
 * @param {boolean} [opts.refresh=true] - rebuild a missing or stale index first
 * @param {(message: string) => void} [opts.notify] - progress messages
 */
function loadModel(cfg, { refresh = true, notify } = {}) {
  const scip = loadBindings(cfg.root);
  if (refresh) ensureFresh(cfg, { notify });
  if (!fs.existsSync(cfg.indexPath)) {
    throw new Error('no index found; run: musubi-code index');
  }
  return buildModel(scip.Index.deserializeBinary(fs.readFileSync(cfg.indexPath)), cfg.root);
}

module.exports = {
  parseSymbol,
  parseDescriptors,
  describeSymbol,
  splitQuery,
  classifyReference,
  metaNameMatches,
  loadBindings,
  buildModel,
  loadModel,
  findEntities,
  refsQuery,
  callersQuery,
  depsQuery,
  dependentsQuery,
  symbolsQuery,
  suggestNames,
  definitionNames,
};
