# MUSUBI Example: Todo App

A complete example project demonstrating MUSUBI's SDD workflow.

## 📁 Project Structure

```
examples/todo-app/
├── AGENTS.md              # Universal entry point
├── steering/
│   ├── structure.md       # Architecture patterns
│   ├── tech.md           # Tech stack
│   └── product.md        # Product context
├── storage/
│   ├── specs/
│   │   └── todo-feature.md    # EARS requirements
│   ├── features/
│   │   └── todo-feature.md    # Feature design
│   └── changes/               # Delta specs
├── src/
│   └── todo.js           # Implementation
└── tests/
    └── todo.test.js      # Tests
```

## 🚀 Quick Start

```bash
# Initialize in new directory
mkdir todo-app && cd todo-app
musubi-sdd init

# Generate requirements
musubi-requirements "Todo management with CRUD operations"

# Generate design
musubi-design todo-feature

# Generate tasks
musubi-tasks todo-feature

# Validate
musubi-validate all
```

## 📋 EARS Requirements

**File**: `storage/specs/todo-feature.md`

```markdown
# Todo Feature Requirements

## REQ-TODO-001: Create Todo
**Type**: Event-Driven
**Priority**: P0

When the user submits a new todo with title,
the system shall create a new todo item with:
- Unique ID (UUID v4)
- Title (required, max 200 chars)
- Completed status (default: false)
- Created timestamp

## REQ-TODO-002: List Todos
**Type**: Ubiquitous
**Priority**: P0

The system shall provide a list of all todo items
sorted by creation date (newest first).

## REQ-TODO-003: Complete Todo
**Type**: Event-Driven
**Priority**: P1

When the user marks a todo as complete,
the system shall update the completed status to true
and record the completion timestamp.

## REQ-TODO-004: Delete Todo
**Type**: Event-Driven
**Priority**: P1

When the user deletes a todo,
the system shall remove the todo item from storage.

## REQ-TODO-005: Filter Todos
**Type**: State-Driven
**Priority**: P2

While the filter is set to "completed",
the system shall display only completed todos.

While the filter is set to "active",
the system shall display only non-completed todos.
```

## 🏗️ C4 Design

**File**: `storage/specs/todo-feature.md`

```markdown
# Todo Feature Design

## C4 Context

```
[User] --> [Todo App] --> [Storage]
```

## C4 Container

```
+------------------+     +------------------+
|   Todo CLI/GUI   | --> |   Todo Service   |
+------------------+     +------------------+
                              |
                              v
                         +----------+
                         | Storage  |
                         | (Memory) |
                         +----------+
```

## ADR-001: In-Memory Storage

**Status**: Accepted
**Context**: Need simple storage for MVP
**Decision**: Use in-memory Map for storage
**Consequences**: 
- Pros: Simple, fast, no dependencies
- Cons: Data lost on restart

## Implementation Tasks

- [P0] Implement Todo class
- [P0] Implement TodoService with CRUD
- [P1] Add filtering functionality
- [P2] Add persistence (optional)
```

## 💻 Implementation

**File**: `src/todo.js`

```javascript
// REQ-TODO-001: Create Todo
// REQ-TODO-002: List Todos
// REQ-TODO-003: Complete Todo
// REQ-TODO-004: Delete Todo
// REQ-TODO-005: Filter Todos

const { v4: uuidv4 } = require('uuid');

class Todo {
  constructor(title) {
    if (!title || title.length > 200) {
      throw new Error('Title required, max 200 chars');
    }
    this.id = uuidv4();
    this.title = title;
    this.completed = false;
    this.createdAt = new Date();
    this.completedAt = null;
  }

  complete() {
    this.completed = true;
    this.completedAt = new Date();
  }
}

class TodoService {
  constructor() {
    this.todos = new Map();
  }

  // REQ-TODO-001
  create(title) {
    const todo = new Todo(title);
    this.todos.set(todo.id, todo);
    return todo;
  }

  // REQ-TODO-002
  list() {
    return Array.from(this.todos.values())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // REQ-TODO-003
  complete(id) {
    const todo = this.todos.get(id);
    if (!todo) throw new Error('Todo not found');
    todo.complete();
    return todo;
  }

  // REQ-TODO-004
  delete(id) {
    return this.todos.delete(id);
  }

  // REQ-TODO-005
  filter(status) {
    const all = this.list();
    if (status === 'completed') {
      return all.filter(t => t.completed);
    }
    if (status === 'active') {
      return all.filter(t => !t.completed);
    }
    return all;
  }
}

module.exports = { Todo, TodoService };
```

## 🧪 Tests

**File**: `tests/todo.test.js`

```javascript
// Tests for REQ-TODO-001 through REQ-TODO-005

const { Todo, TodoService } = require('../src/todo');

describe('TodoService', () => {
  let service;

  beforeEach(() => {
    service = new TodoService();
  });

  // REQ-TODO-001
  describe('create', () => {
    test('should create todo with unique ID', () => {
      const todo = service.create('Buy milk');
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Buy milk');
      expect(todo.completed).toBe(false);
    });

    test('should reject empty title', () => {
      expect(() => service.create('')).toThrow();
    });

    test('should reject title > 200 chars', () => {
      expect(() => service.create('x'.repeat(201))).toThrow();
    });
  });

  // REQ-TODO-002
  describe('list', () => {
    test('should return all todos sorted by date', () => {
      service.create('First');
      service.create('Second');
      const list = service.list();
      expect(list.length).toBe(2);
      expect(list[0].title).toBe('Second');
    });
  });

  // REQ-TODO-003
  describe('complete', () => {
    test('should mark todo as completed', () => {
      const todo = service.create('Task');
      service.complete(todo.id);
      expect(todo.completed).toBe(true);
      expect(todo.completedAt).toBeDefined();
    });
  });

  // REQ-TODO-004
  describe('delete', () => {
    test('should remove todo', () => {
      const todo = service.create('Task');
      service.delete(todo.id);
      expect(service.list().length).toBe(0);
    });
  });

  // REQ-TODO-005
  describe('filter', () => {
    test('should filter by completed', () => {
      const t1 = service.create('Done');
      service.create('Not done');
      service.complete(t1.id);
      
      expect(service.filter('completed').length).toBe(1);
      expect(service.filter('active').length).toBe(1);
    });
  });
});
```

## 📊 Traceability Matrix

| Requirement | Implementation | Test |
|-------------|----------------|------|
| REQ-TODO-001 | `TodoService.create()` | `create tests` |
| REQ-TODO-002 | `TodoService.list()` | `list tests` |
| REQ-TODO-003 | `TodoService.complete()` | `complete tests` |
| REQ-TODO-004 | `TodoService.delete()` | `delete tests` |
| REQ-TODO-005 | `TodoService.filter()` | `filter tests` |

## ✅ Validation

```bash
# Validate all artifacts
musubi-validate all

# Generate traceability report
musubi-trace

# Check for gaps
musubi-gaps
```

## 📚 Related Examples

- [Medium Project: Web App](./web-app/README.md)
- [Complex Project: Microservices](./microservices/README.md)
- [Enterprise Project: Multi-Team](./enterprise/README.md)
