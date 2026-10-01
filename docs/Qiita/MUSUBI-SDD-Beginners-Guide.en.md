# Getting Started with Specification Driven Development Using MUSUBI - From Vibe Coding to SDD (Specification Driven Development)

> **MUSUBI v2.1.1** - The ultimate specification driven development tool, supporting 7 AI agents and equipped with 25 skills
> 
> 🆕 New in v2.0: CodeGraph MCP integration brings an understanding of the code across the entire project!

## Introduction

"With GitHub Copilot or Claude Code, we don't need design documents anymore, right?"

If that's what you think, wait a moment. It's true that AI coding assistants have dramatically increased coding speed. However, **being able to write fast** and **being able to build correctly** are two different things.

In this article, I'll explain, step by step and with hands-on practice, "Specification Driven Development (SDD)", which is what we truly need in the age of AI coding, and how to use "**MUSUBI**", the ultimate tool for making it happen.

**For beginners**: MUSUBI has 25 specialized agents, but at first **you only need to remember `@orchestrator`**. The orchestrator calls the appropriate specialized agents on your behalf.

**What's new in v2.0**: With MUSUBI v2.0's integration with the [CodeGraph MCP Server](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b), AI agents can now understand the "entire project" instead of just "individual files".

## Vibe Coding vs SDD (Specification Driven Development)

### What Is Vibe Coding?

**Vibe Coding** is a development style in which you keep writing code based on a "vibe", without detailed designs or specifications.

```
Developer: "Build a user authentication feature"
↓
AI: "Sure, here's the code I wrote!"
↓
Developer: "Nice! Next, a password reset feature too"
↓
AI: "Done!"
↓
Repeat...
```

#### Problems with Vibe Coding

1. **Ambiguous specifications**: "Authentication feature" doesn't make clear what to implement or how far to go
2. **Lack of traceability**: It's impossible to trace later why this code is needed
3. **Incomplete testing**: Without specifications, it's unclear what should be tested
4. **Difficulty of change**: The scope of impact on existing code is unknown
5. **Unstable quality**: Depends on the AI's output, with no consistency

In real-world projects:

```
❌ Where Vibe Coding ends up:
- "Wait, what was this code for again?"
- "Do we have enough test cases? What should we test?"
- "This change doesn't affect anything else, right? ...Probably."
- "A bug was found right before release, cause unknown"
```

### What Is SDD (Specification Driven Development)?

**Specification Driven Development (SDD)** is an approach that drives development **starting from clear specifications**.

```
Requirements definition (EARS format)
  ↓
Design (C4 model + ADR)
  ↓
Task breakdown (requirements coverage matrix)
  ↓
Implementation (test-first)
  ↓
Testing (traceability to requirements)
  ↓
Deployment
  ↓
Monitoring
```

#### Benefits of SDD

1. **Clear specifications**: Unambiguous requirements (EARS format)
2. **Complete traceability**: Traceability from requirements → design → code → tests
3. **Comprehensive testing**: Test cases for every requirement
4. **Safe changes**: Visualization of impact scope (Delta Specs)
5. **Consistent quality**: Quality assurance through constitutional governance

## How It Differs from GitHub Copilot / Claude Code

### Conventional AI Coding Assistants

| Tool | Strengths | Weaknesses |
|--------|-----------|-----------|
| **GitHub Copilot** | Code completion, function generation | Requirements definition, architecture design, traceability |
| **Claude Code** | Interactive coding, refactoring | Specification management, quality gates, change impact analysis |
| **Cursor** | Multi-file editing, context understanding | Requirements tracking, test strategy, constitutional governance |

These are **"coding assistance tools"** and do not cover **"the entire development process"**.

### How MUSUBI Is Different - Covering the Entire Development Process

MUSUBI integrates with **7 AI coding agents** and supports the **entire SDD workflow** with **25 specialized agents**.

#### MUSUBI = AI Coding Assistant + Complete SDD Framework

| Category | Conventional tools (Copilot/Claude Code/Cursor) | MUSUBI |
|---------|------------------------------------------|--------|
| **Scope** | Code completion/generation only | The entire development process (requirements → monitoring) |
| **1. Requirements definition** | ❌ Not supported | ✅ EARS format + @requirements-analyst |
| **2. Design** | ❌ Not supported | ✅ C4 model + ADR + @system-architect |
| **3. Task breakdown** | ❌ Not supported | ✅ Requirements coverage matrix + @project-manager |
| **4. Implementation** | ✅ Code generation | ✅ Test-first + @software-developer |
| **5. Testing** | △ Partial | ✅ Requirements traceability + @test-engineer |
| **6. Review** | △ Partial | ✅ SOLID principles check + @code-reviewer |
| **7. Security** | ❌ Not supported | ✅ OWASP Top 10 + @security-auditor |
| **8. Deployment** | ❌ Not supported | ✅ CI/CD automation + @devops-engineer |
| **9. Monitoring** | ❌ Not supported | ✅ SLO/SLI + @site-reliability-engineer |
| **Quality assurance** | None | ✅ Constitutional governance (9 articles) |
| **Traceability** | None | ✅ 100% tracking of requirements → design → code → tests |
| **Project memory** | None | ✅ Steering (structure, tech, and product context) |

### Concrete Example: Developing a User Authentication Feature

#### ❌ Vibe Coding (GitHub Copilot alone)

```bash
Developer: "Build a user authentication feature"
Copilot: [generates code]

# Problems:
- Which authentication method? (JWT? Session? OAuth?)
- What's the password policy?
- What about error handling?
- What about test cases?
- What's the impact on existing code?
```

#### ✅ SDD with MUSUBI

