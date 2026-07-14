# Vercel + Supabase 移行手順

最終更新: 2026-07-14

## 進捗ステータス(2026-07-14時点)

フェーズ1〜5・7(バックエンド側)は完了・本番確認済み。**残りはフェーズ6・8・9(フロントエンドのVercel移行と最終切り替え)。** 別PCから再開する場合は「残作業チェックリスト」から始めてください。

確定している値(再開時にそのまま使えるもの):

| 項目 | 値 |
|---|---|
| Supabaseプロジェクトref | `lmsglqjgvqshzdohyonw` |
| Supabaseリージョン | `ap-northeast-1`(Tokyo) |
| DB接続方式 | **Transaction pooler**(`aws-0-ap-northeast-1.pooler.supabase.com:6543`、ユーザー名`postgres.lmsglqjgvqshzdohyonw`) |
| GCP Secret Manager シークレット名 | `wine-db-url`(作成済み・Cloud Run SAに`roles/secretmanager.secretAccessor`付与済み) |
| Cloud Run サービスアカウント | `wine-cloud-run@billing-app-20240401.iam.gserviceaccount.com` |
| バックエンド(Cloud Run `wine-api`)の本番URL | `https://wine-api-113172170388.asia-northeast1.run.app` |
| `/health`確認結果 | `{"status":"ok","database":"postgresql"}`(確認済み) |
| `/api/wines`確認結果 | 8件、Supabaseへの移行データと一致(確認済み) |

未確定・要判断事項(確定済み・下記の通り決定):

- ローカル開発時のDB接続: **案A採用**(`DATABASE_URL`未設定時はSQLiteにフォールバック。実装済み)
- Vercel Previewからバックエンドへの疎通: **許可しない**(Production URLのみCORS許可)
- Alembic導入: **今回の移行と同時実施**(実施済み。初回リビジョン`ce16d0a43505`)
- カスタムドメイン: **使わない**(Vercel発行のデフォルトURLを使う)

## 実施時に詰まったポイント(次回の参考用)

- **SupabaseのDirect connection(`db.<ref>.supabase.co:5432`)はIPv6専用ホスト名で、IPv6非対応のネットワークからは`getaddrinfo failed`でDNS解決に失敗する。** 必ず**Transaction pooler**(`aws-0-<region>.pooler.supabase.com:6543`)を使うこと。ユーザー名も`postgres`ではなく`postgres.<project-ref>`という形式になる点に注意。
- Windowsでの作業時、コマンドプロンプト(`(.venv) C:\...>`、`PS`プレフィックスなし)とPowerShell(`PS C:\...>`)で環境変数の設定構文が違う:
  - cmd.exe: `set "DATABASE_URL=postgresql://..."`
  - PowerShell: `$env:DATABASE_URL = 'postgresql://...'` (パスワードに`$`を含む場合は**必ずシングルクォート**。ダブルクォートだと`$`以降が変数展開されて壊れる)
- Secret ManagerのシークレットとIAM権限付与は、`gcloud`コマンドなしでもGCPコンソールから全て操作可能(Secret Manager画面の「シークレットを作成」→ 詳細画面の「権限」タブから「アクセス権を付与」)。

## 前提・決定事項

- **バックエンド(FastAPI)は移行後も Cloud Run で稼働を継続する**(2026-07-08 に決定)。
  Vercel の Python Serverless Functions への移行は行わない(コールドスタート・実行時間制限・コネクション管理などの検証コストが見合わないため)。
- 今回の移行対象は次の2つに限定される:
  1. **データベース**: SQLite(Cloud Run上で非永続なファイル) → **Supabase Postgres** ✅完了
  2. **フロントエンドのホスティング**: Cloud Run + nginx静的配信 → **Vercel** ⬜残作業
- **画像アップロード(Supabase Storage)は別タスク**として扱う。詳細は `ROADMAP.md` の「⚠️ 要修正: 画像URL入力 → 画像アップロードへの切り替え」を参照。このドキュメントでは触れない。
- 目的はコスト削減。Cloud SQL等の追加コストを払う前に、無料枠が大きい Supabase Postgres と Vercel の静的ホスティングに寄せる。

## 移行後のアーキテクチャ

| コンポーネント | 現状 | 移行後 |
|---|---|---|
| フロントエンド | Cloud Run (`wine-web`, nginx配信) | Vercel |
| バックエンド | Cloud Run (`wine-api`) | 変更なし(Cloud Run継続) ✅ |
| データベース | SQLite(コンテナ内ファイル、非永続) | Supabase Postgres ✅ |
| 画像 | `image_url` 手入力(URL文字列のみ) | 変更なし(このタスクの範囲外) |
| CI/CD(バックエンド) | Cloud Build → Artifact Registry → Cloud Run | 変更なし ✅ |
| CI/CD(フロントエンド) | Cloud Build → Artifact Registry → Cloud Run | Vercel の Git 連携(push時自動デプロイ) |

