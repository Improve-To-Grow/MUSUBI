/**
 * Tech Article Generator
 *
 * Generates publication-ready technical articles for various platforms.
 *
 * Output language is explicit: pass `language` per call, or set
 * `defaultLanguage` on the generator. Only the boilerplate the generator
 * emits itself (section headings, table columns, experiment-report prose) is
 * localized — article body content is always used exactly as supplied, so
 * this does not translate anything. See `STRINGS` for the supported
 * languages and `registerLanguage()` for adding one.
 *
 *   // Japanese article for Qiita
 *   generator.generate(content, { platform: PLATFORM.QIITA, language: LANGUAGE.JA });
 *
 * Requirement: IMP-6.2-006-02
 *
 * @module enterprise/tech-article
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Supported platforms
 */
const PLATFORM = {
  QIITA: 'qiita',
  ZENN: 'zenn',
  MEDIUM: 'medium',
  DEVTO: 'devto',
  GENERIC: 'generic',
};

/**
 * Article type enum
 */
const ARTICLE_TYPE = {
  TUTORIAL: 'tutorial',
  DEEP_DIVE: 'deep-dive',
  ANNOUNCEMENT: 'announcement',
  COMPARISON: 'comparison',
  HOW_TO: 'how-to',
  CASE_STUDY: 'case-study',
};

/**
 * Supported output languages for generated boilerplate
 *
 * Qiita and Zenn are Japanese-language platforms, so `ja` is the usual
 * pairing for them. Any language can be added with `registerLanguage()`.
 */
const LANGUAGE = {
  EN: 'en',
  JA: 'ja',
};

/**
 * Reading speed by script, used by estimateReadingTime().
 * CJK has no word separators, so it is measured per character.
 */
const WORDS_PER_MINUTE = 200;
const CJK_CHARS_PER_MINUTE = 500;

/**
 * Fallback slug for titles that contain no slug-safe characters
 */
const SLUG_FALLBACK = 'article';

/**
 * Localized strings for the headings and prose the generator emits itself.
 * Article body content is always supplied by the caller and never translated.
 */
const STRINGS = {
  [LANGUAGE.EN]: {
    untitled: 'Untitled Article',
    tableOfContents: 'Table of Contents',
    benchmarkResults: 'Benchmark Results',
    conclusion: 'Conclusion',
    references: 'References',
    experimentSummary: 'Experiment Summary',
    metrics: 'Metrics',
    observations: 'Observations',
    performance: 'Performance',
    coverage: 'Coverage',
    colItem: 'Item',
    colValue: 'Value',
    colMetric: 'Metric',
    colType: 'Type',
    rowTotalTests: 'Total Tests',
    rowPassed: 'Passed',
    rowFailed: 'Failed',
    rowSkipped: 'Skipped',
    rowPassRate: 'Pass Rate',
    rowTotalDuration: 'Total Duration',
    experimentUnknown: 'Unknown',
    experimentTestSuite: 'the test suite',
    experimentDescription: 'A report of experiment results and observations',
    experimentTags: ['experiment', 'test', 'report'],
    experimentReportTitle: title => `Experiment Report: ${title}`,
    experimentIntroduction: (title, total, passRate) =>
      `This article reports the experiment results for ${title}. ` +
      `A total of ${total} tests were run, ` +
      `achieving a pass rate of ${passRate}.`,
    experimentConclusion: {
      excellent: 'The experiment completed very successfully. All quality criteria were met.',
      good: 'The experiment was largely successful, but some areas for improvement were found.',
      mixed: 'The experiment results were mixed. Several significant issues were detected.',
      poor: 'The experiment detected many issues. A fundamental review is required.',
    },
    readingTime: minutes => `${minutes} min read`,
  },
  [LANGUAGE.JA]: {
    untitled: '無題の記事',
    tableOfContents: '目次',
    benchmarkResults: 'ベンチマーク結果',
    conclusion: 'まとめ',
    references: '参考リンク',
    experimentSummary: '実験サマリー',
    metrics: 'メトリクス',
    observations: '考察',
    performance: 'パフォーマンス',
    coverage: 'カバレッジ',
    colItem: '項目',
    colValue: '値',
    colMetric: '指標',
    colType: '種別',
    rowTotalTests: 'テスト総数',
    rowPassed: '成功',
    rowFailed: '失敗',
    rowSkipped: 'スキップ',
    rowPassRate: '成功率',
    rowTotalDuration: '合計実行時間',
    experimentUnknown: '不明',
    experimentTestSuite: 'テストスイート',
    experimentDescription: '実験結果と考察のレポート',
    experimentTags: ['実験', 'テスト', 'レポート'],
    experimentReportTitle: title => `実験レポート: ${title}`,
    experimentIntroduction: (title, total, passRate) =>
      `この記事では、${title}の実験結果を報告します。` +
      `合計${total}件のテストを実行し、成功率は${passRate}でした。`,
    experimentConclusion: {
      excellent: '実験は非常に順調に完了しました。すべての品質基準を満たしています。',
      good: '実験はおおむね成功しましたが、いくつか改善の余地が見つかりました。',
      mixed: '実験結果はまちまちでした。いくつかの重大な問題が検出されています。',
      poor: '実験で多くの問題が検出されました。根本的な見直しが必要です。',
    },
    readingTime: minutes => `約${minutes}分で読めます`,
  },
};

