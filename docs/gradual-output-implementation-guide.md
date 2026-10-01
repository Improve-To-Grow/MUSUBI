# Implementation Guide: Gradual Output Pattern for All Agents

## Status

**Date**: 2025-11-22  
**Issue**: Agent outputs exceed context length, causing errors  
**Solution**: Break output into small chunks with file-by-file saves

## Implementation Progress

### ✅ Completed (9/25 agents)

Agents with **full gradual output implementation**:

1. ✅ **system-architect** - Phase 4 "段階的成果物生成" (Gradual Deliverable Generation)
2. ✅ **cloud-architect** - Phase 4 "段階的成果物生成" (Gradual Deliverable Generation)
3. ✅ **technical-writer** - Phase 3 "段階的成果物生成" (Gradual Deliverable Generation)
4. ✅ **api-designer** - Phase 4 "段階的成果物生成" (Gradual Deliverable Generation)
5. ✅ **requirements-analyst** - Phase 6 "段階的成果物生成" (Gradual Deliverable Generation)
6. ✅ **project-manager** - Phase 6 "段階的成果物生成" (Gradual Deliverable Generation)
7. ✅ **database-schema-designer** - Phase 5 "段階的成果物生成" (Gradual Deliverable Generation)
8. ✅ **ui-ux-designer** - Phase 5 "段階的成果物生成と開発引き継ぎ" (Gradual Deliverable Generation and Development Handoff)
9. ✅ **test-engineer** - Phase 4 "段階的テスト実装" (Gradual Test Implementation) (2025-11-22 updated)

### 🔧 Needs Enhancement (11/25 agents)

Agents with partial implementation (needs strengthening):

10. 🔧 **software-developer** - Has "1ファイルずつ" (one file at a time) but missing progress counter
11. 🔧 **bug-hunter** - Has Phase 4 but no step-by-step reporting
12. 🔧 **performance-optimizer** - Has Phase 4 but no file-by-file saves
13. 🔧 **security-auditor** - Has Phase 4 but no gradual output
14. 🔧 **code-reviewer** - Has Phase 4 but no structured progress
15. 🔧 **devops-engineer** - Has Phase 4 but no file counters
16. 🔧 **database-administrator** - Has Phase 4 but incomplete pattern
17. 🔧 **quality-assurance** - Has Phase 4+4.5 but needs enhancement
18. 🔧 **ai-ml-engineer** - Has Phase 4.1-4.3+ but missing pattern
19. 🔧 **change-impact-analyzer** - Has Phases 1-7 but no gradual output
20. 🔧 **constitution-enforcer** - Has 9-gate validation but no chunking

### ❌ Not Implemented (5/25 agents)

Agents without Phase 4 or gradual output:

21. ❌ **orchestrator** - Execution plan/logs only, no file generation
22. ❌ **release-coordinator** - Checklist/approval flow only
23. ❌ **site-reliability-engineer** - Config generation only
24. ❌ **steering** - Bootstrap/Sync/Review only (analysis tasks)
25. ❌ **traceability-auditor** - Matrix/report generation only

---

## Implementation Pattern

### Standard Template Structure

```markdown
### Phase 4: 段階的成果物生成

**CRITICAL: コンテキスト長オーバーフロー防止**

**出力方式の原則:**
- ✅ 1ファイルずつ順番に生成・保存
- ✅ 各ファイル生成後に進捗を報告
- ✅ 大きなファイル(>300行)は複数に分割
- ✅ エラー発生時も部分的な成果物が残る
- ✅ ユーザーに進捗が見える形で実行

```
🤖 確認ありがとうございます。以下の成果物を順番に生成します。

【生成予定の成果物】（英語版と日本語版の両方）
1. [成果物1]
2. [成果物2]
3. [成果物3]
...

合計: N個のファイル

**重要: 段階的生成方式**
各ドキュメント/コードファイルを1つずつ生成・保存し、進捗を報告します。
これにより、途中経過が見え、エラーが発生しても部分的な成果物が残ります。

生成を開始してよろしいですか?
👤 ユーザー: [回答待ち]
```

**Step 1: [成果物1] - 英語版**

```
🤖 [1/N] [成果物1]英語版を生成しています...

📝 ./[path]/[filename]-[date].md
✅ 保存が完了しました

