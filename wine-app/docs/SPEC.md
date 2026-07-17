# Wine Stocker 現状仕様書

最終更新: 2026-07-17
作成目的: 改善タスク「0. 現状把握・仕様書作成」の成果物。以降の改善タスク(1〜5)の前提となる現状を確定する。

---

## 1. 全体構成

```text
フロント(Vercel, React SPA)
  → apiClient(fetch) → FastAPI(Cloud Run, /api配下)
       → SQLAlchemy(直接Postgres接続文字列) → Supabase Postgres
       → httpx(service role key) → Supabase Storage(画像)
```

- フロントは `VITE_API_BASE_URL` を経由して FastAPI にのみアクセスする。
- FastAPI は `DATABASE_URL`(Supabaseのpooler接続文字列)を使い、**SQLAlchemy経由でPostgresに直接接続**している。Supabaseの `supabase-py`/`supabase-js` クライアントは使っていない。
- 画像アップロード/削除も、フロントではなく **FastAPI(`app/storage.py`)がSupabase StorageのREST APIをservice role keyで直接叩く**方式。service role keyはCloud RunのSecret Manager経由でのみ注入され、フロントには一切露出しない。

### 0.5 (フロント→Supabase直接アクセスの残存チェック) 結果: **不要**

- `frontend/src` 全体、`frontend/package.json` を検索した結果、`supabase-js`・`createClient`・`SUPABASE_URL` 等の直接参照は **見つからなかった**。
- データアクセスは既に「フロント → FastAPI → Supabase」に統一されている。改善計画にあった「0.5 FastAPI経由への統一リファクタ」タスクは**追加不要**と判断。

---

## 2. フロントエンド 画面・ルーティング構成

`frontend/src/app/router.tsx` で定義。全ルートは `AppLayout` 配下。

| パス | 画面 | 実装状況 |
|---|---|---|
| `/` | `/wines` へリダイレクト | 実装済み |
| `/wines` | `WineListPage`(ワイン一覧) | 実装済み |
| `/wines/new` | `WineCreatePage`(新規登録) | 実装済み |
| `/wines/:wineId` | `WineDetailPage`(詳細) | 実装済み |
| `/wines/:wineId/edit` | `WineEditPage`(編集) | 実装済み |
| `*` | `NotFoundPage` | 実装済み |

**注意点(既知の不整合)**: `AppLayout`(`src/components/layout/AppLayout.tsx`)のサイドナビには以下のリンクがあるが、対応するルートは未実装で、遷移すると `NotFoundPage` になる。

```text
/dashboard  (ダッシュボード)
/inventory  (在庫管理)
/history    (入出庫履歴)
/producers  (生産者一覧)
/locations  (保管場所)
/reports    (レポート)
/settings   (設定)
```

→ 改善計画の「2. 管理者画面と顧客画面の分離」で `/admin/wines` を追加する際、このナビ構造とどう整合させるか要検討(ダミーリンクをこのタイミングで整理するか、別タスク化するか)。

### WineListPage の主なロジック

- 検索条件・ページ番号・件数・表示モード(`view`)はすべて `URLSearchParams` に保持(`WineListPage.tsx`)。
- 表示モード: `getViewParam()` が `view=card` のときのみ `"card"`、それ以外は `"list"`。

---

## 3. バックエンド APIエンドポイント一覧

`prefix="/api"`。ルーターは `app/routers/wines.py`(`/api/wines`)と `app/routers/images.py`(`/api/images`)。

| Method | Path | 概要 |
|---|---|---|
| GET | `/` | ヘルスチェック(メッセージのみ) |
| GET | `/health` | `{status, database}` (DB dialect名を返す) |
| GET | `/api/wines` | 一覧検索(キーワード・各種フィルタ・ソート・ページング) |
| POST | `/api/wines` | 新規登録(重複時409) |
| GET | `/api/wines/{id}` | 詳細取得(直近入出庫履歴10件を同梱) |
| PATCH | `/api/wines/{id}` | 部分更新(重複時409、画像差替時は旧画像をベストエフォート削除) |
| DELETE | `/api/wines/{id}` | 削除(画像もベストエフォート削除) |
| POST | `/api/wines/{id}/transactions` | 入出庫/移動/棚卸調整の登録(`in`/`out`/`move`/`adjust`) |
| POST | `/api/images` | 画像アップロード(Supabase Storageへ中継、jpeg/png/webp、5MB上限) |

すべて認証なし(現時点でDependsによる認可レイヤーは存在しない)。改善計画の「3. 管理者認証」はここに追加する形になる。

### 3.1 GET /api/wines の検索パラメータ