```bash
1. Requirements definition (@requirements-analyst)
   WHEN the user provides valid credentials,
   THEN the system SHALL authenticate the user
   AND the system SHALL issue a session token

2. Design (@system-architect)
   - JWT authentication
   - BCrypt password hashing
   - Redis session management
   - ADR-001: Record why JWT was chosen

3. Task breakdown (@project-manager)
   - Task 1: Create the User model (maps to REQ-AUTH-001)
   - Task 2: JWT generation logic (maps to REQ-AUTH-002)
   - Task 3: Authentication middleware (maps to REQ-AUTH-003)

4. Implementation (@software-developer)
   [Code generation based on requirements]

5. Testing (@test-engineer)
   - REQ-AUTH-001: Verify token issuance with valid credentials
   - REQ-AUTH-002: Verify error with invalid credentials
   - REQ-AUTH-003: Verify session expiration

6. Traceability check (@traceability-auditor)
   ✅ REQ-AUTH-001 → Design Section 7 → AuthService.login() → test/auth.test.ts:L25
```

**Result**: Everything is traceable, tests are complete, quality is assured, and change impact is clear

## Basic Concepts of MUSUBI

### 1. EARS-Format Requirements

**EARS (Easy Approach to Requirements Syntax)** is a requirements writing format that eliminates ambiguity.

```markdown
❌ Ambiguous requirement:
"Allow users to log in"

✅ EARS format:
WHEN the user enters a valid email address and password,
THEN the system SHALL perform user authentication
AND the system SHALL issue a JWT token
AND the system SHALL redirect the user to the dashboard

IF the password is entered incorrectly 3 times in a row,
THEN the system SHALL lock the account for 15 minutes
AND the system SHALL send an email notification to the user
```

#### The 5 EARS Patterns

1. **Event-driven**: `WHEN [event], the system SHALL [response]`
2. **State-driven**: `WHILE [state], the system SHALL [response]`
3. **Unwanted behavior**: `IF [error], THEN the system SHALL [response]`
4. **Optional features**: `WHERE [feature enabled], the system SHALL [response]`
5. **Ubiquitous**: `The system SHALL [requirement]`

### 2. Project Memory (Steering)

**Steering** is the project's "memory". Every specialized agent references it, which enables consistent development.

```
steering/
├── product.md      # Business context, users, purpose
├── structure.md    # Architecture patterns, directory structure
└── tech.md         # Tech stack, libraries, development tools
```

### 3. Constitutional Governance (9 Articles)

MUSUBI guarantees quality with **9 immutable constitutional articles**.

```
Article I:   Library-First (start from lib/)
Article II:  CLI Interface Mandate (everything executable via CLI)
Article III: Test-First (RED-GREEN-BLUE)
Article IV:  EARS Requirements Format (eliminate ambiguity)
Article V:   Traceability Mandate (100% traceable)
Article VI:  Project Memory Reference (Steering first)
Article VII: Simplicity Gate (start with at most 3 libraries)
Article VIII:Anti-Abstraction (no unnecessary wrappers)
Article IX:  Integration-First Testing (use real services)
```

### 4. 25 Specialized Agents

MUSUBI provides 25 specialized agents, available on **all 7 platforms**.

#### 🌟 Orchestration (3 agents) - **Beginners start here!**

- **`@orchestrator`** - **Automatic coordination of complex tasks (recommended for beginners!)**
  - Automatically calls the other 24 agents
  - Analyzes the task and runs the optimal workflow
  - **Just say "Build a task comment feature" and it runs everything automatically, from requirements definition → design → implementation → testing**
- `@steering` - Project memory management
- `@constitution-enforcer` - Quality gate validation

#### Requirements & Planning (3 agents)
- `@requirements-analyst` - EARS-format requirements creation
- `@project-manager` - Task management, scheduling
- `@change-impact-analyzer` - Change impact analysis

#### Design (4 agents)
- `@system-architect` - System design, ADRs
- `@api-designer` - API design
- `@database-schema-designer` - DB design
- `@ui-ux-designer` - UI/UX design

#### Development & Quality (6 agents)
- `@software-developer` - Code implementation
- `@test-engineer` - Test creation
- `@code-reviewer` - Code review
- `@bug-hunter` - Bug investigation
- `@quality-assurance` - QA strategy
- `@traceability-auditor` - Traceability auditing

#### Security & Performance (2 agents)
- `@security-auditor` - Security auditing
- `@performance-optimizer` - Performance optimization

#### Infrastructure & Operations (5 agents)
- `@devops-engineer` - CI/CD
- `@cloud-architect` - Cloud design
- `@database-administrator` - DB operations
- `@site-reliability-engineer` - Production monitoring
- `@release-coordinator` - Release management

#### Documentation & Specialized (2 agents)
- `@technical-writer` - Technical documentation
- `@ai-ml-engineer` - ML development

## Hands-On! Getting Started with SDD Using MUSUBI

Now let's actually move a project forward using MUSUBI.

### Prerequisites

- Node.js 18 or later
- Any AI coding agent (Claude Code, GitHub Copilot, Cursor, etc.)

### Step 1: Install MUSUBI

```bash
# Via npx (recommended)
npx musubi-sdd init --claude      # If using Claude Code
npx musubi-sdd init --copilot     # If using GitHub Copilot
npx musubi-sdd init --cursor      # If using Cursor

# Or install globally
npm install -g musubi-sdd
musubi init --claude
```

When run, the following files and directories are created.

```
your-project/
├── .claude/           # Claude Code Skills (if using Claude Code)
│   └── skills/        # 25 skill definitions
├── .github/           # GitHub Copilot Agents (if using Copilot)
│   └── agents/        # 25 agent definitions
├── steering/          # Project memory (shared by all agents)
│   ├── product.md
│   ├── structure.md
│   └── tech.md
└── steering/
    ├── rules/
    │   ├── workflow.md           # 8-stage SDD workflow
    │   ├── ears-format.md        # EARS requirements writing guide
    │   └── agent-validation-checklist.md
    └── templates/
        ├── requirements.md
        ├── design.md
        ├── tasks.md
        └── research.md
```

### Step 2: Generate Project Memory

The first step with MUSUBI is to create the project's "memory".

#### 🎯 For Beginners (using the orchestrator)