[1/N] 完了。次のファイルに進みます。
```

**Step 2: [成果物2] - 英語版**

```
🤖 [2/N] [成果物2]英語版を生成しています...

📝 ./[path]/[filename]-[date].md
✅ 保存が完了しました

[2/N] 完了。次のファイルに進みます。
```

... (continue for all files)

**Final Step: すべての成果物の生成完了**

```
🤖 ✨ すべての成果物の生成が完了しました！

## 📊 生成サマリー
- **作成ファイル数**: N個
- **英語版**: X個
- **日本語版**: Y個

## 📂 生成されたファイル
1. ✅ ./[path]/[file1].md
2. ✅ ./[path]/[file2].md
...

## 🔍 次のステップ
1. 成果物を確認して、フィードバックをお願いします
2. 不足や修正が必要な箇所があれば教えてください
3. [関連エージェント]を呼び出して次の工程に進めます

👤 ユーザー: [フィードバック待ち]
```
```

**English version of the template above:**

```markdown
### Phase 4: Gradual Deliverable Generation

**CRITICAL: Prevent context length overflow**

**Output principles:**
- ✅ Generate and save one file at a time, in order
- ✅ Report progress after each file is generated
- ✅ Split large files (>300 lines) into multiple parts
- ✅ Partial deliverables remain even if an error occurs
- ✅ Execute in a way that makes progress visible to the user

```
🤖 Thank you for confirming. I will generate the following deliverables in order.

【Planned deliverables】(both English and Japanese versions)
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable 3]
...

Total: N files

**Important: Gradual generation approach**
Each document/code file is generated and saved one at a time, with progress reported.
This makes intermediate progress visible, and partial deliverables remain even if an error occurs.

May I start generating?
👤 User: [Awaiting response]
```

**Step 1: [Deliverable 1] - English version**

```
🤖 [1/N] Generating the English version of [Deliverable 1]...

📝 ./[path]/[filename]-[date].md
✅ Saved successfully

[1/N] Done. Moving on to the next file.
```

**Step 2: [Deliverable 2] - English version**

```
🤖 [2/N] Generating the English version of [Deliverable 2]...

📝 ./[path]/[filename]-[date].md
✅ Saved successfully

[2/N] Done. Moving on to the next file.
```

... (continue for all files)

**Final Step: All deliverables generated**

```
🤖 ✨ All deliverables have been generated!

## 📊 Generation Summary
- **Files created**: N
- **English versions**: X
- **Japanese versions**: Y

## 📂 Generated Files
1. ✅ ./[path]/[file1].md
2. ✅ ./[path]/[file2].md
...

## 🔍 Next Steps
1. Please review the deliverables and share your feedback
2. Let me know if anything is missing or needs correction
3. Call [related agent] to proceed to the next stage

👤 User: [Awaiting feedback]
```
```

---

## Agent-Specific Implementation Instructions

### Code Generators Group

**Agents**: software-developer, test-engineer, bug-hunter, performance-optimizer

**Files to generate**:
- Source code files (.ts, .js, .py)
- Test files (.test.ts, .spec.js)
- Configuration files
- Type definitions

**Progress message template**:
```
🤖 [1/N] [Component/Module name]を生成しています...

📝 src/[path]/[filename].ts
✅ 保存が完了しました (150行)

[1/N] 完了。次のファイルに進みます。
```

English:
```
🤖 [1/N] Generating [Component/Module name]...

📝 src/[path]/[filename].ts
✅ Saved successfully (150 lines)

[1/N] Done. Moving on to the next file.
```

### Document Generators Group

**Agents**: technical-writer, requirements-analyst, project-manager

**Files to generate**:
- Requirements specs
- Design documents
- User guides
- API documentation

**Progress message template**:
```
🤖 [1/N] [Document title]英語版を生成しています...

📝 docs/[path]/[filename]-[date].md
✅ 保存が完了しました

[1/N] 完了。次のドキュメントに進みます。
```

English:
```
🤖 [1/N] Generating the English version of [Document title]...

📝 docs/[path]/[filename]-[date].md
✅ Saved successfully

[1/N] Done. Moving on to the next document.
```

### Design/Architecture Generators Group

**Agents**: system-architect, cloud-architect, ui-ux-designer, database-schema-designer, api-designer

**Files to generate**:
- Architecture diagrams (C4 model)
- Database schemas (ERD)
- UI wireframes
- ADR documents