```text
keyword          部分一致(name, name_kana, producer, country, grape_variety, comment)
wine_type        完全一致
style_type       完全一致
country          完全一致
producer         部分一致
grape_variety    部分一致
vintage          完全一致
location         完全一致
min_sale_price / max_sale_price   範囲(sale_price)
in_stock         true=quantity>0, false=quantity==0
sort_by          id | name | vintage | sale_price | quantity | created_at
sort_order       asc | desc
skip / limit     ページング(limit上限500、デフォルト20)
```

CLAUDE.mdの仕様通りに実装されている。

### 3.2 在庫増減(`inventory_transactions`)ロジック(現状把握=タスク5の前提)

`create_wine_transaction`(`routers/wines.py`)にすべて実装済み:

- `in`: `quantity += n`。`to_location` 未指定なら現在のlocationを補完。
- `out`: 在庫不足(`n > quantity`)は422で拒否。`from_location` 未指定なら現在のlocationを補完。
- `move`: 在庫0なら422で拒否。**ワイン単位で全数移動**(1本単位の一部移動は非対応)。`wine.location` を更新。
- `adjust`: `quantity` をリクエスト値でそのまま上書き(棚卸)。

在庫は `wines.quantity` の数値カラムで保持し(履歴からの都度算出ではない)、`inventory_transactions` は履歴記録用。マイナス在庫は `out` 時のみアプリ層で防止(`adjust` では負値バリデーションはPydantic `Field(gt=0)` が `quantity` 自体には無いため、スキーマ上は正の数量のみ受け付ける設計)。

`reserved_quantity`(予約数)も存在し、`available_quantity = quantity - reserved_quantity` を `WineResponse` の `computed_field` として返す。ただし `reserved_quantity` を増減させるAPI(予約/引当操作)は現状存在せず、フィールドの手動編集(`WineForm`経由のPATCH)のみ。

---

## 4. データモデル(DB定義)

Alembic初期リビジョン `ce16d0a43505_initial_schema.py` が唯一のマイグレーション。SQLAlchemyモデル(`app/models.py`)と一致。

### `wines`

```text
id                 PK
original_no        int, null可
order_date         date, null可
wine_type          varchar(50), null可
style_type         varchar(50), null可
name               varchar(255), NOT NULL, index
name_kana          varchar(255), null可
country            varchar(100), null可, index
producer           varchar(255), null可, index
grape_variety      varchar(255), null可
vintage            int, null可
size               varchar(50), null可
retail_price       int, null可
purchase_price     int, null可
quantity           int, NOT NULL, default 0
sale_price         int, null可
location           varchar(100), null可, index
management_code    varchar(50), null可
reserved_quantity  int, NOT NULL, default 0 (server_default)
image_url          varchar(500), null可
comment            text, null可
ai_check_status    varchar(50), null可
created_at         datetime, NOT NULL, server_default now()
updated_at         datetime, NOT NULL, server_default now(), onupdate now()
```

`management_code` / `reserved_quantity` / `image_url` はCLAUDE.md記載のフィールド一覧より後に追加されたもの(CLAUDE.md側の更新漏れ)。

### `inventory_transactions`

```text
id                 PK
wine_id            FK(wines.id, ON DELETE CASCADE), NOT NULL, index
transaction_type   varchar(20), NOT NULL  ("in" | "out" | "move" | "adjust")
quantity           int, NOT NULL
from_location      varchar(100), null可
to_location        varchar(100), null可
note               text, null可
operated_by        varchar(100), null可
transaction_at     datetime, NOT NULL, server_default now()
created_at / updated_at
```

### RLS(Row Level Security)について

- Alembicのマイグレーション・SQLAlchemyモデルには **RLSポリシーの定義は一切ない**。
- FastAPIはSupabaseのJSクライアントではなく**直接Postgres接続文字列**(pooler経由)でアクセスしているため、接続に使うDBロール次第でRLSの効力は変わる。
- **要確認事項(Supabaseダッシュボード側でしか分からない)**: `wine-db-url` シークレットの接続文字列がどのロールを使っているか、そのロールに対して `wines` / `inventory_transactions` にRLSが有効化されているか。コード側の情報だけでは判定不可。
  - もしRLSが無効、かつ将来Supabase Auth経由でフロントから直接supabase-jsアクセスする経路を作らない限り(=タスク3もFastAPI側Depends認可のみで完結させる方針)、RLS未設定のままでも実害はない。ただしSupabaseダッシュボードで一度目視確認しておくことを推奨。

---

## 5. 環境変数・デプロイ設定

