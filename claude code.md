# Claude Code スキル作成ガイド（追記草案）

---

## スキルとカスタムコマンドの違い

Claude Codeには、拡張指示を与える仕組みが2種類あります。

| 種類 | ファイルパス | 特徴 |
|------|-------------|------|
| カスタムコマンド（旧方式） | `.claude/commands/<name>.md` | シンプルな単一ファイル |
| スキル（推奨） | `.claude/skills/<name>/SKILL.md` | フォルダ構造・多機能 |

- 両者が同じ名前の場合、**スキルが優先**されます
- カスタムコマンドは引き続きサポートされますが、スキルへの移行が推奨です

---

## スキルの保存場所と適用範囲

スキルは3か所に置けます。

| 場所 | パス | 適用範囲 |
|------|------|---------|
| エンタープライズ | 管理設定経由 | 組織内全ユーザー |
| パーソナル | `~/.claude/skills/<name>/SKILL.md` | 自分のすべてのプロジェクト |
| プロジェクト | `.claude/skills/<name>/SKILL.md` | このプロジェクトのみ |

優先順位：**エンタープライズ > パーソナル > プロジェクト**

---

## SKILL.md の基本構成

SKILL.md はYAMLフロントマター＋マークダウン本体で構成します。

```markdown
---
name: explain-code
description: コードを図解と例え話で説明する。コードの動作を説明する時に使う。
---

コードを説明する際は必ず以下の手順で行う：
1. まず例え話でイメージを伝える
2. ASCIIアートで構造図を描く
3. コードを一行ずつ解説する
4. ありがちな落とし穴を指摘する
```

---

## SKILL.md フロントマター 完全リファレンス

| フィールド | 必須 | 説明 |
|----------|:---:|------|
| `name` | — | スラッシュコマンド名（英小文字・数字・ハイフン、64文字以内） |
| `description` | 推奨 | 何をするか・いつ使うか（**250文字以内**推奨） |
| `argument-hint` | — | 引数のヒント例：`[issue-number]` や `[filename] [format]` |
| `disable-model-invocation` | — | `true` でユーザー手動呼び出しのみに限定 |
| `user-invocable` | — | `false` でClaudeのみ呼び出し可能に（メニュー非表示） |
| `allowed-tools` | — | 許可するツールを限定：`Read, Grep, Glob` 等 |
| `model` | — | スキル実行時のモデルを指定 |
| `effort` | — | 処理レベル：`low` / `medium` / `high` / `max` |
| `context` | — | `fork` で隔離サブエージェント実行 |
| `agent` | — | サブエージェントタイプ：`Explore` / `Plan` / `general-purpose` |
| `hooks` | — | スキルライフサイクル用フック |
| `paths` | — | 対象ファイルパターン制限：`src/**/*.ts,src/**/*.tsx` |
| `shell` | — | シェル指定：`bash`（デフォルト）または `powershell` |

### descriptionフィールドのコツ

`description` はClaudeが**自動適用を判断する最重要フィールド**です。

```yaml
# 良い例：いつ使うかが明確
description: PRのレビューを実施する。ユーザーがコードレビューを依頼した時に使う。

# 悪い例：あいまいで自動適用されにくい
description: コードをレビューする
```

---

## 変数・プレースホルダー

スキル内で使える変数：

| 変数 | 説明 |
|-----|------|
| `$ARGUMENTS` | 呼び出し時の全引数文字列 |
| `$ARGUMENTS[N]` / `$N` | 個別引数（0ベース） |
| `${CLAUDE_SESSION_ID}` | 現在のセッションID |
| `${CLAUDE_SKILL_DIR}` | スキルディレクトリの絶対パス |

### 使用例

```yaml
---
name: migrate-component
description: コンポーネントをフレームワーク間で移行する
argument-hint: [component-name] [from-framework] [to-framework]
---

$0 コンポーネントを $1 から $2 へ移行してください。
```

