/**
 * MUSUBI Repository Skill Manager
 *
 * Manages and auto-generates repository-specific skills (.musubi/skills/)
 *
 * @module src/managers/repo-skill-manager
 * @see REQ-P0-B003
 * @inspired-by OpenHands openhands/microagent/microagent.py
 */

const fs = require('fs');
const path = require('path');

/**
 * Repository skill manager
 */
class RepoSkillManager {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot - Project root
   * @param {boolean} options.autoGenerate - Auto-generate when it does not exist
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.skillsDir = path.join(this.projectRoot, '.musubi/skills');
    this.autoGenerate = options.autoGenerate !== false;
  }

  /**
   * Initialize the .musubi/skills/ directory
   * @returns {Object} Initialization result
   */
  async initialize() {
    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    // Create the directory
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
      results.created.push('.musubi/skills/');
    }

    // Generate repo.md
    const repoMdPath = path.join(this.skillsDir, 'repo.md');
    if (!fs.existsSync(repoMdPath)) {
      try {
        const content = await this.generateRepoMd();
        fs.writeFileSync(repoMdPath, content, 'utf-8');
        results.created.push('repo.md');
      } catch (error) {
        results.errors.push({ file: 'repo.md', error: error.message });
      }
    } else {
      results.skipped.push('repo.md');
    }

    return results;
  }

  /**
   * Auto-generate repo.md
   * @returns {string}
   */
  async generateRepoMd() {
    const analysis = await this.analyzeProject();

    let content = `---
name: repo
type: repo
agent: all
priority: 100
---

# ${analysis.name}

${analysis.description || 'Repository information for AI assistants.'}

## General Setup

${
  analysis.setupCommands.length > 0
    ? analysis.setupCommands.map(cmd => `- \`${cmd}\``).join('\n')
    : '- Check the README for setup instructions'
}

## Repository Structure

\`\`\`
${analysis.structureTree}
\`\`\`

${
  analysis.patterns.length > 0
    ? `### Detected Patterns

${analysis.patterns.map(p => `- **${p.name}**: ${p.description}`).join('\n')}
`
    : ''
}

## Common Commands

| Command | Description |
|---------|-------------|
${analysis.commands.map(c => `| \`${c.cmd}\` | ${c.desc} |`).join('\n')}

${
  analysis.testingInfo
    ? `## Testing

${analysis.testingInfo}
`
    : ''
}

${
  analysis.cicdInfo
    ? `## CI/CD Workflows

${analysis.cicdInfo}
`
    : ''
}

## Important Conventions

