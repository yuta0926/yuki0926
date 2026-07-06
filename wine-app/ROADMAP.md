# Wine Stocker 実装ロードマップ / To Do

最終更新: 2026-07-06

このドキュメントは、今後の実装計画とTo Doを整理したものです。各項目の詳細な設計判断は `design-update.md` を、開発方針全般は `CLAUDE.md` を参照してください。

## 現状(2026-07-06 時点)

完了済み:
- ワイン一覧画面(リスト表示/カード表示の切り替え、検索・フィルタ・ソート・ページネーション)
- ワイン詳細画面(基本情報・在庫サマリー・価格情報・管理情報・コメント・入出庫履歴の表示、画像カード、削除確認ダイアログ)
- `inventory_transactions` テーブルの追加と、詳細API経由での直近履歴の読み取り表示

未着手・スタブのまま:
- ワイン新規登録/編集フォーム(`WineCreatePage.tsx` / `WineEditPage.tsx` は現状プレースホルダー)
- 入出庫登録の実処理(入庫/出庫/移動ボタンは現在すべて非活性)

## 次にやること(短期)

1. **入出庫登録モーダル + 更新API**
   - `POST /api/wines/{id}/transactions` のような新規エンドポイントを追加し、`inventory_transactions` への書き込みと `wines.quantity`/`reserved_quantity` の更新を連動させる
   - `WineStockSummary` の入庫/出庫/移動ボタン、`WineDetailPage` の入出庫登録ボタンをモーダルに接続
   - 出庫時の在庫不足チェックなどのバリデーションを検討

2. **ワイン作成・編集フォームの実装**
   - CLAUDE.mdの優先度4番目に該当、まだ未着手
   - `management_code` を含む全フィールドの入力対応
   - 既存の重複チェック(name+producer+vintage+size+location)をフォーム側でも考慮

3. **「すべての履歴を見る」導線**
   - 詳細画面の履歴テーブルは直近10件のみ表示中
   - 案B(`GET /api/wines/{id}/transactions` の独立エンドポイント + ページング)で全履歴閲覧ページを追加

## 中期

4. **複数画像対応**
   - `wines.image_url`(単一画像)から `wine_images` テーブルへ分離
   - `WineImageCard` → `WineImageGallery` への拡張(design-update.md記載の想定拡張)

5. **AI確認ステータスの運用フロー整備**
   - 現状は表示のみ(確認済み/未確認/要確認/要修正のバッジ化は完了)
   - 誰が・いつ・どう更新するかの運用/UIが未定義

6. **Excelインポート**(CLAUDE.md記載の将来項目)

## 長期・インフラ

7. **データベースの永続化基盤の見直し**
   - 現状のSQLiteはCloud Run上では非永続(デモ/ローカル用)
   - Cloud SQL(PostgreSQL)への移行、またはコスト削減目的で **Vercel + Supabase** への移行を検討中(まだ着手前、規模の大きい別タスクとして扱う想定。SupabaseはDoc永続化に加えて画像ストレージの候補にもなり得る)
   - 移行までの間は、特定クラウド(GCS等)に依存しない実装(画像URLを素朴に保持する等)を優先する

8. **マイグレーションツールの導入(Alembic等)**
   - 現状は `Base.metadata.create_all()` のみで、既存テーブルへの列追加は手動 `ALTER TABLE` が必要
   - 今回の `management_code`/`reserved_quantity`/`inventory_transactions` 追加でも手動対応が発生しており、今後列追加のたびに同じ運用コストが発生する

## 参考ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・技術スタック・現在の優先度
- `design-update.md` — ワイン詳細画面の設計仕様と実装判断の記録
- `frontend/DESIGN.md` — デザインシステム(カラー・タイポグラフィ・コンポーネント方針)
