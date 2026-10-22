/**
 * Preload module for scip-python on Windows (loaded with `node -r`, see ./indexer.js).
 *
 * scip-python 0.5.0 to 0.6.6 build `new RegExp(path.sep, 'g')` while loading, which throws on
 * Windows because a lone backslash is not a valid pattern (sourcegraph/scip-python issue #210;
 * the fix in PR #224 is `/[\\/]/g`). This module replaces exactly that pattern and nothing else,
 * so the unmodified package runs. Drop it once a release contains the fix.
 */

'use strict';

const NativeRegExp = RegExp;

function PatchedRegExp(pattern, flags) {
  if (pattern === '\\') pattern = '[\\\\/]';
  return new.target ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags);
}

PatchedRegExp.prototype = NativeRegExp.prototype;
Object.setPrototypeOf(PatchedRegExp, NativeRegExp);
global.RegExp = PatchedRegExp;
