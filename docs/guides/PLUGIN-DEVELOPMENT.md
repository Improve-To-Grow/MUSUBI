# MUSUBI Plugin Development Guide

A complete guide to creating third-party extensions.

---

## 📖 Table of Contents

1. [Plugin Architecture](#plugin-architecture)
2. [Quickstart](#quickstart)
3. [Plugin Types](#plugin-types)
4. [API Reference](#api-reference)
5. [Best Practices](#best-practices)
6. [Distribution and Publishing](#distribution-and-publishing)

---

## Plugin Architecture

### Overview

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

### Plugin Lifecycle

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

## Quickstart

### Step 1: Generate the Plugin Scaffold

```bash
# Plugin scaffolding
musubi plugin create my-awesome-plugin

# Generated files:
# .musubi-plugins/my-awesome-plugin/
# ├── package.json
# ├── index.js
# ├── README.md
# └── tests/
#     └── plugin.test.js
```

### Step 2: Implement the Plugin

```javascript
// .musubi-plugins/my-awesome-plugin/index.js

/**
 * MUSUBI Plugin: My Awesome Plugin
 * 
 * @type {import('musubi-sdd').PluginDefinition}
 */
module.exports = {
  // Metadata
  name: 'my-awesome-plugin',
  version: '1.0.0',
  description: 'Adds awesome functionality to MUSUBI',
  author: 'Your Name',
  
  // Compatibility
  musubi: {
    minVersion: '5.0.0',
    maxVersion: '6.x'
  },
  
  // Plugin configuration schema
  configSchema: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean', default: true },
      customOption: { type: 'string', default: 'default-value' }
    }
  },
  
  // Initialization
  async initialize(context) {
    console.log('My Awesome Plugin initialized!');
    
    // Get services from the context
    const { config, logger, storage } = context;
    
    // Load configuration
    this.config = config.get('my-awesome-plugin');
    this.logger = logger.child({ plugin: 'my-awesome-plugin' });
  },
  
  // Register hooks
  hooks: {
    // Run before requirements validation
    'requirements:validate:before': async (requirements, context) => {
      context.logger.info('Validating requirements with custom rules...');
      
      // Custom validation logic
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
    
    // Run after design generation
    'design:generate:after': async (design, context) => {
      // Add a custom section to the design
      design.customSection = {
        generatedBy: 'my-awesome-plugin',
        timestamp: new Date().toISOString()
      };
      
      return design;
    }
  },
  
  // Custom commands
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
        
        // Command logic
        return { success: true, message: 'Command executed!' };
      }
    }
  },
  
  // Custom services
  services: {
    'myService': {
      async doSomething(input) {
        return `Processed: ${input}`;
      }
    }
  },
  
  // Cleanup
  async dispose() {
    console.log('My Awesome Plugin disposed');
  }
};
```

### Step 3: Test the Plugin

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

### Step 4: Enable the Plugin

```yaml
# .musubi/config.yml
plugins:
  - name: my-awesome-plugin
    enabled: true
    config:
      customOption: 'production-value'
```

---

## Plugin Types

### 1. Validator Plugin

Adds custom validation rules.

```javascript
module.exports = {
  name: 'custom-validator',
  type: 'validator',
  
  validators: {
    // Requirements validator
    requirements: {
      name: 'custom-ears-validator',
      async validate(requirement) {
        const errors = [];
        
        // EARS pattern check
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
    
    // Design validator
    design: {
      name: 'c4-diagram-validator',
      async validate(design) {
        // Check for the presence of a C4 diagram
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

### 2. Generator Plugin

Adds custom document generation.

```javascript
module.exports = {
  name: 'api-doc-generator',
  type: 'generator',
  
  generators: {
    // OpenAPI specification generation
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
        
        // Extract endpoints
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
    
    // TypeScript type definition generation
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

### 3. Reporter Plugin

Adds custom report output.

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

### 4. Integration Plugin

Adds integration with external services.

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
  
  // Sync methods
  sync: {
    // Export requirements to Notion
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
    
    // Import requirements from Notion
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
  
  // Event listeners
  events: {
    'requirements:created': async (requirement) => {
      await this.sync.exportRequirements([requirement]);
    },
    
    'requirements:updated': async (requirement) => {
      // Update the Notion page
    }
  }
};
```

### 5. Skill Plugin

Adds new skills to agents.

```javascript
module.exports = {
  name: 'kubernetes-skill',
  type: 'skill',
  
  skills: {
    'kubernetes-expert': {
      name: 'Kubernetes Expert',
      description: 'Generates Kubernetes manifests and Helm charts',
      
      // Conditions under which the skill applies
      triggers: [
        'kubernetes',
        'k8s',
        'helm',
        'container orchestration'
      ],
      
      // Context information
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
      
      // Custom action
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

## API Reference

### Plugin Context

The context object passed to the plugin's `initialize()`.

```typescript
interface PluginContext {
  // Configuration management
  config: {
    get<T>(key: string): T;
    set(key: string, value: any): void;
  };
  
  // Logging
  logger: {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    child(context: object): Logger;
  };
  
  // Storage
  storage: {
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    list(pattern: string): Promise<string[]>;
  };
  
  // Events
  events: {
    emit(event: string, data: any): void;
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
  };
  
  // Access to other services
  services: {
    get<T>(name: string): T;
  };
  
  // Project information
  project: {
    root: string;
    name: string;
    version: string;
  };
}
```

### Available Hooks

| Hook | Timing | Parameters |
|------|----------|-----------|
| `requirements:validate:before` | Before requirements validation | `(requirements, context)` |
| `requirements:validate:after` | After requirements validation | `(requirements, results, context)` |
| `requirements:generate:before` | Before requirements generation | `(input, context)` |
| `requirements:generate:after` | After requirements generation | `(requirements, context)` |
| `design:validate:before` | Before design validation | `(design, context)` |
| `design:validate:after` | After design validation | `(design, results, context)` |
| `design:generate:before` | Before design generation | `(requirements, context)` |
| `design:generate:after` | After design generation | `(design, context)` |
| `tasks:generate:before` | Before task generation | `(design, context)` |
| `tasks:generate:after` | After task generation | `(tasks, context)` |
| `orchestration:start` | Orchestration start | `(config, context)` |
| `orchestration:complete` | Orchestration complete | `(results, context)` |
| `orchestration:error` | Orchestration error | `(error, context)` |
| `agent:before` | Before agent execution | `(agent, task, context)` |
| `agent:after` | After agent execution | `(agent, task, result, context)` |

### Available Events

| Event | Description | Data |
|-------|------|-------|
| `requirements:created` | Requirement created | `{ requirement }` |
| `requirements:updated` | Requirement updated | `{ requirement, changes }` |
| `requirements:deleted` | Requirement deleted | `{ requirementId }` |
| `design:created` | Design created | `{ design }` |
| `design:updated` | Design updated | `{ design, changes }` |
| `task:created` | Task created | `{ task }` |
| `task:completed` | Task completed | `{ task, result }` |
| `validation:passed` | Validation passed | `{ type, target }` |
| `validation:failed` | Validation failed | `{ type, target, errors }` |
| `replan:triggered` | Replan started | `{ reason, context }` |
| `replan:completed` | Replan completed | `{ newPlan }` |

---

## Best Practices

### 1. Error Handling

```javascript
module.exports = {
  hooks: {
    'requirements:validate:before': async (requirements, context) => {
      try {
        // Main processing
        return await validateRequirements(requirements);
      } catch (error) {
        // Log the error
        context.logger.error('Validation failed', { error: error.message });
        
        // Graceful degradation
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

### 2. Configuration Validation

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
    // Configuration is automatically validated against the schema
    // If the configuration is invalid, initialization fails
  }
};
```

### 3. Proper Management of Asynchronous Processing

```javascript
module.exports = {
  async initialize(context) {
    // Await asynchronous processing during initialization
    this.connection = await createConnection(context.config);
    
    // Manage background tasks properly
    this.backgroundTask = this.startBackgroundSync();
  },
  
  async dispose() {
    // Stop background tasks
    if (this.backgroundTask) {
      await this.backgroundTask.stop();
    }
    
    // Clean up resources
    if (this.connection) {
      await this.connection.close();
    }
  }
};
```

### 4. Test Coverage

```javascript
// tests/plugin.test.js
const { createPluginTestContext, mockLogger } = require('musubi-sdd/testing');

describe('My Plugin', () => {
  // Test each hook
  describe('hooks', () => {
    test.each([
      ['requirements:validate:before', mockRequirements],
      ['design:generate:after', mockDesign]
    ])('%s hook works correctly', async (hookName, mockData) => {
      const context = createPluginTestContext();
      const result = await plugin.hooks[hookName](mockData, context);
      
      expect(result).toBeDefined();
      // Specific assertions
    });
  });
  
  // Test error cases
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

## Distribution and Publishing

### Publishing to npm

```bash
# Prepare package.json
{
  "name": "musubi-plugin-my-awesome",
  "version": "1.0.0",
  "keywords": ["musubi", "musubi-plugin", "sdd"],
  "main": "index.js",
  "peerDependencies": {
    "musubi-sdd": ">=5.0.0"
  }
}

# Publish
npm publish
```

### Distributing as a Local Plugin

```bash
# Place within the project
.musubi-plugins/
└── my-local-plugin/
    ├── package.json
    └── index.js
```

### Installing from GitHub

```yaml
# .musubi/config.yml
plugins:
  - name: github:username/musubi-plugin-awesome
    version: v1.2.0
    config:
      option1: value1
```

### Plugin Discovery

Register with the MUSUBI plugin registry:

```bash
# Register the plugin (after publishing)
musubi plugin register musubi-plugin-my-awesome

# Search for available plugins
musubi plugin search "notification"

# Install a plugin
musubi plugin install musubi-plugin-slack-notifications
```

---

## Sample Plugins

### 1. Slack Notification Plugin

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

### 2. Custom Metrics Plugin

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
    
    // Metrics collection
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

## Troubleshooting

### Plugin Not Loading

```bash
# Check plugin status
musubi plugin list --verbose

# Common issues:
# 1. Invalid package.json
# 2. musubi version compatibility
# 3. Missing required dependencies
```

### Hooks Not Being Called

```javascript
// Add logging for debugging
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

### Configuration Not Loading

```yaml
# Specify the correct path in .musubi/config.yml
plugins:
  - name: my-plugin
    config:
      # Do not use the plugin name as a key
      # ❌ my-plugin:
      #      option: value
      # ✅
      option: value
```

---

*© 2025 MUSUBI SDD - Plugin Development Guide*