**Progress message template**:
```
🤖 [1/N] [Design artifact]英語版を生成しています...

📝 design/[category]/[filename]-[project]-[date].md
✅ 保存が完了しました

[1/N] 完了。次の成果物に進みます。
```

English:
```
🤖 [1/N] Generating the English version of [Design artifact]...

📝 design/[category]/[filename]-[project]-[date].md
✅ Saved successfully

[1/N] Done. Moving on to the next deliverable.
```

### Infrastructure/DevOps Generators Group

**Agents**: devops-engineer, database-administrator, security-auditor, site-reliability-engineer

**Files to generate**:
- CI/CD configs (.github/workflows/)
- Docker files (Dockerfile, docker-compose.yml)
- Kubernetes manifests (k8s/)
- Monitoring configs (Prometheus, Grafana)
- Database scripts (.sql)

**Progress message template**:
```
🤖 [1/N] [Config/Script name]を生成しています...

📝 [path]/[filename]
✅ 保存が完了しました (200行)

[1/N] 完了。次の設定ファイルに進みます。
```

English:
```
🤖 [1/N] Generating [Config/Script name]...

📝 [path]/[filename]
✅ Saved successfully (200 lines)

[1/N] Done. Moving on to the next config file.
```

### Review/Audit Generators Group

**Agents**: code-reviewer, quality-assurance, security-auditor, traceability-auditor, constitution-enforcer

**Files to generate**:
- Review reports
- Test reports
- Security audit reports
- Traceability matrices
- Compliance reports

**Progress message template**:
```
🤖 [1/N] [Report type]を生成しています...

📝 reports/[category]/[filename]-[date].md
✅ 保存が完了しました

[1/N] 完了。次のレポートに進みます。
```

English:
```
🤖 [1/N] Generating [Report type]...

📝 reports/[category]/[filename]-[date].md
✅ Saved successfully

[1/N] Done. Moving on to the next report.
```

---

## Implementation Steps (For Each Agent)

### Step 1: Locate Phase 4/5 Section

Open `src/templates/agents/claude-code/skills/[agent-name]/SKILL.md`

Find the section:
- `### Phase 4:` or `### Phase 5:`
- Or the section where main output generation happens

### Step 2: Add CRITICAL Warning

Add at the beginning of Phase 4:

```markdown
**CRITICAL: コンテキスト長オーバーフロー防止**

**出力方式の原則:**
- ✅ 1ファイルずつ順番に生成・保存
- ✅ 各ファイル生成後に進捗を報告
- ✅ 大きなファイル(>300行)は複数に分割
- ✅ エラー発生時も部分的な成果物が残る
- ✅ ユーザーに進捗が見える形で実行
```

English:

```markdown
**CRITICAL: Prevent context length overflow**

**Output principles:**
- ✅ Generate and save one file at a time, in order
- ✅ Report progress after each file is generated
- ✅ Split large files (>300 lines) into multiple parts
- ✅ Partial deliverables remain even if an error occurs
- ✅ Execute in a way that makes progress visible to the user
```

### Step 3: Add File List and Confirmation

Before generation starts:

```markdown
```
🤖 確認ありがとうございます。以下の成果物を順番に生成します。

【生成予定の成果物】
1. [具体的なファイル名1]
2. [具体的なファイル名2]
3. [具体的なファイル名3]
...

合計: N個のファイル

**重要: 段階的生成方式**
各ファイルを1つずつ生成・保存し、進捗を報告します。
これにより、途中経過が見え、エラーが発生しても部分的な成果物が残ります。

生成を開始してよろしいですか?
👤 ユーザー: [回答待ち]
```
```

English:

```markdown
```
🤖 Thank you for confirming. I will generate the following deliverables in order.

【Planned deliverables】
1. [Specific file name 1]
2. [Specific file name 2]
3. [Specific file name 3]
...

Total: N files

**Important: Gradual generation approach**
Each file is generated and saved one at a time, with progress reported.
This makes intermediate progress visible, and partial deliverables remain even if an error occurs.

May I start generating?
👤 User: [Awaiting response]
```
```

### Step 4: Add Step-by-Step Generation

For each file:

```markdown
**Step 1: [File/Component Name]**

```
🤖 [1/N] [具体的な内容]を生成しています...

