# Agent Output Pattern - Gradual File Generation

## Purpose

Prevent context length overflow errors by breaking agent output into small chunks with file saves.

## Standard Pattern (All 25 Agents)

### Phase 4: Gradual Output Generation

```markdown
### Phase 4: Incremental Deliverable Generation

**CRITICAL: Prevent context length overflow**

**Output method:**
- Generate and save one file at a time, in order
- Report progress after each file is generated
- Split large files (>300 lines) into multiple files
- Partial deliverables remain even if an error occurs

```
🤖 Thank you for confirming. I will generate the following deliverables in order.

[Deliverables to generate]
1. [Document/Code 1]
2. [Document/Code 2]
3. [Document/Code 3]
...

Total: N files

**Important: Incremental generation method**
I will generate and save each document/code file one at a time and report progress.
This lets you see intermediate progress, and partial deliverables remain even if an error occurs.

May I start generating?
👤 User: [Awaiting response]
```

After user approval, **generate each file in order**:

**Step 1: [File 1 Name]**

```
🤖 [1/N] Generating [File 1 Name]...

📝 ./[path]/[filename]-[date].md
✅ Save complete

[1/N] Complete. Proceeding to the next file.
```

**Step 2: [File 2 Name]**

```
🤖 [2/N] Generating [File 2 Name]...

📝 ./[path]/[filename]-[date].md
✅ Save complete

[2/N] Complete. Proceeding to the next file.
```

...

**Final Step: All Files Completed**

```
🤖 ✨ All deliverables have been generated!

## 📊 Generation Summary
- **Files created**: N

## 📂 Generated Files
1. ✅ ./[path]/[file1]
2. ✅ ./[path]/[file2]
...

## 🔍 Next Steps
1. Please review the deliverables and provide feedback
2. Let me know if anything is missing or needs revision
3. I can call [related agent] to proceed to the next stage

👤 User: [Awaiting feedback]
```
```

## Key Principles

### 1. One File at a Time
- **Never** output multiple large files in a single response
- Generate → Save → Report progress → Next file
- Maximum file size: 300 lines (split if larger)

### 2. Progress Reporting
- Show file counter: [1/N], [2/N], etc.
- Show file path after creation
- Confirm save completion (✅)

### 3. Error Recovery
- If error occurs at file 5/10, files 1-4 are already saved
- User can resume from file 6
- No need to regenerate completed files

### 4. English Only
- All deliverables are written in English; no translated copies are generated

## Agent-Specific Adaptations

### Code Generators (software-developer, api-designer, etc.)
```
**Step 1: [Component Name]**

🤖 [1/N] Generating [Component Name]...

📝 src/[path]/[filename].ts
✅ Save complete (150 lines)

[1/N] Complete. Proceeding to the next file.
```

### Document Generators (technical-writer, requirements-analyst, etc.)
```
**Step 1: [Document Title]**

🤖 [1/N] Generating [Document Title]...

📝 docs/[path]/[filename]-[date].md
✅ Save complete

[1/N] Complete. Proceeding to the next document.
```

### Design Generators (system-architect, database-schema-designer, etc.)
```
**Step 1: [Design Artifact]**

🤖 [1/N] Generating [Design Artifact]...

📝 design/[category]/[filename]-[project]-[date].md
✅ Save complete

[1/N] Complete. Proceeding to the next deliverable.
```

## File Size Guidelines

| Agent Type | Max Lines per File | Action if Exceeded |
|------------|-------------------|-------------------|
| Code files | 300 lines | Split into modules |
| Documentation | 500 lines | Split into sections |
| Design diagrams | 400 lines | Split by diagram type |
| Test files | 300 lines | Split by test suite |

## Implementation Checklist

For each agent's SKILL.md:

- [ ] Phase 4 has "Incremental Deliverable Generation" section
- [ ] Lists all files to be generated upfront
- [ ] Asks user confirmation before generation
- [ ] Generates files one-by-one with progress counter
- [ ] Shows file path after each save
- [ ] Reports completion with ✅ emoji
- [ ] Shows final summary with all created files
- [ ] Provides next steps guidance

## Example Workflow

### System Architect Agent

**Phase 4 Output:**
1. Architecture Design Doc → Save → ✅
2. C4 Context Diagram → Save → ✅
3. C4 Container Diagram → Save → ✅
4. C4 Component Diagram → Save → ✅
5. Tech Stack Analysis → Save → ✅
6. ADR Document → Save → ✅

**Total**: 6 files, each saved separately

### Software Developer Agent

**Phase 4 Output:**
1. Type definitions (auth.types.ts) → Save → ✅
2. Service layer (authService.ts) → Save → ✅
3. Service tests (authService.test.ts) → Save → ✅
4. Custom hook (useAuth.ts) → Save → ✅
5. Hook tests (useAuth.test.ts) → Save → ✅
6. Component (LoginForm.tsx) → Save → ✅
7. Component tests (LoginForm.test.tsx) → Save → ✅
8. API routes (auth.routes.ts) → Save → ✅

**Total**: 8 files, each saved separately

## Benefits

✅ **No context overflow**: Each file generation is a separate operation
✅ **Progress visibility**: User sees real-time progress
✅ **Error recovery**: Partial results preserved on failure
✅ **User control**: Can stop/resume at any point
✅ **Better UX**: Clear status updates throughout process

## Anti-Patterns (Avoid)

❌ **Large monolithic output**: Generating all files in one response
❌ **No progress updates**: Silent generation with final dump
❌ **No file splitting**: Single 1000+ line file
❌ **No save confirmation**: User doesn't know what was saved
❌ **Ambiguous completion**: No clear "done" signal

---

**Last Updated**: 2025-11-22
**Applies To**: All 25 MUSUBI agents
