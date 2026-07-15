# Wine Stocker 実装ロードマップ / To Do

最終更新: 2026-07-15

このドキュメントは、今後の実装計画とTo Doを整理したものです。開発方針全般は `CLAUDE.md` を参照してください。(`design-update.md` は削除済み)

## 現状(2026-07-07 時点)

完了済み:
- ワイン一覧画面(リスト表示/カード表示の切り替え、検索・フィルタ・ソート・ページネーション)
- ワイン詳細画面(基本情報・在庫サマリー・価格情報・管理情報・コメント・入出庫履歴の表示、画像カード、削除確認ダイアログ)
  - 画像が未登録の場合は画像カード自体を非表示にし、2カラムレイアウトに切り替える対応済み
- `inventory_transactions` テーブルの追加と、詳細API経由での直近履歴の読み取り表示
- **入出庫登録モーダル + 更新API**(2026-07-07 完了)
  - `POST /api/wines/{id}/transactions` を追加し、`inventory_transactions` への書き込みと `wines.quantity`/`location` の更新を連動させ済み(in/out/move/adjust対応、出庫時の在庫不足チェック・移動時の在庫0チェックあり)
  - `WineStockSummary` の入庫/出庫/移動ボタン、`WineDetailPage` の入出庫登録ボタンから `WineTransactionDialog` を開いて登録できる
- **ワイン新規登録・編集フォーム**(2026-07-07 完了)
  - `WineForm` を作成・編集共通で実装し、`management_code`/`reserved_quantity` を含む全フィールドに対応
  - 重複チェック(name+producer+vintage+size+location)の409エラーをフォーム側で表示
- **Vercel + Supabase移行**(2026-07-15 完了。詳細は下記「長期・インフラ」6番と`MIGRATION_VERCEL_SUPABASE.md`)
  - DB: SQLite → Supabase Postgres、Alembic導入
  - フロントエンドホスティング: Cloud Run → Vercel(`https://yuki0926.vercel.app`)
  - バックエンドはCloud Run継続(`wine-api`)
- **画像アップロード機能(Supabase Storage連携)**(2026-07-15 完了)
  - `WineForm`の画像欄を「URL手入力」から「ファイル選択→アップロード」に置き換え
  - バックエンド経由でSupabase Storageに中継する方式(`POST /api/images`、`app/storage.py`)を採用。service role keyはCloud RunのSecret Manager経由でのみ注入し、フロントには一切露出しない
  - ワイン更新・削除時に、差し替え/削除された古い画像をベストエフォートでStorageから削除(孤児ファイル防止)
  - Supabase未設定環境(ローカル/Codespacesで環境変数未設定時)では503を返し、その他の機能には影響しない
  - 複数画像対応は引き続き未着手(下記「中期」3番)

未着手・スタブのまま:
- 「すべての履歴を見る」導線

## 次にやること(短期)

1. **「すべての履歴を見る」導線**
   - 詳細画面の履歴テーブルは直近10件のみ表示中
   - 案B(`GET /api/wines/{id}/transactions` の独立エンドポイント + ページング)で全履歴閲覧ページを追加

## 中期

2. **複数画像対応**
   - `wines.image_url`(単一画像)から `wine_images` テーブルへ分離
   - `WineImageCard` → `WineImageGallery` への拡張
   - 画像アップロード機能(上記「完了」参照)は既に実装済みなので、この分離は既存のアップロードAPIをそのまま複数回呼び出す形で拡張できる想定

3. **AI確認ステータスの運用フロー整備**
   - 現状は表示のみ(確認済み/未確認/要確認/要修正のバッジ化は完了)
   - 誰が・いつ・どう更新するかの運用/UIが未定義

4. **Excelインポート**(CLAUDE.md記載の将来項目)

## 長期・インフラ

5. **データベース・ホスティング基盤の見直し(Vercel + Supabase移行)— ✅完了(2026-07-15)**
   - DB: SQLite(Cloud Run上で非永続)→ **Supabase Postgres**(Transaction pooler接続、`ap-northeast-1`)
   - フロントエンドホスティング: Cloud Run + nginx → **Vercel**(Git連携自動デプロイ、`https://yuki0926.vercel.app`)
   - バックエンド(FastAPI)はCloud Run継続(`wine-api`)、変更なし
   - 画像アップロード先はSupabase Storage(上記「完了」参照。実装は本インフラ移行とは別タスクとして2026-07-15に完了)
   - 実施記録・手順は `MIGRATION_VERCEL_SUPABASE.md` を参照

6. **マイグレーションツールの導入(Alembic等)— ✅完了(2026-07-15、5番と同時実施)**
   - `backend/migrations/` にAlembicを導入済み。`Base.metadata.create_all()` は`main.py`から削除し、以後のスキーマ変更は全てAlembicのリビジョンで管理する
   - ローカル新規クローン時は`alembic upgrade head`が必要(`CLAUDE.md`のLocal Backend節に記載)

## 参考ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・技術スタック・現在の優先度
- `frontend/DESIGN.md` — デザインシステム(カラー・タイポグラフィ・コンポーネント方針)
- `MIGRATION_VERCEL_SUPABASE.md` — Vercel + Supabase移行の詳細手順