/**
 * Tech Article Generator
 */
class TechArticleGenerator {
  /**
   * Create a new TechArticleGenerator
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || 'docs/articles',
      defaultPlatform: config.defaultPlatform || PLATFORM.GENERIC,
      defaultLanguage: config.defaultLanguage || 'en',
      includeTableOfContents: config.includeTableOfContents !== false,
      includeFrontMatter: config.includeFrontMatter !== false,
      ...config,
    };

    this.templates = this.loadTemplates();
    this.strings = this.loadStrings();
  }

  /**
   * Load language string tables
   * @returns {Object} Strings by language code
   */
  loadStrings() {
    return { ...STRINGS };
  }

  /**
   * Resolve the output language for a generation call
   *
   * Precedence: per-call `options.language` > `config.defaultLanguage` > 'en'.
   * An unknown language code falls back to English rather than throwing, so a
   * typo degrades to readable output instead of a crash.
   *
   * @param {Object} options - Generation options
   * @returns {string} Language code
   */
  resolveLanguage(options = {}) {
    const requested = options.language || this.config.defaultLanguage || LANGUAGE.EN;
    return this.strings[requested] ? requested : LANGUAGE.EN;
  }

  /**
   * Get the string table for a language
   * @param {string} language - Language code
   * @returns {Object} String table
   */
  getStrings(language) {
    return this.strings[language] || this.strings[LANGUAGE.EN];
  }

  /**
   * Register a custom language string table
   * @param {string} language - Language code
   * @param {Object} strings - String table, merged over the English defaults
   */
  registerLanguage(language, strings) {
    this.strings[language] = { ...this.strings[LANGUAGE.EN], ...strings };
  }

  /**
   * Load platform templates
   * @returns {Object} Templates by platform
   */
  loadTemplates() {
    return {
      [PLATFORM.QIITA]: {
        frontMatter: meta => `---
title: "${meta.title}"
tags: [${meta.tags.map(t => `"${t}"`).join(', ')}]
private: false
---`,
        codeBlock: (lang, code) => `\`\`\`${lang}\n${code}\n\`\`\``,
        note: (text, type = 'info') => `:::note ${type}\n${text}\n:::`,
        link: (text, url) => `[${text}](${url})`,
      },
      [PLATFORM.ZENN]: {
        frontMatter: meta => `---
title: "${meta.title}"
emoji: "${meta.emoji || '📝'}"
type: "${meta.articleType || 'tech'}"
topics: [${meta.tags.map(t => `"${t}"`).join(', ')}]
published: true
---`,
        codeBlock: (lang, code, filename) =>
          filename
            ? `\`\`\`${lang}:${filename}\n${code}\n\`\`\``
            : `\`\`\`${lang}\n${code}\n\`\`\``,
        note: (text, type = 'info') => `:::message ${type === 'warn' ? 'alert' : ''}\n${text}\n:::`,
        link: (text, url) => `[${text}](${url})`,
      },
      [PLATFORM.MEDIUM]: {
        frontMatter: () => '', // Medium doesn't use front matter
        codeBlock: (lang, code) => `\`\`\`${lang}\n${code}\n\`\`\``,
        note: text => `> **Note:** ${text}`,
        link: (text, url) => `[${text}](${url})`,
      },
      [PLATFORM.DEVTO]: {
        frontMatter: meta => `---
title: "${meta.title}"
published: true
description: "${meta.description || ''}"
tags: ${meta.tags.slice(0, 4).join(', ')}
cover_image: ${meta.coverImage || ''}
---`,
        codeBlock: (lang, code) => `\`\`\`${lang}\n${code}\n\`\`\``,
        note: (text, type = 'info') =>
          `{% ${type === 'warn' ? 'warning' : type} %}\n${text}\n{% end${type === 'warn' ? 'warning' : type} %}`,
        link: (text, url) => `[${text}](${url})`,
      },
      [PLATFORM.GENERIC]: {
        frontMatter: meta => `---
title: "${meta.title}"
date: "${meta.date || new Date().toISOString()}"
author: "${meta.author || 'MUSUBI SDD'}"
tags: [${meta.tags.map(t => `"${t}"`).join(', ')}]
---`,
        codeBlock: (lang, code) => `\`\`\`${lang}\n${code}\n\`\`\``,
        note: text => `> **Note:** ${text}`,
        link: (text, url) => `[${text}](${url})`,
      },
    };
  }

