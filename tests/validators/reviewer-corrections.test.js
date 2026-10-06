/**
 * Reviewer Corrections Tests (CHANGE-001)
 *
 * SDD documents are English only. applyCorrections() modifies the named document (plus its
 * backup) and leaves any translated sibling such as <doc>.ja.md untouched.
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { RequirementsReviewer } = require('../../src/validators/requirements-reviewer');
const { DesignReviewer } = require('../../src/validators/design-reviewer');

const ORIGINAL = 'The system should respond quickly.';
const CORRECTED = 'WHEN a request is received, the system SHALL respond within 2 seconds.';

const DOC = `# Requirements\n\n## REQ-001\n\n${ORIGINAL}\n`;
const JA_DOC = `# 要件定義\n\n## REQ-001\n\n${ORIGINAL}\n`;

const CASES = [
  {
    name: 'RequirementsReviewer',
    create: dir => new RequirementsReviewer(dir),
    lookup: '_findDefectInContent',
    stub: { id: 'DEF-001', evidence: ORIGINAL, recommendation: CORRECTED },
    correction: { defectId: 'DEF-001', action: 'accept' },
  },
  {
    name: 'DesignReviewer',
    create: dir => new DesignReviewer(dir),
    lookup: '_findIssueInContent',
    stub: { id: 'ISS-001', category: 'solid', evidence: ORIGINAL, recommendation: CORRECTED },
    correction: { issueId: 'ISS-001', action: 'accept' },
  },
];

describe.each(CASES)(
  '$name.applyCorrections (CHANGE-001)',
  ({ create, lookup, stub, correction }) => {
    let tmpDir;
    let docPath;
    let jaPath;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-reviewer-'));
      docPath = path.join(tmpDir, 'requirements.md');
      jaPath = path.join(tmpDir, 'requirements.ja.md');
      await fs.writeFile(docPath, DOC, 'utf-8');
      await fs.writeFile(jaPath, JA_DOC, 'utf-8');
    });

    afterEach(async () => {
      await fs.remove(tmpDir);
    });

    async function applyAccept(options) {
      const reviewer = create(tmpDir);
      jest.spyOn(reviewer, lookup).mockReturnValue(stub);
      return reviewer.applyCorrections('requirements.md', [correction], options);
    }

    it('corrects the document and leaves the .ja.md sibling untouched', async () => {
      const result = await applyAccept();

      expect(result.success).toBe(true);
      expect(result.changesApplied).toHaveLength(1);
      expect(await fs.readFile(docPath, 'utf-8')).toContain(CORRECTED);
      expect(await fs.readFile(jaPath, 'utf-8')).toBe(JA_DOC);
      expect(result.filesModified).toEqual([docPath, `${docPath}.backup`]);
    });

    it('ignores the removed updateJapanese option', async () => {
      const result = await applyAccept({ updateJapanese: true });

      expect(await fs.readFile(jaPath, 'utf-8')).toBe(JA_DOC);
      expect(result.filesModified).not.toContain(jaPath);
    });
  }
);
