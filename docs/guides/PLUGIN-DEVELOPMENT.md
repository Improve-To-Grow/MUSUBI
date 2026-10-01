> 🇬🇧 English version: [PLUGIN-DEVELOPMENT.en.md](./PLUGIN-DEVELOPMENT.en.md)

# MUSUBI Plugin Development Guide

サードパーティ拡張機能を作成するための完全ガイド。

---

## 📖 目次

1. [プラグインアーキテクチャ](#プラグインアーキテクチャ)
2. [クイックスタート](#クイックスタート)
3. [プラグインタイプ](#プラグインタイプ)
4. [API リファレンス](#api-リファレンス)
5. [ベストプラクティス](#ベストプラクティス)
6. [配布とパブリッシング](#配布とパブリッシング)

---

## プラグインアーキテクチャ

### 概要

```
┌─────────────────────────────────────────────────────────────┐
│                      MUSUBI Core                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Plugin     │  │   Plugin     │  │   Plugin     │       │
│  │   Loader     │  │   Registry   │  │   Sandbox    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                      Plugin API                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Hooks      │  │   Events     │  │   Services   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                     Your Plugins                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Validator   │  │  Generator   │  │  Reporter    │       │
│  │   Plugin     │  │   Plugin     │  │   Plugin     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### プラグインライフサイクル

```
Discovery → Load → Initialize → Register → Execute → Dispose
    │         │         │           │          │         │
    │         │         │           │          │         └─ Cleanup
    │         │         │           │          └─ Hook execution
    │         │         │           └─ Register hooks/services
    │         │         └─ Call plugin.initialize()
    │         └─ Validate & sandbox
    └─ Scan plugin directories
```

---

## クイックスタート

### ステップ 1: プラグインの雛形を生成

```bash
# プラグインスキャフォールディング
musubi plugin create my-awesome-plugin

# 生成されるファイル:
# .musubi-plugins/my-awesome-plugin/
# ├── package.json
# ├── index.js
# ├── README.md
# └── tests/
#     └── plugin.test.js
```

### ステップ 2: プラグインの実装

```javascript
// .musubi-plugins/my-awesome-plugin/index.js

/**
 * MUSUBI Plugin: My Awesome Plugin
 * 
 * @type {import('musubi-sdd').PluginDefinition}
 */
module.exports = {
  // メタ情報
  name: 'my-awesome-plugin',
  version: '1.0.0',
  description: 'Adds awesome functionality to MUSUBI',
  author: 'Your Name',
  
  // 互換性
  musubi: {
    minVersion: '5.0.0',
    maxVersion: '6.x'
  },
  
  // プラグイン設定スキーマ
  configSchema: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean', default: true },
      customOption: { type: 'string', default: 'default-value' }
    }
  },
  
  // 初期化
  async initialize(context) {
    console.log('My Awesome Plugin initialized!');
    
    // コンテキストからサービスを取得
    const { config, logger, storage } = context;
    
    // 設定を読み込み
    this.config = config.get('my-awesome-plugin');
    this.logger = logger.child({ plugin: 'my-awesome-plugin' });
  },
  
  // フックの登録
  hooks: {
    // 要件検証前に実行
    'requirements:validate:before': async (requirements, context) => {
      context.logger.info('Validating requirements with custom rules...');
      
      // カスタム検証ロジック
      const customErrors = requirements.filter(req => {
        return !req.description.includes('shall');
      });
      
      return {
        errors: customErrors.map(req => ({
          id: req.id,
          message: 'Requirement must contain "shall"'
        }))
      };
    },
    
    // 設計生成後に実行
    'design:generate:after': async (design, context) => {
      // 設計にカスタムセクションを追加
      design.customSection = {
        generatedBy: 'my-awesome-plugin',
        timestamp: new Date().toISOString()
      };
      
      return design;
    }
  },
  
  // カスタムコマンド
  commands: {
    'my-command': {
      description: 'Execute my custom command',
      options: [
        { name: '--verbose', description: 'Enable verbose output' }
      ],
      async execute(args, context) {
        if (args.verbose) {
          context.logger.info('Verbose mode enabled');
        }
        
        // コマンドロジック
        return { success: true, message: 'Command executed!' };
      }
    }
  },
  
  // カスタムサービス
  services: {
    'myService': {
      async doSomething(input) {
        return `Processed: ${input}`;
      }
    }
  },
  
  // クリーンアップ
  async dispose() {
    console.log('My Awesome Plugin disposed');
  }
};
```

### ステップ 3: プラグインのテスト

```javascript
// .musubi-plugins/my-awesome-plugin/tests/plugin.test.js

const { createPluginTestContext } = require('musubi-sdd/testing');
const myPlugin = require('../index');

describe('My Awesome Plugin', () => {
  let context;
  
  beforeEach(async () => {
    context = await createPluginTestContext({
      config: {
        'my-awesome-plugin': {
          enabled: true,
          customOption: 'test-value'
        }
      }
    });
  });
  
  test('initializes correctly', async () => {
    await myPlugin.initialize(context);
    expect(myPlugin.config.enabled).toBe(true);
  });
  
  test('validates requirements with custom rules', async () => {
    const requirements = [
      { id: 'REQ-001', description: 'The system shall do something' },
      { id: 'REQ-002', description: 'The system does something' } // Missing 'shall'
    ];
    
    const result = await myPlugin.hooks['requirements:validate:before'](
      requirements, 
      context
    );
    
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].id).toBe('REQ-002');
  });
  
  test('executes custom command', async () => {
    const result = await myPlugin.commands['my-command'].execute(
      { verbose: true },
      context
    );
    
    expect(result.success).toBe(true);
  });
});
```

### ステップ 4: プラグインの有効化

```yaml
# .musubi/config.yml
plugins:
  - name: my-awesome-plugin
    enabled: true
    config:
      customOption: 'production-value'
```

---

## プラグインタイプ

### 1. Validator Plugin（検証プラグイン）

カスタム検証ルールを追加します。

```javascript
module.exports = {
  name: 'custom-validator',
  type: 'validator',
  
  validators: {
    // 要件バリデーター
    requirements: {
      name: 'custom-ears-validator',
      async validate(requirement) {
        const errors = [];
        
        // EARS パターンチェック
        const earsPatterns = [
          /^When .+, the .+ shall/,
          /^While .+, the .+ shall/,
          /^Where .+, the .+ shall/,
          /^If .+, then the .+ shall/,
          /^The .+ shall/
        ];
        
        const matchesPattern = earsPatterns.some(pattern => 
          pattern.test(requirement.description)
        );
        
        if (!matchesPattern) {
          errors.push({
            code: 'EARS_PATTERN_MISMATCH',
            message: 'Requirement does not match EARS pattern',
            severity: 'error'
          });
        }
        
        return { valid: errors.length === 0, errors };
      }
    },
    
    // 設計バリデーター
    design: {
      name: 'c4-diagram-validator',
      async validate(design) {
        // C4 ダイアグラムの存在チェック
        const hasContext = design.content.includes('C4Context');
        const hasContainer = design.content.includes('C4Container');
        
        return {
          valid: hasContext && hasContainer,
          errors: hasContext && hasContainer ? [] : [{
            code: 'MISSING_C4_DIAGRAMS',
            message: 'Design must include C4 Context and Container diagrams'
          }]
        };
      }
    }
  }
};
```

### 2. Generator Plugin（生成プラグイン）

カスタムドキュメント生成を追加します。

```javascript
module.exports = {
  name: 'api-doc-generator',
  type: 'generator',
  
  generators: {
    // OpenAPI 仕様生成
    'openapi': {
      description: 'Generate OpenAPI specification from design',
      
      async generate(design, options) {
        const openapi = {
          openapi: '3.0.3',
          info: {
            title: design.name,
            version: design.version || '1.0.0',
            description: design.description
          },
          paths: {}
        };
        
        // エンドポイントを抽出
        for (const component of design.components) {
          if (component.type === 'api-endpoint') {
            openapi.paths[component.path] = {
              [component.method.toLowerCase()]: {
                summary: component.summary,
                operationId: component.operationId,
                responses: component.responses
              }
            };
          }
        }
        
        return {
          filename: 'openapi.yaml',
          content: YAML.stringify(openapi),
          format: 'yaml'
        };
      }
    },
    
    // TypeScript 型定義生成
    'typescript-types': {
      description: 'Generate TypeScript types from design',
      
      async generate(design, options) {
        let content = '// Auto-generated by MUSUBI\n\n';
        
        for (const entity of design.entities) {
          content += `export interface ${entity.name} {\n`;
          for (const prop of entity.properties) {
            content += `  ${prop.name}: ${prop.type};\n`;
          }
          content += '}\n\n';
        }
        
        return {
          filename: 'types.ts',
          content,
          format: 'typescript'
        };
      }
    }
  }
};
```

### 3. Reporter Plugin（レポートプラグイン）

カスタムレポート出力を追加します。

```javascript
module.exports = {
  name: 'html-reporter',
  type: 'reporter',
  
  reporters: {
    'html': {
      description: 'Generate HTML report',
      formats: ['html'],
      
      async generate(data, options) {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>MUSUBI Report - ${data.projectName}</title>
  <style>
    body { font-family: system-ui; margin: 2rem; }
    .metric { padding: 1rem; background: #f5f5f5; margin: 0.5rem 0; }
    .success { border-left: 4px solid #10b981; }
    .warning { border-left: 4px solid #f59e0b; }
    .error { border-left: 4px solid #ef4444; }
  </style>
</head>
<body>
  <h1>📊 ${data.projectName} Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  
  <h2>Traceability Coverage</h2>
  <div class="metric ${data.coverage >= 80 ? 'success' : 'warning'}">
    ${data.coverage}% coverage
  </div>
  
  <h2>Requirements</h2>
  <ul>
    ${data.requirements.map(req => `
      <li>${req.id}: ${req.description}</li>
    `).join('')}
  </ul>
  
  <h2>Validation Results</h2>
  ${data.validationErrors.map(err => `
    <div class="metric error">
      ${err.code}: ${err.message}
    </div>
  `).join('')}
</body>
</html>`;
        
        return {
          filename: 'report.html',
          content: html,
          format: 'html'
        };
      }
    },
    
    'json': {
      description: 'Generate JSON report',
      formats: ['json'],
      
      async generate(data, options) {
        return {
          filename: 'report.json',
          content: JSON.stringify(data, null, 2),
          format: 'json'
        };
      }
    }
  }
};
```

### 4. Integration Plugin（統合プラグイン）

外部サービスとの統合を追加します。

```javascript
module.exports = {
  name: 'notion-integration',
  type: 'integration',
  
  configSchema: {
    type: 'object',
    required: ['apiKey', 'databaseId'],
    properties: {
      apiKey: { type: 'string' },
      databaseId: { type: 'string' }
    }
  },
  
  async initialize(context) {
    const { Client } = require('@notionhq/client');
    
    this.notion = new Client({
      auth: context.config.get('notion-integration.apiKey')
    });
    
    this.databaseId = context.config.get('notion-integration.databaseId');
  },
  
  // 同期メソッド
  sync: {
    // 要件を Notion にエクスポート
    async exportRequirements(requirements) {
      for (const req of requirements) {
        await this.notion.pages.create({
          parent: { database_id: this.databaseId },
          properties: {
            'ID': { title: [{ text: { content: req.id } }] },
            'Description': { rich_text: [{ text: { content: req.description } }] },
            'Priority': { select: { name: req.priority } },
            'Status': { status: { name: 'Not Started' } }
          }
        });
      }
      
      return { exported: requirements.length };
    },
    
    // Notion から要件をインポート
    async importRequirements() {
      const response = await this.notion.databases.query({
        database_id: this.databaseId
      });
      
      return response.results.map(page => ({
        id: page.properties['ID'].title[0].text.content,
        description: page.properties['Description'].rich_text[0].text.content,
        priority: page.properties['Priority'].select.name,
        status: page.properties['Status'].status.name
      }));
    }
  },
  
  // イベントリスナー
  events: {
    'requirements:created': async (requirement) => {
      await this.sync.exportRequirements([requirement]);
    },
    
    'requirements:updated': async (requirement) => {
      // Notion ページを更新
    }
  }
};
```

### 5. Skill Plugin（スキルプラグイン）

エージェントに新しいスキルを追加します。

```javascript
module.exports = {
  name: 'kubernetes-skill',
  type: 'skill',
  
  skills: {
    'kubernetes-expert': {
      name: 'Kubernetes Expert',
      description: 'Generates Kubernetes manifests and Helm charts',
      
      // スキルが適用される条件
      triggers: [
        'kubernetes',
        'k8s',
        'helm',
        'container orchestration'
      ],
      
      // コンテキスト情報
      context: `
## Kubernetes Expert Skill

You are an expert in Kubernetes and cloud-native technologies.

### Capabilities
- Generate Kubernetes manifests (Deployment, Service, ConfigMap, etc.)
- Create Helm charts
- Design microservices architecture
- Configure ingress and networking
- Set up RBAC and security policies

### Best Practices
- Always use resource limits
- Prefer Deployments over bare Pods
- Use ConfigMaps for configuration
- Use Secrets for sensitive data
- Implement health checks (liveness/readiness probes)
      `,
      
      // カスタムアクション
      actions: {
        'generate-deployment': {
          description: 'Generate a Kubernetes Deployment',
          async execute(params) {
            const { name, image, replicas = 3, port = 8080 } = params;
            
            return `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: ${port}
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
`;
          }
        }
      }
    }
  }
};
```

---

## API リファレンス

### Plugin Context

プラグインの `initialize()` に渡されるコンテキストオブジェクト。

```typescript
interface PluginContext {
  // 設定管理
  config: {
    get<T>(key: string): T;
    set(key: string, value: any): void;
  };
  
  // ロギング
  logger: {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    child(context: object): Logger;
  };
  
  // ストレージ
  storage: {
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    list(pattern: string): Promise<string[]>;
  };
  
  // イベント
  events: {
    emit(event: string, data: any): void;
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
  };
  
  // 他のサービスへのアクセス
  services: {
    get<T>(name: string): T;
  };
  
  // プロジェクト情報
  project: {
    root: string;
    name: string;
    version: string;
  };
}
```

### Available Hooks

| Hook | タイミング | パラメータ |
|------|----------|-----------|
| `requirements:validate:before` | 要件検証前 | `(requirements, context)` |
| `requirements:validate:after` | 要件検証後 | `(requirements, results, context)` |
| `requirements:generate:before` | 要件生成前 | `(input, context)` |
| `requirements:generate:after` | 要件生成後 | `(requirements, context)` |
| `design:validate:before` | 設計検証前 | `(design, context)` |
| `design:validate:after` | 設計検証後 | `(design, results, context)` |
| `design:generate:before` | 設計生成前 | `(requirements, context)` |
| `design:generate:after` | 設計生成後 | `(design, context)` |
| `tasks:generate:before` | タスク生成前 | `(design, context)` |
| `tasks:generate:after` | タスク生成後 | `(tasks, context)` |
| `orchestration:start` | オーケストレーション開始 | `(config, context)` |
| `orchestration:complete` | オーケストレーション完了 | `(results, context)` |
| `orchestration:error` | オーケストレーションエラー | `(error, context)` |
| `agent:before` | エージェント実行前 | `(agent, task, context)` |
| `agent:after` | エージェント実行後 | `(agent, task, result, context)` |

### Available Events

| Event | 説明 | データ |
|-------|------|-------|
| `requirements:created` | 要件作成 | `{ requirement }` |
| `requirements:updated` | 要件更新 | `{ requirement, changes }` |
| `requirements:deleted` | 要件削除 | `{ requirementId }` |
| `design:created` | 設計作成 | `{ design }` |
| `design:updated` | 設計更新 | `{ design, changes }` |
| `task:created` | タスク作成 | `{ task }` |
| `task:completed` | タスク完了 | `{ task, result }` |
| `validation:passed` | 検証成功 | `{ type, target }` |
| `validation:failed` | 検証失敗 | `{ type, target, errors }` |
| `replan:triggered` | リプラン開始 | `{ reason, context }` |
| `replan:completed` | リプラン完了 | `{ newPlan }` |

---

## ベストプラクティス

### 1. エラーハンドリング

```javascript
module.exports = {
  hooks: {
    'requirements:validate:before': async (requirements, context) => {
      try {
        // メイン処理
        return await validateRequirements(requirements);
      } catch (error) {
        // エラーをログに記録
        context.logger.error('Validation failed', { error: error.message });
        
        // グレースフルデグラデーション
        return {
          errors: [],
          warnings: [{
            code: 'PLUGIN_ERROR',
            message: `Plugin validation skipped: ${error.message}`
          }]
        };
      }
    }
  }
};
```

### 2. 設定のバリデーション

```javascript
module.exports = {
  configSchema: {
    type: 'object',
    required: ['apiKey'],
    properties: {
      apiKey: { 
        type: 'string',
        minLength: 32
      },
      timeout: {
        type: 'number',
        default: 5000,
        minimum: 1000,
        maximum: 30000
      }
    }
  },
  
  async initialize(context) {
    // 設定は自動的にスキーマに対して検証される
    // 無効な設定の場合、初期化は失敗する
  }
};
```

### 3. 非同期処理の適切な管理

```javascript
module.exports = {
  async initialize(context) {
    // 初期化時の非同期処理はawaitする
    this.connection = await createConnection(context.config);
    
    // バックグラウンドタスクは適切に管理
    this.backgroundTask = this.startBackgroundSync();
  },
  
  async dispose() {
    // バックグラウンドタスクの停止
    if (this.backgroundTask) {
      await this.backgroundTask.stop();
    }
    
    // リソースのクリーンアップ
    if (this.connection) {
      await this.connection.close();
    }
  }
};
```

### 4. テストカバレッジ

```javascript
// tests/plugin.test.js
const { createPluginTestContext, mockLogger } = require('musubi-sdd/testing');

describe('My Plugin', () => {
  // 各フックをテスト
  describe('hooks', () => {
    test.each([
      ['requirements:validate:before', mockRequirements],
      ['design:generate:after', mockDesign]
    ])('%s hook works correctly', async (hookName, mockData) => {
      const context = createPluginTestContext();
      const result = await plugin.hooks[hookName](mockData, context);
      
      expect(result).toBeDefined();
      // 具体的なアサーション
    });
  });
  
  // エラーケースのテスト
  describe('error handling', () => {
    test('handles API failures gracefully', async () => {
      const context = createPluginTestContext({
        mockApiError: new Error('API unavailable')
      });
      
      const result = await plugin.hooks['requirements:validate:before'](
        mockRequirements,
        context
      );
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ code: 'PLUGIN_ERROR' })
      );
    });
  });
});
```

---

## 配布とパブリッシング

### npm への公開

```bash
# package.json の準備
{
  "name": "musubi-plugin-my-awesome",
  "version": "1.0.0",
  "keywords": ["musubi", "musubi-plugin", "sdd"],
  "main": "index.js",
  "peerDependencies": {
    "musubi-sdd": ">=5.0.0"
  }
}

# 公開
npm publish
```

### ローカルプラグインとして配布

```bash
# プロジェクト内に配置
.musubi-plugins/
└── my-local-plugin/
    ├── package.json
    └── index.js
```

### GitHub からインストール

```yaml
# .musubi/config.yml
plugins:
  - name: github:username/musubi-plugin-awesome
    version: v1.2.0
    config:
      option1: value1
```

### プラグインの発見

MUSUBI プラグインレジストリに登録:

```bash
# プラグインを登録（公開後）
musubi plugin register musubi-plugin-my-awesome

# 利用可能なプラグインを検索
musubi plugin search "notification"

# プラグインをインストール
musubi plugin install musubi-plugin-slack-notifications
```

---

## サンプルプラグイン

### 1. Slack 通知プラグイン

```javascript
// musubi-plugin-slack/index.js
const { WebClient } = require('@slack/web-api');

module.exports = {
  name: 'slack-notifications',
  version: '1.0.0',
  
  configSchema: {
    type: 'object',
    required: ['token', 'channel'],
    properties: {
      token: { type: 'string' },
      channel: { type: 'string' }
    }
  },
  
  async initialize(context) {
    this.slack = new WebClient(context.config.get('slack-notifications.token'));
    this.channel = context.config.get('slack-notifications.channel');
    
    context.events.on('orchestration:complete', this.notifyComplete.bind(this));
    context.events.on('validation:failed', this.notifyFailure.bind(this));
  },
  
  async notifyComplete(data) {
    await this.slack.chat.postMessage({
      channel: this.channel,
      text: `✅ Orchestration complete: ${data.feature}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Feature*: ${data.feature}\n*Duration*: ${data.duration}s\n*Cost*: $${data.cost.toFixed(4)}`
          }
        }
      ]
    });
  },
  
  async notifyFailure(data) {
    await this.slack.chat.postMessage({
      channel: this.channel,
      text: `❌ Validation failed: ${data.target}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Errors*:\n${data.errors.map(e => `• ${e.message}`).join('\n')}`
          }
        }
      ]
    });
  }
};
```

### 2. カスタムメトリクスプラグイン

```javascript
// musubi-plugin-metrics/index.js
module.exports = {
  name: 'custom-metrics',
  version: '1.0.0',
  
  async initialize(context) {
    this.metrics = {
      orchestrations: 0,
      totalTokens: 0,
      totalCost: 0,
      errors: 0
    };
    
    // メトリクス収集
    context.events.on('orchestration:complete', (data) => {
      this.metrics.orchestrations++;
      this.metrics.totalTokens += data.tokens;
      this.metrics.totalCost += data.cost;
    });
    
    context.events.on('orchestration:error', () => {
      this.metrics.errors++;
    });
  },
  
  services: {
    'metrics': {
      getMetrics() {
        return { ...this.metrics };
      },
      
      resetMetrics() {
        this.metrics = {
          orchestrations: 0,
          totalTokens: 0,
          totalCost: 0,
          errors: 0
        };
      }
    }
  },
  
  commands: {
    'metrics': {
      description: 'Show MUSUBI usage metrics',
      async execute(args, context) {
        const metrics = context.services.get('metrics').getMetrics();
        
        console.log(`
📊 MUSUBI Metrics
━━━━━━━━━━━━━━━━━
Orchestrations: ${metrics.orchestrations}
Total Tokens:   ${metrics.totalTokens.toLocaleString()}
Total Cost:     $${metrics.totalCost.toFixed(4)}
Error Rate:     ${((metrics.errors / metrics.orchestrations) * 100).toFixed(1)}%
        `);
        
        return metrics;
      }
    }
  }
};
```

---

## トラブルシューティング

### プラグインがロードされない

```bash
# プラグインの状態を確認
musubi plugin list --verbose

# 一般的な問題:
# 1. package.json が不正
# 2. musubi バージョンの互換性
# 3. 必須の依存関係が不足
```

### フックが呼び出されない

```javascript
// デバッグ用にログを追加
hooks: {
  'requirements:validate:before': async (requirements, context) => {
    context.logger.debug('Hook called', { 
      hookName: 'requirements:validate:before',
      requirementCount: requirements.length 
    });
    // ...
  }
}
```

### 設定が読み込まれない

```yaml
# .musubi/config.yml で正しいパスを指定
plugins:
  - name: my-plugin
    config:
      # プラグイン名をキーとして使用しない
      # ❌ my-plugin:
      #      option: value
      # ✅
      option: value
```

---

*© 2025 MUSUBI SDD - Plugin Development Guide*
