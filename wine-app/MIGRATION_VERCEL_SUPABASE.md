# Vercel + Supabase 移行手順(実施記録)

最終更新: 2026-07-15

## ステータス: ✅ 移行完了(2026-07-15)

フェーズ1〜9すべて完了。本ドキュメントは今後の実施記録として残す。同種の移行(別プロジェクトなど)をやり直す場合の参考にする。

確定した値:

| 項目 | 値 |
|---|---|
| Supabaseプロジェクトref | `lmsglqjgvqshzdohyonw` |
| Supabaseリージョン | `ap-northeast-1`(Tokyo) |
| DB接続方式 | **Transaction pooler**(`aws-0-ap-northeast-1.pooler.supabase.com:6543`、ユーザー名`postgres.lmsglqjgvqshzdohyonw`) |
| GCP Secret Manager シークレット名 | `wine-db-url` |
| Cloud Run サービスアカウント | `wine-cloud-run@billing-app-20240401.iam.gserviceaccount.com` |
| バックエンド(Cloud Run `wine-api`)の本番URL | `https://wine-api-113172170388.asia-northeast1.run.app` |
| フロントエンド(Vercel)の本番URL | `https://yuki0926.vercel.app` |
| 旧フロントエンド(Cloud Run `wine-web`) | 削除済み |

決定事項:

- ローカル開発時のDB接続: **案A**(`DATABASE_URL`未設定時はSQLiteにフォールバック)
- Vercel Previewからバックエンドへの疎通: **許可しない**(Production URLのみCORS許可)
- Alembic導入: **移行と同時実施**(初回リビジョン`ce16d0a43505`)
- カスタムドメイン: **使わない**(Vercel発行のデフォルトURL)

## 実施時に詰まったポイント(次回の参考用)

- **SupabaseのDirect connection(`db.<ref>.supabase.co:5432`)はIPv6専用ホスト名で、IPv6非対応のネットワークからは`getaddrinfo failed`でDNS解決に失敗する。** 必ず**Transaction pooler**(`aws-0-<region>.pooler.supabase.com:6543`)を使うこと。ユーザー名も`postgres`ではなく`postgres.<project-ref>`という形式になる点に注意。
- Windowsでの作業時、コマンドプロンプト(`(.venv) C:\...>`、`PS`プレフィックスなし)とPowerShell(`PS C:\...>`)で環境変数の設定構文が違う:
  - cmd.exe: `set "DATABASE_URL=postgresql://..."`
  - PowerShell: `$env:DATABASE_URL = 'postgresql://...'` (パスワードに`$`を含む場合は**必ずシングルクォート**。ダブルクォートだと`$`以降が変数展開されて壊れる)
- Secret ManagerのシークレットとIAM権限付与は、`gcloud`コマンドなしでもGCPコンソールから全て操作可能(Secret Manager画面の「シークレットを作成」→ 詳細画面の「権限」タブから「アクセス権を付与」)。
- **Vite + React RouterをVercelにデプロイすると、直接URL(`/wines`等)へのアクセスが404になる。** VercelはVite製SPAに対して自動でルーティングのフォールバックをしないため、`frontend/vercel.json`に`rewrites`で全パスを`/index.html`に流す設定が必要(この移行で追加した)。
- CORSの`CORS_ORIGINS`にはOriginのみを設定する(パスは不要。`https://yuki0926.vercel.app/wines`ではなく`https://yuki0926.vercel.app`)。

## 前提・決定事項

- **バックエンド(FastAPI)は移行後も Cloud Run で稼働を継続する**(2026-07-08 に決定)。
  Vercel の Python Serverless Functions への移行は行わない(コールドスタート・実行時間制限・コネクション管理などの検証コストが見合わないため)。
- 今回の移行対象は次の2つに限定された:
  1. **データベース**: SQLite(Cloud Run上で非永続なファイル) → **Supabase Postgres**
  2. **フロントエンドのホスティング**: Cloud Run + nginx静的配信 → **Vercel**
