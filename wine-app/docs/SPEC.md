# Wine Stocker 現状仕様書

最終更新: 2026-07-18
作成目的: 実装の現状を確定し、以降の改善・追加実装の前提とするための参照ドキュメント。継続的にメンテナンスする(実装が変わったら本ドキュメントも更新すること)。関連するTo Doは `ROADMAP.md` を参照。

---

## 1. 全体構成

```text
フロント(Vercel, React SPA)
  → apiClient(fetch) → FastAPI(Cloud Run, /api配下)
       → SQLAlchemy(直接Postgres接続文字列) → Supabase Postgres
       → httpx(service role key) → Supabase Storage(画像)
       → PyJWT(JWKS) → Supabase Auth(管理者トークン検証)
```

- フロントは `VITE_API_BASE_URL` を経由して FastAPI にのみアクセスする。
- FastAPI は `DATABASE_URL`(Supabaseのpooler接続文字列)を使い、**SQLAlchemy経由でPostgresに直接接続**している。Supabaseの `supabase-py` クライアントは使っていない。
- 画像アップロード/削除は、フロントではなく **FastAPI(`app/storage.py`)がSupabase StorageのREST APIをservice role keyで直接叩く**方式。service role keyはCloud RunのSecret Manager経由でのみ注入され、フロントには一切露出しない。
- 管理者認証は **Supabase AuthのJWT(ES256署名)をFastAPI側(`app/auth.py`)がJWKSエンドポイントで検証**する方式。フロントは `@supabase/supabase-js`(`src/lib/supabaseClient.ts`)を**ログイン/セッション管理のみ**に使い、ワインデータへのアクセスは常にFastAPI経由。

### 0.5(フロント→Supabase直接アクセスの残存チェック) 結果: **不要**

- `frontend/src` 全体を検索した結果、ワインデータ取得系で `supabase-js` を直接使っている箇所は **見つからなかった**(ログイン画面/セッション管理のみで使用)。
- データアクセスは「フロント → FastAPI → Supabase」に統一されている。

---

## 2. フロントエンド 画面・ルーティング構成

`frontend/src/app/router.tsx` で定義。顧客向け(`PublicLayout`、認証不要)と管理者向け(`AppLayout`、`RequireAuth`でログイン必須)に分離されている。

| パス | 画面 | レイアウト | 認証 |
|---|---|---|---|
| `/` | `/wines` へリダイレクト | - | 不要 |
| `/login` | `LoginPage`(管理者ログイン) | 単独 | 不要 |
| `/wines` | `CustomerWineListPage`(顧客向け一覧) | `PublicLayout` | 不要 |
| `/wines/:wineId` | `CustomerWineDetailPage`(顧客向け詳細) | `PublicLayout` | 不要 |
| `/admin` | `/admin/wines` へリダイレクト | `AppLayout` | 必須 |
| `/admin/wines` | `WineListPage`(管理者向け一覧) | `AppLayout` | 必須 |
| `/admin/wines/new` | `WineCreatePage`(新規登録) | `AppLayout` | 必須 |
| `/admin/wines/import` | `WineImportPage`(Excel一括登録) | `AppLayout` | 必須 |
| `/admin/wines/:wineId` | `WineDetailPage`(詳細) | `AppLayout` | 必須 |
| `/admin/wines/:wineId/edit` | `WineEditPage`(編集) | `AppLayout` | 必須 |
| `/admin/history` | `WineHistoryPage`(全ワイン横断の入出庫履歴) | `AppLayout` | 必須 |
| `*` | `NotFoundPage` | - | - |

`RequireAuth`(`features/auth/components/RequireAuth.tsx`)はSupabaseセッションが無ければ`/login`へリダイレクトする。`AppLayout`のサイドナビは「ワイン一覧」「入出庫履歴」の2項目のみで、対応ルートが未実装のダミーリンクは無い(2026-07-18に整理済み)。

### WineListPage(管理者向け)の主なロジック

- 検索条件・ページ番号・件数・表示モード(`view`)はすべて `URLSearchParams` に保持(`WineListPage.tsx`)。
- 表示モード: `getViewParam()` が `view=card` のときのみ `"card"`、それ以外は `"list"`。
- ページ送り・件数変更・表示モード切替のいずれも他の状態を引き継ぐよう実装されている(過去にあった「ページ送りでview状態が消える」バグは修正済み)。