### バックエンド(Cloud Run `wine-api`, `cloudbuild.yaml`より)

```text
CORS_ORIGINS                    = https://yuki0926.vercel.app (env var)
SUPABASE_URL                    = https://lmsglqjgvqshzdohyonw.supabase.co (env var, 公開情報)
DATABASE_URL                    = Secret Manager: wine-db-url
SUPABASE_SERVICE_ROLE_KEY       = Secret Manager: wine-supabase-service-role-key
SUPABASE_STORAGE_BUCKET         = 未設定時デフォルト "wine-images"(app/storage.py)
```

CORSはCodespaces用に `allow_origin_regex=r"https://.*-5173\.app\.github\.dev"` も常時許可されている(`app/main.py`)。本番運用上は問題ないが、Codespaces環境が廃止された場合は削除候補。

### フロントエンド(Vercel)

```text
VITE_API_BASE_URL  = Vercelプロジェクト設定で注入(ビルド時)
```

---

## 6. 改善タスクとの対応関係

### タスク1(ページネーション後にカード表示がリストに戻るバグ)の原因特定

`frontend/src/pages/WineListPage.tsx` にて:

- 表示モードは `view` というURLクエリで保持される設計になっている(`getViewParam` / `handleViewChange`)ため、**設計自体は正しい**。
- しかしページ送り・件数変更のハンドラが原因でバグが発生している:

```ts
function handlePageChange(nextPage: number) {
  setSearchParams(buildUrlSearchParams(filters, nextPage, limit));
}

function handleLimitChange(nextLimit: number) {
  setSearchParams(buildUrlSearchParams(filters, DEFAULT_PAGE, nextLimit));
}
```

`buildUrlSearchParams(filters, page, limit)` は `filters`(検索条件)・`page`・`limit` だけから **新規に** `URLSearchParams` を組み立てており、現在の `view` パラメータを引き継いでいない。そのため、ページ送りや件数変更を行うと `view` パラメータがURLから消え、`getViewParam` が `"list"` にフォールバックする。

→ **修正方針**: `handlePageChange` / `handleLimitChange` で `buildUrlSearchParams` 呼び出し時に現在の `view` を引数として渡し、URLに書き戻す(もしくは既存の `searchParams` をコピーして `page`/`limit` だけ上書きする方式に変更する)。改善計画1で想定されていた「表示モードのstateがページ遷移で初期化されている」という仮説は、原因の所在としては正しく(URL state初期化)、具体的な修正箇所は上記2関数に絞り込める。

### タスク2(管理者/顧客画面分離)への影響

- 現状 `WineResponse` はコスト情報(`purchase_price`)・管理コード(`management_code`)・在庫数量含め全フィールドを無条件で返している。顧客向けレスポンスを絞る場合、`response_model` を顧客用に別途定義する(例: `WineCustomerResponse`)ことになる。
- ルーティングは現在 `/wines` 系のみのフラットな構成のため、`/admin/wines` を追加する場合は `router.tsx` の再編と、上記「ナビにある未実装リンク」の扱いを合わせて整理するとよい。

### タスク3(管理者認証)への影響

- `backend/requirements.txt` には現状JWT検証ライブラリ(`python-jose` や `PyJWT`)が **含まれていない**。SupabaseのJWT Secretを検証するDependsを実装する際は追加が必要。
- フロントにも `supabase-js` が未導入(0.5判定と同じ結果)。ログイン機能を作る場合はこの依存追加が必要になる。

### タスク4(Excel一括登録)への影響

- `backend/requirements.txt` に `openpyxl`・`pandas` は既に含まれている。`backend/scripts/import_wines_from_excel.py` という**スクリプト版の実装が既に存在**しており、実装時の参考・流用元にできる。

### タスク5(在庫管理ロジック仕様確認)への影響

- 上記「3.2」に記載した内容が現状ロジックの全体像。決定が必要な項目(マイナス在庫許容可否など)は、現状 `adjust` 以外は基本的にアプリ層でガードされている。`adjust` は上書き型のため、マイナス値を渡した場合の挙動は要検討(現状バリデーション未確認、要テスト)。

---

## 7. その他、実装ガイドラインとの既知の乖離

- CLAUDE.md記載のワインモデルフィールド一覧に `management_code` / `reserved_quantity` / `image_url` が含まれていない(実装が先行)。CLAUDE.mdの更新を推奨。
- CLAUDE.mdは「CRUDロジックは `crud.py` に置く」想定だが、実際は `routers/wines.py` にすべてのDB操作ロジックが実装されており、`crud.py` は未使用のプレースホルダーコメントのみ。