  /**
   * Generate article from template
   * @param {Object} content - Article content
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated article info
   */
  async generate(content, options = {}) {
    const platform = options.platform || this.config.defaultPlatform;
    const template = this.templates[platform] || this.templates[PLATFORM.GENERIC];
    const language = this.resolveLanguage(options);
    const s = this.getStrings(language);

    const metadata = {
      title: content.title || s.untitled,
      description: content.description || '',
      tags: content.tags || [],
      author: content.author || 'MUSUBI SDD',
      date: new Date().toISOString(),
      emoji: content.emoji || '📝',
      articleType: content.articleType || ARTICLE_TYPE.TUTORIAL,
      coverImage: content.coverImage || '',
      language,
    };

    const sections = [];

    // Front matter
    if (this.config.includeFrontMatter) {
      sections.push(template.frontMatter(metadata));
      sections.push('');
    }

    // Title (for platforms that don't include it in front matter)
    if (platform === PLATFORM.MEDIUM) {
      sections.push(`# ${metadata.title}`);
      sections.push('');
    }

    // Introduction
    if (content.introduction) {
      sections.push(content.introduction);
      sections.push('');
    }

    // Table of Contents
    if (this.config.includeTableOfContents && content.sections) {
      sections.push(`## ${s.tableOfContents}`);
      sections.push('');
      content.sections.forEach((section, idx) => {
        sections.push(`${idx + 1}. [${section.title}](#${this.slugify(section.title)})`);
      });
      sections.push('');
    }

    // Main sections
    if (content.sections) {
      for (const section of content.sections) {
        sections.push(`## ${section.title}`);
        sections.push('');

        if (section.content) {
          sections.push(section.content);
          sections.push('');
        }

        // Code examples
        if (section.codeExamples) {
          for (const example of section.codeExamples) {
            if (example.description) {
              sections.push(example.description);
              sections.push('');
            }
            sections.push(
              template.codeBlock(example.language || 'javascript', example.code, example.filename)
            );
            sections.push('');
          }
        }

        // Notes
        if (section.notes) {
          for (const note of section.notes) {
            sections.push(template.note(note.text, note.type));
            sections.push('');
          }
        }

        // Subsections
        if (section.subsections) {
          for (const sub of section.subsections) {
            sections.push(`### ${sub.title}`);
            sections.push('');
            if (sub.content) {
              sections.push(sub.content);
              sections.push('');
            }
          }
        }
      }
    }

    // Benchmarks
    if (content.benchmarks) {
      sections.push(`## ${s.benchmarkResults}`);
      sections.push('');
      sections.push(`| ${s.colItem} | ${s.colValue} |`);
      sections.push('|------|-----|');
      for (const [key, value] of Object.entries(content.benchmarks)) {
        sections.push(`| ${key} | ${value} |`);
      }
      sections.push('');
    }

    // Conclusion
    if (content.conclusion) {
      sections.push(`## ${s.conclusion}`);
      sections.push('');
      sections.push(content.conclusion);
      sections.push('');
    }

    // References
    if (content.references && content.references.length > 0) {
      sections.push(`## ${s.references}`);
      sections.push('');
      for (const ref of content.references) {
        sections.push(`- ${template.link(ref.title, ref.url)}`);
      }
      sections.push('');
    }

    // Footer
    if (content.footer) {
      sections.push('---');
      sections.push('');
      sections.push(content.footer);
    }

    const article = sections.join('\n');
    const filePath = await this.saveArticle(article, metadata, platform);

    return {
      article,
      metadata,
      filePath,
      platform,
      language,
      wordCount: this.countWords(article),
      readingTime: this.estimateReadingTime(article, language),
    };
  }