- **画像アップロード(Supabase Storage)は別タスク**として扱う。詳細は `ROADMAP.md` の「⚠️ 要修正: 画像URL入力 → 画像アップロードへの切り替え」を参照。このドキュメントでは触れない。
- 目的はコスト削減。Cloud SQL等の追加コストを払う前に、無料枠が大きい Supabase Postgres と Vercel の静的ホスティングに寄せた。

## 移行後のアーキテクチャ

| コンポーネント | 移行前 | 移行後 |
|---|---|---|
| フロントエンド | Cloud Run (`wine-web`, nginx配信) | **Vercel**(`https://yuki0926.vercel.app`) |
| バックエンド | Cloud Run (`wine-api`) | 変更なし(Cloud Run継続) |
| データベース | SQLite(コンテナ内ファイル、非永続) | **Supabase Postgres**(Transaction pooler) |
| 画像 | `image_url` 手入力(URL文字列のみ) | 変更なし(このタスクの範囲外) |
| CI/CD(バックエンド) | Cloud Build → Artifact Registry → Cloud Run | 変更なし |
| CI/CD(フロントエンド) | Cloud Build → Artifact Registry → Cloud Run | **Vercel の Git 連携**(push時自動デプロイ) |

バックエンドが変わらないため、`CLAUDE.md` のバックエンド関連の記述(API設計・CORSの考え方・ローカル開発手順)はそのまま有効。

## 実施内容の要約

### フェーズ1〜5・7: バックエンド移行

- Supabaseプロジェクト作成(Transaction pooler接続を使用)
- `backend/app/database.py`: `DATABASE_URL`環境変数対応、未設定時はSQLiteにフォールバック、`postgresql://`を`postgresql+psycopg://`に自動正規化
- `backend/app/main.py`: `Base.metadata.create_all()`削除、`/health`が実際の接続先を返すよう修正
- Alembic導入(`backend/migrations/`、初回リビジョン`ce16d0a43505`)し、`alembic upgrade head`でSupabase側にスキーマ作成
- `backend/scripts/migrate_sqlite_to_postgres.py`で既存データ(ワイン8件+入出庫履歴)を移行
- `backend/Dockerfile`: `COPY wine.db`を削除、`migrations`/`alembic.ini`を含めるよう変更
- GCP Secret Manager `wine-db-url` を作成しCloud Run SAに権限付与、`cloudbuild.yaml`の`deploy-backend`で`--set-secrets=DATABASE_URL=wine-db-url:latest`を設定

### フェーズ6〜9: フロントエンド移行・切り替え・仕上げ

- Vercelプロジェクト作成(Root Directory: `wine-app/frontend`、env `VITE_API_BASE_URL`にCloud RunバックエンドURLを設定)
- `frontend/vercel.json`を追加してSPAルーティングのフォールバックを設定(直接URLアクセス404の修正)
- `cloudbuild.yaml`の`_VERCEL_FRONTEND_URL`を実際のVercel URLに更新し、バックエンドの`CORS_ORIGINS`を反映
- Vercel URLからの動作確認(一覧・詳細・入出庫登録・作成/編集、CORSエラーなし)
- Cloud Run `wine-web`を削除、Artifact Registryの旧フロントエンドイメージを整理
- Supabaseのデータベースパスワードをローテーション(作業中にチャットへ平文表示された分の念のための対応)
- `CLAUDE.md`・`ROADMAP.md`を新しいデプロイ構成に合わせて更新

## ロールバック(参考)

- データベース: `DATABASE_URL`環境変数を元のSQLite設定に戻せば切り戻せる。移行前にバックアップした`wine.db.bak`がある。
- フロントエンド: 旧Cloud Run `wine-web`は既に削除済みのため、切り戻す場合は再デプロイが必要(`cloudbuild.yaml`に旧フロントエンドのビルド・デプロイステップは残っていないので、必要なら過去のコミットから復元する)。

## 関連ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・現在のインフラ構成
- `ROADMAP.md` — 実装ロードマップ(長期・インフラ項目、画像アップロードの要修正事項)
