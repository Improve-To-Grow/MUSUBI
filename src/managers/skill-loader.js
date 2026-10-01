/**
 * MUSUBI Skill Loader
 *
 * キーワードトリガー型スキルのロードと活性化 / Loading and activation of keyword-triggered skills
 *
 * @module src/managers/skill-loader
 * @see REQ-P0-B002
 * @inspired-by OpenHands openhands/microagent/microagent.py
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * スキルタイプ / Skill types
 */
const SkillType = {
  GLOBAL: 'global',
  USER: 'user',
  REPO: 'repo',
  KNOWLEDGE: 'knowledge',
};

/**
 * エージェントタイプ / Agent types
 */
const AgentType = {
  ALL: 'all',
  CODER: 'coder',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
};

/**
 * スキル定義 / Skill definition
 */
class Skill {
  /**
   * @param {Object} options
   * @param {string} options.name - スキル名 / Skill name
   * @param {string} options.type - スキルタイプ / Skill type
   * @param {string[]} options.triggers - トリガーキーワード / Trigger keywords
   * @param {string} options.agent - 対象エージェント / Target agent
   * @param {number} options.priority - 優先度 / Priority
   * @param {string} options.content - スキル内容（Markdown） / Skill content (Markdown)
   * @param {string} options.source - ソースファイルパス / Source file path
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
   * メッセージがこのスキルをトリガーするか判定 / Determine whether a message triggers this skill
   * @param {string} message
   * @returns {boolean}
   */
  matchesTrigger(message) {
    const normalizedMessage = message.toLowerCase();

    return this.triggers.some(trigger => {
      // 正規表現パターン: /pattern/flags / Regex pattern: /pattern/flags
      if (trigger.startsWith('/') && trigger.includes('/', 1)) {
        const lastSlash = trigger.lastIndexOf('/');
        const pattern = trigger.slice(1, lastSlash);
        const flags = trigger.slice(lastSlash + 1) || 'i';
        try {
          const regex = new RegExp(pattern, flags);
          return regex.test(message);
        } catch (e) {
          // 無効な正規表現は無視 / Ignore invalid regular expressions
          return false;
        }
      }

      // 通常のキーワードマッチ / Normal keyword match
      return normalizedMessage.includes(trigger.toLowerCase());
    });
  }

  /**
   * エージェントがこのスキルを使用可能か判定 / Determine whether an agent can use this skill
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
 * スキルローダー / Skill loader
 */
class SkillLoader {
  /**
   * @param {Object} options
   * @param {string} options.globalDir - グローバルスキルディレクトリ / Global skills directory
   * @param {string} options.userDir - ユーザースキルディレクトリ / User skills directory
   * @param {string} options.repoDir - リポジトリスキルディレクトリ / Repository skills directory
   * @param {string} options.projectRoot - プロジェクトルート / Project root
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
   * 全スキルをロード / Load all skills
   * 優先順位: リポジトリ > ユーザー > グローバル / Priority: repository > user > global
   */
  async loadAll() {
    this.loadedSkills.clear();

    // グローバルスキルをロード（最低優先度） / Load global skills (lowest priority)
    await this._loadFromDirectory(this.globalDir, SkillType.GLOBAL, 0);

    // ユーザースキルをロード / Load user skills
    await this._loadFromDirectory(this.userDir, SkillType.USER, 100);

    // リポジトリスキルをロード（最高優先度） / Load repository skills (highest priority)
    await this._loadFromDirectory(this.repoDir, SkillType.REPO, 200);

    this.initialized = true;
    return this.getSkills();
  }

  /**
   * ディレクトリからスキルをロード / Load skills from a directory
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
          // 同名スキルは高優先度で上書き / Skills with the same name are overwritten by higher priority
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
   * スキルファイルをパース / Parse a skill file
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

    // トリガーの正規化 / Normalize triggers
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
   * Frontmatterをパース / Parse frontmatter
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

    // 簡易YAMLパーサー / Simple YAML parser
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let inArray = false;
    let arrayValue = [];

    for (const line of lines) {
      // 配列項目 / Array item
      if (line.match(/^\s*-\s+(.+)$/)) {
        if (currentKey && inArray) {
          arrayValue.push(line.match(/^\s*-\s+(.+)$/)[1].trim());
        }
        continue;
      }

      // 配列終了判定 / Detect end of array
      if (inArray && currentKey && !line.match(/^\s*-/)) {
        frontmatter[currentKey] = arrayValue;
        arrayValue = [];
        inArray = false;
        currentKey = null;
      }

      // キーバリューペア / Key-value pair
      const kvMatch = line.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const value = kvMatch[2].trim();

        if (value === '' || value === '|') {
          // 配列または複数行の開始 / Start of array or multi-line value
          currentKey = key;
          inArray = true;
          arrayValue = [];
        } else {
          frontmatter[key] = this._parseValue(value);
        }
      }
    }

    // 最後の配列を処理 / Process the last array
    if (inArray && currentKey && arrayValue.length > 0) {
      frontmatter[currentKey] = arrayValue;
    }

    return { frontmatter, body };
  }

  /**
   * 値をパース / Parse a value
   * @param {string} value
   * @returns {any}
   */
  _parseValue(value) {
    // 数値 / Number
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    // ブール値 / Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    // 配列（インライン） / Array (inline)
    if (value.startsWith('[') && value.endsWith(']')) {
      return value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    }
    // 文字列 / String
    return value.replace(/^["']|["']$/g, '');
  }

  /**
   * キーワードに基づいてスキルを活性化 / Activate skills based on keywords
   * @param {string} message ユーザーメッセージ / User message
   * @param {string} agentType エージェントタイプ / Agent type
   * @returns {Skill[]} 活性化されたスキル（優先度順） / Activated skills (sorted by priority)
   */
  activateByKeywords(message, agentType = AgentType.ALL) {
    if (!this.initialized) {
      console.warn('SkillLoader not initialized. Call loadAll() first.');
      return [];
    }

    const matchedSkills = [];

    for (const skill of this.loadedSkills.values()) {
      // エージェント互換性チェック / Agent compatibility check
      if (!skill.isAvailableFor(agentType)) {
        continue;
      }

      // トリガーマッチング / Trigger matching
      if (skill.matchesTrigger(message)) {
        matchedSkills.push(skill);
      }
    }

    // 優先度でソート（降順） / Sort by priority (descending)
    matchedSkills.sort((a, b) => b.priority - a.priority);

    return matchedSkills;
  }

  /**
   * 名前でスキルを取得 / Get a skill by name
   * @param {string} name
   * @returns {Skill|undefined}
   */
  getSkill(name) {
    return this.loadedSkills.get(name);
  }

  /**
   * 全スキルを取得 / Get all skills
   * @returns {Skill[]}
   */
  getSkills() {
    return Array.from(this.loadedSkills.values());
  }

  /**
   * スキルタイプでフィルタリング / Filter by skill type
   * @param {string} type
   * @returns {Skill[]}
   */
  getSkillsByType(type) {
    return this.getSkills().filter(s => s.type === type);
  }

  /**
   * リポジトリスキルが存在するか確認 / Check whether repository skills exist
   * @returns {boolean}
   */
  hasRepoSkills() {
    return fs.existsSync(this.repoDir) && fs.readdirSync(this.repoDir).some(f => f.endsWith('.md'));
  }

  /**
   * ロードされたスキルのサマリーをMarkdownで出力 / Output a Markdown summary of loaded skills
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
   * 活性化されたスキルをプロンプトに変換 / Convert activated skills into a prompt
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