**For Claude Code**:
```
You: @orchestrator Please set up the initial configuration for this project. We plan to develop a task management SaaS.
```

**For GitHub Copilot / Cursor**:
```
You: @orchestrator Please set up the initial configuration for this project. We plan to develop a task management SaaS.
```

The orchestrator automatically:
1. Calls `@steering` to generate the project memory
2. Presents tech stack recommendations
3. Proposes a directory structure

#### 💡 For Advanced Users (direct invocation)

```
You: @steering Please analyze this project's context and generate the steering files
```

The Steering agent analyzes existing code (if any) and automatically generates the following.

```markdown
# steering/product.md
## Project Overview
Development of the task management SaaS "TaskMaster"

## Users
- Small teams (5-20 people)
- Mainly remote work
- Includes non-engineers

## Key Features
1. Task creation/editing
2. Sharing across teams
3. Progress visualization
4. Slack integration
```

```markdown
# steering/tech.md
## Tech Stack
- Frontend: Next.js 14 (App Router)
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Auth: NextAuth.js
- Deployment: Vercel
```

```markdown
# steering/structure.md
## Architecture Pattern
Clean Architecture + Repository Pattern

## Directory Structure
lib/               # Business logic (framework-independent)
  ├── tasks/       # Task management domain
  ├── users/       # User management domain
  └── shared/      # Shared utilities

app/               # Next.js App Router
  ├── tasks/       # Task pages
  └── api/         # API Routes

test/              # Test code
```

**Important**: From this point on, all agents automatically reference this Steering.

### Step 3: Feature Development (leave it all to the orchestrator)

Let's say we're adding a new feature: "comments on tasks".

#### 🎯 For Beginners (using the orchestrator) - **Recommended!**

**Run the entire process automatically with just one command**:

```
You: @orchestrator I want to add a comment feature to tasks. Please let users post, edit, and delete comments.
```

The orchestrator automatically:

1. **Requirements analysis**: Calls `@requirements-analyst` to create EARS-format requirements
2. **Design**: Calls `@system-architect` for C4 model + ADR design
3. **Task breakdown**: Calls `@project-manager` to create the implementation task list
4. **Implementation planning**: Instructs `@software-developer` on test-first implementation steps
5. **Quality check**: Checks constitutional compliance with `@constitution-enforcer`
6. **Progress reporting**: Reports the completion of each step

**What you do**: Just answer the orchestrator's questions!

```
Orchestrator: Let me confirm the comment feature. Are the following requirements OK?

1. Post comments (user info and timestamp recorded automatically)
2. Display comment list (newest first)
3. Edit comments (author only, edit history recorded)
4. Delete comments (soft delete)
5. Error handling (retry on network errors)

You: Yes, that works.

Orchestrator: Understood. I'll proceed in order, starting with requirements definition...
[Starting Requirements Analyst]
[Starting System Architect]
[Starting Project Manager]
...
```

#### 💡 For Advanced Users (calling individual agents)

If you want to control each step individually:

```
You: @requirements-analyst Please create requirements for a comment feature on tasks
```

The Requirements Analyst agent creates the requirements interactively.

```markdown
# docs/requirements/task-comments.md

## REQ-COMMENT-001: Post Comment
WHEN the user enters a comment on the task detail screen and presses the Submit button,
THEN the system SHALL save the comment to the database
AND the system SHALL record the posting date/time and user information
AND the system SHALL display it in the comment list immediately
AND the system SHALL send a task update notification to team members

## REQ-COMMENT-002: Display Comments
WHEN the user opens the task detail screen,
THEN the system SHALL display all comments in newest-first order
AND the system SHALL display the author name and avatar for each comment
AND the system SHALL display the posting date/time as relative time ("2 hours ago")

## REQ-COMMENT-003: Edit Comment
WHEN the comment author clicks the edit icon on their own comment,
THEN the system SHALL display the comment edit form
AND the system SHALL prefill the form with the current comment content

WHEN the Save button is pressed after editing,
THEN the system SHALL update the comment
AND the system SHALL record it in the edit history ("edited 1 hour ago")

## REQ-COMMENT-004: Delete Comment
WHEN the comment author clicks the delete icon on their own comment,
THEN the system SHALL display a confirmation dialog

WHEN the user confirms the deletion,
THEN the system SHALL soft-delete the comment
AND the system SHALL hide the deleted comment from the comment list

## REQ-COMMENT-005: Error Handling
IF posting a comment fails due to a network error,
THEN the system SHALL display an error message
AND the system SHALL retain the user's input
AND the system SHALL display a retry button

## Acceptance Criteria
- [ ] All requirements are in EARS format
- [ ] Each requirement is testable
- [ ] Error cases are covered
- [ ] Complies with steering (tech stack)
```

#### Orchestrator Results

The orchestrator automatically calls each specialized agent and generates the following documents:

**1. Requirements definition** (`docs/requirements/task-comments.md`):

The requirements document generated by the Requirements Analyst agent (see above)

**2. Design** (`docs/design/task-comments.md`):

The orchestrator automatically launches `@system-architect` and creates the design document:

```markdown
# docs/design/task-comments.md

## Architecture Overview (C4 Context)

┌──────────────────────────────────────────┐
│ TaskMaster System                        │
│                                          │
│  ┌────────────────┐  ┌────────────────┐  │
│  │ Task Comments  │→ │ Notification   │  │
│  │ Feature        │  │ Service        │  │
│  └────────────────┘  └────────────────┘  │
│         ↓                                │
│  ┌────────────────┐                      │
│  │ PostgreSQL     │                      │
│  └────────────────┘                      │
└──────────────────────────────────────────┘
         ↓
    [Slack API]

## Component Design (C4 Component)

### Frontend Components
- `CommentList` - Display comment list (REQ-COMMENT-002)
- `CommentForm` - Comment posting form (REQ-COMMENT-001)
- `CommentItem` - Display, edit, and delete individual comments (REQ-COMMENT-003, 004)

### Backend API
- `POST /api/tasks/:taskId/comments` - Post comment (REQ-COMMENT-001)
- `GET /api/tasks/:taskId/comments` - Get comments (REQ-COMMENT-002)
- `PATCH /api/comments/:commentId` - Edit comment (REQ-COMMENT-003)
- `DELETE /api/comments/:commentId` - Delete comment (REQ-COMMENT-004)

### Database Schema
\`\`\`sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,  -- Soft delete
  edit_history JSONB        -- Edit history
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
\`\`\`

## ADR (Architecture Decision Record)

### ADR-001: Adopting Soft Delete

**Status**: Accepted

**Context**:
When deleting comments, we need to choose between physical deletion (DELETE) and soft deletion (deleted_at flag).

**Decision**:
Adopt soft deletion.

**Rationale**:
1. Audit requirements: deletion history must be traceable
2. Recoverability: recovery from accidental deletion is possible
3. Protection of related data: preserves replies to deleted comments, etc.

**Consequences**:
- Positive: Data can be restored, audit-ready
- Negative: Queries require `WHERE deleted_at IS NULL`

## Requirements Traceability Matrix

| Requirement ID | Design Component | Implementation File (planned) |
|--------|------------------|-------------------|
| REQ-COMMENT-001 | POST /api/tasks/:taskId/comments | lib/comments/repository.ts |
| REQ-COMMENT-002 | GET /api/tasks/:taskId/comments | lib/comments/repository.ts |
| REQ-COMMENT-003 | PATCH /api/comments/:commentId | lib/comments/repository.ts |
| REQ-COMMENT-004 | DELETE /api/comments/:commentId | lib/comments/repository.ts |
| REQ-COMMENT-005 | Error boundary in CommentForm | app/components/CommentForm.tsx |
```

### Step 5: Task Breakdown

Once the design is ready, break it down into implementation tasks.

#### For Claude Code

```
You: /sdd-tasks task-comments
```

#### For GitHub Copilot / Cursor

```
You: @project-manager Please create tasks based on design/task-comments.md
```

The Project Manager agent creates the task list.

``````markdown
# docs/tasks/task-comments.md

## Task List

### Phase 1: Database & API (2-3 days)

#### Task 1.1: Database Migration
- [ ] Create the comments table (REQ-COMMENT-001, 002, 003, 004)
- [ ] Add indexes
- [ ] Create migration file
- **Owner**: Backend Developer
- **Due**: Day 1
- **Depends on**: None

#### Task 1.2: Comment Repository
- [ ] Create `lib/comments/repository.ts` (Article I: Library First)
- [ ] Implement `createComment()` (REQ-COMMENT-001)
- [ ] Implement `getCommentsByTaskId()` (REQ-COMMENT-002)
- [ ] Implement `updateComment()` (REQ-COMMENT-003)
- [ ] Implement `softDeleteComment()` (REQ-COMMENT-004)
- [ ] Create CLI interface (Article II)
- **Owner**: Backend Developer
- **Due**: Day 1-2
- **Depends on**: Task 1.1

#### Task 1.3: Comment Repository Tests
- [ ] Create test file `lib/comments/repository.test.ts`
- [ ] Tests for REQ-COMMENT-001 (post comment)
- [ ] Tests for REQ-COMMENT-002 (get comments)
- [ ] Tests for REQ-COMMENT-003 (edit comment)
- [ ] Tests for REQ-COMMENT-004 (delete comment)
- [ ] Confirm coverage of 80% or higher (Article III)
- **Owner**: Backend Developer
- **Due**: Day 2
- **Depends on**: Task 1.2

#### Task 1.4: API Routes
- [ ] Create `app/api/tasks/[taskId]/comments/route.ts`
- [ ] POST handler (REQ-COMMENT-001)
- [ ] GET handler (REQ-COMMENT-002)
- [ ] Create `app/api/comments/[commentId]/route.ts`
- [ ] PATCH handler (REQ-COMMENT-003)
- [ ] DELETE handler (REQ-COMMENT-004)
- [ ] Error handling (REQ-COMMENT-005)
- **Owner**: Backend Developer
- **Due**: Day 2-3
- **Depends on**: Task 1.2

### Phase 2: Frontend Components (3-4 days)

#### Task 2.1: CommentForm Component
- [ ] Create `app/components/CommentForm.tsx`
- [ ] Form UI (REQ-COMMENT-001)
- [ ] Validation
- [ ] Error display (REQ-COMMENT-005)
- [ ] Retry logic
- **Owner**: Frontend Developer
- **Due**: Day 3-4
- **Depends on**: Task 1.4

#### Task 2.2: CommentList Component
- [ ] Create `app/components/CommentList.tsx`
- [ ] Display comment list (REQ-COMMENT-002)
- [ ] Sort newest first
- [ ] Loading state
- **Owner**: Frontend Developer
- **Due**: Day 4
- **Depends on**: Task 1.4

#### Task 2.3: CommentItem Component
- [ ] Create `app/components/CommentItem.tsx`
- [ ] Display comment (author, time)
- [ ] Edit button (REQ-COMMENT-003)
- [ ] Delete button (REQ-COMMENT-004)
- [ ] Toggle edit form
- [ ] Delete confirmation dialog
- **Owner**: Frontend Developer
- **Due**: Day 5
- **Depends on**: Task 2.2

#### Task 2.4: Frontend Tests
- [ ] `app/components/CommentForm.test.tsx`
- [ ] `app/components/CommentList.test.tsx`
- [ ] `app/components/CommentItem.test.tsx`
- [ ] Confirm coverage of 80% or higher
- **Owner**: Frontend Developer
- **Due**: Day 6
- **Depends on**: Task 2.1, 2.2, 2.3

### Phase 3: Integration & Testing (1-2 days)

#### Task 3.1: Integration Tests
- [ ] Create E2E tests
- [ ] Run test cases for all requirements
- [ ] Update the traceability matrix
- **Owner**: QA Engineer
- **Due**: Day 7
- **Depends on**: Task 2.4

