# プロジェクトセットアップ

Claude Codeを最大限に活用するためのプロジェクト設定方法を解説します。

## 推奨ディレクトリ構造

```
my-project/
├── .claude/
│   ├── CLAUDE.md          # プロジェクト設定・規約
│   ├── commands/          # カスタムスラッシュコマンド
│   │   ├── spec.md
│   │   ├── review.md
│   │   └── deploy.md
│   └── memory/            # 自動記憶ファイル
└── src/
    └── ...
```

## CLAUDE.md のテンプレート

```markdown
# プロジェクト設定

## 概要
[プロジェクトの目的・概要]

## 技術スタック
- 言語: Python 3.11
- フレームワーク: FastAPI
- DB: PostgreSQL 15
- テスト: pytest

## ディレクトリ構造
[主要なディレクトリとその役割]

## コーディング規約
- 型ヒントを全関数・変数に付与
- クラス名はPascalCase、関数名はsnake_case
- テストは tests/ に配置

## 禁止事項
- console.log / print デバッグ（ロガーを使用）
- ハードコードされた認証情報
- type: ignore の乱用

## よく使うコマンド
- `uvicorn main:app --reload` — 開発サーバー起動
- `pytest tests/ -v` — テスト実行
- `alembic upgrade head` — マイグレーション適用
```

## gitignore の設定

Claude Codeが生成する一時ファイルをignoreします。

```gitignore
# Claude Code
.claude/memory/
```

## VS Code との連携

`.vscode/settings.json` でClaude Codeと同じ設定を共有:

```json
{
  "editor.formatOnSave": true,
  "python.linting.enabled": true
}
```

## チームでの共有

### コミットすべきファイル

- `.claude/CLAUDE.md` — プロジェクト設定
- `.claude/commands/` — カスタムコマンド

### コミットしないファイル

- `.claude/memory/` — 個人の会話メモリ
- `.env` — APIキー等の機密情報
