# Wine Stocker 実装ロードマップ / To Do

最終更新: 2026-07-18

このドキュメントは、今後の実装計画とTo Doを整理したものです。開発方針全般は `CLAUDE.md` を、現状の詳細な仕様は `docs/SPEC.md` を参照してください。(`design-update.md` は削除済み)

## 現状(2026-07-18 時点)

完了済み:
- ワイン一覧画面(リスト表示/カード表示の切り替え、検索・フィルタ・ソート・ページネーション)
- ワイン詳細画面(基本情報・在庫サマリー・価格情報・管理情報・コメント・入出庫履歴の表示、画像カード、削除確認ダイアログ)
  - 画像が未登録の場合は画像カード自体を非表示にし、2カラムレイアウトに切り替える対応済み
- `inventory_transactions` テーブルの追加と、詳細API経由での直近履歴の読み取り表示
- 入出庫登録モーダル + 更新API(`POST /api/wines/{id}/transactions`、in/out/move/adjust対応)
- ワイン新規登録・編集フォーム(重複チェックの409エラー表示を含む)
- Vercel + Supabase移行(DB: SQLite→Supabase Postgres、Alembic導入、フロントホスティング: Cloud Run→Vercel)
- 画像アップロード機能(Supabase Storage連携、`POST /api/images`)
- **Supabase Auth管理者認証・管理者/顧客画面分離**(2026-07-16頃 完了)
  - `/admin/wines*` は管理者ログイン必須(`RequireAuth` + `app/auth.py`の`get_current_admin`、JWKS/ES256検証)
  - `/wines*` は顧客向けに公開のまま(`app/routers/public_wines.py`、`WineCustomerResponse`で仕入値・在庫数・保管場所等を除外)
  - `/api/wines`・`/api/images` は全エンドポイントが管理者認証必須に
- **Excel一括登録**(2026-07-18 完了)
  - `POST /api/wines/import`(`app/wine_import.py`)+ フロント `/admin/wines/import`(`WineImportPage`)
  - 名前空欄行のスキップ、重複行(名前・生産者・Vintage・サイズ・保管場所)のエラー返却に対応
- **「すべての履歴を見る」導線 / 全履歴閲覧ページ**(2026-07-18 完了)
  - `GET /api/wines/transactions` を追加(`wine_id`・`transaction_type`フィルタ、ページング対応、全ワイン横断)
  - フロント `/admin/history`(`WineHistoryPage`)を追加し、サイドナビの「入出庫履歴」から遷移可能に
  - ワイン詳細ページの履歴テーブルから `/admin/history?wine_id=...` へのリンクを追加
- **サイドナビのダミーリンク整理**(2026-07-18 完了)
  - ダッシュボード/在庫管理/生産者一覧/保管場所/レポート/設定の6項目(対応機能なし)を削除し、「ワイン一覧」「入出庫履歴」の2項目のみに整理
- **`crud.py` の削除**(2026-07-18 完了)
  - 未使用のプレースホルダーだった `backend/app/crud.py` を削除。DB操作ロジックは `routers/*.py` に集約する方針を正とし、`CLAUDE.md` のリポジトリ構成図からも記載を削除

未着手:
- RLS(Row Level Security)のSupabaseダッシュボード目視確認
- **在庫ロケーション管理の再設計**(要クライアント確認、着手前)
  - 現状は保管場所が単一文字列で、複数拠点の在庫内訳を持てない不整合が判明。検討メモ: `docs/INVENTORY_LOCATION_DESIGN_NOTES.md`

将来の拡張(優先度低、着手時期未定):
- 複数画像対応
- AI確認ステータスの運用フロー整備

## 次にやること(短期)

1. **RLS(Row Level Security)のSupabaseダッシュボード目視確認**
   - `docs/SPEC.md` の「4. データモデル」節にある要確認事項。コード側の情報だけでは判定不可なため、Supabaseダッシュボードでの確認が必要(コードでの対応ではなく、ユーザー側でのSupabaseダッシュボード確認作業)

## 将来の拡張(優先度低、着手時期未定)

2. **複数画像対応**
   - `wines.image_url`(単一画像)から `wine_images` テーブルへ分離
   - `WineImageCard` → `WineImageGallery` への拡張
   - 画像アップロードAPI自体は実装済みなので、複数回呼び出す形で拡張できる想定

3. **AI確認ステータスの運用フロー整備**
   - 現状は表示のみ(確認済み/未確認/要確認/要修正のバッジ化は完了)
   - 誰が・いつ・どう更新するかの運用/UIが未定義

## 長期・インフラ

4. **データベース・ホスティング基盤の見直し(Vercel + Supabase移行)— ✅完了(2026-07-15)**
   - DB: SQLite(Cloud Run上で非永続)→ **Supabase Postgres**(Transaction pooler接続、`ap-northeast-1`)
   - フロントエンドホスティング: Cloud Run + nginx → **Vercel**(Git連携自動デプロイ、`https://yuki0926.vercel.app`)
   - バックエンド(FastAPI)はCloud Run継続(`wine-api`)、変更なし
   - 画像アップロード先はSupabase Storage(実装は本インフラ移行とは別タスクとして2026-07-15に完了)
   - 実施記録・手順は `MIGRATION_VERCEL_SUPABASE.md` を参照

5. **マイグレーションツールの導入(Alembic等)— ✅完了(2026-07-15、4番と同時実施)**
   - `backend/migrations/` にAlembicを導入済み。`Base.metadata.create_all()` は`main.py`から削除し、以後のスキーマ変更は全てAlembicのリビジョンで管理する
   - ローカル新規クローン時は`alembic upgrade head`が必要(`CLAUDE.md`のLocal Backend節に記載)
   - 2026-07-18時点でリビジョンは初期スキーマ(`ce16d0a43505_initial_schema.py`)の1本のみ

## 参考ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・技術スタック・現在の優先度
- `docs/SPEC.md` — 現状の画面・API・データモデル仕様の詳細
- `frontend/DESIGN.md` — デザインシステム(カラー・タイポグラフィ・コンポーネント方針)
- `MIGRATION_VERCEL_SUPABASE.md` — Vercel + Supabase移行の詳細手順
