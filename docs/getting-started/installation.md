# インストール

## 前提条件

- Node.js 18以上
- npm または yarn

## インストール手順

Claude CodeはnpmからインストールできるCLIツールです。

```bash
npm install -g @anthropic-ai/claude-code
```

インストールが完了したら、バージョンを確認します。

```bash
claude --version
```

## APIキーの設定

Claude CodeはAnthropic APIキーを使用します。以下のいずれかの方法で設定してください。

### 環境変数（推奨）

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

`.bashrc` または `.zshrc` に追加することで永続化できます。

### .env ファイル

プロジェクトルートに `.env` ファイルを作成します。

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 動作確認

```bash
claude "Hello, Claude!"
```

正常にレスポンスが返ってくれば、インストール成功です。

## トラブルシューティング

### コマンドが見つからない

PATHが通っていない可能性があります。

```bash
export PATH="$PATH:$(npm root -g)/.bin"
```

### 認証エラー

APIキーが正しく設定されているか確認してください。

```bash
echo $ANTHROPIC_API_KEY
```
