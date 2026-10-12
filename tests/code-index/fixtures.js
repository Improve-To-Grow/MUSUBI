/**
 * Fixture projects shared by the code index end-to-end tests (not a test file itself).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CLI = path.join(__dirname, '..', '..', 'bin', 'musubi-code.js');

/** A small Python package: inheritance, a decorator, relative imports, self and super calls. */
const PYTHON_FILES = {
  'pkg/__init__.py': '',
  'pkg/models.py': [
    'import json',
    'from dataclasses import dataclass',
    '',
    '',
    'def timed(fn):',
    '    return fn',
    '',
    '',
    'class Base:',
    '    registry = {}',
    '',
    '    def __init__(self, name):',
    '        self.name = name',
    '',
    '    def save(self):',
    '        return json.dumps({"name": self.name})',
    '',
    '    def describe(self):',
    '        return self.save()',
    '',
    '',
    'class User(Base):',
    '    def __init__(self, name, email):',
    '        super().__init__(name)',
    '        self.email = email',
    '',
    '    @timed',
    '    def save(self):',
    '        payload = super().save()',
    '        return payload + self.email',
    '',
    '    def notify(self):',
    '        self.describe()',
    '        return self.email',
    '',
    '',
    'def make_user(name):',
    '    return User(name, name + "@example.com")',
    '',
    '',
    '@dataclass',
    'class Config:',
    '    debug: bool = False',
    '',
  ].join('\n'),
  'pkg/service.py': [
    'from pkg.models import User, make_user',
    'import pkg.models as models',
    'from . import models as rel_models',
    '',
    'CONFIG = models.Config()',
    '',
    '',
    'def run(name):',
    '    user = make_user(name)',
    '    user.save()',
    '    direct = User(name, "x")',
    '    direct.notify()',
    '    rel_models.make_user("a")',
    '    return user',
    '',
    '',
    'def untyped(thing):',
    '    return thing.save()',
    '',
  ].join('\n'),
  'tests/test_service.py': [
    'from pkg.service import run',
    'from pkg import models',
    '',
    '',
    'def test_run():',
    '    assert run("bob").email',
    '    assert isinstance(models.make_user("a"), models.User)',
    '',
  ].join('\n'),
};

/** Two CommonJS modules: a class, a factory and a consumer. */
const JAVASCRIPT_FILES = {
  'web/widget.js': [
    'class Widget {',
    '  constructor(name) {',
    '    this.name = name;',
    '  }',
    '  render() {',
    '    return `<${this.name}>`;',
    '  }',
    '}',
    'function makeWidget(name) {',
    '  return new Widget(name);',
    '}',
    'module.exports = { Widget, makeWidget };',
    '',
  ].join('\n'),
  'web/server.js': [
    "const { makeWidget, Widget } = require('./widget');",
    'function main() {',
    "  const w = new Widget('a');",
    "  return [w.render(), makeWidget('b').render()];",
    '}',
    'module.exports = { main };',
    '',
  ].join('\n'),
};

const PYPROJECT = '[project]\nname = "demo"\nversion = "1.0.0"\n';

const SESSION_START = JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup' });

function writeFixture(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
}

/** Run bin/musubi-code.js against a project root. */
function cli(root, args, input) {
  return spawnSync(process.execPath, [CLI, ...args, '--root', root], {
    encoding: 'utf8',
    input,
    timeout: 120000,
  });
}

/** `file:line tag caller` for every reference of the first entity named by `query`. */
function referencesOf(refsQuery, model, query, file) {
  const [entity] = refsQuery(model, query, { file });
  if (!entity) throw new Error(`no definition named ${query}`);
  return entity.references.map(r => `${r.file}:${r.line} ${r.tag} ${r.caller || '-'}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Give a file a modification time in the future, so a rebuilt fingerprint sees the edit. */
function touchLater(file) {
  const future = new Date(Date.now() + 60000);
  fs.utimesSync(file, future, future);
}

module.exports = {
  PYTHON_FILES,
  JAVASCRIPT_FILES,
  PYPROJECT,
  SESSION_START,
  writeFixture,
  cli,
  referencesOf,
  readJson,
  touchLater,
};
