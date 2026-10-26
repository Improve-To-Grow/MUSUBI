/**
 * @fileoverview Traceability Service
 * @module gui/services/traceability-service
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

// REQ-001, REQ-RSVP-001 and REQ-MEETING-RSVP-001
const REQ_ID = 'REQ-(?:[A-Z0-9]+-)*\\d+';
const CODE_FILE = /\.[cm]?[jt]sx?$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
// Where MUSUBI writes each document; storage/specs is the older place of designs and tasks
const DESIGN_DIRS = ['storage/design', 'storage/specs'];
const TASK_DIRS = ['storage/tasks', 'storage/specs'];
const CODE_DIRS = ['src', 'tests', 'test', '__tests__'];

/** Requirement ids named in a text */
function mentionedIds(text) {
  return [...new Set(text.match(new RegExp(REQ_ID, 'g')) || [])];
}

/**
 * Traceability Service - Manages requirement-to-implementation traceability
 */
class TraceabilityService {
  /**
   * Create a new TraceabilityService instance
   * @param {string} projectPath - Project path
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * Build traceability matrix
   * @returns {Promise<Object>} Traceability matrix
   */
  async buildMatrix() {
    const requirements = await this.scanRequirements();
    const designs = await this.scanDesigns();
    const tasks = await this.scanTasks();
    const implementations = await this.scanImplementations();

    const matrix = {
      requirements: [],
      links: [],
      coverage: {
        total: requirements.length,
        linked: 0,
        implemented: 0,
        tested: 0,
      },
    };

    for (const req of requirements) {
      const entry = {
        id: req.id,
        title: req.title,
        type: req.type,
        priority: req.priority,
        status: 'unlinked',
        links: {
          designs: [],
          tasks: [],
          implementations: [],
          tests: [],
        },
      };

      // Find linked designs
      for (const design of designs) {
        if (design.requirements?.includes(req.id)) {
          entry.links.designs.push({
            id: design.id,
            title: design.title,
            path: design.path,
          });
          entry.status = 'designed';
        }
      }

      // Find linked tasks
      for (const task of tasks) {
        if (task.requirement === req.id || task.requirements?.includes(req.id)) {
          entry.links.tasks.push({
            id: task.id,
            title: task.title,
            status: task.status,
            path: task.path,
          });
          entry.status = 'tasked';
        }
      }

      // Find linked implementations and tests
      for (const impl of implementations) {
        if (!impl.requirements?.includes(req.id)) continue;
        if (impl.type === 'test') {
          entry.links.tests.push({ file: impl.file, type: impl.type });
        } else {
          entry.links.implementations.push({ file: impl.file, type: impl.type });
          entry.status = 'implemented';
        }
      }

      if (entry.links.designs.length > 0 || entry.links.tasks.length > 0) {
        matrix.coverage.linked++;
      }
      if (entry.links.implementations.length > 0) {
        matrix.coverage.implemented++;
      }
      if (entry.links.tests.length > 0) {
        matrix.coverage.tested++;
      }

      matrix.requirements.push(entry);
    }

    // Build links array for visualization
    for (const entry of matrix.requirements) {
      for (const design of entry.links.designs) {
        matrix.links.push({
          source: entry.id,
          target: design.id,
          type: 'requirement-design',
        });
      }
      for (const task of entry.links.tasks) {
        matrix.links.push({
          source: entry.id,
          target: task.id,
          type: 'requirement-task',
        });
      }
    }

    return matrix;
  }

