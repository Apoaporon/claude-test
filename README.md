# Claude Code Best Practice — 利用ガイド

> 参考リポジトリ: `../claude-code-best-practice/`
> このプロジェクトの `.claude/CLAUDE.md` は `@../claude-code-best-practice/CLAUDE.md` で毎回自動読み込みしている（Claude Code CLI のみ有効）。

---

## 主要コンセプト

| 機能 | 配置場所 | 概要 |
|------|----------|------|
| **サブエージェント** | `.claude/agents/<name>.md` | 独立したコンテキストで動く自律エージェント。専用ツール・モデル・権限を持つ |
| **コマンド** | `.claude/commands/<name>.md` | `/コマンド名` で呼び出すプロンプトテンプレート。現在のコンテキストに知識を注入する |
| **スキル** | `.claude/skills/<name>/SKILL.md` | コンテキストに注入できる知識。プリロード・自動発見・コンテキストフォークに対応 |
| **フック** | `.claude/hooks/` | ツール実行前後などのイベントで自動実行されるスクリプト |
| **メモリ** | `CLAUDE.md`, `.claude/rules/` | `@パス` 記法で複数ファイルを結合して毎回読み込む永続コンテキスト |
| **設定** | `.claude/settings.json` | 権限・モデル・ツール許可などの階層設定 |

---

## コマンド → エージェント → スキル オーケストレーション

複雑なタスクは3層に分離するのがベストプラクティス：

```
/command（エントリーポイント）
  └── Agent（独立コンテキスト・専用ツール）
        └── Skill（知識・手順）
```

サブエージェントの呼び出しは必ず `Agent()` ツールを使う（bashコマンド経由は不可）：

```
Agent(subagent_type="agent-name", description="...", prompt="...", model="haiku")
```

---

## 設定ファイルの書き方

### サブエージェント（`.claude/agents/<name>.md`）

```yaml
---
name: my-agent
description: いつ呼び出すか（"PROACTIVELY" を付けると自動発動）
tools: Read, Write, Bash
model: haiku          # haiku / sonnet / opus / inherit
permissionMode: acceptEdits
maxTurns: 20
skills:
  - my-skill
---
エージェントへの指示
```

### スキル（`.claude/skills/<name>/SKILL.md`）

```yaml
---
name: my-skill
description: どんな場面で使うか
allowed-tools: Read, Write
model: sonnet
context: fork         # 独立コンテキストで実行する場合
user-invocable: false # /メニューに非表示にする場合
---
スキルの手順・知識
```

---

## 設定階層（優先度 高→低）

1. Managed（組織強制）
2. CLIフラグ（`claude --permission-mode auto` など）
3. `.claude/settings.local.json`（個人・git管理外）
4. `.claude/settings.json`（チーム共有）
5. `~/.claude/settings.json`（グローバル個人設定）

---

## CLAUDE.md の運用

```
@../claude-code-best-practice/CLAUDE.md   ← ベストプラクティスを先頭で展開
# プロジェクト固有の設定
```

- **1ファイル200行以下**に保つ
- 共通ルールは `.claude/rules/` に分割して `@パス` で参照
- `@パス` 展開は **Claude Code CLI のみ**有効（VS Code Copilot では展開されない）

---

## ワークフローベストプラクティス

| シーン | やること |
|--------|----------|
| 複雑なタスク開始時 | **plan モード** で計画を立て、承認してから実装 |
| コンテキスト使用量 〜50% | `/compact` を手動実行してコンテキストを圧縮 |
| 並行開発 | Git Worktrees でブランチを分離し、複数エージェントを並走 |
| 繰り返しタスク | `/loop` や `/schedule` でスケジュール実行 |
| 長時間タスク | `background: true` サブエージェントに委譲 |

---

## このプロジェクトのスキル

| スキル | トリガー | 説明 |
|--------|----------|------|
| `japan-stock-analysis` | 「〇〇株を調べて」「証券コード××」など | 日本株を調査・分析し `reports/` にMDレポートを保存 |

---

## ディレクトリ構造

```
.claude/
├── CLAUDE.md                    # メイン設定（@importでBPを読み込み）
├── agents/                      # サブエージェント定義
├── commands/                    # スラッシュコマンド定義
├── skills/
│   └── japan-stock-analysis/    # スキル（SKILL.md）
├── hooks/                       # フックスクリプト
├── rules/                       # ルール分割ファイル
└── settings.local.json          # 個人設定（git管理外）
```

## メモ
金融分析Agentのはやりのやつ
https://github.com/edinetdb/dexter-jp

https://github.com/virattt/dexter

claude codeのベストプラクティス
https://github.com/shanraisshan/claude-code-best-practice

claude codeのskillsていき
https://github.com/github/awesome-copilot/blob/main/agents/prompt-engineer.agent.md

https://qiita.com/aktsmm/items/08eef2cdeeb0a32b69a2
https://github.com/anthropics/skills

https://skills.sh/vercel-labs/skills/find-skills