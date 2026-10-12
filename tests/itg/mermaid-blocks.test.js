/**
 * Mermaid blocks in the templates are well formed (ITG-DEL-12: decision logic and architecture
 * are drawn as Mermaid, so a broken block hides a rule)
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'src', 'templates');
const DIAGRAM_TYPES = [
  'flowchart',
  'graph',
  'sequenceDiagram',
  'stateDiagram-v2',
  'stateDiagram',
  'classDiagram',
  'erDiagram',
  'gitGraph',
  'gantt',
  'mindmap',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Deployment',
  'C4Dynamic',
];
const C4_ELEMENTS =
  /^(Person|Person_Ext|System|System_Ext|SystemDb|SystemDb_Ext|Container|Container_Ext|ContainerDb|ContainerDb_Ext|Component|Component_Ext|ComponentDb|Rel|BiRel|Rel_[UDLR]|Rel_(Up|Down|Left|Right)|System_Boundary|Container_Boundary|Boundary|Enterprise_Boundary|Deployment_Node|Node|UpdateLayoutConfig|UpdateRelStyle|UpdateElementStyle)\(/;

/**
 * Extract the Mermaid blocks of a file
 * @param {string} content - File content
 * @returns {{start: number, lines: string[], closed: boolean}[]} Blocks with their first line
 */
function mermaidBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '```mermaid') continue;
    const block = { start: i + 1, lines: [], closed: false };
    for (i++; i < lines.length; i++) {
      if (lines[i].trim().startsWith('```')) {
        block.closed = true;
        break;
      }
      block.lines.push(lines[i]);
    }
    blocks.push(block);
  }
  return blocks;
}

const files = globSync('**/*.{md,toml}', { cwd: TEMPLATE_DIR })
  .map(rel => ({ rel, content: fs.readFileSync(path.join(TEMPLATE_DIR, rel), 'utf8') }))
  .filter(({ content }) => content.includes('```mermaid'));

const blocks = files.flatMap(({ rel, content }) =>
  mermaidBlocks(content).map(block => ({ where: `${rel}:${block.start}`, ...block }))
);

/** First line of a block that is not blank, a comment or an init directive */
function diagramType(block) {
  const first = block.lines.map(line => line.trim()).find(line => line && !line.startsWith('%%'));
  return (first || '').split(/\s+/)[0];
}

describe('Mermaid blocks in templates', () => {
  it('exist in the ITG steering and design templates', () => {
    const rels = new Set(files.map(({ rel }) => rel));
    for (const rel of [
      'shared/steering/tech.md',
      'shared/steering/structure.md',
      'shared/steering/rules/itg/security.md',
      'shared/documents/design.md',
      'agents/claude-code/commands/sdd-design.md',
      'agents/gemini-cli/commands/sdd-design.toml',
    ]) {
      expect(rels.has(rel)).toBe(true);
    }
  });

  it('are closed', () => {
    expect(blocks.filter(block => !block.closed).map(block => block.where)).toEqual([]);
  });

  it('start with a known diagram type', () => {
    const unknown = blocks
      .filter(block => !DIAGRAM_TYPES.includes(diagramType(block)))
      .map(block => `${block.where}: ${diagramType(block)}`);
    expect(unknown).toEqual([]);
  });

  it('use only C4 elements in C4 diagrams', () => {
    const invalid = blocks
      .filter(block => diagramType(block).startsWith('C4'))
      .flatMap(block =>
        block.lines
          .map(line => line.trim())
          .filter(line => line && !/^(C4\w+|title |%%|\}$)/.test(line) && !C4_ELEMENTS.test(line))
          .map(line => `${block.where}: ${line}`)
      );
    expect(invalid).toEqual([]);
  });

  it('balance brackets and quotes in every line of C4 diagrams', () => {
    const unbalanced = blocks
      .filter(block => diagramType(block).startsWith('C4'))
      .flatMap(block =>
        block.lines
          .filter(line => C4_ELEMENTS.test(line.trim()))
          .filter(line => {
            const quotes = (line.match(/"/g) || []).length;
            const open = (line.match(/\(/g) || []).length;
            const close = (line.match(/\)/g) || []).length;
            return quotes % 2 !== 0 || open < 1 || open !== close;
          })
          .map(line => `${block.where}: ${line.trim()}`)
      );
    expect(unbalanced).toEqual([]);
  });

  it('are used instead of ASCII boxes in the design templates', () => {
    for (const rel of ['shared/documents/design.md', 'agents/claude-code/commands/sdd-design.md']) {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, rel), 'utf8');
      expect(content).not.toMatch(/\+-{10,}\+/);
    }
  });
});