#### Task 3.2: Documentation
- [ ] Create API documentation
- [ ] Update user guide
- **Owner**: Technical Writer
- **Due**: Day 7
- **Depends on**: Task 3.1

## Requirements Coverage Matrix

| Requirement ID | Phase | Task | Implementation File | Test File | Status |
|--------|---------|--------|-------------|--------------|-----------|
| REQ-COMMENT-001 | Phase 1 | Task 1.2, 1.4 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-002 | Phase 1 | Task 1.2, 1.4 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-003 | Phase 1, 2 | Task 1.2, 1.4, 2.3 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-004 | Phase 1, 2 | Task 1.2, 1.4, 2.3 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-005 | Phase 2 | Task 2.1 | app/components/CommentForm.tsx | app/components/CommentForm.test.tsx | ⏳ |

## Schedule

```
Day 1-2:  Backend (DB + Repository)
Day 3-6:  Frontend Components
Day 7:    Integration & Docs
Total:    7 days (1 week)
```
``````

### Step 4: Implementation (the orchestrator continues to support you)

The orchestrator reviews the task list and automatically starts implementation:

```
Orchestrator: I've reviewed the task list. Starting implementation from Phase 1.
Proceeding test-first (Article III compliant).

[Implementing Task 1.2]
✓ @test-engineer is designing tests...
✓ @software-developer is implementing RED-GREEN-REFACTOR...
✓ @code-reviewer is reviewing the code...
✓ @constitution-enforcer is running the constitution check...

Task 1.2 complete. Moving on to the next task.
```

**💡 Tip for advanced users**: You can also specify individual tasks.  
Example: `@software-developer Please implement only Task 2.1`

Example of generated test code:

```typescript
// lib/comments/repository.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createComment, getCommentsByTaskId, updateComment, softDeleteComment } from './repository';
import { testDb } from '@/test/helpers/db';

describe('Comment Repository', () => {
  beforeEach(async () => {
    await testDb.clean(); // Clean up the test DB
  });

  // REQ-COMMENT-001: Post comment
  describe('createComment', () => {
    it('should create a new comment with user info and timestamp', async () => {
      // GIVEN
      const taskId = 'task-123';
      const userId = 'user-456';
      const content = 'This is a great task!';

      // WHEN
      const comment = await createComment({ taskId, userId, content });

      // THEN
      expect(comment).toMatchObject({
        id: expect.any(String),
        taskId,
        userId,
        content,
        createdAt: expect.any(Date),
        updatedAt: null,
        deletedAt: null,
      });
    });

    it('should throw error when content is empty', async () => {
      await expect(
        createComment({ taskId: 'task-123', userId: 'user-456', content: '' })
      ).rejects.toThrow('Content cannot be empty');
    });
  });

  // REQ-COMMENT-002: Get comments
  describe('getCommentsByTaskId', () => {
    it('should return comments in descending order by created_at', async () => {
      // GIVEN
      const taskId = 'task-123';
      await createComment({ taskId, userId: 'user-1', content: 'First comment' });
      await createComment({ taskId, userId: 'user-2', content: 'Second comment' });
      await createComment({ taskId, userId: 'user-3', content: 'Third comment' });

      // WHEN
      const comments = await getCommentsByTaskId(taskId);

      // THEN
      expect(comments).toHaveLength(3);
      expect(comments[0].content).toBe('Third comment'); // Newest first
      expect(comments[2].content).toBe('First comment');
    });

    it('should not return soft-deleted comments', async () => {
      // GIVEN
      const taskId = 'task-123';
      const comment = await createComment({ taskId, userId: 'user-1', content: 'Will be deleted' });
      await softDeleteComment(comment.id);

      // WHEN
      const comments = await getCommentsByTaskId(taskId);

      // THEN
      expect(comments).toHaveLength(0);
    });
  });

  // REQ-COMMENT-003: Edit comment
  describe('updateComment', () => {
    it('should update comment content and set updated_at', async () => {
      // GIVEN
      const comment = await createComment({
        taskId: 'task-123',
        userId: 'user-1',
        content: 'Original content',
      });

      // WHEN
      const updated = await updateComment(comment.id, { content: 'Updated content' });

      // THEN
      expect(updated.content).toBe('Updated content');
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.editHistory).toContainEqual({
        content: 'Original content',
        editedAt: expect.any(Date),
      });
    });
  });

  // REQ-COMMENT-004: Delete comment
  describe('softDeleteComment', () => {
    it('should set deleted_at timestamp', async () => {
      // GIVEN
      const comment = await createComment({
        taskId: 'task-123',
        userId: 'user-1',
        content: 'Will be deleted',
      });

      // WHEN
      const deleted = await softDeleteComment(comment.id);

      // THEN
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });
  });
});
```

#### Task 1.2: Repository Implementation (RED → GREEN)

First, run the tests (RED):

```bash
npm test lib/comments/repository.test.ts
# ❌ All fail (naturally, since nothing is implemented yet)
```

Next, implement (GREEN):

```typescript
// lib/comments/repository.ts

import { db } from '@/lib/database/client';
import type { Comment, CreateCommentInput, UpdateCommentInput } from './types';

/**
 * Article I: Library First
 * Framework-independent business logic
 */

// REQ-COMMENT-001: Post comment
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  if (!input.content.trim()) {
    throw new Error('Content cannot be empty');
  }

  const [comment] = await db
    .insert('comments')
    .values({
      taskId: input.taskId,
      userId: input.userId,
      content: input.content,
      createdAt: new Date(),
    })
    .returning('*');

  return comment;
}

// REQ-COMMENT-002: Get comments
export async function getCommentsByTaskId(taskId: string): Promise<Comment[]> {
  return db
    .select('*')
    .from('comments')
    .where('taskId', taskId)
    .whereNull('deletedAt') // Exclude soft-deleted comments
    .orderBy('createdAt', 'desc'); // Newest first
}

// REQ-COMMENT-003: Edit comment
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<Comment> {
  const [existing] = await db.select('*').from('comments').where('id', commentId);

  const editHistory = existing.editHistory || [];
  editHistory.push({
    content: existing.content,
    editedAt: new Date(),
  });

  const [updated] = await db
    .update('comments')
    .set({
      content: input.content,
      updatedAt: new Date(),
      editHistory,
    })
    .where('id', commentId)
    .returning('*');

  return updated;
}

// REQ-COMMENT-004: Delete comment (soft delete)
export async function softDeleteComment(commentId: string): Promise<Comment> {
  const [deleted] = await db
    .update('comments')
    .set({ deletedAt: new Date() })
    .where('id', commentId)
    .returning('*');

  return deleted;
}
```

