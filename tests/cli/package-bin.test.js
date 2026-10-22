/**
 * Every CLI in bin/ is installed as a command (CHANGE-009): package.json "bin" lists each
 * bin/musubi*.js, and every listed file exists.
 */

const fs = require('fs');
const path = require('path');
const { bin } = require('../../package.json');

describe('package.json bin', () => {
  const listed = Object.values(bin).map(file => path.basename(file));

  it('lists every CLI in bin/', () => {
    const clis = fs
      .readdirSync(path.join(__dirname, '../../bin'))
      .filter(f => /^musubi.*\.js$/.test(f));
    expect(clis.filter(file => !listed.includes(file))).toEqual([]);
  });

  it('points only to existing files', () => {
    const missing = Object.values(bin).filter(
      file => !fs.existsSync(path.join(__dirname, '../..', file))
    );
    expect(missing).toEqual([]);
  });
});
