# MCPツール

MCP（Model Context Protocol）は、Claude Codeを外部ツールやサービスと接続するためのプロトコルです。

## MCPとは

MCPを使うことで、Claude Codeに以下のような機能を追加できます:

- データベースへのアクセス
- 外部APIの呼び出し
- ファイルシステムの操作
- Webブラウジング

## MCPサーバーの設定

`~/.claude/mcp.json` でMCPサーバーを設定します。

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

## 代表的なMCPサーバー

### ファイルシステム

```bash
npx @modelcontextprotocol/server-filesystem /path/to/allowed/directory
```

ローカルファイルシステムへの安全なアクセスを提供します。

### GitHub

```bash
npx @modelcontextprotocol/server-github
```

GitHubのIssue、PR、リポジトリの操作が可能になります。

### PostgreSQL

```bash
npx @modelcontextprotocol/server-postgres postgresql://localhost/mydb
```

データベースのスキーマ確認やクエリ実行ができます。

### Brave Search

```bash
npx @modelcontextprotocol/server-brave-search
```

Web検索をClaudeから実行できます。

## MCPツールの使用

MCPサーバーが設定されていると、Claudeは自動的にそのツールを使用できます。

```
> GitHubのIssue一覧を表示してください
> データベースのusersテーブルの構造を確認してください
```

## セキュリティ考慮事項

- MCPサーバーには必要最小限の権限のみ付与する
- 本番環境のデータベースへの直接アクセスは避ける
- 機密情報を含む環境変数の管理に注意する