Following Article II, also create a CLI interface:

```typescript
// lib/comments/cli.ts

import { createComment, getCommentsByTaskId } from './repository';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      const taskId = process.argv[3];
      const userId = process.argv[4];
      const content = process.argv[5];
      const comment = await createComment({ taskId, userId, content });
      console.log('Created:', comment);
      break;

    case 'list':
      const task = process.argv[3];
      const comments = await getCommentsByTaskId(task);
      console.log('Comments:', comments);
      break;

    default:
      console.log('Usage: node cli.ts [create|list] <args>');
  }
}

main();
```

Run the tests again (GREEN):

```bash
npm test lib/comments/repository.test.ts
# ✅ All tests passed! (14/14)
# Coverage: 85%
```

#### Constitutional Validation

After implementation, check constitutional compliance with constitution-enforcer:

```
You: @constitution-enforcer Please validate lib/comments/
```

```
✅ Article I (Library First): lib/comments/repository.ts - No framework dependencies
✅ Article II (CLI Interface): lib/comments/cli.ts - Executable via CLI
✅ Article III (Test First): lib/comments/repository.test.ts - 85% coverage
✅ Article V (Traceability): All requirements map to tests
✅ Article VI (Project Memory): Complies with the tech stack in steering/tech.md
```

### Step 7: Frontend Implementation

Implement the frontend test-first in the same way.

```typescript
// app/components/CommentForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from './CommentForm';
import { createComment } from '@/lib/comments/repository';

jest.mock('@/lib/comments/repository');

describe('CommentForm', () => {
  // REQ-COMMENT-001: Post comment
  it('should submit comment when form is valid', async () => {
    render(<CommentForm taskId="task-123" />);

    const textarea = screen.getByPlaceholderText('Enter a comment...');
    const submitButton = screen.getByRole('button', { name: 'Post' });

    fireEvent.change(textarea, { target: { value: 'This is a great task!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith({
        taskId: 'task-123',
        userId: expect.any(String),
        content: 'This is a great task!',
      });
    });
  });

  // REQ-COMMENT-005: Error handling
  it('should show error message and retry button when submission fails', async () => {
    (createComment as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CommentForm taskId="task-123" />);

    const textarea = screen.getByPlaceholderText('Enter a comment...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to post comment')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      expect(textarea).toHaveValue('Test comment'); // Input is preserved
    });
  });
});
```

Implementation:

```tsx
// app/components/CommentForm.tsx

'use client';

import { useState } from 'react';
import { createComment } from '@/lib/comments/repository';

export function CommentForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createComment({
        taskId,
        userId: 'current-user-id', // In practice, obtained from authentication
        content,
      });
      setContent(''); // Clear only on success
    } catch (err) {
      setError('Failed to post comment'); // REQ-COMMENT-005
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter a comment..."
        className="w-full p-3 border rounded-lg"
        rows={3}
      />

      {error && (
        <div className="text-red-600 text-sm">
          {error}
          <button
            type="button"
            onClick={handleSubmit}
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

#### Quality Check by the Orchestrator

The orchestrator detects that implementation is complete and automatically starts quality checks:

```
Orchestrator: Detected the implementation of the task-comments feature. Starting quality checks.

[Running automatically]
✓ Traceability audit by @traceability-auditor...
✓ Code review by @code-reviewer...
✓ Security check by @security-auditor...
✓ Constitutional compliance check by @constitution-enforcer...

All checks are complete. The results are shown below.
```

**💡 Tip for advanced users**: You can also call individual agents directly.  
Example: `@traceability-auditor Please check the requirements coverage of task-comments`

Generated traceability audit report:

```markdown
# Traceability Audit Report: task-comments

## Requirements Coverage: 100% ✅

| Requirement ID | Summary | Design | Implementation | Test | Status |
|--------|---------|------|------|--------|-----------|
| REQ-COMMENT-001 | Post comment | Design Section 3.2 | lib/comments/repository.ts:L15 | repository.test.ts:L12 | ✅ |
| REQ-COMMENT-002 | Display comments | Design Section 3.2 | lib/comments/repository.ts:L32 | repository.test.ts:L35 | ✅ |
| REQ-COMMENT-003 | Edit comment | Design Section 3.2 | lib/comments/repository.ts:L45 | repository.test.ts:L58 | ✅ |
| REQ-COMMENT-004 | Delete comment | Design Section 3.2 | lib/comments/repository.ts:L68 | repository.test.ts:L78 | ✅ |
| REQ-COMMENT-005 | Error handling | Design Section 3.3 | app/components/CommentForm.tsx:L25 | CommentForm.test.tsx:L45 | ✅ |

## Test Coverage: 87% ✅

- Backend: 92%
- Frontend: 81%
- Overall: 87% (target of 80% or higher achieved)

## Constitutional Compliance: 9/9 ✅

- Article I (Library First): ✅
- Article II (CLI Interface): ✅
- Article III (Test First): ✅
- Article IV (EARS Format): ✅
- Article V (Traceability): ✅
- Article VI (Project Memory): ✅
- Article VII (Simplicity): ✅
- Article VIII (Anti-Abstraction): ✅
- Article IX (Integration First): ✅

