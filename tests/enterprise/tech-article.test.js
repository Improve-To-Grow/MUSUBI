/**
 * Tech Article Generator Tests
 *
 * Requirement: IMP-6.2-006-02
 */

const {
  TechArticleGenerator,
  createTechArticleGenerator,
  PLATFORM,
  ARTICLE_TYPE,
  LANGUAGE,
} = require('../../src/enterprise/tech-article');
const fs = require('fs').promises;

describe('TechArticleGenerator', () => {
  let generator;
  const testDir = 'test-tech-article-temp';

  beforeEach(async () => {
    generator = new TechArticleGenerator({ outputDir: testDir });
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      /* ignore cleanup errors */
    }
  });

  describe('constructor', () => {
    it('should create generator with default config', () => {
      const g = new TechArticleGenerator();
      expect(g.config.defaultPlatform).toBe(PLATFORM.GENERIC);
      expect(g.config.defaultLanguage).toBe('en');
      expect(g.config.includeTableOfContents).toBe(true);
    });

    it('should load templates for all platforms', () => {
      const g = new TechArticleGenerator();
      expect(g.templates[PLATFORM.QIITA]).toBeDefined();
      expect(g.templates[PLATFORM.ZENN]).toBeDefined();
      expect(g.templates[PLATFORM.MEDIUM]).toBeDefined();
      expect(g.templates[PLATFORM.DEVTO]).toBeDefined();
    });
  });

  describe('PLATFORM', () => {
    it('should define all platforms', () => {
      expect(PLATFORM.QIITA).toBe('qiita');
      expect(PLATFORM.ZENN).toBe('zenn');
      expect(PLATFORM.MEDIUM).toBe('medium');
      expect(PLATFORM.DEVTO).toBe('devto');
      expect(PLATFORM.GENERIC).toBe('generic');
    });
  });

  describe('ARTICLE_TYPE', () => {
    it('should define all article types', () => {
      expect(ARTICLE_TYPE.TUTORIAL).toBe('tutorial');
      expect(ARTICLE_TYPE.DEEP_DIVE).toBe('deep-dive');
      expect(ARTICLE_TYPE.ANNOUNCEMENT).toBe('announcement');
    });
  });

  describe('generate', () => {
    it('should generate article with basic content', async () => {
      const content = {
        title: 'Test Article',
        introduction: 'This is a test article.',
        sections: [{ title: 'Section 1', content: 'Content 1' }],
        conclusion: 'In conclusion...',
      };

      const result = await generator.generate(content);

      expect(result.article).toContain('Test Article');
      expect(result.article).toContain('Section 1');
      expect(result.filePath).toBeDefined();
    });

    it('should generate for specific platform', async () => {
      const content = {
        title: 'Qiita Article',
        tags: ['javascript', 'react'],
      };

      const result = await generator.generate(content, { platform: PLATFORM.QIITA });

      expect(result.platform).toBe(PLATFORM.QIITA);
      expect(result.article).toContain('tags:');
    });

    it('should include code examples', async () => {
      const content = {
        title: 'Code Article',
        sections: [
          {
            title: 'Code Example',
            codeExamples: [
              {
                language: 'javascript',
                code: 'const x = 1;',
                description: 'A simple variable',
              },
            ],
          },
        ],
      };

      const result = await generator.generate(content);

      expect(result.article).toContain('```javascript');
      expect(result.article).toContain('const x = 1;');
    });

    it('should include table of contents', async () => {
      const content = {
        title: 'TOC Article',
        sections: [{ title: 'First Section' }, { title: 'Second Section' }],
      };

      const result = await generator.generate(content);

      expect(result.article).toContain('## Table of Contents');
      expect(result.article).toContain('First Section');
    });

    it('should include benchmarks', async () => {
      const content = {
        title: 'Benchmark Article',
        benchmarks: {
          'Execution Time': '100ms',
          Memory: '50MB',
        },
      };

      const result = await generator.generate(content);

      expect(result.article).toContain('## Benchmark Results');
      expect(result.article).toContain('100ms');
    });
  });

  describe('generateFromExperiment', () => {
    it('should generate article from experiment report', async () => {
      const experimentReport = {
        metadata: { title: 'Test Experiment' },
        summary: { total: 10, passed: 9, failed: 1, passRate: '90%' },
        metrics: { performance: { avgDuration: '50ms' } },
        observations: ['Test observation'],
      };

      const result = await generator.generateFromExperiment(experimentReport);

      expect(result.article).toContain('Experiment Report: Test Experiment');
      expect(result.article).toContain('## Experiment Summary');
      expect(result.article).toContain('## Conclusion');
      expect(result.article).toContain('90%');
    });
  });

  describe('platform templates', () => {
    it('should generate Qiita front matter', () => {
      const template = generator.templates[PLATFORM.QIITA];
      const frontMatter = template.frontMatter({
        title: 'Test',
        tags: ['js', 'react'],
      });

      expect(frontMatter).toContain('title: "Test"');
      expect(frontMatter).toContain('tags:');
    });

    it('should generate Zenn front matter', () => {
      const template = generator.templates[PLATFORM.ZENN];
      const frontMatter = template.frontMatter({
        title: 'Test',
        tags: ['js'],
        emoji: '🚀',
      });

      expect(frontMatter).toContain('emoji: "🚀"');
      expect(frontMatter).toContain('type: "tech"');
    });

    it('should generate Dev.to front matter', () => {
      const template = generator.templates[PLATFORM.DEVTO];
      const frontMatter = template.frontMatter({
        title: 'Test',
        tags: ['js', 'react', 'node', 'test', 'extra'],
        description: 'Test description',
      });

      expect(frontMatter).toContain('published: true');
      // Dev.to limits to 4 tags
      expect(frontMatter).not.toContain('extra');
    });
  });

  describe('slugify', () => {
    it('should convert to URL-friendly slug', () => {
      expect(generator.slugify('Hello World')).toBe('hello-world');
      expect(generator.slugify('Test: Article!')).toBe('test-article');
      expect(generator.slugify('  Spaces  ')).toBe('spaces');
    });

    it('should limit length', () => {
      const longTitle = 'A'.repeat(100);
      expect(generator.slugify(longTitle).length).toBeLessThanOrEqual(50);
    });

    it('should preserve CJK characters instead of emptying the slug', () => {
      expect(generator.slugify('仕様駆動開発')).toBe('仕様駆動開発');
      expect(generator.slugify('【MUSUBI v6.2.0】完全ガイド')).toBe('musubi-v620完全ガイド');
    });

    it('should not collide for different Japanese titles', () => {
      expect(generator.slugify('はじめに')).not.toBe(generator.slugify('まとめ'));
    });

    it('should fall back when no slug-safe characters remain', () => {
      expect(generator.slugify('【】！？')).toBe('article');
    });
  });

  describe('countWords', () => {
    it('should count English words', () => {
      expect(generator.countWords('Hello world test')).toBe(3);
    });

    it('should count CJK characters individually', () => {
      expect(generator.countWords('\u30c6\u30b9\u30c8')).toBe(3);
    });
  });

  describe('estimateReadingTime', () => {
    it('should estimate reading time', () => {
      const shortText = 'Hello world';
      const longText = 'word '.repeat(1000);

      expect(generator.estimateReadingTime(shortText)).toBe('1 min read');
      expect(generator.estimateReadingTime(longText)).toBe('5 min read');
    });

    it('should label the estimate in Japanese', () => {
      expect(generator.estimateReadingTime('テスト', LANGUAGE.JA)).toBe('約1分で読めます');
    });

    it('should weight CJK by its own reading speed', () => {
      // 2000 CJK chars at 500/min reads in 4 minutes, not 10 as a flat
      // 200-per-minute rate over the same character count would imply.
      const japanese = 'あ'.repeat(2000);
      expect(generator.estimateReadingTime(japanese, LANGUAGE.JA)).toBe('約4分で読めます');
    });
  });

  describe('registerTemplate', () => {
    it('should register custom template', () => {
      generator.registerTemplate('custom', {
        frontMatter: () => '---\ncustom: true\n---',
        codeBlock: (lang, code) => `<code>${code}</code>`,
        note: text => `<note>${text}</note>`,
        link: (text, url) => `<a href="${url}">${text}</a>`,
      });

      expect(generator.templates['custom']).toBeDefined();
    });
  });

  describe('createTechArticleGenerator', () => {
    it('should create instance', () => {
      const g = createTechArticleGenerator();
      expect(g).toBeInstanceOf(TechArticleGenerator);
    });
  });

  describe('LANGUAGE', () => {
    it('should define supported languages', () => {
      expect(LANGUAGE.EN).toBe('en');
      expect(LANGUAGE.JA).toBe('ja');
    });
  });

  describe('resolveLanguage', () => {
    it('should default to English', () => {
      expect(generator.resolveLanguage()).toBe(LANGUAGE.EN);
    });

    it('should honour the per-call option over the config default', () => {
      const g = new TechArticleGenerator({ outputDir: testDir, defaultLanguage: LANGUAGE.JA });
      expect(g.resolveLanguage()).toBe(LANGUAGE.JA);
      expect(g.resolveLanguage({ language: LANGUAGE.EN })).toBe(LANGUAGE.EN);
    });

    it('should fall back to English for an unknown language', () => {
      expect(generator.resolveLanguage({ language: 'xx' })).toBe(LANGUAGE.EN);
    });
  });

  describe('Japanese output', () => {
    it('should emit Japanese section headings', async () => {
      const content = {
        title: 'MUSUBI v6.2.0 完全ガイド',
        tags: ['SDD', 'AI'],
        introduction: 'この記事では MUSUBI を紹介します。',
        sections: [{ title: 'はじめに', content: '仕様駆動開発について' }],
        benchmarks: { 実行時間: '100ms' },
        conclusion: 'MUSUBI をぜひお試しください。',
        references: [{ title: 'MUSUBI', url: 'https://github.com/nahisaho/MUSUBI' }],
      };

      const result = await generator.generate(content, {
        platform: PLATFORM.QIITA,
        language: LANGUAGE.JA,
      });

      expect(result.language).toBe(LANGUAGE.JA);
      expect(result.article).toContain('## 目次');
      expect(result.article).toContain('## ベンチマーク結果');
      expect(result.article).toContain('## まとめ');
      expect(result.article).toContain('## 参考リンク');
      expect(result.article).not.toContain('## Table of Contents');
      expect(result.article).not.toContain('## Conclusion');
    });

    it('should keep caller-supplied content untranslated', async () => {
      const result = await generator.generate(
        { title: 'タイトル', sections: [{ title: 'Section 1', content: 'English body' }] },
        { language: LANGUAGE.JA }
      );

      expect(result.article).toContain('## Section 1');
      expect(result.article).toContain('English body');
    });

    it('should emit a Japanese Qiita front matter title', async () => {
      const result = await generator.generate(
        { title: '【MUSUBI v6.2.0】完全ガイド', tags: ['SDD'] },
        { platform: PLATFORM.QIITA, language: LANGUAGE.JA }
      );

      expect(result.article).toContain('title: "【MUSUBI v6.2.0】完全ガイド"');
      expect(result.article).toContain('private: false');
    });

    it('should use a Japanese default title when none is given', async () => {
      const result = await generator.generate({}, { language: LANGUAGE.JA });
      expect(result.metadata.title).toBe('無題の記事');
    });

    it('should generate a Japanese experiment report', async () => {
      const experimentReport = {
        metadata: { title: 'MUSUBI テストスイート' },
        summary: { total: 10, passed: 10, failed: 0, passRate: '100%', duration: 1200 },
        metrics: { performance: { avgDuration: '50ms' }, coverage: { line: '85%' } },
        observations: ['すべてのテストが成功した'],
      };

      const result = await generator.generateFromExperiment(experimentReport, {
        language: LANGUAGE.JA,
      });

      expect(result.article).toContain('実験レポート: MUSUBI テストスイート');
      expect(result.article).toContain('## 実験サマリー');
      expect(result.article).toContain('| テスト総数 | 10 |');
      expect(result.article).toContain('### パフォーマンス');
      expect(result.article).toContain('### カバレッジ');
      expect(result.article).toContain('## 考察');
      expect(result.article).toContain('合計実行時間');
      expect(result.article).toContain('実験は非常に順調に完了しました');
      expect(result.article).not.toContain('Experiment Summary');
    });

    it('should work via the config default language', async () => {
      const g = new TechArticleGenerator({ outputDir: testDir, defaultLanguage: LANGUAGE.JA });
      const result = await g.generate({ title: 'テスト', sections: [{ title: '章' }] });

      expect(result.language).toBe(LANGUAGE.JA);
      expect(result.article).toContain('## 目次');
    });
  });

  describe('registerLanguage', () => {
    it('should register a custom language merged over English defaults', async () => {
      generator.registerLanguage('fr', { tableOfContents: 'Sommaire' });
      const result = await generator.generate(
        { title: 'Article', sections: [{ title: 'Un' }], conclusion: 'Fin' },
        { language: 'fr' }
      );

      expect(result.article).toContain('## Sommaire');
      // Unspecified keys fall back to English rather than going missing
      expect(result.article).toContain('## Conclusion');
    });
  });
});
