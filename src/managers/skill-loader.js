/**
 * MUSUBI Skill Loader
 *
 * Loads and activates keyword-triggered skills
 *
 * @module src/managers/skill-loader
 * @see REQ-P0-B002
 * @inspired-by OpenHands openhands/microagent/microagent.py
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Skill types
 */
const SkillType = {
  GLOBAL: 'global',
  USER: 'user',
  REPO: 'repo',
  KNOWLEDGE: 'knowledge',
};

/**
 * Agent types
 */
const AgentType = {
  ALL: 'all',
  CODER: 'coder',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
};

/**
 * Skill definition
 */
class Skill {
  /**
   * @param {Object} options
   * @param {string} options.name - Skill name
   * @param {string} options.type - Skill type
   * @param {string[]} options.triggers - Trigger keywords
   * @param {string} options.agent - Target agent
   * @param {number} options.priority - Priority
   * @param {string} options.content - Skill content (Markdown)
   * @param {string} options.source - Source file path
   */
  constructor(options = {}) {
    this.name = options.name || 'unnamed';
    this.type = options.type || SkillType.GLOBAL;
    this.triggers = options.triggers || [];
    this.agent = options.agent || AgentType.ALL;
    this.priority = options.priority || 0;
    this.content = options.content || '';
    this.source = options.source || '';
    this.loadedAt = new Date();
  }

  /**
   * Determine whether a message triggers this skill
   * @param {string} message
   * @returns {boolean}
   */
  matchesTrigger(message) {
    const normalizedMessage = message.toLowerCase();

    return this.triggers.some(trigger => {
      // Regular expression pattern: /pattern/flags
      if (trigger.startsWith('/') && trigger.includes('/', 1)) {
        const lastSlash = trigger.lastIndexOf('/');
        const pattern = trigger.slice(1, lastSlash);
        const flags = trigger.slice(lastSlash + 1) || 'i';
        try {
          const regex = new RegExp(pattern, flags);
          return regex.test(message);
        } catch (e) {
          // Ignore invalid regular expressions
          return false;
        }
      }

      // Plain keyword match
      return normalizedMessage.includes(trigger.toLowerCase());
    });
  }

  /**
   * Determine whether an agent can use this skill
   * @param {string} agentType
   * @returns {boolean}
   */
  isAvailableFor(agentType) {
    if (this.agent === AgentType.ALL) {
      return true;
    }
    return this.agent === agentType;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      triggers: this.triggers,
      agent: this.agent,
      priority: this.priority,
      source: this.source,
      loadedAt: this.loadedAt.toISOString(),
    };
  }
}

/**
 * Skill loader
 */
class SkillLoader {
  /**
   * @param {Object} options
   * @param {string} options.globalDir - Global skills directory
   * @param {string} options.userDir - User skills directory
   * @param {string} options.repoDir - Repository skills directory
   * @param {string} options.projectRoot - Project root
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.globalDir = options.globalDir || path.join(__dirname, '../../steering/templates/skills');
    this.userDir = options.userDir || path.join(os.homedir(), '.musubi/skills');
    this.repoDir = options.repoDir || path.join(this.projectRoot, '.musubi/skills');

    this.loadedSkills = new Map();
    this.initialized = false;
  }

  /**
   * Load all skills
   * Priority: repository > user > global
   */
  async loadAll() {
    this.loadedSkills.clear();

    // Load global skills (lowest priority)
    await this._loadFromDirectory(this.globalDir, SkillType.GLOBAL, 0);

    // Load user skills
    await this._loadFromDirectory(this.userDir, SkillType.USER, 100);

    // Load repository skills (highest priority)
    await this._loadFromDirectory(this.repoDir, SkillType.REPO, 200);

    this.initialized = true;
    return this.getSkills();
  }

