# プラグイン

プラグインは、スキル・エージェント・フック・MCPサーバーをひとまとめにして配布できるパッケージです。
チームや組織に機能を配布したり、マーケットプレイスで公開したりできます。

## スキルとプラグインの違い

| 項目 | スキル | プラグイン |
|---|---|---|
| 配置場所 | `.claude/skills/name/` | `plugin-dir/.claude-plugin/` |
| スコープ | 単一プロジェクトまたはグローバル | 複数プロジェクト・チーム配布可能 |
| スラッシュコマンド名 | `/name` | `/plugin-name:name`（名前空間付き） |
| 含められるもの | スキルのみ | スキル + エージェント + フック + MCPサーバー |
| 配布方法 | 不可 | ローカルパス・GitHub・マーケットプレイス |

プラグインのスラッシュコマンドは **名前空間付き** になります。例えば `my-plugin` というプラグインの `deploy` スキルは `/my-plugin:deploy` で呼び出します。

## プラグインの構造

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # 必須：プラグイン定義
├── skills/
│   └── skill-name/
│       └── SKILL.md       # スキル定義
├── agents/
│   └── agent-name.md      # エージェント定義（任意）
├── hooks/
│   └── pre-commit.sh      # フック（任意）
└── .mcp.json              # MCPサーバー設定（任意）
```

## plugin.json の構造

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "プラグインの説明",
  "author": "your-name",
  "skills": [
    {
      "name": "skill-name",
      "path": "skills/skill-name/SKILL.md"
    }
  ],
  "agents": [],
  "hooks": [],
  "mcpServers": {}
}
```

### 最小構成の plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "シンプルなプラグイン",
  "skills": [
    {
      "name": "hello",
      "path": "skills/hello/SKILL.md"
    }
  ]
}
```

## 最小構成のプラグインを作成する

### ステップ1: ディレクトリを作成

```bash
mkdir -p my-plugin/.claude-plugin
mkdir -p my-plugin/skills/hello
```

### ステップ2: plugin.json を作成

`my-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "挨拶スキルのサンプルプラグイン",
  "skills": [
    {
      "name": "hello",
      "path": "skills/hello/SKILL.md"
    }
  ]
}
```

### ステップ3: SKILL.md を作成

`my-plugin/skills/hello/SKILL.md`:

```markdown
---
name: hello
description: "挨拶メッセージを生成するスキル"
argument-hint: "[名前]"
disable-model-invocation: true
---

# 挨拶

$ARGUMENTS[0] に向けた挨拶メッセージを生成する。
引数がない場合は「世界」に挨拶する。
```

### ステップ4: ローカルでテスト

```bash
# ローカルパスで一時的にインストール
claude plugins install ./my-plugin

# スキルを実行
> /my-plugin:hello Claude
```

## プラグインのインストール方法

### ローカルパスから

```bash
claude plugins install ./path/to/plugin
```

### GitHub リポジトリから

```bash
claude plugins install github:username/plugin-repo
```

### マーケットプレイスから

```bash
claude plugins install plugin-name
```

### インストール済みプラグインの確認

```bash
claude plugins list
```

## MCPサーバーをプラグインにバンドルする

プラグインに `.mcp.json` を含めることで、MCPサーバーをセットアップ不要で提供できます。

`my-plugin/.mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server/index.js"]
    }
  }
}
```

インストール時に自動的にMCPサーバーが登録され、スキルから利用できます。

## 複数スキルを持つプラグイン例

```
git-tools/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    ├── commit/
    │   └── SKILL.md      # /git-tools:commit
    ├── review/
    │   └── SKILL.md      # /git-tools:review
    └── changelog/
        └── SKILL.md      # /git-tools:changelog
```

`git-tools/.claude-plugin/plugin.json`:

```json
{
  "name": "git-tools",
  "version": "2.0.0",
  "description": "Git操作を効率化するスキル集",
  "skills": [
    { "name": "commit", "path": "skills/commit/SKILL.md" },
    { "name": "review", "path": "skills/review/SKILL.md" },
    { "name": "changelog", "path": "skills/changelog/SKILL.md" }
  ]
}
```

## 公式マーケットプレイスへの投稿

公式マーケットプレイスに投稿するには：

1. プラグインを GitHub の公開リポジトリに配置する
2. `plugin.json` に `author`、`homepage`、`license` フィールドを追加する
3. マーケットプレイスのリポジトリにプルリクエストを送る

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "プラグインの説明（英語推奨）",
  "author": "your-github-username",
  "homepage": "https://github.com/you/my-plugin",
  "license": "MIT",
  "skills": [...]
}
```

## プラグインの更新とアンインストール

```bash
# 更新
claude plugins update my-plugin

# アンインストール
claude plugins remove my-plugin
```

## ベストプラクティス

**名前空間の衝突を避ける**

プラグイン名はユニークにしてください。スキル名はプラグイン内で一意であれば十分です（`/plugin:skill` 形式のため）。

**スキルのスコープを明確にする**

プラグインのスキルは `disable-model-invocation: true` を設定し、意図しない自動実行を防ぎます。

**MCPサーバーは必要な場合のみバンドルする**

不要なMCPサーバーはインストール時の負荷になります。スキルのみで実現できる場合はMCPを使わないようにします。