バックエンドが変わらないため、`CLAUDE.md` のバックエンド関連の記述(API設計・CORSの考え方・ローカル開発手順)はそのまま有効。変更が必要なのはデータベース接続とフロントエンドのデプロイ・CORS許可先のみ。

---

## ✅ フェーズ1〜5・7: バックエンド移行(完了)

Supabaseプロジェクト作成、`backend/app/database.py`のDATABASE_URL対応、Alembic導入、データ移行、Cloud Run側のSecret Manager連携・`cloudbuild.yaml`更新まで完了・本番確認済み。詳細な手順は git 履歴のコミット `DBをSupabaseに変更` を参照。やり直しが必要な場合の要点だけ書いておく:

- ローカルから`alembic upgrade head`を実行する際は、`DATABASE_URL`にTransaction poolerの接続文字列(`?sslmode=require`付き)をセットする。
- データ移行は `backend/scripts/migrate_sqlite_to_postgres.py` を、同じく`DATABASE_URL`をセットした状態で`python -m scripts.migrate_sqlite_to_postgres`として実行する(事前に`wine.db`をバックアップ)。
- Secret Manager (`wine-db-url`) とCloud Run SAへの権限付与はGCPコンソールから実施済み。

---

## ⬜ 残作業チェックリスト(ここから再開)

### フェーズ6: フロントエンドをVercelへ

対象: Vercelダッシュボード側の設定(リポジトリ内に変更は基本不要)。

1. https://vercel.com にログイン(GitHubアカウントで可)。
2. 「Add New...」→「Project」→ GitHubリポジトリ `yuki0926` をインポート(初回はVercelにリポジトリアクセスを許可する)。
3. プロジェクト設定:
   - **Root Directory**: `wine-app/frontend`(モノレポなので必ず指定。「Edit」から選択する)
   - **Framework Preset**: 自動検出される「Vite」のまま
   - **Build Command**: `npm run build`(デフォルトのまま)
   - **Output Directory**: `dist`(デフォルトのまま)
4. **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://wine-api-113172170388.asia-northeast1.run.app`
   - 対象環境: **Production**(Previewは今回使わない方針なのでチェック不要)
5. 「Deploy」を実行し、発行されたURL(`https://<project>.vercel.app`)を控える。

### フェーズ7: バックエンドCORSの許可先をVercelに変更

対象ファイル: `wine-app/cloudbuild.yaml`

1. `substitutions`セクションの`_VERCEL_FRONTEND_URL`(現在は仮の値`https://wine-web.vercel.app`)を、フェーズ6で発行された実際のVercel URLに書き換える。
2. 変更をコミットし、mainにpush(pushすると`deploy-backend`ステップが再実行され、Cloud Runの`CORS_ORIGINS`環境変数が更新される)。
3. Cloud Buildが成功したことを https://console.cloud.google.com/cloud-build/builds?project=billing-app-20240401 で確認する。

### フェーズ8: 切り替え・検証

1. VercelのURLからアプリを実際に操作し、Cloud Run上のバックエンド(`https://wine-api-113172170388.asia-northeast1.run.app`)と通信できるか確認する。ブラウザのNetwork/ConsoleタブでCORSエラーが出ていないか必ず確認する。
2. 一覧・詳細・入出庫登録・作成/編集フォームなど主要導線をひと通り確認する。
3. 問題がなければ、Cloud Run側のフロントエンドサービス(`wine-web`)を停止・削除し、Artifact Registry上の不要なイメージも整理してコスト削減効果を確定させる。
4. 必要であればカスタムドメインをVercel側に設定する(今回は方針として設定しない)。

### フェーズ9: ドキュメント更新(最終仕上げ)

1. `CLAUDE.md` のデプロイ関連の記述を更新する(フロントエンドは「Cloud Build → Cloud Run」ではなく「Vercel Git連携」に変わる旨。ローカル/Codespacesの開発手順自体は変更不要)。
2. `ROADMAP.md` の該当項目(長期・インフラ)を完了扱いに更新する。
3. このファイル(`MIGRATION_VERCEL_SUPABASE.md`)は実施記録として残す。
4. Supabaseのデータベースパスワードをローテーションしておく(作業中にチャット等へ平文で残っている場合の念のための対応)。

## ロールバック

- データベース: `DATABASE_URL`環境変数を元のSQLite設定に戻すだけで切り戻せる(Cloud Runの環境変数からシークレット参照を外す)。移行前にバックアップした`wine.db.bak`があれば何度でもやり直せる。
- フロントエンド: Cloud Run側の`wine-web`サービスをすぐに削除せず、Vercel側の動作確認が済むまで並行稼働させておく。問題があればDNS/参照先をCloud Run側に戻すだけで良い。

## 関連ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・現在のインフラ構成
- `ROADMAP.md` — 実装ロードマップ(長期・インフラ項目、画像アップロードの要修正事項)
