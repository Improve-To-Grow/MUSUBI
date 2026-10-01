# Phase 4: Gradual Output Template

## Copy this template to Phase 4 section of each agent

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
1. [成果物1の名称]
2. [成果物2の名称]
3. [成果物3の名称]
4. [成果物4の名称]
5. [成果物5の名称]
6. [成果物6の名称]

合計: N個のファイル（X個 × 2言語）

**重要: 段階的生成方式**
各ドキュメント/コードファイルを1つずつ生成・保存し、進捗を報告します。
これにより、途中経過が見え、エラーが発生しても部分的な成果物が残ります。

生成を開始してよろしいですか？
👤 ユーザー: [回答待ち]
```

ユーザーが承認後、**各ファイルを順番に生成**:

**Step 1: [成果物1の名称] - 英語版**

```
🤖 [1/N] [成果物1の名称]英語版を生成しています...

📝 ./[適切なパス]/[ファイル名]-[日付].md
✅ 保存が完了しました

[1/N] 完了。次のファイルに進みます。
```

**Step 2: [成果物2の名称] - 英語版**

```
🤖 [2/N] [成果物2の名称]英語版を生成しています...

📝 ./[適切なパス]/[ファイル名]-[日付].md
✅ 保存が完了しました

[2/N] 完了。次のファイルに進みます。
```

**Step 3: [成果物3の名称] - 英語版**

```
🤖 [3/N] [成果物3の名称]英語版を生成しています...

📝 ./[適切なパス]/[ファイル名]-[日付].md
✅ 保存が完了しました

[3/N] 完了。次のファイルに進みます。
```

... (英語版を全て生成後、日本語版へ)

**Step X: [成果物1の名称] - 日本語版**

```
🤖 [X/N] [成果物1の名称]日本語版を生成しています...

📝 ./[適切なパス]/[ファイル名]-[日付].ja.md
✅ 保存が完了しました

[X/N] 完了。次のファイルに進みます。
```

... (日本語版を全て生成)

**Final Step: すべての成果物の生成完了**

```
🤖 ✨ すべての成果物の生成が完了しました！

## 📊 生成サマリー
- **作成ファイル数**: N個
- **英語版**: X個
- **日本語版**: Y個

## 📂 生成されたファイル
1. ✅ ./[パス]/[ファイル1]-[日付].md (英語版)
2. ✅ ./[パス]/[ファイル2]-[日付].md (英語版)
3. ✅ ./[パス]/[ファイル3]-[日付].md (英語版)
...
X. ✅ ./[パス]/[ファイル1]-[日付].ja.md (日本語版)
X+1. ✅ ./[パス]/[ファイル2]-[日付].ja.md (日本語版)
...

## 🔍 次のステップ
1. 成果物を確認して、フィードバックをお願いします
2. 不足や修正が必要な箇所があれば教えてください
3. [関連する次のエージェント名]を呼び出して次の工程に進めます

## 🔗 関連エージェント
- **前工程**: [前のエージェント名] - [何をするエージェントか]
- **次工程**: [次のエージェント名] - [何をするエージェントか]

👤 ユーザー: [フィードバック待ち]
```

**メリット:**

- ✅ エラーが発生しても部分的な成果物が残る
- ✅ 進捗が可視化され、ユーザーが待ち時間を把握できる
- ✅ コンテキスト長制限に引っかからない
- ✅ いつでも中断・再開可能
- ✅ 大量の出力でもUI/UXが破綻しない
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
- ✅ Run in a way that makes progress visible to the user

```
🤖 Thank you for confirming. I will generate the following deliverables in order.

[Planned deliverables] (both English and Japanese versions)
1. [Name of deliverable 1]
2. [Name of deliverable 2]
3. [Name of deliverable 3]
4. [Name of deliverable 4]
5. [Name of deliverable 5]
6. [Name of deliverable 6]

Total: N files (X files × 2 languages)

**Important: Gradual generation approach**
Each document/code file is generated and saved one at a time, with progress reported.
This makes intermediate progress visible, and partial deliverables remain even if an error occurs.

May I start generating?
👤 User: [awaiting response]
```

After user approval, **generate each file in order**:

**Step 1: [Name of deliverable 1] - English version**

```
🤖 [1/N] Generating the English version of [Name of deliverable 1]...

📝 ./[appropriate path]/[file name]-[date].md
✅ Saved successfully

[1/N] Complete. Moving on to the next file.
```

**Step 2: [Name of deliverable 2] - English version**

```
🤖 [2/N] Generating the English version of [Name of deliverable 2]...

📝 ./[appropriate path]/[file name]-[date].md
✅ Saved successfully