- Follow existing code patterns in this repository
- Check \`steering/\` directory for project-specific guidelines
${analysis.conventions.map(c => `- ${c}`).join('\n')}
`;

    return content;
  }

  /**
   * Analyze the project
   * @returns {Object}
   */
  async analyzeProject() {
    const analysis = {
      name: path.basename(this.projectRoot),
      description: '',
      setupCommands: [],
      commands: [],
      structureTree: '',
      patterns: [],
      testingInfo: '',
      cicdInfo: '',
      conventions: [],
    };

    // Analyze package.json
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        analysis.name = pkg.name || analysis.name;
        analysis.description = pkg.description || '';

        // Setup commands
        analysis.setupCommands.push('npm install');

        // Scripts
        if (pkg.scripts) {
          const scriptMapping = {
            start: 'Start the application',
            dev: 'Start in development mode',
            build: 'Build the application',
            test: 'Run tests',
            lint: 'Run linter',
            format: 'Format code',
          };

          for (const [script, desc] of Object.entries(scriptMapping)) {
            if (pkg.scripts[script]) {
              analysis.commands.push({
                cmd: `npm run ${script}`,
                desc,
              });
            }
          }
        }

        // Detect patterns from dependencies
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['jest'] || deps['vitest']) {
          analysis.patterns.push({
            name: 'Testing',
            description: deps['jest'] ? 'Jest' : 'Vitest',
          });
          analysis.testingInfo = deps['jest']
            ? '- Run `npm test` to execute Jest tests'
            : '- Run `npm test` to execute Vitest tests';
        }
        if (deps['eslint']) {
          analysis.patterns.push({
            name: 'Linting',
            description: 'ESLint',
          });
        }
        if (deps['typescript']) {
          analysis.patterns.push({
            name: 'Language',
            description: 'TypeScript',
          });
        }
        if (deps['react']) {
          analysis.patterns.push({
            name: 'Framework',
            description: 'React',
          });
        }
        if (deps['express'] || deps['fastify']) {
          analysis.patterns.push({
            name: 'Backend',
            description: deps['express'] ? 'Express.js' : 'Fastify',
          });
        }
      } catch (error) {
        // Ignore
      }
    }

    // Analyze Python projects
    const requirementsPath = path.join(this.projectRoot, 'requirements.txt');
    const pyprojectPath = path.join(this.projectRoot, 'pyproject.toml');
    if (fs.existsSync(requirementsPath)) {
      analysis.setupCommands.push('pip install -r requirements.txt');
      analysis.commands.push({
        cmd: 'pip install -r requirements.txt',
        desc: 'Install dependencies',
      });
    }
    if (fs.existsSync(pyprojectPath)) {
      analysis.setupCommands.push('pip install -e .');
      analysis.patterns.push({ name: 'Packaging', description: 'pyproject.toml' });
    }

    // Detect CI/CD
    const cicdPaths = [
      { path: '.github/workflows', desc: 'GitHub Actions workflows' },
      { path: '.gitlab-ci.yml', desc: 'GitLab CI configuration' },
      { path: 'Jenkinsfile', desc: 'Jenkins pipeline' },
      { path: '.circleci/config.yml', desc: 'CircleCI configuration' },
    ];

    for (const ci of cicdPaths) {
      const ciPath = path.join(this.projectRoot, ci.path);
      if (fs.existsSync(ciPath)) {
        analysis.cicdInfo = `- ${ci.desc} found in \`${ci.path}\``;
        break;
      }
    }

    // Directory structure
    analysis.structureTree = this._generateTreeStructure();

    // Detect conventions
    if (fs.existsSync(path.join(this.projectRoot, '.editorconfig'))) {
      analysis.conventions.push('Follow .editorconfig settings');
    }
    if (
      fs.existsSync(path.join(this.projectRoot, '.prettierrc')) ||
      fs.existsSync(path.join(this.projectRoot, '.prettierrc.json'))
    ) {
      analysis.conventions.push('Use Prettier for code formatting');
    }
    if (fs.existsSync(path.join(this.projectRoot, 'steering'))) {
      analysis.conventions.push('MUSUBI steering documents are available');
    }

    return analysis;
  }

  /**
   * Generate the directory tree structure
   * @returns {string}
   */
  _generateTreeStructure() {
    const maxDepth = 2;
    const maxItems = 15;
    const ignoreDirs = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '__pycache__',
      '.venv',
      'venv',
    ];

    const lines = [];
    let itemCount = 0;

    const walk = (dir, prefix = '', depth = 0) => {
      if (depth > maxDepth || itemCount >= maxItems) return;

      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      // Filter and sort
      entries = entries
        .filter(e => !e.name.startsWith('.') || e.name === '.musubi')
        .filter(e => !ignoreDirs.includes(e.name))
        .sort((a, b) => {
          // Directories first
          if (a.isDirectory() !== b.isDirectory()) {
            return a.isDirectory() ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

      for (let i = 0; i < entries.length && itemCount < maxItems; i++) {
        const entry = entries[i];
        const isLast = i === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}`);
        itemCount++;

        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), newPrefix, depth + 1);
        }
      }
    };

    lines.push(`${path.basename(this.projectRoot)}/`);
    itemCount++;
    walk(this.projectRoot);

    if (itemCount >= maxItems) {
      lines.push('... (truncated)');
    }

    return lines.join('\n');
  }

  /**
   * Add a custom skill
   * @param {string} name Skill name
   * @param {Object} options Skill options
   * @returns {string} Path of the created file
   */
  async addSkill(name, options = {}) {
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = path.join(this.skillsDir, filename);

    if (fs.existsSync(filePath) && !options.overwrite) {
      throw new Error(`Skill already exists: ${filename}`);
    }

    const content = `---
name: ${name}
type: repo
triggers:
${options.triggers ? options.triggers.map(t => `  - ${t}`).join('\n') : '  - ' + name.toLowerCase()}
agent: ${options.agent || 'all'}
priority: ${options.priority || 50}
---

# ${name}

${options.content || '<!-- Add skill content here -->'}
`;

    // Create the directory
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * List skills
   * @returns {Object[]}
   */
  listSkills() {
    if (!fs.existsSync(this.skillsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.skillsDir).filter(f => f.endsWith('.md'));
    return files.map(f => ({
      name: f.replace('.md', ''),
      path: path.join(this.skillsDir, f),
      size: fs.statSync(path.join(this.skillsDir, f)).size,
    }));
  }

  /**
   * Update repo.md
   * @returns {boolean}
   */
  async updateRepoMd() {
    const repoMdPath = path.join(this.skillsDir, 'repo.md');
    const content = await this.generateRepoMd();
    fs.writeFileSync(repoMdPath, content, 'utf-8');
    return true;
  }

  /**
   * Remove a skill
   * @param {string} name
   * @returns {boolean}
   */
  removeSkill(name) {
    const filePath = path.join(this.skillsDir, `${name}.md`);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    fs.unlinkSync(filePath);
    return true;
  }

  /**
   * Generate sample skills
   * @returns {Object} Creation result
   */
  async generateSampleSkills() {
    const results = { created: [], skipped: [] };

    const sampleSkills = [
      {
        name: 'testing',
        triggers: ['test', '/\\bspec\\b/i'],
        content: `## Testing Guidelines

When writing tests for this project:

1. Follow the existing test patterns in the \`tests/\` directory
2. Use descriptive test names
3. Aim for high code coverage
4. Mock external dependencies

### Example Test Structure

\`\`\`javascript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
\`\`\`
`,
      },
      {
        name: 'debugging',
        triggers: ['debug', 'error', 'bug', 'issue'],
        content: `## Debugging Guidelines

When debugging issues in this project:

1. Check console/logs for error messages
2. Use breakpoints or \`console.log\` statements
3. Review recent changes in git history
4. Check for common issues:
   - Missing dependencies
   - Environment variables
   - Configuration errors
`,
      },
    ];

    for (const skill of sampleSkills) {
      const filePath = path.join(this.skillsDir, `${skill.name}.md`);
      if (fs.existsSync(filePath)) {
        results.skipped.push(skill.name);
        continue;
      }

      try {
        await this.addSkill(skill.name, {
          triggers: skill.triggers,
          content: skill.content,
        });
        results.created.push(skill.name);
      } catch (error) {
        // Skip
      }
    }

    return results;
  }
}

module.exports = {
  RepoSkillManager,
};