  /**
   * Generate article from experiment report
   * @param {Object} experimentReport - Experiment report data
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated article info
   */
  async generateFromExperiment(experimentReport, options = {}) {
    const language = this.resolveLanguage(options);
    const s = this.getStrings(language);

    const content = {
      title:
        options.title ||
        s.experimentReportTitle(experimentReport.metadata?.title || s.experimentUnknown),
      description: options.description || s.experimentDescription,
      tags: options.tags || s.experimentTags,
      introduction:
        options.introduction || this.generateExperimentIntroduction(experimentReport, language),
      sections: this.generateExperimentSections(experimentReport, language),
      benchmarks: this.extractBenchmarks(experimentReport, language),
      conclusion:
        options.conclusion || this.generateExperimentConclusion(experimentReport, language),
      references: options.references || [],
    };

    return this.generate(content, { ...options, language });
  }

  /**
   * Generate introduction from experiment
   * @param {Object} report - Experiment report
   * @param {string} [language] - Output language
   * @returns {string} Introduction text
   */
  generateExperimentIntroduction(report, language) {
    const s = this.getStrings(language || this.resolveLanguage());
    const summary = report.summary || {};
    return s.experimentIntroduction(
      report.metadata?.title || s.experimentTestSuite,
      summary.total || 0,
      summary.passRate || '0%'
    );
  }

  /**
   * Generate sections from experiment
   * @param {Object} report - Experiment report
   * @param {string} [language] - Output language
   * @returns {Array} Sections
   */
  generateExperimentSections(report, language) {
    const lang = language || this.resolveLanguage();
    const s = this.getStrings(lang);
    const sections = [];

    // Summary section
    sections.push({
      title: s.experimentSummary,
      content: `
| ${s.colMetric} | ${s.colValue} |
|--------|-------|
| ${s.rowTotalTests} | ${report.summary?.total || 0} |
| ${s.rowPassed} | ${report.summary?.passed || 0} |
| ${s.rowFailed} | ${report.summary?.failed || 0} |
| ${s.rowSkipped} | ${report.summary?.skipped || 0} |
| ${s.rowPassRate} | ${report.summary?.passRate || '0%'} |
      `.trim(),
    });

    // Metrics section (if available)
    if (report.metrics && Object.keys(report.metrics).length > 0) {
      sections.push({
        title: s.metrics,
        content: this.formatMetricsSection(report.metrics, lang),
      });
    }

    // Observations section
    if (report.observations && report.observations.length > 0) {
      sections.push({
        title: s.observations,
        content: report.observations.map(o => `- ${o}`).join('\n'),
      });
    }

    return sections;
  }

