> 🇬🇧 English version: [troubleshooting.en.md](./troubleshooting.en.md)

# 🔧 トラブルシューティングガイド

**MUSUBI v3.5.1** | 最終更新: 2025-12-08

> よくある問題と解決方法

---

## 📋 目次

1. [インストール関連](#1-インストール関連)
2. [初期化関連](#2-初期化関連)
3. [AIエージェント関連](#3-aiエージェント関連)
4. [CLI関連](#4-cli関連)
5. [ワークフロー関連](#5-ワークフロー関連)
6. [パフォーマンス関連](#6-パフォーマンス関連)
7. [その他](#7-その他)

---

## 1. インストール関連

### ❌ エラー: `npm ERR! code EACCES`

**症状:**
```bash
npm install -g musubi-sdd
npm ERR! code EACCES
npm ERR! permission denied
```

**解決方法:**

```bash
# 方法1: sudo使用（非推奨）
sudo npm install -g musubi-sdd

# 方法2: npm権限修正（推奨）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g musubi-sdd

# 方法3: npx使用（インストール不要）
npx musubi-sdd init
```

---

### ❌ エラー: `Node.js version not supported`

**症状:**
```bash
Error: musubi-sdd requires Node.js >= 18.0.0
Current version: 16.x.x
```

**解決方法:**

```bash
# nvm使用
nvm install 18
nvm use 18

# 確認
node --version  # v18.x.x 以上

# 再インストール
npm install -g musubi-sdd
```

---

### ❌ エラー: `Cannot find module 'musubi-sdd'`

**症状:**
```bash
Error: Cannot find module 'musubi-sdd'
```

**解決方法:**

```bash
# グローバルインストール確認
npm list -g musubi-sdd

# 見つからない場合、再インストール
npm install -g musubi-sdd

# またはnpx使用
npx musubi-sdd --version
```

---

## 2. 初期化関連

### ❌ エラー: `AGENTS.md already exists`

**症状:**
```bash
musubi init
Error: AGENTS.md already exists. Use --force to overwrite.
```

**解決方法:**

```bash
# 上書き許可
musubi init --force

# または別ディレクトリで初期化
mkdir new-project && cd new-project
musubi init
```

---

### ❌ エラー: `steering/ directory not created`

**症状:**
初期化後に `steering/` ディレクトリが見つからない

**解決方法:**

```bash
# 1. 現在のディレクトリ確認
pwd
ls -la

# 2. 権限確認
ls -la .

# 3. 手動作成
mkdir -p steering/rules steering/memories steering/templates
musubi init --force
```

---

### ❌ 問題: 既存プロジェクトで初期化したい

**解決方法:**

```bash
# onboardコマンドを使用（既存プロジェクト向け）
musubi onboard

# 自動検出される内容:
# - package.json → tech.md
# - ディレクトリ構造 → structure.md
# - README.md → product.md
```

---

## 3. AIエージェント関連

### ❌ 問題: GitHub Copilotがコマンドを認識しない

**症状:**
`#sdd-requirements` と入力しても通常のテキストとして扱われる

**解決方法:**

1. **AGENTS.md確認:**
```bash
cat AGENTS.md | head -20
```

2. **VS Code設定確認:**
`.vscode/settings.json`:
```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    { "file": "AGENTS.md" }
  ]
}
```

3. **Copilot再起動:**
- VS Codeを再起動
- または `Ctrl+Shift+P` → `GitHub Copilot: Restart`

4. **直接プロンプト:**
```
AGENTS.mdのsdd-requirementsセクションに従って、ログイン機能の要件を定義して
```

---

### ❌ 問題: Claude Codeでスキルが見つからない

**症状:**
```
/sdd-requirements → Unknown command
```

**解決方法:**

```bash
# 1. ファイル構成確認
ls -la .claude/commands/
ls -la .claude/skills/

# 2. 再初期化
musubi init --claude-code --force

# 3. Claude Code再起動
# VS Codeを再起動

# 4. パス確認（CLAUDE.md内）
cat CLAUDE.md | grep "commands"
```

---

### ❌ 問題: Cursorでコンテキストが読み込まれない

**解決方法:**

1. **.cursorrules確認:**
```bash
cat .cursorrules
```

2. **AGENTS.mdをプロジェクトルートに配置:**
```bash
ls AGENTS.md
```

3. **Cursor設定:**
- Settings → AI → Context Files → `AGENTS.md` 追加

4. **明示的にファイル参照:**
```
@AGENTS.md この手法に従って要件を書いて
```

---

## 4. CLI関連

### ❌ エラー: `musubi: command not found`

**症状:**
```bash
musubi --version
bash: musubi: command not found
```

**解決方法:**

```bash
# 1. インストール確認
npm list -g musubi-sdd

# 2. グローバルbin確認
npm bin -g

# 3. PATHに追加
export PATH="$(npm bin -g):$PATH"

# 4. または npx 使用
npx musubi-sdd --version
```

---

### ❌ エラー: `Error: ENOENT: no such file or directory`

**症状:**
```bash
musubi requirements --feature login
Error: ENOENT: no such file or directory, open 'steering/project.yml'
```

**解決方法:**

```bash
# 1. プロジェクト初期化済み確認
ls steering/

# 2. 初期化されていない場合
musubi init

# 3. ファイルが欠損している場合
musubi onboard --force
```

---

### ❌ エラー: `SyntaxError in project.yml`

**症状:**
```bash
SyntaxError: Invalid YAML in steering/project.yml
```

**解決方法:**

```bash
# 1. YAML検証
npx yaml steering/project.yml

# 2. よくある問題:
# - インデントがスペースでなくタブ
# - コロン後のスペース不足
# - 特殊文字のエスケープ不足

# 3. 修正例:
# NG: key:value
# OK: key: value

# 4. 再生成
musubi sync --force
```

---

## 5. ワークフロー関連

### ❌ 問題: 要件が生成されない

**症状:**
`musubi requirements` が空の結果を返す

**解決方法:**

```bash
# 1. feature名指定
musubi requirements --feature login

# 2. 対話モード使用
musubi requirements --interactive

# 3. 出力先確認
musubi requirements --feature login --output ./storage/specs/
ls storage/specs/
```

---

### ❌ 問題: トレーサビリティが不完全

**症状:**
`musubi trace` で一部の要件がリンクされていない

**解決方法:**

```bash
# 1. ギャップ分析
musubi gaps --detailed

# 2. 要件IDの形式確認
# 正しい形式: REQ-LOGIN-001
# 間違い: REQ_LOGIN_001, LOGIN-001

# 3. コード内にコメント追加
# // REQ-LOGIN-001: Implements login validation

# 4. テスト内にコメント追加
# // Tests: REQ-LOGIN-001

# 5. 再スキャン
musubi trace --rebuild
```

---

### ❌ 問題: 検証が失敗する

**症状:**
```bash
musubi validate
❌ Constitution violation: Article 3
```

**解決方法:**

```bash
# 1. 詳細確認
musubi validate --verbose

# 2. 憲法条項確認
cat steering/rules/constitution.md

# 3. よくある違反:
# - Article 3: 要件にIDがない
# - Article 5: テストカバレッジ不足
# - Article 7: ドキュメント不足

# 4. 修正後に再検証
musubi validate
```

---

## 6. パフォーマンス関連

### ❌ 問題: 初期化が遅い

**解決方法:**

```bash
# 1. 最小構成で初期化
musubi init --minimal

# 2. キャッシュクリア
npm cache clean --force

# 3. ネットワーク確認
ping registry.npmjs.org
```

---

### ❌ 問題: 大規模プロジェクトで分析が遅い

**解決方法:**

```bash
# 1. 特定機能のみ分析
musubi analyze --feature login

# 2. 除外パターン設定
# steering/project.yml に追加:
# exclude:
#   - node_modules/**
#   - dist/**
#   - coverage/**

# 3. インクリメンタル分析
musubi analyze --incremental
```

---

### ❌ 問題: GUIが起動しない

**症状:**
```bash
musubi gui start
Error: EADDRINUSE: address already in use
```

**解決方法:**

```bash
# 1. 既存プロセス確認
lsof -i :3000

# 2. プロセス終了
kill -9 <PID>

# 3. 別ポート使用
musubi gui start --port 8080

# 4. ブラウザで開く
open http://localhost:8080
```

---

## 7. その他

### ❌ 問題: Git連携が動作しない

**解決方法:**

```bash
# 1. Git初期化確認
git status

# 2. 初期化されていない場合
git init

# 3. GitHub CLI確認（Issue解決に必要）
gh auth status

# 4. 認証されていない場合
gh auth login
```

---

### ❌ 問題: 日本語が文字化けする

**解決方法:**

```bash
# 1. 環境変数設定
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# 2. エディタ設定
# VS Code: settings.json
# "files.encoding": "utf8"

# 3. ターミナル設定
# UTF-8対応ターミナル使用
```

---

### ❌ 問題: バージョンアップ後に動作しない

**解決方法:**

```bash
# 1. キャッシュクリア
npm cache clean --force

# 2. 再インストール
npm uninstall -g musubi-sdd
npm install -g musubi-sdd

# 3. プロジェクト同期
musubi sync --force

# 4. バージョン確認
musubi --version
```

---

## 🆘 サポート

### ログ収集

問題報告時は以下の情報を含めてください:

```bash
# 環境情報
node --version
npm --version
musubi --version

# エラーログ
musubi <command> --verbose 2>&1 | tee musubi-error.log
```

### 問い合わせ先

| 方法 | リンク |
|------|--------|
| **GitHub Issues** | https://github.com/nahisaho/MUSUBI/issues |
| **Discussions** | https://github.com/nahisaho/MUSUBI/discussions |
| **Documentation** | https://nahisaho.github.io/musubi/ |

### 🔍 デバッグモード

詳細なデバッグ情報を取得:

```bash
# デバッグモード有効化
DEBUG=musubi:* musubi <command>

# 特定モジュールのみ
DEBUG=musubi:cli musubi init
DEBUG=musubi:analyze musubi analyze
```

---

## 📚 関連ドキュメント

- [5分間クイックスタート](./quick-start-5min.md)
- [CLI完全リファレンス](./cli-reference.md)
- [プラットフォーム別セットアップ](./platform-setup.md)
- [実践チュートリアル](./tutorial-todo-app.md)

---

*ドキュメント生成: MUSUBI v3.5.1*