呼び出し：`/migrate-component SearchBar React Vue`
→ `$0`=SearchBar、`$1`=React、`$2`=Vue に置換されます。

---

## 呼び出し制御：手動専用 vs Claude専用

### disable-model-invocation: true（手動専用）

デプロイやコミットなど**副作用のある操作**に推奨。Claudeが勝手に実行しません。

```yaml
---
name: deploy
description: 本番環境にデプロイする
disable-model-invocation: true
---

以下の手順でデプロイを実行してください：
1. テストを全実行
2. ビルド
3. デプロイコマンドを実行
```

### user-invocable: false（Claude専用）

ユーザーが手動で呼ぶ意味がないリファレンス系に使います。

```yaml
---
name: coding-standards
description: このプロジェクトのコーディング規約を参照する。コードを書く前に確認。
user-invocable: false
---

# コーディング規約
- 型ヒントを全関数に付与
- ...
```

| 設定 | ユーザー呼び出し | Claude自動呼び出し |
|-----|:-----------:|:-------------:|
| デフォルト | ✅ | ✅ |
| `disable-model-invocation: true` | ✅ | ❌ |
| `user-invocable: false` | ❌ | ✅ |

---

## 高度な使い方

### 動的コンテキスト注入（シェルコマンド実行）

`` !`コマンド` `` 記法でシェルの出力をプロンプトに直接埋め込めます。

```yaml
---
name: pr-summary
description: PRの変更内容を要約する
allowed-tools: Bash(gh *)
---

## プルリクエストの情報
- 変更差分: !`gh pr diff`
- コメント: !`gh pr view --comments`

上記の情報をもとにPRを要約してください。
```

### 隔離実行（サブエージェント）

`context: fork` で独立したサブエージェントとして実行します。

```yaml
---
name: deep-research
description: トピックを徹底的に調査する
context: fork
agent: Explore
---

$ARGUMENTS について、Glob・Grep・Readツールを使って徹底調査してください。
```

### ツール制限（安全なスキル設計）

```yaml
---
name: safe-reader
description: ファイルを読み取り専用で分析する
allowed-tools: Read, Grep, Glob
---

指定されたファイルを読み取り、問題点を報告してください。変更は行わないこと。
```

---

## スキルへのアクセス制御

`settings.json` または `CLAUDE.md` でClaudeのスキル使用を制限できます。

```
# 特定スキルのみ許可
Skill(commit)
Skill(review-pr *)

# 特定スキルを拒否
Skill(deploy *)

# 全スキルを拒否
Skill
```

---

## 公式バンドルスキル一覧

Claude Codeにはあらかじめ組み込まれているスキルがあります。

| スキル | 説明 |
|-------|------|
| `/batch <instruction>` | 大規模な並列変更（5〜30ユニット） |
| `/claude-api` | Claude APIリファレンスを自動ロード |
| `/debug [description]` | デバッグログを有効化 |
| `/loop [interval] <prompt>` | 定期実行（例：`/loop 5m /check-status`） |
| `/simplify [focus]` | コードの品質向上を自動提案 |

---

## ベストプラクティスまとめ

1. **descriptionを最優先で丁寧に書く** — Claudeの自動適用判断はここにかかっている
2. **SKILL.mdは500行以内に** — 詳細な参考資料は別ファイルにして `[reference.md](reference.md)` で参照
3. **副作用操作には `disable-model-invocation: true`** — 誤爆防止
4. **読み取り専用スキルには `allowed-tools` で制限** — 安全設計
5. **スキルの種類で使い分け**：
   - リファレンス型（規約・スタイルガイド）→ `user-invocable: false`
   - タスク型（デプロイ・コミット）→ `disable-model-invocation: true`
   - 調査型（コードベース分析）→ `context: fork` + `agent: Explore`

---

## 参考リンク

- [公式ドキュメント: Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [公式ドキュメント: Slash commands](https://code.claude.com/docs/en/slash-commands)
- [awesome-claude-code（50以上のスキル集）](https://github.com/hesreallyhim/awesome-claude-code)