## Recommendations

All quality gates have been passed. Ready to deploy.
```

### Step 6: Deployment Preparation (the orchestrator wraps it up)

#### Deployment Preparation by the Orchestrator

After the quality checks are complete, the orchestrator automatically starts deployment preparation:

```
Orchestrator: All quality checks have been cleared. Starting deployment preparation.

[Running automatically]
✓ Creating the CI/CD pipeline with @devops-engineer...
✓ Creating deployment documentation with @technical-writer...
✓ Setting up production monitoring with @site-reliability-engineer...

Deployment preparation is complete. The following files have been generated.
```

**💡 Tip for advanced users**: You can also configure details with individual agents.  
Example: `@devops-engineer Please create a custom CI/CD configuration`

Generated CI/CD pipeline:

```
You: @devops-engineer Please set up the CI/CD pipeline for the task-comments feature
```

```yaml
# .github/workflows/task-comments.yml

name: Task Comments CI/CD

on:
  pull_request:
    paths:
      - 'lib/comments/**'
      - 'app/components/Comment*'
      - 'app/api/tasks/*/comments/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- lib/comments app/components/Comment
      
      - name: Check coverage
        run: npm run test:coverage -- --threshold=80
      
      - name: Constitutional validation
        run: npx musubi validate

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Comparing the Results of Vibe Coding vs SDD

Results of developing the same "task comment feature" with two approaches:

### ❌ Vibe Coding (GitHub Copilot alone)

```
Development time: 3 days
Lines of code: 500
Test coverage: 45%
Bugs (production): 8
  - Deleting a comment deletes the whole task
  - Edit history is not recorded
  - Form content is lost on errors
  - Performance issue (N+1 queries)

Documentation: None
Traceability: 0%
Refactoring difficulty: High (no idea why things are the way they are)
```

### ✅ SDD with MUSUBI

```
Development time: 7 days (including design and testing)
Lines of code: 800 (including tests)
Test coverage: 87%
Bugs (production): 0
  - All requirements tested
  - Edge cases covered
  - Error handling is flawless

Documentation: Complete (requirements, design, ADRs, traceability matrix)
Traceability: 100%
Refactoring difficulty: Low (everything is traceable)
```

**Conclusion**: An up-front investment (+4 days) dramatically improves long-term quality and maintainability

## Brownfield Projects (Adding Features to Existing Code)

When introducing MUSUBI to an existing project, use Delta Specs (differential specifications).

### Step 1: Initialize MUSUBI in Existing Code

```bash
cd existing-project
npx musubi-sdd init --claude
```

### Step 2: Analyze Existing Code

```
You: @steering Please analyze the existing codebase and generate the steering files
```

The Steering agent analyzes the existing code and automatically extracts the current architecture, tech stack, and structure.

### Step 3: Change Impact Analysis

Suppose we're adding a new feature: "two-factor authentication (2FA)".

```
You: @change-impact-analyzer Please analyze the impact of adding a two-factor authentication feature
```

The Change Impact Analyzer generates an analysis report:

```markdown
# Change Impact Analysis: Two-Factor Authentication (2FA)

## ADDED (new)

### Requirements
- REQ-2FA-001: TOTP generation and verification
- REQ-2FA-002: QR code display
- REQ-2FA-003: Backup code generation

### Files
- lib/auth/totp.ts (new)
- lib/auth/backup-codes.ts (new)
- app/settings/security/page.tsx (new)

## MODIFIED (changed)

### Requirements
- REQ-AUTH-001: Add a 2FA verification step to the login process

### Files
- lib/auth/login.ts (add 2FA verification)
- app/login/page.tsx (add 2FA input form)
- database/schema.sql (add 2fa_secret column to the users table)

## REMOVED (deleted)

None

## Impact Scope

### High Risk
- Changes to the existing login flow (affects all users)

### Medium Risk
- Database schema changes (migration required)

### Low Risk
- New screens added (no impact on existing features)

## Recommendations

1. Gradual rollout (using Feature Flags)
2. 2FA optional for existing users, mandatory for new users
3. Backup code generation mandatory
```

### Step 4: Create Delta Specs

```
You: @requirements-analyst Please create the delta specs for the 2FA feature
```

```markdown
# Delta Specs: Two-Factor Authentication (2FA)

## ADDED Requirements

### REQ-2FA-001: Enable TOTP
WHEN the user clicks the "Enable 2FA" button in the security settings,
THEN the system SHALL generate a TOTP secret
AND the system SHALL display a QR code
AND the system SHALL generate 10 six-digit backup codes

### REQ-2FA-002: Verify TOTP
WHEN a user with 2FA enabled logs in,
THEN the system SHALL require 2FA code entry after password verification
AND the system SHALL verify the 6-digit code entered by the user
AND the system SHALL allow login only when verification succeeds

## MODIFIED Requirements

### REQ-AUTH-001: Login Process (modified)
**Before**:
WHEN the user enters a valid email address and password,
THEN the system SHALL perform user authentication

**After**:
WHEN the user enters a valid email address and password,
THEN the system SHALL perform password verification
AND IF the user has 2FA enabled, THEN the system SHALL display the 2FA verification screen
AND IF the user does not have 2FA enabled, THEN the system SHALL complete the login
```

With these delta specs, you can safely add new features while minimizing the impact on existing functionality.

## 🚀 MUSUBI v2.0: Enhanced Code Understanding with CodeGraph MCP Integration

With MUSUBI v2.0's integration with the **CodeGraph MCP Server**, AI agents can now understand the code structure of the entire project.

### The Previous Challenge

Conventional AI coding assistants had a limitation: a "file-level field of view":

- "Where is this function called from?" → Can't answer
- "What's the impact scope of the change?" → Relies on guesswork
- "What's the structure of the whole project?" → Time-consuming manual investigation

### Solved with CodeGraph MCP

The CodeGraph MCP Server analyzes the codebase as a graph structure and gives AI agents a "map of the entire project".

#### Key Features

