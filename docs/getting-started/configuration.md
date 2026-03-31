# 設定

## CLAUDE.md

プロジェクトルートに `CLAUDE.md` を置くことで、Claude Codeの動作をカスタマイズできます。

```markdown
# プロジェクト設定

## 技術スタック
- Python 3.11 + FastAPI
- PostgreSQL

## コーディング規約
- 型ヒントを必ず使用する
- docstringはGoogle形式で書く

## 禁止事項
- print文でのデバッグは禁止（loggerを使用）
```

### CLAUDE.md の配置場所

| ファイルパス | スコープ |
|---|---|
| `~/.claude/CLAUDE.md` | グローバル（全プロジェクト共通） |
| `./CLAUDE.md` | プロジェクトルート |
| `./src/CLAUDE.md` | サブディレクトリ以下 |

## パーミッション設定

Claude Codeが実行できる操作を制限できます。

### 自動承認の設定

`.claude/settings.json` で設定します。

```json
{
  "allowedTools": ["Read", "Glob", "Grep"],
  "autoApprove": false
}
```

## 環境変数

| 変数名 | 説明 |
|---|---|
| `ANTHROPIC_API_KEY` | APIキー（必須） |
| `ANTHROPIC_MODEL` | 使用するモデル（デフォルト: claude-sonnet-4-6） |
| `CLAUDE_CODE_MAX_TOKENS` | 最大トークン数 |

## モデルの選択

```bash
ANTHROPIC_MODEL=claude-opus-4-6 claude
```

## ログレベル

デバッグ情報を表示するには:

```bash
claude --debug
```
