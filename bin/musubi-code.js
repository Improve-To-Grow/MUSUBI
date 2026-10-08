#!/usr/bin/env node

/**
 * MUSUBI Code - compiler-accurate code navigation for JavaScript/TypeScript projects
 *
 * Builds a SCIP index with @sourcegraph/scip-typescript in `<project>/.scip/` and answers
 * "who references / calls / instantiates / requires X" and file dependency questions.
 *
 * Usage:
 *   musubi-code refs <Name|Owner.member>     every reference, tagged, with the enclosing function
 *   musubi-code callers <Name|Owner.member>  distinct functions that use the symbol
 *   musubi-code deps <file>                  files and packages a file depends on
 *   musubi-code dependents <file>            files that depend on a file
 *   musubi-code symbols <file>               definitions in a file
 *   musubi-code status                       index freshness
 *   musubi-code index [--if-stale | --hook]  build the index (--hook: Claude Code hook mode)
 *   musubi-code setup                        configure the project: skill, hooks, instructions
 */

'use strict';

const { Command } = require('commander');
const packageJson = require('../package.json');
const indexer = require('../src/code-index/indexer');
const query = require('../src/code-index/query');
const format = require('../src/code-index/format');
const { setupCodeIndex } = require('../src/code-index/setup');

function projectConfig(opts) {
  return indexer.loadConfig(indexer.findProjectRoot(opts.root || process.cwd()));
}

function print(text) {
  if (text) process.stdout.write(`${text}\n`);
}

function parseLimit(value) {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 0)
    throw new Error(`--limit must be 0 or more, got "${value}"`);
  return limit;
}

function addQueryOptions(command) {
  return command
    .option('--json', 'machine-readable output')
    .option('--no-refresh', 'use the index as it is, even when stale')
    .option('--root <dir>', 'project directory (default: found from the current directory)');
}

function loadModel(opts) {
  const cfg = projectConfig(opts);
  return query.loadModel(cfg, { refresh: opts.refresh, notify: message => console.error(message) });
}

function symbolCommand(name, opts) {
  const model = loadModel(opts);
  const entityOpts = { file: opts.file, includeProperties: opts.includeProperties };
  const results =
    name === 'refs'
      ? query.refsQuery(model, opts.target, entityOpts)
      : query.callersQuery(model, opts.target, entityOpts);
  if (results.length === 0) {
    const suggestions = query.suggestNames(model, opts.target);
    console.error(
      `No definition named "${opts.target}" in the index.` +
        (suggestions.length ? ` Similar names: ${suggestions.join(', ')}` : '')
    );
    process.exitCode = 1;
    return;
  }
  if (name === 'refs') {
    for (const entry of results) {
      entry.totalReferences = entry.references.length;
      if (opts.json && opts.limit > 0) entry.references = entry.references.slice(0, opts.limit);
    }
    print(opts.json ? JSON.stringify(results, null, 2) : format.formatRefs(results, opts.limit));
  } else {
    print(opts.json ? JSON.stringify(results, null, 2) : format.formatCallers(results));
  }
}

function fileCommand(name, file, opts) {
  const model = loadModel(opts);
  const run = {
    deps: query.depsQuery,
    dependents: query.dependentsQuery,
    symbols: query.symbolsQuery,
  }[name];
  const formatter = {
    deps: format.formatDeps,
    dependents: format.formatDependents,
    symbols: format.formatSymbols,
  }[name];
  const result = run(model, file);
  print(opts.json ? JSON.stringify(result, null, 2) : formatter(result));
}

function createProgram() {
  const program = new Command();
  program
    .name('musubi-code')
    .description(
      'Compiler-accurate code navigation for JavaScript/TypeScript projects (scip-typescript)'
    )
    .version(packageJson.version);

  for (const name of ['refs', 'callers']) {
    addQueryOptions(
      program
        .command(`${name} <name>`)
        .description(
          name === 'refs'
            ? 'every reference to a class, function or method (Name or Owner.member)'
            : 'distinct functions that call or instantiate a symbol'
        )
        .option('--file <path>', 'only definitions whose file path contains <path>')
        .option(
          '--limit <n>',
          'references shown per definition, 0 for all',
          parseLimit,
          format.DEFAULT_LIMIT
        )
        .option('--include-properties', 'also match object-literal properties')
    ).action((target, opts) => symbolCommand(name, { ...opts, target }));
  }

  const fileDescriptions = {
    deps: 'files and packages a file depends on',
    dependents: 'files that depend on a file',
    symbols: 'definitions in a file',
  };
  for (const [name, description] of Object.entries(fileDescriptions)) {
    addQueryOptions(program.command(`${name} <file>`).description(description)).action(
      (file, opts) => fileCommand(name, file, opts)
    );
  }

  program
    .command('status')
    .description('index location, roots and freshness (exit code 1 when missing or stale)')
    .option('--json', 'machine-readable output')
    .option('--root <dir>', 'project directory (default: found from the current directory)')
    .action(opts => {
      const report = indexer.statusReport(projectConfig(opts));
      print(opts.json ? JSON.stringify(report, null, 2) : format.formatStatus(report));
      process.exitCode = report.state === 'fresh' ? 0 : 1;
    });

  program
    .command('index')
    .description('build the index in .scip/ (always rebuilds unless --if-stale)')
    .option('--if-stale', 'rebuild only when indexed source files changed')
    .option('--hook', 'Claude Code hook mode: read the hook JSON from stdin, never fail')
    .option('--root <dir>', 'project directory (default: found from the current directory)')
    .action(async opts => {
      if (opts.hook) {
        indexer.runHook(await indexer.readStdin(1000), { root: opts.root });
        process.exitCode = 0;
        return;
      }
      const cfg = projectConfig(opts);
      if (opts.ifStale && indexer.getFreshness(cfg).state === 'fresh') {
        console.error('musubi-code: index is up to date');
        return;
      }
      const result = indexer.build(cfg, { quiet: false });
      if (result.queued) {
        console.error(
          'musubi-code: another build is running; it will rebuild again when it finishes'
        );
      } else {
        console.error(
          `musubi-code: indexed ${result.files} files in ${(result.durationMs / 1000).toFixed(1)} s`
        );
      }
    });

  program
    .command('setup')
    .description(
      'configure this project: .gitignore, Claude Code skill and hooks, agent instructions'
    )
    .option(
      '--agent <agent...>',
      'agents to configure (default: detected; e.g. claude-code, copilot, cursor)'
    )
    .option('--command <command>', 'command the hooks and instructions call', 'musubi-code')
    .option('--dry-run', 'show what would change without writing')
    .option('--force', 'also set up a directory without package.json or tsconfig.json')
    .option('--root <dir>', 'project directory (default: found from the current directory)')
    .action(opts => {
      const root = indexer.findProjectRoot(opts.root || process.cwd());
      const result = setupCodeIndex(root, {
        agents: opts.agent,
        command: opts.command,
        dryRun: opts.dryRun,
        force: opts.force,
      });
      print(format.formatSetup(result));
      if (result.skippedReason) {
        process.exitCode = 1;
        return;
      }
      if (!opts.dryRun) {
        print(
          `\nThe index builds on the next Claude Code session or the first query; to build it now run: ${opts.command} index`
        );
      }
    });

  return program;
}

/**
 * Run the CLI.
 * @param {string[]} [argv] - full argv including node and script path
 */
async function run(argv = process.argv) {
  await createProgram().parseAsync(argv);
}

module.exports = { run, createProgram };

if (require.main === module) {
  run().catch(error => {
    console.error(`musubi-code: ${error.message}`);
    process.exitCode = 1;
  });
}
