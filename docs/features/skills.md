# スキル

スキルは、Claude Codeの動作をカスタマイズする再利用可能なMarkdownファイルです。
スラッシュコマンドの上位互換であり、より構造化されたディレクトリ形式で管理できます。

## スキルの2種類の起動モード

スキルには **ユーザー呼び出し型** と **モデル呼び出し型** の2種類があります。

| 種別 | 起動方法 | フロントマター設定 |
|---|---|---|
| **ユーザー呼び出し型** | `/skill-name` で手動実行 | `disable-model-invocation: true` |
| **モデル呼び出し型** | Claudeが会話内容を見て自動実行 | デフォルト（省略可） |

ユーザーが `/` コマンドとして使うスキルには `disable-model-invocation: true` を設定することを推奨します。
これにより、Claudeが不意に自動実行することを防ぎます。

## ファイル構造

スキルは以下のディレクトリ構造で配置します（推奨形式）：

```
.claude/skills/skill-name/
├── SKILL.md              # 必須（フロントマター + 本体）
├── references/           # 詳細資料（必要時にロード）
│   └── guide.md
├── examples/             # 実装例
│   └── sample.md
└── scripts/              # 実行スクリプト
    └── run.sh
```

旧形式（`.claude/commands/name.md`）も引き続き動作しますが、`skills/` ディレクトリ形式を推奨します。

### プロジェクト vs グローバルスキル

| 配置場所 | スコープ | 優先度 |
|---|---|---|
| `.claude/skills/` | プロジェクト内のみ | 高（グローバルより優先） |
| `~/.claude/skills/` | 全プロジェクトで使用可能 | 低 |

## フロントマターの全フィールド

`SKILL.md` の先頭にYAML形式で記述します。

```yaml
---
name: command-name
description: "スキルの説明（60文字以下推奨、Claudeが参照するため三人称で）"
argument-hint: "<必須引数> [任意引数]"
allowed-tools: Read, Grep, Bash(git:*)
model: haiku
disable-model-invocation: true
user-invocable: false
---
```

### 各フィールドの説明

| フィールド | 説明 | デフォルト |
|---|---|---|
| `name` | スラッシュコマンド名（`/name` で呼び出し） | ファイル名 |
| `description` | スキルの説明。60文字以下推奨 | なし |
| `argument-hint` | 引数のヒント（例: `<file> [--verbose]`） | なし |
| `allowed-tools` | 使用許可ツール。未指定は全ツール許可 | 全許可 |
| `model` | 使用モデル（`haiku` / `sonnet` / `opus`） | 継承 |
| `disable-model-invocation` | `true` でユーザー呼び出し専用に | `false` |
| `user-invocable` | `false` で `/` メニューに非表示（Claude専用） | `true` |

### allowed-tools のフィルタリング構文

特定のサブコマンドのみ許可する場合：

```yaml
allowed-tools: Bash(git:*), Read, Grep
```

これにより `git` コマンドのみ `Bash` で実行できます。

## $ARGUMENTS の使い方

ユーザーが引数を渡した場合、`$ARGUMENTS` で参照できます。

```markdown
# コードレビュー

$ARGUMENTS のファイルをレビューする。
```

位置引数でアクセスする場合：

```markdown
$ARGUMENTS[0]   # 最初の引数（または $0）
$ARGUMENTS[1]   # 2番目の引数（または $1）
$ARGUMENTS      # 全引数の文字列
```

使用例：

```
> /review src/auth.py strict
```

この場合 `$ARGUMENTS[0]` = `src/auth.py`、`$ARGUMENTS[1]` = `strict` になります。

## コンテキスト注入

`!コマンド` 構文でシェルコマンドの実行結果をスキル本文に埋め込めます：

```markdown
現在のgit状態:
!git status

変更ファイル一覧:
!git diff --name-only
```

スキル実行時にこれらのコマンドが実行され、結果がコンテキストとして注入されます。

## Progressive Disclosure（段階的情報開示）原則

スキルは3段階でロードされます：

```
① メタデータ（name + description）
   → 常にロード。〜100語が目安。
   → Claudeがスキルの存在を認識するために使用。

② SKILL.md 本体
   → スキル実行時にロード。理想1500〜2000語、上限5000語。
   → 主要な手順・ロジックをここに記述。

③ references/ / examples/ / scripts/
   → 必要と判断したときのみロード。サイズ制限なし。
   → 詳細仕様・実装例・スクリプトを分離。
```

この設計により、使わないスキルがコンテキストを圧迫しません。

## 記述スタイルのルール

- **命令形または不定詞形** を使う（「〜してください」ではなく「〜する」「〜せよ」）
- **二人称（あなた、you）は禁止**
- **`description` フィールドは三人称** で書く（「〜するスキル」形式）

```yaml
# 良い例
description: "コードの品質を分析してレポートを生成するスキル"

# 悪い例
description: "あなたのコードを分析します"
```

## 実装例：コードレビュースキル

`.claude/skills/review/SKILL.md`:

```markdown
---
name: review
description: "指定ファイルのコードレビューを実行するスキル"
argument-hint: "<file-path> [--security|--performance]"
allowed-tools: Read, Grep
disable-model-invocation: true
---

# コードレビュー

$ARGUMENTS[0] を対象にコードレビューを実行する。

## レビュー観点

- **セキュリティ**: 入力検証、SQLインジェクション、XSS
- **パフォーマンス**: N+1クエリ、不要な計算、メモリリーク
- **可読性**: 命名規則、関数の責務、コメント

## 出力形式

各問題について以下を報告する：

1. 問題箇所（ファイル名:行番号）
2. 問題の種類と重大度（critical / warning / info）
3. 改善案のコード例
```

## ベストプラクティス

**allowed-tools は最小権限で設定する**

```yaml
# 読み取り専用スキルにはRead/Grepのみ許可
allowed-tools: Read, Grep, Glob
```

**description は具体的かつ60文字以内に**

```yaml
# 良い
description: "TypeScriptコードの型エラーを検出して修正案を提示するスキル"

# 悪い（長すぎる）
description: "このスキルはTypeScriptで書かれたコードファイルを読み込み、型エラーを検出し、適切な修正案をユーザーに提示するためのスキルです"
```

**重い処理は references/ に分離する**

メインの `SKILL.md` は2000語以内に抑え、詳細仕様は `references/` に移動することで、
ロード時間を短縮し、コンテキストを効率的に使います。