  /**
   * Format metrics section
   * @param {Object} metrics - Metrics object
   * @param {string} [language] - Output language
   * @returns {string} Formatted content
   */
  formatMetricsSection(metrics, language) {
    const s = this.getStrings(language || this.resolveLanguage());
    const lines = [];

    if (metrics.performance) {
      lines.push(`### ${s.performance}`);
      lines.push('');
      lines.push(`| ${s.colMetric} | ${s.colValue} |`);
      lines.push('|--------|-------|');
      for (const [key, value] of Object.entries(metrics.performance)) {
        lines.push(`| ${key} | ${value} |`);
      }
      lines.push('');
    }

    if (metrics.coverage) {
      lines.push(`### ${s.coverage}`);
      lines.push('');
      lines.push(`| ${s.colType} | ${s.colValue} |`);
      lines.push('|------|-------|');
      for (const [key, value] of Object.entries(metrics.coverage)) {
        lines.push(`| ${key} | ${value} |`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Extract benchmarks from report
   * @param {Object} report - Experiment report
   * @returns {Object} Benchmarks
   */
  extractBenchmarks(report, language) {
    const s = this.getStrings(language || this.resolveLanguage());
    const benchmarks = {};

    if (report.metrics?.performance) {
      Object.assign(benchmarks, report.metrics.performance);
    }

    if (report.summary?.duration) {
      benchmarks[s.rowTotalDuration] = `${report.summary.duration}ms`;
    }

    return Object.keys(benchmarks).length > 0 ? benchmarks : null;
  }

  /**
   * Generate conclusion from experiment
   * @param {Object} report - Experiment report
   * @param {string} [language] - Output language
   * @returns {string} Conclusion text
   */
  generateExperimentConclusion(report, language) {
    const s = this.getStrings(language || this.resolveLanguage());
    const summary = report.summary || {};
    const passRate = parseFloat(summary.passRate) || 0;

    if (passRate >= 95) {
      return s.experimentConclusion.excellent;
    } else if (passRate >= 80) {
      return s.experimentConclusion.good;
    } else if (passRate >= 50) {
      return s.experimentConclusion.mixed;
    } else {
      return s.experimentConclusion.poor;
    }
  }

  /**
   * Save article to file
   * @param {string} content - Article content
   * @param {Object} metadata - Article metadata
   * @param {string} platform - Target platform
   * @returns {Promise<string>} File path
   */
  async saveArticle(content, metadata, platform) {
    await this.ensureOutputDir();

    const slug = this.slugify(metadata.title);
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${timestamp}-${slug}-${platform}.md`;
    const filePath = path.join(this.config.outputDir, fileName);

    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Ensure output directory exists
   * @returns {Promise<void>}
   */
  async ensureOutputDir() {
    await fs.mkdir(this.config.outputDir, { recursive: true });
  }

  /**
   * Convert string to slug
   *
   * CJK characters are preserved: stripping them would reduce a Japanese
   * title to an empty slug and every article would collide on the same
   * generated file name. Titles with no slug-safe characters at all (e.g.
   * one made only of 【】 brackets) fall back to SLUG_FALLBACK.
   *
   * @param {string} text - Input text
   * @returns {string} Slug
   */
  slugify(text) {
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s\-぀-ゟ゠-ヿ一-鿿]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
      .replace(/-+$/g, '');

    return slug || SLUG_FALLBACK;
  }

  /**
   * Count words in text
   * @param {string} text - Input text
   * @returns {number} Word count
   */
  countWords(text) {
    // Count CJK characters individually (no word separators) plus Latin words
    const { cjk, words } = this.countUnits(text);
    return cjk + words;
  }

  /**
   * Count CJK characters and Latin words separately
   *
   * The two scripts are read at different speeds, so estimateReadingTime
   * needs them apart rather than as a single total.
   *
   * @param {string} text - Input text
   * @returns {{cjk: number, words: number}} Counts by script
   */
  countUnits(text) {
    return {
      cjk: (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []).length,
      words: (text.match(/\b\w+\b/g) || []).length,
    };
  }

  /**
   * Estimate reading time
   *
   * Each script is weighted by its own reading speed, so a Japanese article
   * is not reported as roughly 2.5x longer than it reads.
   *
   * @param {string} text - Article text
   * @param {string} [language] - Language of the label
   * @returns {string} Reading time estimate
   */
  estimateReadingTime(text, language) {
    const s = this.getStrings(language || this.resolveLanguage());
    const { cjk, words } = this.countUnits(text);
    const minutes = Math.max(1, Math.ceil(cjk / CJK_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE));
    return s.readingTime(minutes);
  }

  /**
   * Get platform template
   * @param {string} platform - Platform name
   * @returns {Object} Template
   */
  getTemplate(platform) {
    return this.templates[platform] || this.templates[PLATFORM.GENERIC];
  }

  /**
   * Register custom template
   * @param {string} platform - Platform name
   * @param {Object} template - Template object
   */
  registerTemplate(platform, template) {
    this.templates[platform] = template;
  }
}

/**
 * Create a new TechArticleGenerator instance
 * @param {Object} config - Configuration options
 * @returns {TechArticleGenerator}
 */
function createTechArticleGenerator(config = {}) {
  return new TechArticleGenerator(config);
}

module.exports = {
  TechArticleGenerator,
  createTechArticleGenerator,
  PLATFORM,
  ARTICLE_TYPE,
  LANGUAGE,
};