  /**
   * Load skills from a directory
   * @param {string} dir
   * @param {string} defaultType
   * @param {number} basePriority
   */
  async _loadFromDirectory(dir, defaultType, basePriority) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const skill = await this.parseSkill(filePath, defaultType, basePriority);
        if (skill) {
          // A skill with the same name is overridden by the higher-priority one
          const existing = this.loadedSkills.get(skill.name);
          if (!existing || skill.priority > existing.priority) {
            this.loadedSkills.set(skill.name, skill);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse skill: ${filePath}`, error.message);
      }
    }
  }

  /**
   * Parse a skill file
   * @param {string} filePath
   * @param {string} defaultType
   * @param {number} basePriority
   * @returns {Skill|null}
   */
  async parseSkill(filePath, defaultType = SkillType.GLOBAL, basePriority = 0) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = this._parseFrontmatter(content);

    if (!frontmatter.name) {
      frontmatter.name = path.basename(filePath, '.md');
    }

    // Normalize triggers
    let triggers = frontmatter.triggers || [];
    if (typeof triggers === 'string') {
      triggers = triggers.split(',').map(t => t.trim());
    }

    return new Skill({
      name: frontmatter.name,
      type: frontmatter.type || defaultType,
      triggers: triggers,
      agent: frontmatter.agent || AgentType.ALL,
      priority: (frontmatter.priority || 0) + basePriority,
      content: body.trim(),
      source: filePath,
    });
  }

  /**
   * Parse the frontmatter
   * @param {string} content
   * @returns {{ frontmatter: Object, body: string }}
   */
  _parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, body: content };
    }

    const frontmatterText = match[1];
    const body = match[2];

    // Simple YAML parser
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let inArray = false;
    let arrayValue = [];

    for (const line of lines) {
      // Array item
      if (line.match(/^\s*-\s+(.+)$/)) {
        if (currentKey && inArray) {
          arrayValue.push(line.match(/^\s*-\s+(.+)$/)[1].trim());
        }
        continue;
      }

      // Detect the end of an array
      if (inArray && currentKey && !line.match(/^\s*-/)) {
        frontmatter[currentKey] = arrayValue;
        arrayValue = [];
        inArray = false;
        currentKey = null;
      }

      // Key-value pair
      const kvMatch = line.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const value = kvMatch[2].trim();

        if (value === '' || value === '|') {
          // Start of an array or multi-line value
          currentKey = key;
          inArray = true;
          arrayValue = [];
        } else {
          frontmatter[key] = this._parseValue(value);
        }
      }
    }

    // Handle the last array
    if (inArray && currentKey && arrayValue.length > 0) {
      frontmatter[currentKey] = arrayValue;
    }

    return { frontmatter, body };
  }

  /**
   * Parse a value
   * @param {string} value
   * @returns {any}
   */
  _parseValue(value) {
    // Number
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    // Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    // Inline array
    if (value.startsWith('[') && value.endsWith(']')) {
      return value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    }
    // String
    return value.replace(/^["']|["']$/g, '');
  }

  /**
   * Activate skills based on keywords
   * @param {string} message User message
   * @param {string} agentType Agent type
   * @returns {Skill[]} Activated skills (ordered by priority)
   */
  activateByKeywords(message, agentType = AgentType.ALL) {
    if (!this.initialized) {
      console.warn('SkillLoader not initialized. Call loadAll() first.');
      return [];
    }

    const matchedSkills = [];

    for (const skill of this.loadedSkills.values()) {
      // Check agent compatibility
      if (!skill.isAvailableFor(agentType)) {
        continue;
      }

      // Trigger matching
      if (skill.matchesTrigger(message)) {
        matchedSkills.push(skill);
      }
    }

    // Sort by priority (descending)
    matchedSkills.sort((a, b) => b.priority - a.priority);

    return matchedSkills;
  }

  /**
   * Get a skill by name
   * @param {string} name
   * @returns {Skill|undefined}
   */
  getSkill(name) {
    return this.loadedSkills.get(name);
  }

  /**
   * Get all skills
   * @returns {Skill[]}
   */
  getSkills() {
    return Array.from(this.loadedSkills.values());
  }

  /**
   * Filter by skill type
   * @param {string} type
   * @returns {Skill[]}
   */
  getSkillsByType(type) {
    return this.getSkills().filter(s => s.type === type);
  }

  /**
   * Check whether repository skills exist
   * @returns {boolean}
   */
  hasRepoSkills() {
    return fs.existsSync(this.repoDir) && fs.readdirSync(this.repoDir).some(f => f.endsWith('.md'));
  }

  /**
   * Output a Markdown summary of the loaded skills
   * @returns {string}
   */
  getSummary() {
    if (this.loadedSkills.size === 0) {
      return '# Loaded Skills\n\nNo skills loaded.';
    }

    let md = '# Loaded Skills\n\n';
    md += `Total: ${this.loadedSkills.size} skills\n\n`;
    md += '| Name | Type | Priority | Triggers | Agent |\n';
    md += '|------|------|----------|----------|-------|\n';

    const sortedSkills = this.getSkills().sort((a, b) => b.priority - a.priority);
    for (const skill of sortedSkills) {
      const triggers =
        skill.triggers.length > 3
          ? skill.triggers.slice(0, 3).join(', ') + '...'
          : skill.triggers.join(', ');
      md += `| ${skill.name} | ${skill.type} | ${skill.priority} | ${triggers} | ${skill.agent} |\n`;
    }

    return md;
  }

  /**
   * Convert activated skills into a prompt
   * @param {Skill[]} skills
   * @returns {string}
   */
  formatSkillsForPrompt(skills) {
    if (skills.length === 0) {
      return '';
    }

    let prompt = '\n## Activated Skills\n\n';
    prompt += 'The following skills are relevant to the current context:\n\n';

    for (const skill of skills) {
      prompt += `### ${skill.name}\n\n`;
      prompt += skill.content;
      prompt += '\n\n---\n\n';
    }

    return prompt;
  }
}

module.exports = {
  SkillLoader,
  Skill,
  SkillType,
  AgentType,
};