| Feature | Description |
|------|------|
| 🔍 **Code structure analysis** | Visualizes dependencies between functions, classes, and modules |
| 🧠 **GraphRAG search** | Semantic code search (meaning-based) |
| 📊 **Impact analysis** | Automatically identifies the ripple effects of changes |
| 🏘️ **Community detection** | Automatically analyzes module boundaries |
| 🌐 **14 languages supported** | Python, JS, TS, Java, Go, Rust, etc. |

### Before / After Comparison

| Task | Before (v1.x) | After (v2.0 + CodeGraph) |
|--------|---------------|--------------------------|
| Investigating a function's impact | Manual grep (risk of missing things) | Complete list via `find_callers` |
| Refactoring planning | Relies on experience and intuition | Objective analysis via `analyze_module_structure` |
| Understanding dependencies | Visually checking import statements | Detects deep dependencies too via `find_dependencies` |
| Understanding the codebase | Reading files one by one | Big-picture view via `stats`, `community` |

### Practical Example: Enhanced Impact Analysis

```
User: @change-impact-analyzer I want to change the calculatePrice function. Please tell me the impact scope.

🤖 Change Impact Analyzer (using CodeGraph):

Running find_callers("calculatePrice")...

[Direct callers] (5)
- OrderService.createOrder() - line 45
- CartController.updateCart() - line 78
- InvoiceGenerator.generate() - line 112
- PriceValidator.validate() - line 23
- BatchProcessor.processAll() - line 89

[Indirect callers] (3) ← This is the part we used to miss!
- APIController.handleRequest() → OrderService → calculatePrice
- ScheduledTask.dailyReport() → BatchProcessor → calculatePrice
- WebhookHandler.onPayment() → InvoiceGenerator → calculatePrice

[Impact on tests]
- tests/unit/price.test.ts (direct test)
- tests/integration/order.test.ts (indirect impact)
```

### Setup

```bash
# Just ask the orchestrator
@orchestrator Please set up CodeGraph MCP
```

The orchestrator automatically:
1. ✅ Checks the Python environment
2. ✅ Installs the CodeGraph MCP Server
3. ✅ Indexes the project
4. ✅ Generates configuration files

For details, see the [MUSUBI × CodeGraph MCP Server Integration Guide](https://qiita.com/hisaho/items/719210ccc20fe2514054) (in Japanese).

## Summary

### Vibe Coding vs SDD with MUSUBI

| Item | Vibe Coding | SDD with MUSUBI |
|------|------------|-----------------|
| **Development speed (short term)** | Fast (3 days) | Somewhat slower (7 days, including design) |
| **Quality** | Unstable | Stable (constitution-guaranteed) |
| **Test coverage** | Low (~50%) | High (80% or more) |
| **Bug rate** | High | Low |
| **Documentation** | None | Complete |
| **Traceability** | None | 100% |
| **Maintainability** | Low | High |
| **Ease of change** | Difficult | Easy (with impact analysis) |
| **Long-term cost** | High (technical debt) | Low |

### When to Use MUSUBI

✅ **Strongly recommended**:
- Systems running in production
- Team development (traceability essential)
- Projects planned for long-term operation
- Regulatory compliance required (audits, security)
- Projects with frequent changes

△ **Optional**:
- Personal experiments and learning projects
- Throwaway prototypes
- Extremely short PoCs

### Benefits of Using the Orchestrator

🎯 **Beginner-friendly**:
- **You only need to remember one command**: `@orchestrator [what you want to do]`
- **No need to remember 25 agents**: The orchestrator selects them automatically
- **Proceeds in a question format**: It asks only what's necessary
- **Hard to fail**: Best practices are applied automatically

🚀 **Efficient development**:
- **Parallel execution**: Launches multiple agents simultaneously
- **Automatic dependency resolution**: Automatically determines which agents are needed
- **Progress management**: Visualizes the overall flow
- **Error handling**: Automatically detects problems and suggests fixes

📚 **Great for learning too**:
- **Experience the SDD flow**: Actually see requirements → design → implementation
- **Learn expert judgment**: Understand why each agent is needed
- **Go deeper step by step**: Leave it to the orchestrator at first, then move to individual operations once you're used to it

### Next Steps

#### 🎯 For Beginners

1. **Install MUSUBI**
   ```bash
   npx musubi-sdd init --claude  # Choose your agent
   ```

2. **First, just remember @orchestrator**
   ```
   @orchestrator Please implement [what you want to do]
   ```
   - No need to remember the other 24 agents
   - The orchestrator automatically calls the appropriate agents

3. **Start with a small feature**
   - For an existing project, try MUSUBI on your next small feature addition
   - For a new project, start with one core feature
   - **Example**: `@orchestrator Please build a login feature`

4. **Answer the orchestrator's questions**
   - The orchestrator confirms the requirements with you
   - Just reply with Yes/No or a short explanation

#### 💡 Once You're Comfortable

5. **Try individual agents**
   - Want to create just the requirements first → `@requirements-analyst`
   - Want just the design reviewed → `@system-architect`
   - Check only security → `@security-auditor`

6. **Get used to the SDD workflow**
   - Experience the flow of requirements → design → implementation → testing
   - It takes time at first, but you'll get used to it after 2-3 times

7. **Roll it out to your team**
   - Once you succeed individually, share it with your team
   - Share project knowledge with Steering

## Resources

- **MUSUBI npm**: https://www.npmjs.com/package/musubi-sdd
- **GitHub Repository**: https://github.com/nahisaho/MUSUBI
- **Current Version**: v2.1.1 (as of June 2025)

---

**Unlock the full potential of AI coding with specification driven development!** 🚀

---

> MUSUBI, introduced in this article, is an open-source project under the MIT License.
> Contributions and stars ⭐ are welcome!

#SDD #SpecificationDrivenDevelopment #MUSUBI #AI #ClaudeCode #GitHubCopilot #Cursor #DevelopmentProcess #QualityAssurance
