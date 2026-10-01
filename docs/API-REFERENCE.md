# MUSUBI SDD API Reference

## Overview

MUSUBI SDD は仕様駆動開発のための包括的なツールキットです。このドキュメントでは主要なモジュールとAPIについて説明します。

MUSUBI SDD is a comprehensive toolkit for specification-driven development. This document describes the main modules and APIs.

## Installation

```bash
npm install musubi-sdd
```

## Module Index

| Module | Description |
|--------|-------------|
| [Analyzers](#analyzers) | コード解析ツール / Code analysis tools |
| [Generators](#generators) | 要件・設計・タスク生成 / Requirements, design, and task generation |
| [Orchestration](#orchestration) | ワークフローオーケストレーション / Workflow orchestration |
| [Validators](#validators) | 憲法準拠検証 / Constitutional compliance validation |
| [Performance](#performance) | パフォーマンス最適化 / Performance optimization |
| [Enterprise](#enterprise) | マルチテナント・RBAC / Multi-tenancy & RBAC |
| [AI](#ai) | 高度なAI機能 / Advanced AI features |

---

## Analyzers

### LargeProjectAnalyzer

大規模プロジェクト解析のためのクラス。

A class for analyzing large-scale projects.

```javascript
const { LargeProjectAnalyzer } = require('musubi-sdd');

const analyzer = new LargeProjectAnalyzer({
  maxFiles: 1000,
  chunkSize: 50,
  enableParallel: true
});

const analysis = await analyzer.analyze('./src');
console.log(analysis.summary);
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| maxFiles | number | 1000 | 解析する最大ファイル数 / Maximum number of files to analyze |
| chunkSize | number | 50 | バッチ処理のチャンクサイズ / Chunk size for batch processing |
| enableParallel | boolean | true | 並列処理を有効化 / Enable parallel processing |

### ComplexityAnalyzer

コード複雑度を分析します。

Analyzes code complexity.

```javascript
const { ComplexityAnalyzer } = require('musubi-sdd');

const analyzer = new ComplexityAnalyzer();
const result = analyzer.analyzeFile('./src/index.js');

console.log(`Cyclomatic Complexity: ${result.cyclomatic}`);
console.log(`Cognitive Complexity: ${result.cognitive}`);
```

### GapDetector

要件とコード間のギャップを検出します。

Detects gaps between requirements and code.

```javascript
const { GapDetector } = require('musubi-sdd');

const detector = new GapDetector();
const gaps = await detector.detectGaps({
  requirements: './steering/requirements.md',
  codebase: './src'
});

gaps.forEach(gap => {
  console.log(`${gap.requirementId}: ${gap.status}`);
});
```

---

## Generators

### RequirementsGenerator

EARS形式で要件を生成します。

Generates requirements in EARS format.

```javascript
const { RequirementsGenerator } = require('musubi-sdd');

const generator = new RequirementsGenerator({
  format: 'EARS',
  language: 'ja'
});

const requirements = await generator.generate({
  feature: 'ユーザー認証', // EN: User authentication
  context: 'Webアプリケーション' // EN: Web application
});
```

### DesignGenerator

C4モデルベースの設計ドキュメントを生成します。

Generates C4 model-based design documents.

```javascript
const { DesignGenerator } = require('musubi-sdd');

const generator = new DesignGenerator();
const design = await generator.generate({
  requirements: requirements,
  outputFormat: 'mermaid'
});
```

### TaskGenerator

設計からタスクを生成します。

Generates tasks from the design.

```javascript
const { TaskGenerator } = require('musubi-sdd');

const generator = new TaskGenerator({
  granularity: 'fine',
  estimateEffort: true
});

const tasks = await generator.generate(design);
```

---

## Orchestration

### OrchestrationEngine

ワークフローを実行するメインエンジン。

The main engine that executes workflows.

```javascript
const { OrchestrationEngine } = require('musubi-sdd');

const engine = new OrchestrationEngine({
  llmProvider: 'openai',
  model: 'gpt-4o',
  costTracking: true
});

const result = await engine.execute({
  workflow: 'full-sdd',
  feature: 'ユーザー管理機能' // EN: User management feature
});

console.log(`Total cost: $${result.totalCost}`);
```

### WorkflowOrchestrator

カスタムワークフローを定義・実行します。

Defines and executes custom workflows.

```javascript
const { WorkflowOrchestrator } = require('musubi-sdd');

const orchestrator = new WorkflowOrchestrator();

orchestrator.defineWorkflow('custom', [
  { step: 'analyze', skill: 'codebase-analysis' },
  { step: 'generate', skill: 'requirements-generation' },
  { step: 'validate', skill: 'constitutional-validation' }
]);

await orchestrator.run('custom', context);
```

---

## Validators

### ConstitutionalValidator

9条憲法に準拠しているか検証します。

Validates compliance with the 9-article constitution.

```javascript
const { ConstitutionalValidator } = require('musubi-sdd');

const validator = new ConstitutionalValidator();
const result = await validator.validate({
  feature: 'user-auth',
  requirements: requirements,
  design: design,
  implementation: './src/auth'
});

if (result.passed) {
  console.log('All constitutional articles satisfied');
} else {
  result.violations.forEach(v => console.error(v));
}
```

**9 Constitutional Articles:**
1. 要件からの追跡可能性 / Traceability from requirements
2. EARS形式の要件 / Requirements in EARS format
3. C4モデルベース設計 / C4 model-based design
4. ADR記録 / ADR records
5. タスク粒度の適切性 / Appropriate task granularity
6. コード品質基準 / Code quality standards
7. テストカバレッジ / Test coverage
8. セキュリティ考慮 / Security considerations
9. ドキュメント完全性 / Documentation completeness

---

## Performance

### LazyLoader

モジュールの遅延ロードを実現します。

Provides lazy loading of modules.

```javascript
const { performance } = require('musubi-sdd');
const { LazyLoader } = performance;

const loader = new LazyLoader();

loader.register('heavyModule', () => require('./heavy'));
loader.preloadHint('heavyModule');

const module = await loader.load('heavyModule');
```

### CacheManager

TTL付きLRUキャッシュを提供します。

Provides an LRU cache with TTL.

```javascript
const { CacheManager } = require('musubi-sdd').performance;

const cache = new CacheManager({
  maxSize: 1000,
  defaultTtl: 60000 // 1分 / 1 minute
});

cache.set('key', value);
const cached = cache.get('key');
```

### StartupOptimizer

起動時間を最適化します。

Optimizes startup time.

```javascript
const { StartupOptimizer, InitStage } = require('musubi-sdd').performance;

const optimizer = new StartupOptimizer();

optimizer.register('core', {
  stage: InitStage.CORE,
  init: async () => { /* 初期化処理 / Initialization logic */ }
});

await optimizer.initialize();
```

---

## Enterprise

### TenantManager

マルチテナント環境を管理します。

Manages multi-tenant environments.

```javascript
const { enterprise } = require('musubi-sdd');
const { TenantManager, TenantRole } = enterprise;

const manager = new TenantManager();

const tenant = manager.createTenant({
  name: 'Acme Corp',
  plan: 'enterprise',
  quotas: { maxTokensPerDay: 1000000 }
});

const user = manager.addUser(tenant.id, {
  email: 'admin@acme.com',
  role: TenantRole.ADMIN
});

const context = manager.createContext(tenant.id, user.id);
```

### RBAC

ロールベースアクセス制御。

Role-based access control.

```javascript
const { Permission, ROLE_PERMISSIONS } = require('musubi-sdd').enterprise;

if (user.hasPermission(Permission.ORCHESTRATE)) {
  // オーケストレーション実行可能 / Can execute orchestration
}

if (user.hasAllPermissions([Permission.READ, Permission.WRITE])) {
  // 読み書き両方可能 / Can both read and write
}
```

---

## AI

### ModelRouter

タスクに最適なモデルを選択します。

Selects the optimal model for a task.

```javascript
const { ai } = require('musubi-sdd');
const { ModelRouter, TaskType } = ai;

const router = new ModelRouter();

const model = router.route({
  taskType: TaskType.CODE_GENERATION,
  complexity: 'high',
  tokens: 50000
});

console.log(`Selected model: ${model.name}`);
```

### RAGPipeline

コード知識のRAG検索を実現します。

Provides RAG search over code knowledge.

```javascript
const { RAGPipeline } = require('musubi-sdd').ai;

const rag = new RAGPipeline({ topK: 5 });

await rag.index([
  { id: 'auth', content: authCode, path: 'src/auth.ts' },
  { id: 'user', content: userCode, path: 'src/user.ts' }
]);

const augmented = await rag.augment(
  'authentication',
  'How to implement login?'
);
```

### ContextWindowManager

大きなコンテキストを管理します。

Manages large contexts.

```javascript
const { ContextWindowManager } = require('musubi-sdd').ai;

const manager = new ContextWindowManager();

const chunks = manager.chunkSemantic(largeCode, 4000);
const relevant = manager.prioritize(chunks, 'login function', 5);
```

---

## CLI Commands

```bash
# 初期化 / Initialize
musubi init

# 要件生成 / Generate requirements
musubi requirements <feature>

# 設計生成 / Generate design
musubi design <feature>

# タスク生成 / Generate tasks
musubi tasks <feature>

# 憲法検証 / Validate against the constitution
musubi validate <feature>

# フルオーケストレーション / Full orchestration
musubi orchestrate <feature>

# コスト追跡 / Track costs
musubi costs --report
```

---

## TypeScript Support

```typescript
import {
  OrchestrationEngine,
  RequirementsGenerator,
  ConstitutionalValidator,
  type OrchestrationResult,
  type Requirement
} from 'musubi-sdd';

const engine = new OrchestrationEngine();
const result: OrchestrationResult = await engine.execute({
  workflow: 'full-sdd',
  feature: 'user-auth'
});
```

---

## Error Handling

```javascript
const { MUSUBIError, ValidationError } = require('musubi-sdd');

try {
  await validator.validate(feature);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.violations);
  } else if (error instanceof MUSUBIError) {
    console.error('MUSUBI error:', error.message);
  }
}
```

---

## Configuration

### steering/project.yml

```yaml
project:
  name: my-project
  version: 1.0.0

musubi:
  llm:
    provider: openai
    model: gpt-4o
    temperature: 0.2
  
  validation:
    strictMode: true
    requiredCoverage: 80
  
  performance:
    enableCaching: true
    lazyLoading: true
```

---

## License

MIT License - See [LICENSE](LICENSE)
