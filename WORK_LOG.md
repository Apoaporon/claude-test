# 作業ログ

このセッションで実施した対応事項のまとめ。

---



## 2. japan-stock-analysis スキルの拡張（PDF出力対応）

### SKILL.md 更新
- Step 4（ファイル保存とPDF出力）を追加
- `scripts/` サブディレクトリへのスクリプト配置（Claude Code スキルベストプラクティスに準拠）
- `${CLAUDE_SKILL_DIR}/scripts/report_to_pdf.py` の呼び出しを定義

### report_to_pdf.py 作成
- 配置先：`.claude/skills/japan-stock-analysis/scripts/report_to_pdf.py`
- Markdown → PDF 変換スクリプト
- **ライブラリ選定の経緯**：
  1. `weasyprint` → Windows で GTK3 依存ライブラリ不足のため断念
  2. `xhtml2pdf` → Windowsドライブレター（`C:`）をURLスキームとして誤認識するため断念
  3. **`ReportLab Platypus`** → 直接レンダリングで安定動作（採用）
- **フォント対応**：`fontTools` で Windows TTC フォント（游ゴシック）から TTF を抽出・キャッシュ
- **絵文字対応**：`strip_emoji()` 関数で PDF 非対応文字を変換前に除去
- **テーブル列幅**：`_COL_RATIOS` で列数別に幅を固定し、テキストのはみ出しを防止
- 依存ライブラリ：`pip install markdown reportlab fonttools`

---

## 3. キリンHD（2503）株式分析レポート作成

- `japan-stock-analysis` スキルを使用してキリンHDを調査・分析
- 保存先：`reports/KirinHD_20260331.md` / `reports/KirinHD_20260331.pdf`

---

## 4. Vercel デプロイ準備

### 作成ファイル
| ファイル | 内容 |
|----------|------|
| `frontend/vercel.json` | SPA（BrowserRouter）用rewriteルール。全パスを `index.html` へ転送 |
| `.gitignore` | `node_modules`・`dist`・`reports/`・Python仮想環境・`settings.local.json`・フォントキャッシュを除外 |

### Git リポジトリ初期化
- `git init` → `git add .` → 初回コミット（57ファイル）
- 除外対象：`settings.local.json`（個人設定）、`fonts/*.ttf`（システムフォントキャッシュ）
- リモート：`https://github.com/Apoaporon/claude-test.git`

### Vercel デプロイ手順
1. `git push -u origin master` でGitHubへプッシュ
2. [vercel.com](https://vercel.com) → "Add New Project" → リポジトリを選択
3. **Root Directory を `frontend` に設定**（重要）
4. Deploy

---

## 技術スタック（フロントエンド）

| 技術 | 用途 |
|------|------|
| React 19 + TypeScript | UIフレームワーク |
| React Router v7 | SPAルーティング（BrowserRouter） |
| Vite | ビルドツール。`import.meta.glob` で `docs/**/*.md` をビルド時にバンドル |
| Tailwind CSS | スタイリング（ダークテーマ）|
| react-markdown + rehype | Markdownレンダリング・コードハイライト |
| Fuse.js | 全文検索 |
| highlight.js | コード構文ハイライト |