### WineHistoryPage(管理者向け、全履歴)の主なロジック

- `transaction_type`(入庫/出庫/移動/調整)フィルタと `wine_id` フィルタを `URLSearchParams` に保持。
- `wine_id` は主にワイン詳細ページの「すべての履歴を見る」リンク(`/admin/history?wine_id=...`)経由で設定される。フィルタ中はChipで表示し、クリア可能。

---

## 3. バックエンド APIエンドポイント一覧

`prefix="/api"`。ルーターは `app/routers/wines.py`(`/api/wines`)、`app/routers/images.py`(`/api/images`)、`app/routers/public_wines.py`(`/api/public/wines`)。

| Method | Path | 概要 | 認証 |
|---|---|---|---|
| GET | `/` | ヘルスチェック(メッセージのみ) | 不要 |
| GET | `/health` | `{status, database}`(DB dialect名を返す) | 不要 |
| GET | `/api/wines` | 一覧検索(キーワード・各種フィルタ・ソート・ページング) | 必須 |
| POST | `/api/wines` | 新規登録(重複時409) | 必須 |
| POST | `/api/wines/import` | Excel一括登録(名前空欄行はスキップ、重複行はエラー返却) | 必須 |
| GET | `/api/wines/transactions` | 全ワイン横断の入出庫履歴一覧(`wine_id`/`transaction_type`フィルタ、ページング) | 必須 |
| GET | `/api/wines/{id}` | 詳細取得(直近入出庫履歴10件を同梱) | 必須 |
| PATCH | `/api/wines/{id}` | 部分更新(重複時409、画像差替時は旧画像をベストエフォート削除) | 必須 |
| DELETE | `/api/wines/{id}` | 削除(画像もベストエフォート削除) | 必須 |
| POST | `/api/wines/{id}/transactions` | 入出庫/移動/棚卸調整の登録(`in`/`out`/`move`/`adjust`) | 必須 |
| POST | `/api/images` | 画像アップロード(Supabase Storageへ中継、jpeg/png/webp、5MB上限) | 必須 |
| GET | `/api/public/wines` | 顧客向け一覧検索(在庫本数・保管場所等は返さない) | 不要 |
| GET | `/api/public/wines/{id}` | 顧客向け詳細取得 | 不要 |

「必須」の認証は `Depends(get_current_admin)`(`app/auth.py`)。Supabase AuthのJWT(ES256)をJWKSエンドポイントで検証し、`app_metadata.role == "admin"` のユーザーのみ通す。トークン欠如は401、role不一致は403。

`/api/wines/transactions` は静的パスとして `/{wine_id}` より前に定義しており(`wine_id`はint型のため文字列パスとの衝突は起きないが、可読性のため`/import`と同様に静的パスを先に置く方針)、ルーティング上の衝突はない。

`/api/public/wines*`(`schemas.WineCustomerResponse`)は `purchase_price`、`quantity`、`reserved_quantity`、`available_quantity`、`location`、`management_code`、`comment` を返さない。`sale_price` と在庫有無の `in_stock`(boolean)のみ。共通のフィルタ構築ロジックは `app/wine_filters.py` にあり、管理者向け・顧客向け両方の一覧エンドポイントで共用している。

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

`GET /api/public/wines` もほぼ同じパラメータだが、`location`(保管場所)による絞り込みは持たない(管理者向けのみ)。

### 3.2 GET /api/wines/transactions の検索パラメータ

```text
wine_id            指定した場合、そのワインの履歴のみに絞り込み
transaction_type   in | out | move | adjust
skip / limit       ページング(limit上限500、デフォルト20)
```

新しい順(`transaction_at desc, id desc`)で返す。レスポンスの各アイテムには `wine_id`・`wine_name` を含む(`InventoryTransactionWithWineResponse`)。

### 3.3 在庫増減(`inventory_transactions`)ロジック

`create_wine_transaction`(`routers/wines.py`)にすべて実装済み:

- `in`: `quantity += n`。`to_location` 未指定なら現在のlocationを補完。
- `out`: 在庫不足(`n > quantity`)は422で拒否。`from_location` 未指定なら現在のlocationを補完。
- `move`: 在庫0なら422で拒否。**ワイン単位で全数移動**(1本単位の一部移動は非対応)。`wine.location` を更新。
- `adjust`: `quantity` をリクエスト値でそのまま上書き(棚卸)。