  /**
   * Scan requirements from storage
   * @returns {Promise<Array<Object>>}
   */
  async scanRequirements() {
    const specsPath = path.join(this.projectPath, 'storage', 'specs');
    const requirements = [];

    try {
      const files = await fs.readdir(specsPath);
      const reqFiles = files.filter(f => f.endsWith('-requirements.md'));

      for (const file of reqFiles) {
        const filePath = path.join(specsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        // Parse requirements from content
        const reqRegex = new RegExp(`^###\\s+(${REQ_ID}):?\\s*(.*)$`, 'gm');
        let match;

        while ((match = reqRegex.exec(body)) !== null) {
          requirements.push({
            id: match[1],
            title: match[2] || match[1],
            type: frontmatter.type || 'functional',
            priority: frontmatter.priority || 'medium',
            source: file,
          });
        }

        // Also check frontmatter for requirements list
        if (frontmatter.requirements) {
          for (const req of frontmatter.requirements) {
            if (!requirements.find(r => r.id === req.id)) {
              requirements.push({
                id: req.id,
                title: req.title || req.id,
                type: req.type || 'functional',
                priority: req.priority || 'medium',
                source: file,
              });
            }
          }
        }
      }
    } catch {
      // Specs directory doesn't exist
    }

    return requirements;
  }

  /**
   * Scan designs from storage
   * @returns {Promise<Array<Object>>}
   */
  async scanDesigns() {
    const designs = [];

    for (const filePath of await this.markdownFiles(DESIGN_DIRS, '-design.md')) {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      const file = path.basename(filePath);

      designs.push({
        id: path.basename(file, '-design.md'),
        title: frontmatter.title || file,
        // Declared in frontmatter or named in the document
        requirements: [...new Set([...(frontmatter.requirements || []), ...mentionedIds(body)])],
        path: filePath,
      });
    }

    return designs;
  }

  /**
   * Scan tasks from storage
   * @returns {Promise<Array<Object>>}
   */
  async scanTasks() {
    const tasks = [];

    for (const filePath of await this.markdownFiles(TASK_DIRS, '-tasks.md')) {
      const file = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      // musubi-tasks sections: ### TASK-001: title, **Status**, the REQ ids they cover
      const sections = body
        .split(/^(?=###\s+TASK-\d+:)/m)
        .filter(part => /^###\s+TASK-\d+:/.test(part));
      for (const section of sections) {
        const [, id, title] = section.match(/^###\s+(TASK-\d+):\s*(.+)$/m);
        const status = section.match(/^\*\*Status\*\*:\s*(.+)$/m)?.[1] || '';
        tasks.push({
          id,
          title: title.trim(),
          status: /done|complete/i.test(status) ? 'done' : 'todo',
          requirement: null,
          requirements: mentionedIds(section),
          path: filePath,
        });
      }
      // Without sections, checklist items are the tasks: - [ ] title
      if (sections.length > 0) continue;

      const taskRegex = /^-\s+\[([ x])\]\s+(.+?)(?:\s*\(([^)]+)\))?$/gm;
      let match;
      let taskIndex = 0;

      while ((match = taskRegex.exec(body)) !== null) {
        tasks.push({
          id: `${path.basename(file, '-tasks.md')}-T${++taskIndex}`,
          title: match[2],
          status: match[1] === 'x' ? 'done' : 'todo',
          requirement: frontmatter.requirement || null,
          requirements: frontmatter.requirements || [],
          path: filePath,
        });
      }
    }

    return tasks;
  }

  /**
   * Markdown files ending in `suffix` in the given project directories
   * @param {string[]} dirs - Project-relative directories
   * @param {string} suffix - File name suffix
   * @returns {Promise<string[]>}
   */
  async markdownFiles(dirs, suffix) {
    const files = [];
    for (const dir of dirs) {
      const dirPath = path.join(this.projectPath, dir);
      const names = await fs.readdir(dirPath).catch(() => []);
      files.push(
        ...names.filter(name => name.endsWith(suffix)).map(name => path.join(dirPath, name))
      );
    }
    return files;
  }

  /**
   * Scan code and test files for the requirement ids they name
   * @returns {Promise<Array<Object>>}
   */
  async scanImplementations() {
    const implementations = [];

    for (const dir of CODE_DIRS) {
      await this.walkDirectory(path.join(this.projectPath, dir), async filePath => {
        if (!CODE_FILE.test(filePath)) return;

        // Any named requirement id links the file, as musubi-trace counts it
        const reqs = mentionedIds(await fs.readFile(filePath, 'utf-8'));
        if (reqs.length > 0) {
          implementations.push({
            file: path.relative(this.projectPath, filePath),
            type: dir === 'src' && !TEST_FILE.test(filePath) ? 'source' : 'test',
            requirements: reqs,
          });
        }
      });
    }

    return implementations;
  }

  /**
   * Walk directory recursively
   * @param {string} dir - Directory path
   * @param {Function} callback - Callback for each file
   */
  async walkDirectory(dir, callback) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await this.walkDirectory(fullPath, callback);
          }
        } else {
          await callback(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or access denied
    }
  }

  /**
   * Get coverage statistics
   * @returns {Promise<Object>}
   */
  async getCoverage() {
    const matrix = await this.buildMatrix();
    const total = matrix.coverage.total;

    return {
      total,
      linked: matrix.coverage.linked,
      linkedPercent: total > 0 ? Math.round((matrix.coverage.linked / total) * 100) : 0,
      implemented: matrix.coverage.implemented,
      implementedPercent: total > 0 ? Math.round((matrix.coverage.implemented / total) * 100) : 0,
      tested: matrix.coverage.tested,
      testedPercent: total > 0 ? Math.round((matrix.coverage.tested / total) * 100) : 0,
    };
  }

  /**
   * Find gaps in traceability
   * @returns {Promise<Array<Object>>}
   */
  async findGaps() {
    const matrix = await this.buildMatrix();
    const gaps = [];

    for (const req of matrix.requirements) {
      if (req.links.designs.length === 0) {
        gaps.push({
          type: 'no-design',
          severity: 'warning',
          requirement: req.id,
          message: `Requirement ${req.id} has no linked design`,
        });
      }

      if (req.links.tasks.length === 0) {
        gaps.push({
          type: 'no-tasks',
          severity: 'warning',
          requirement: req.id,
          message: `Requirement ${req.id} has no linked tasks`,
        });
      }

      if (req.links.implementations.length === 0 && req.links.tasks.length > 0) {
        gaps.push({
          type: 'not-implemented',
          severity: 'info',
          requirement: req.id,
          message: `Requirement ${req.id} has tasks but no implementation`,
        });
      }
    }

    return gaps;
  }

  /**
   * Generate a comprehensive traceability report
   * @returns {Promise<Object>} Report data
   */
  async generateReport() {
    const matrix = await this.buildMatrix();
    const coverage = await this.getCoverage();
    const gaps = await this.findGaps();

    return {
      generatedAt: new Date().toISOString(),
      projectPath: this.projectPath,
      summary: {
        totalRequirements: coverage.total,
        linkedRequirements: coverage.linked,
        implementedRequirements: coverage.implemented,
        testedRequirements: coverage.tested,
        coveragePercent: coverage.implementedPercent,
        gapCount: gaps.length,
      },
      coverage,
      gaps,
      matrix: {
        requirements: matrix.requirements,
        links: matrix.links,
      },
    };
  }
}

module.exports = TraceabilityService;
