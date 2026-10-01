# Phase 4: Gradual Output Template

> Bilingual output (an additional translated copy of each deliverable) is optional. For the
> template that adds translation steps, see
> [BILINGUAL-IMPLEMENTATION.md](../../BILINGUAL-IMPLEMENTATION.md) (Step 4.3).

## Copy this template to Phase 4 section of each agent

```markdown
### Phase 4: Incremental Deliverable Generation

**CRITICAL: Prevent context length overflow**

**Output Principles:**
- ✅ Generate and save one file at a time, in order
- ✅ Report progress after each file is generated
- ✅ Split large files (>300 lines) into multiple files
- ✅ Partial deliverables remain even if an error occurs
- ✅ Execute in a way that makes progress visible to the user

```
🤖 Thank you for confirming. I will generate the following deliverables in order.

[Deliverables to generate]
1. [Deliverable 1 name]
2. [Deliverable 2 name]
3. [Deliverable 3 name]
4. [Deliverable 4 name]
5. [Deliverable 5 name]
6. [Deliverable 6 name]

Total: N files

**Important: Incremental generation method**
I will generate and save each document/code file one at a time and report progress.
This lets you see intermediate progress, and partial deliverables remain even if an error occurs.

May I start generating?
👤 User: [Awaiting response]
```

After user approval, **generate each file in order**:

**Step 1: [Deliverable 1 name]**

```
🤖 [1/N] Generating [Deliverable 1 name]...

📝 ./[appropriate-path]/[file-name]-[date].md
✅ Save complete

[1/N] Complete. Proceeding to the next file.
```

**Step 2: [Deliverable 2 name]**

```
🤖 [2/N] Generating [Deliverable 2 name]...

📝 ./[appropriate-path]/[file-name]-[date].md
✅ Save complete

[2/N] Complete. Proceeding to the next file.
```

**Step 3: [Deliverable 3 name]**

```
🤖 [3/N] Generating [Deliverable 3 name]...

📝 ./[appropriate-path]/[file-name]-[date].md
✅ Save complete

[3/N] Complete. Proceeding to the next file.
```

... (Generate the remaining deliverables)

**Final Step: All Deliverables Generated**

```
🤖 ✨ All deliverables have been generated!

## 📊 Generation Summary
- **Files created**: N

## 📂 Generated Files
1. ✅ ./[path]/[file1]-[date].md
2. ✅ ./[path]/[file2]-[date].md
3. ✅ ./[path]/[file3]-[date].md
...

## 🔍 Next Steps
1. Please review the deliverables and provide feedback
2. Let me know if anything is missing or needs revision
3. Invoke [related next agent name] to proceed to the next step

## 🔗 Related Agents
- **Previous step**: [Previous agent name] - [What this agent does]
- **Next step**: [Next agent name] - [What this agent does]

👤 User: [Awaiting feedback]
```

**Benefits:**

- ✅ Partial deliverables remain even if an error occurs
- ✅ Progress is visualized, so users can gauge the wait time
- ✅ Avoids hitting context length limits
- ✅ Can be interrupted and resumed at any time
- ✅ UI/UX does not break down even with large outputs
```

## Agent-Specific Customizations

### For Code Generators (software-developer, test-engineer, etc.)

Replace "[Deliverable X]" with specific code file names:
- Component files (.tsx, .jsx)
- Service files (.ts, .js)
- Test files (.test.ts)
- Type definition files (.types.ts)
- API route files
- Utility files
- Configuration files

Example output message:
```
🤖 [1/8] Generating type definition file...

📝 src/features/user-auth/types/auth.types.ts
✅ Save complete (120 lines)

[1/8] Complete. Moving on to the next file.
```

### For Document Generators (technical-writer, requirements-analyst, etc.)

Replace "[Deliverable X]" with specific document types:
- README files
- API documentation
- User guides
- Requirements specifications
- Architecture design docs
- ADR (Architecture Decision Records)

Example output message:
```
🤖 [1/6] Generating the README...

📝 docs/README.md
✅ Save complete

[1/6] Complete. Proceeding to the next document.
```

### For Design Generators (system-architect, ui-ux-designer, etc.)

Replace "[Deliverable X]" with specific design artifacts:
- Architecture diagrams (C4 model)
- Database schemas (ERD)
- UI wireframes
- Design systems
- Component libraries

Example output message:
```
🤖 [1/12] Generating the C4 Context diagram...

📝 design/architecture/c4-context-diagram-myapp-20251122.md
✅ Save complete

[1/12] Complete. Proceeding to the next diagram.
```

---

**Usage Instructions:**

1. Copy the entire template above
2. Paste into the appropriate Phase 4 section of each agent's SKILL.md
3. Replace [Deliverable X] placeholders with agent-specific output types
4. Customize file paths to match agent's output directory structure
5. Update "Related Agents" section with actual agent names
6. Test with a sample prompt to ensure proper file-by-file generation

---

**Last Updated**: 2025-11-22
**Version**: 1.0
