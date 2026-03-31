@../claude-code-best-practice/CLAUDE.md

# プロジェクト設定

## アプリ概要
株主優待確認アプリ。日本株の株主優待情報を検索・閲覧できるダッシュボード。

## 技術スタック

### バックエンド
- Python 3.11+ / FastAPI 0.115.0 + uvicorn
- Pydantic v2（BaseModel）
- データソース: shareholder_benefits.json（静的JSON）

### フロントエンド
- React 18 + TypeScript 5.6 / Vite 5
- TanStack Query v5（サーバー状態管理）
- TailwindCSS v3（スタイリング）/ Recharts（チャート）

## プロジェクト構造

```
claude-test/
├── .claude/
│   ├── CLAUDE.md              # このファイル
│   └── commands/              # スラッシュコマンド
│       ├── spec.md            # /spec
│       ├── review.md          # /review
│       ├── implement.md       # /implement
│       ├── test.md            # /test
│       └── analyze.md         # /analyze（株式分析）
├── backend/
│   ├── main.py                # FastAPIアプリ本体、CORS設定
│   ├── models.py              # Pydanticモデル定義
│   ├── shareholder_benefits.json  # データソース
│   ├── routers/benefits.py    # APIルーター（prefix: /api/benefits）
│   └── services/benefit_service.py # ビジネスロジック層
└── frontend/
    └── src/
        ├── App.tsx            # QueryClientProvider, 状態管理
        ├── api/stockApi.ts    # fetch関数群（BASE_URL: localhost:8000）
        ├── types/stock.ts     # TypeScript型定義
        ├── components/        # Header, FilterBar, BenefitList, BenefitCard
        └── hooks/useDebounce.ts
```

## 起動コマンド

```bash
# バックエンド
cd backend && venv\Scripts\activate && uvicorn main:app --reload
# → http://localhost:8000 / Swagger: http://localhost:8000/docs

# フロントエンド
cd frontend && npm run dev
# → http://localhost:5173
```

## コーディング規約

### バックエンド
- 型ヒントを全関数・変数に付与（Optional[str], list[Model] 等）
- モデルは models.py に集約（Pydantic v2 BaseModel を継承）
- ルーターは routers/ に配置し APIRouter(prefix=..., tags=[...]) を使用
- ビジネスロジックは services/ に分離し、main.py ではルーターマウントのみ
- CORS allow_origins は ["http://localhost:5173"] に限定

### フロントエンド
- Props は `interface Props {}` で明示
- 型定義は src/types/ に集約（interface を優先）
- API通信は src/api/ に集約（async function fetch～ の形式）
- queryKey は [リソース名, フィルターオブジェクト] の形式
- テキスト入力には useDebounce(400ms) を適用
- カラーテーマ: bg-slate-900（背景）/ bg-zinc-800（カード）/ text-white
- TailwindCSSのみ使用、インラインスタイル禁止

## API仕様

| Method | Path | 説明 |
|--------|------|------|
| GET | /api/benefits | 優待一覧取得（q, benefit_type, record_month, min_shares_max） |
| GET | /api/benefits/categories | カテゴリ一覧取得 |
