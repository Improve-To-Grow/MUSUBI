# Agent Output Pattern - Gradual File Generation

## Purpose

Prevent context length overflow errors by breaking agent output into small chunks with file saves.

## Standard Pattern (All 25 Agents)

### Phase 4: Gradual Output Generation

```markdown
### Phase 4: 段階的成果物生成 (Gradual Deliverable Generation)

**CRITICAL: コンテキスト長オーバーフロー防止** (Prevent context length overflow)

**出力方式:** (Output method:)
- 1ファイルずつ順番に生成・保存 / Generate and save one file at a time, in order
- 各ファイル生成後に進捗を報告 / Report progress after each file is generated
- 大きなファイル(>300行)は複数に分割 / Split large files (>300 lines) into multiple files
- エラー発生時も部分的な成果物が残る / Partial deliverables remain even if an error occurs

```
🤖 確認ありがとうございます。以下の成果物を順番に生成します。
   (Thank you for confirming. I will generate the following deliverables in order.)

【生成予定の成果物】（英語版と日本語版の両方）
[Planned deliverables] (both English and Japanese versions)
1. [Document/Code 1]
2. [Document/Code 2]
3. [Document/Code 3]
...

合計: Nファイル
Total: N files

**重要: 段階的生成方式** (Important: gradual generation method)
各ドキュメント/コードファイルを1つずつ生成・保存し、進捗を報告します。
(I will generate and save each document/code file one at a time and report progress.)
これにより、途中経過が見え、エラーが発生しても部分的な成果物が残ります。
(This makes intermediate progress visible, and partial deliverables remain even if an error occurs.)

生成を開始してよろしいですか？
(May I start generating?)
👤 ユーザー: [回答待ち]
   (User: [awaiting response])
```

ユーザーが承認後、**各ファイルを順番に生成**:
After the user approves, **generate each file in order**:

**Step 1: [File 1 Name] - 英語版** (English version)

```
🤖 [1/N] [File 1 Name]英語版を生成しています...
   (Generating the English version of [File 1 Name]...)

📝 ./[path]/[filename]-[date].md
✅ 保存が完了しました
   (Saved successfully)

[1/N] 完了。次のファイルに進みます。
(Done. Moving on to the next file.)
```

**Step 2: [File 2 Name] - 英語版** (English version)

```
🤖 [2/N] [File 2 Name]英語版を生成しています...
   (Generating the English version of [File 2 Name]...)

📝 ./[path]/[filename]-[date].md
✅ 保存が完了しました
   (Saved successfully)

[2/N] 完了。次のファイルに進みます。
(Done. Moving on to the next file.)
```

...

**Final Step: All Files Completed**

```
🤖 ✨ すべての成果物の生成が完了しました！
   (All deliverables have been generated!)

## 📊 生成サマリー (Generation Summary)
- **作成ファイル数**: N個 / Files created: N
- **英語版**: X個 / English versions: X
- **日本語版**: Y個 / Japanese versions: Y

## 📂 生成されたファイル (Generated Files)
1. ✅ ./[path]/[file1]
2. ✅ ./[path]/[file2]
...

## 🔍 次のステップ (Next Steps)
1. 成果物を確認して、フィードバックをお願いします / Please review the deliverables and share your feedback
2. 不足や修正が必要な箇所があれば教えてください / Let me know if anything is missing or needs changes
3. [関連エージェント]を呼び出して次の工程に進めます / You can call [related agent] to proceed to the next stage

👤 ユーザー: [フィードバック待ち]
   (User: [awaiting feedback])
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

### 4. Bilingual Output (English + Japanese)
- Generate all English files first
- Then generate all Japanese files
- Each file saved separately

## Agent-Specific Adaptations

### Code Generators (software-developer, api-designer, etc.)
```
**Step 1: [Component Name]**

🤖 [1/N] [Component Name]を生成しています...
   (Generating [Component Name]...)

📝 src/[path]/[filename].ts
✅ 保存が完了しました (150行)
   (Saved successfully (150 lines))

[1/N] 完了。次のファイルに進みます。
(Done. Moving on to the next file.)
```

### Document Generators (technical-writer, requirements-analyst, etc.)
```
**Step 1: [Document Title] - English Version**

🤖 [1/N] [Document Title]英語版を生成しています...
   (Generating the English version of [Document Title]...)

📝 docs/[path]/[filename]-[date].md
✅ 保存が完了しました
   (Saved successfully)

[1/N] 完了。次のドキュメントに進みます。
(Done. Moving on to the next document.)
```

### Design Generators (system-architect, database-schema-designer, etc.)
```
**Step 1: [Design Artifact] - English Version**

🤖 [1/N] [Design Artifact]英語版を生成しています...
   (Generating the English version of [Design Artifact]...)

📝 design/[category]/[filename]-[project]-[date].md
✅ 保存が完了しました
   (Saved successfully)

[1/N] 完了。次の成果物に進みます。
(Done. Moving on to the next deliverable.)
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

- [ ] Phase 4 has "段階的成果物生成" (Gradual Deliverable Generation) section
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
1. Architecture Design Doc (EN) → Save → ✅
2. C4 Context Diagram (EN) → Save → ✅
3. C4 Container Diagram (EN) → Save → ✅
4. C4 Component Diagram (EN) → Save → ✅
5. Tech Stack Analysis (EN) → Save → ✅
6. ADR Document (EN) → Save → ✅
7. Architecture Design Doc (JA) → Save → ✅
8. C4 Context Diagram (JA) → Save → ✅
... (continues for all files)

**Total**: 12 files, each saved separately

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
