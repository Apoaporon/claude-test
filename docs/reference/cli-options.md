# CLIオプション

`claude` コマンドで使用できるオプション一覧です。

## 基本構文

```bash
claude [オプション] [プロンプト]
```

## オプション一覧

### 動作モード

| オプション | 説明 |
|---|---|
| `--plan` | プランモードで起動 |
| `--print` / `-p` | 非インタラクティブモード（結果をstdoutに出力） |
| `--continue` / `-c` | 前の会話を継続 |
| `--resume <id>` | 指定した会話IDを再開 |

### 出力形式

| オプション | 説明 |
|---|---|
| `--output-format text` | テキスト形式で出力（デフォルト） |
| `--output-format json` | JSON形式で出力 |
| `--output-format stream-json` | ストリーミングJSON形式 |

### モデル設定

| オプション | 説明 |
|---|---|
| `--model <model-id>` | 使用するモデルを指定 |

### ツール制御

| オプション | 説明 |
|---|---|
| `--allowedTools <tools>` | 許可するツールを指定（カンマ区切り） |
| `--disallowedTools <tools>` | 禁止するツールを指定 |
| `--dangerously-skip-permissions` | ⚠️ 全ての権限確認をスキップ |

### その他

| オプション | 説明 |
|---|---|
| `--debug` | デバッグログを出力 |
| `--verbose` | 詳細なログを出力 |
| `--version` / `-v` | バージョンを表示 |
| `--help` / `-h` | ヘルプを表示 |

## 使用例

### 非インタラクティブモード

```bash
# スクリプトから呼び出す
claude -p "package.json の依存関係を最新版に更新して" --output-format json

# パイプと組み合わせる
cat error.log | claude -p "このエラーログの原因と解決策を教えてください"
```

### 特定ツールのみ許可

```bash
# 読み取りのみ（ファイルの変更不可）
claude --allowedTools "Read,Glob,Grep" "src/ のアーキテクチャを説明してください"
```

### モデルを指定して起動

```bash
claude --model claude-opus-4-6 "複雑なアルゴリズムを実装してください"
```

## 環境変数

CLIオプションの代わりに環境変数でも設定できます。

```bash
export ANTHROPIC_MODEL=claude-opus-4-6
export CLAUDE_CODE_MAX_TOKENS=8192
```
