# MUSUBI SDD API Reference

## Overview

MUSUBI SDD is a comprehensive toolkit for specification-driven development. This document describes the main modules and APIs.

## Installation

```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

## Module Index

| Module | Description |
|--------|-------------|
| [Analyzers](#analyzers) | Code analysis tools |
| [Generators](#generators) | Requirements, design, and task generation |
| [Orchestration](#orchestration) | Workflow orchestration |
| [Validators](#validators) | Constitutional compliance validation |
| [Performance](#performance) | Performance optimization |
| [Enterprise](#enterprise) | Multi-tenancy and RBAC |
| [AI](#ai) | Advanced AI features |

---

## Analyzers

### LargeProjectAnalyzer

A class for analyzing large projects.

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
| maxFiles | number | 1000 | Maximum number of files to analyze |
| chunkSize | number | 50 | Chunk size for batch processing |
| enableParallel | boolean | true | Enable parallel processing |

### ComplexityAnalyzer

Analyzes code complexity.

```javascript
const { ComplexityAnalyzer } = require('musubi-sdd');

const analyzer = new ComplexityAnalyzer();
const result = analyzer.analyzeFile('./src/index.js');

console.log(`Cyclomatic Complexity: ${result.cyclomatic}`);
console.log(`Cognitive Complexity: ${result.cognitive}`);
```

### GapDetector

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

Generates requirements in EARS format.

```javascript
const { RequirementsGenerator } = require('musubi-sdd');

const generator = new RequirementsGenerator({
  format: 'EARS',
  language: 'ja'
});

const requirements = await generator.generate({
  feature: 'User Authentication',
  context: 'Web Application'
});
```

### DesignGenerator

Generates design documents based on the C4 model.

```javascript
const { DesignGenerator } = require('musubi-sdd');

const generator = new DesignGenerator();
const design = await generator.generate({
  requirements: requirements,
  outputFormat: 'mermaid'
});
```

### TaskGenerator

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
  feature: 'User Management'
});

console.log(`Total cost: $${result.totalCost}`);
```

### WorkflowOrchestrator

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

Verifies compliance with the 9-Article Constitution.

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
1. Traceability from requirements
2. EARS-format requirements
3. C4 model-based design
4. ADR records
5. Appropriate task granularity
6. Code quality standards
7. Test coverage
8. Security considerations
9. Documentation completeness

---

## Performance

### LazyLoader

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

Provides an LRU cache with TTL.

```javascript
const { CacheManager } = require('musubi-sdd').performance;

const cache = new CacheManager({
  maxSize: 1000,
  defaultTtl: 60000 // 1 minute
});

cache.set('key', value);
const cached = cache.get('key');
```

### StartupOptimizer

Optimizes startup time.

```javascript
const { StartupOptimizer, InitStage } = require('musubi-sdd').performance;

const optimizer = new StartupOptimizer();

optimizer.register('core', {
  stage: InitStage.CORE,
  init: async () => { /* initialization */ }
});

await optimizer.initialize();
```

---

## Enterprise

### TenantManager

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

Role-based access control.

```javascript
const { Permission, ROLE_PERMISSIONS } = require('musubi-sdd').enterprise;

if (user.hasPermission(Permission.ORCHESTRATE)) {
  // Can run orchestration
}

if (user.hasAllPermissions([Permission.READ, Permission.WRITE])) {
  // Can both read and write
}
```

---

## AI

### ModelRouter

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
# Initialize
musubi init

# Generate requirements
musubi requirements <feature>

# Generate design
musubi design <feature>

# Generate tasks
musubi tasks <feature>

# Constitutional validation
musubi validate <feature>

# Full orchestration
musubi orchestrate <feature>

# Cost tracking
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