[2/N] Complete. Moving on to the next file.
```

**Step 3: [Name of deliverable 3] - English version**

```
🤖 [3/N] Generating the English version of [Name of deliverable 3]...

📝 ./[appropriate path]/[file name]-[date].md
✅ Saved successfully

[3/N] Complete. Moving on to the next file.
```

... (after generating all English versions, move on to the Japanese versions)

**Step X: [Name of deliverable 1] - Japanese version**

```
🤖 [X/N] Generating the Japanese version of [Name of deliverable 1]...

📝 ./[appropriate path]/[file name]-[date].ja.md
✅ Saved successfully

[X/N] Complete. Moving on to the next file.
```

... (generate all Japanese versions)

**Final Step: All deliverables generated**

```
🤖 ✨ All deliverables have been generated!

## 📊 Generation Summary
- **Files created**: N
- **English versions**: X
- **Japanese versions**: Y

## 📂 Generated Files
1. ✅ ./[path]/[file1]-[date].md (English version)
2. ✅ ./[path]/[file2]-[date].md (English version)
3. ✅ ./[path]/[file3]-[date].md (English version)
...
X. ✅ ./[path]/[file1]-[date].ja.md (Japanese version)
X+1. ✅ ./[path]/[file2]-[date].ja.md (Japanese version)
...

## 🔍 Next Steps
1. Please review the deliverables and share your feedback
2. Let me know if anything is missing or needs correction
3. Invoke [next related agent name] to proceed to the next stage

## 🔗 Related Agents
- **Previous stage**: [previous agent name] - [what the agent does]
- **Next stage**: [next agent name] - [what the agent does]

👤 User: [awaiting feedback]
```

**Benefits:**

- ✅ Partial deliverables remain even if an error occurs
- ✅ Progress is visible, so the user knows how long to wait
- ✅ Does not hit context length limits
- ✅ Can be interrupted and resumed at any time
- ✅ UI/UX does not break down even with large outputs
```

## Agent-Specific Customizations

### For Code Generators (software-developer, test-engineer, etc.)

Replace "[成果物X]" ([Deliverable X]) with specific code file names:
- Component files (.tsx, .jsx)
- Service files (.ts, .js)
- Test files (.test.ts)
- Type definition files (.types.ts)
- API route files
- Utility files
- Configuration files

Example output message:
```
🤖 [1/8] 型定義ファイルを生成しています...

📝 src/features/user-auth/types/auth.types.ts
✅ 保存が完了しました (120行)

[1/8] 完了。次のファイルに進みます。
```

English example:
```
🤖 [1/8] Generating type definition file...

📝 src/features/user-auth/types/auth.types.ts
✅ Saved successfully (120 lines)

[1/8] Complete. Moving on to the next file.
```

### For Document Generators (technical-writer, requirements-analyst, etc.)

Replace "[成果物X]" ([Deliverable X]) with specific document types:
- README files
- API documentation
- User guides
- Requirements specifications
- Architecture design docs
- ADR (Architecture Decision Records)

Example output message:
```
🤖 [1/6] README英語版を生成しています...

📝 docs/README.md
✅ 保存が完了しました

[1/6] 完了。次のドキュメントに進みます。
```

English example:
```
🤖 [1/6] Generating English version of README...

📝 docs/README.md
✅ Saved successfully

[1/6] Complete. Moving on to the next document.
```

### For Design Generators (system-architect, ui-ux-designer, etc.)

Replace "[成果物X]" ([Deliverable X]) with specific design artifacts:
- Architecture diagrams (C4 model)
- Database schemas (ERD)
- UI wireframes
- Design systems
- Component libraries

Example output message:
```
🤖 [1/12] C4 Contextダイアグラム英語版を生成しています...

📝 design/architecture/c4-context-diagram-myapp-20251122.md
✅ 保存が完了しました

[1/12] 完了。次のダイアグラムに進みます。
```

English example:
```
🤖 [1/12] Generating English version of C4 Context diagram...

📝 design/architecture/c4-context-diagram-myapp-20251122.md
✅ Saved successfully

[1/12] Complete. Moving on to the next diagram.
```

---

**Usage Instructions:**

1. Copy the entire template above
2. Paste into the appropriate Phase 4 section of each agent's SKILL.md
3. Replace [成果物X] ([Deliverable X]) placeholders with agent-specific output types
4. Customize file paths to match agent's output directory structure
5. Update "関連エージェント" (Related Agents) section with actual agent names
6. Test with a sample prompt to ensure proper file-by-file generation

---

**Last Updated**: 2025-11-22
**Version**: 1.0