在庫は `wines.quantity` の数値カラムで保持し(履歴からの都度算出ではない)、`inventory_transactions` は履歴記録用。マイナス在庫は `out` 時のみアプリ層で防止。

`reserved_quantity`(予約数)も存在し、`available_quantity = quantity - reserved_quantity` を `WineResponse` の `computed_field` として返す。ただし `reserved_quantity` を増減させるAPI(予約/引当操作)は現状存在せず、フィールドの手動編集(`WineForm`経由のPATCH)のみ。

---

## 4. データモデル(DB定義)

Alembic初期リビジョン `ce16d0a43505_initial_schema.py` が唯一のマイグレーション(2026-07-18時点)。SQLAlchemyモデル(`app/models.py`)と一致。

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

`management_code` / `reserved_quantity` / `image_url` はCLAUDE.md記載のフィールド一覧より後に追加されたもの(CLAUDE.md側の更新漏れ、未解消)。

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
- **要確認事項(Supabaseダッシュボード側でしか分からない、未解消)**: `wine-db-url` シークレットの接続文字列がどのロールを使っているか、そのロールに対して `wines` / `inventory_transactions` にRLSが有効化されているか。コード側の情報だけでは判定不可。
  - アプリ側の認可はFastAPIの`get_current_admin`(Depends)のみで完結する方針であり(フロントから直接supabase-js経由でDBアクセスする経路は無い)、RLS未設定のままでも実害はない想定。ただしSupabaseダッシュボードで一度目視確認しておくことを推奨(`ROADMAP.md`参照)。

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

`SUPABASE_URL` は画像アップロード(Storage)と管理者認証(JWKS)の両方で使う共通の環境変数。

CORSはCodespaces用に `allow_origin_regex=r"https://.*-5173\.app\.github\.dev"` も常時許可されている(`app/main.py`)。本番運用上は問題ないが、Codespaces環境が廃止された場合は削除候補。

### フロントエンド(Vercel)

```text
VITE_API_BASE_URL       = Vercelプロジェクト設定で注入(ビルド時)
VITE_SUPABASE_URL       = Vercelプロジェクト設定で注入(ログイン画面用)
VITE_SUPABASE_ANON_KEY  = Vercelプロジェクト設定で注入(ログイン画面用)
```

`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` はログイン画面(`supabase-js`の`signInWithPassword`/セッション管理)専用。ワインデータ取得には使わない。

---

## 6. 主要な機能追加の記録

以下は完了済み機能の実装メモ。詳細な経緯は各コミット・`ROADMAP.md`を参照。

- **管理者認証・画面分離**: `backend/requirements.txt` に `PyJWT` を追加し、`app/auth.py` でSupabase AuthのJWT(ES256、JWKS検証)を検証する`get_current_admin`を実装。フロントは`supabase-js`を導入し、ログイン画面(`LoginPage`)とセッション管理(`AuthContext`)のみに使用。ルーティングを`/wines*`(顧客向け、公開)と`/admin/wines*`(管理者向け、`RequireAuth`)に分離。
- **Excel一括登録**: `backend/requirements.txt` の `openpyxl`・`pandas` を利用し、`app/wine_import.py` でExcel(WineListシート)をパースして一括登録。旧スクリプト版(`backend/scripts/import_wines_from_excel.py`)をAPI化したもの。
- **全履歴閲覧ページ**: `GET /api/wines/transactions`(全ワイン横断、`wine_id`/`transaction_type`フィルタ、ページング)を追加し、フロントに`/admin/history`ページを実装。ワイン詳細ページの履歴テーブルからも遷移可能。

---

## 7. その他、実装ガイドラインとの既知の乖離

- CLAUDE.md記載のワインモデルフィールド一覧に `management_code` / `reserved_quantity` / `image_url` が含まれていない(実装が先行)。CLAUDE.mdの更新を推奨。
- CLAUDE.mdは「CRUDロジックは `crud.py` に置く」想定だが、実際は `routers/*.py` にすべてのDB操作ロジックが実装されており、`crud.py` は未使用のプレースホルダーコメントのみ(`ROADMAP.md`の中期タスク参照)。
