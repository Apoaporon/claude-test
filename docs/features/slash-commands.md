# スラッシュコマンド

スラッシュコマンドは、よく使う操作をショートカットとして呼び出す機能です。
`/` で始まるコマンドをチャット入力欄に入力することで実行できます。

## 組み込みコマンド

| コマンド | 説明 |
|---|---|
| `/help` | ヘルプを表示 |
| `/clear` | 会話履歴をクリア |
| `/compact` | 会話を圧縮して続ける |
| `/memory` | メモリ一覧を表示 |
| `/cost` | 現在のセッションのコスト表示 |
| `/doctor` | 設定の健全性チェック |
| `/review` | コードレビューを実行 |
| `/commit` | コミットメッセージを生成して commit |

## カスタムスラッシュコマンド

`.claude/commands/` ディレクトリにMarkdownファイルを置くことで、カスタムコマンドを作成できます。
より高度なカスタマイズには、[スキル](./skills) の使用を推奨します。

### 例: /spec コマンド

`.claude/commands/spec.md`:

```markdown
# 仕様書作成

現在のコードを分析して、機能仕様書を作成する。

以下を含める:
- 概要
- 機能一覧
- API仕様
- データモデル
```

使い方:

```
> /spec
```

### コマンドに引数を渡す

`$ARGUMENTS` プレースホルダーを使用します。

```markdown
# コードレビュー

$ARGUMENTS のコードをレビューする。
セキュリティ、パフォーマンス、可読性の観点で評価する。
```

```
> /review src/api/auth.py
```

## フロントマター（オプション）

Markdownファイルの先頭にYAMLフロントマターを追加することで、コマンドの動作を詳細に設定できます。

```yaml
---
name: command-name
description: "コマンドの説明（60文字以下推奨）"
argument-hint: "<必須引数> [任意引数]"
allowed-tools: Read, Grep, Bash(git:*)
model: haiku
disable-model-invocation: true
---
```

### フィールド一覧

| フィールド | 説明 | デフォルト |
|---|---|---|
| `name` | スラッシュコマンド名 | ファイル名 |
| `description` | Claudeが参照する説明文。三人称で記述 | なし |
| `argument-hint` | 入力補完に表示する引数ヒント | なし |
| `allowed-tools` | 使用を許可するツール | 全許可 |
| `model` | 使用モデル（`haiku` / `sonnet` / `opus`） | 継承 |
| `disable-model-invocation` | `true` にするとユーザー呼び出し専用になる | `false` |

### allowed-tools のフィルタリング構文

`Bash(サブコマンド:*)` のように書くことで、特定コマンドのみ許可できます：

```yaml
# git コマンドのみ許可
allowed-tools: Bash(git:*), Read, Grep

# npm の run サブコマンドのみ許可
allowed-tools: Bash(npm run:*)
```

## コンテキスト注入

`!コマンド` 構文でシェルの実行結果をコマンド本文に注入できます：

```markdown
---
name: status
description: "現在のプロジェクト状態をサマリーするコマンド"
---

現在のgit状態:
!git status

最近のコミット:
!git log --oneline -5

上記の情報をもとにプロジェクトの状態をサマリーする。
```

## プロジェクトコマンド vs グローバルコマンド

| 配置場所 | スコープ | 優先度 |
|---|---|---|
| `.claude/commands/` | プロジェクト内のみ | 高（グローバルより優先） |
| `~/.claude/commands/` | 全プロジェクトで使用可能 | 低 |

## スラッシュコマンド vs スキル

| 項目 | スラッシュコマンド | スキル |
|---|---|---|
| ファイル形式 | `commands/name.md`（単一ファイル） | `skills/name/SKILL.md`（ディレクトリ） |
| サポートファイル | なし | `references/`, `examples/`, `scripts/` |
| 推奨用途 | シンプルなプロンプト | 複雑なロジック・段階的ロード |

複雑な処理や再利用性が必要な場合は [スキル](./skills) を使用してください。