📝 [具体的なファイルパス]
✅ 保存が完了しました (行数)

[1/N] 完了。次のファイルに進みます。
```
```

English:

```markdown
**Step 1: [File/Component Name]**

```
🤖 [1/N] Generating [specific content]...

📝 [specific file path]
✅ Saved successfully (line count)

[1/N] Done. Moving on to the next file.
```
```

### Step 5: Add Completion Summary

After all files generated:

```markdown
```
🤖 ✨ すべての成果物の生成が完了しました！

## 📊 生成サマリー
- **作成ファイル数**: N個
- **[カテゴリ別の内訳]**

## 📂 生成されたファイル
1. ✅ [ファイルパス1]
2. ✅ [ファイルパス2]
...

## 🔍 次のステップ
1. 成果物を確認して、フィードバックをお願いします
2. 不足や修正が必要な箇所があれば教えてください
3. [関連エージェント]を呼び出して次の工程に進めます

👤 ユーザー: [フィードバック待ち]
```
```

English:

```markdown
```
🤖 ✨ All deliverables have been generated!

## 📊 Generation Summary
- **Files created**: N
- **[Breakdown by category]**

## 📂 Generated Files
1. ✅ [file path 1]
2. ✅ [file path 2]
...

## 🔍 Next Steps
1. Please review the deliverables and share your feedback
2. Let me know if anything is missing or needs correction
3. Call [related agent] to proceed to the next stage

👤 User: [Awaiting feedback]
```
```

---

## Quick Reference

### ✅ Good Example (with gradual output)

```
🤖 [1/8] 型定義ファイルを生成しています...
📝 src/types/auth.types.ts
✅ 保存が完了しました (120行)
[1/8] 完了。次のファイルに進みます。

🤖 [2/8] サービス層を生成しています...
📝 src/services/authService.ts
✅ 保存が完了しました (200行)
[2/8] 完了。次のファイルに進みます。
...
```

English:
```
🤖 [1/8] Generating the type definition file...
📝 src/types/auth.types.ts
✅ Saved successfully (120 lines)
[1/8] Done. Moving on to the next file.

🤖 [2/8] Generating the service layer...
📝 src/services/authService.ts
✅ Saved successfully (200 lines)
[2/8] Done. Moving on to the next file.
...
```

### ❌ Bad Example (no gradual output)

```
🤖 実装を開始します!

[Huge code dump with 8 files at once, 1500+ lines total]

✅ 実装完了!
```

English:
```
🤖 Starting implementation!

[Huge code dump with 8 files at once, 1500+ lines total]

✅ Implementation complete!
```

**Problem**: If error occurs halfway, all work is lost. Context overflow likely.

---

## Testing

After implementing the pattern, test with:

1. **Small request**: Ask agent to generate 2-3 files
   - Verify: Each file generated separately
   - Verify: Progress counter shows [1/N], [2/N], etc.
   - Verify: ✅ confirmation after each file

2. **Large request**: Ask agent to generate 10+ files
   - Verify: No context overflow error
   - Verify: Can see incremental progress
   - Verify: If interrupted, partial files are saved

3. **Error recovery**: Simulate error at file 5/10
   - Verify: Files 1-4 are saved
   - Verify: Can resume from file 5

---

## Benefits

✅ **Prevents context overflow**: Each file is a separate operation  
✅ **Progress visibility**: User sees real-time [X/N] counter  
✅ **Error recovery**: Partial results preserved on failure  
✅ **User control**: Can stop/resume at any point  
✅ **Better UX**: Clear status updates throughout process  

---

## Reference Files

- **Pattern documentation**: `docs/agent-output-pattern.md`
- **Template snippet**: `docs/snippets/phase4-gradual-output-template.md`
- **Example implementation**: `src/templates/agents/claude-code/skills/test-engineer/SKILL.md` (Phase 4)
- **This guide**: `docs/gradual-output-implementation-guide.md`

---

## Next Steps

1. ✅ Review agents in "Needs Enhancement" category
2. ✅ Apply gradual output pattern to each agent
3. ✅ Test with sample prompts
4. ✅ Commit changes
5. ⏳ Implement for remaining 16 agents (manual work required)

---

**Last Updated**: 2025-11-22  
**Status**: Phase 1 Complete (1/25 agents updated, documentation created)  
**Next Phase**: Apply to remaining 24 agents
