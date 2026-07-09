# Vercel + Supabase 移行手順

最終更新: 2026-07-09

## 前提・決定事項

- **バックエンド(FastAPI)は移行後も Cloud Run で稼働を継続する**(2026-07-08 に決定)。
  Vercel の Python Serverless Functions への移行は行わない(コールドスタート・実行時間制限・コネクション管理などの検証コストが見合わないため)。
- 今回の移行対象は次の2つに限定される:
  1. **データベース**: SQLite(Cloud Run上で非永続なファイル) → **Supabase Postgres**
  2. **フロントエンドのホスティング**: Cloud Run + nginx静的配信 → **Vercel**
- **画像アップロード(Supabase Storage)は別タスク**として扱う。詳細は `ROADMAP.md` の「⚠️ 要修正: 画像URL入力 → 画像アップロードへの切り替え」を参照。このドキュメントでは触れない。
- 目的はコスト削減。Cloud SQL等の追加コストを払う前に、無料枠が大きい Supabase Postgres と Vercel の静的ホスティングに寄せる。

## 移行後のアーキテクチャ

| コンポーネント | 現状 | 移行後 |
|---|---|---|
| フロントエンド | Cloud Run (`wine-web`, nginx配信) | Vercel |
| バックエンド | Cloud Run (`wine-api`) | 変更なし(Cloud Run継続) |
| データベース | SQLite(コンテナ内ファイル、非永続) | Supabase Postgres |
| 画像 | `image_url` 手入力(URL文字列のみ) | 変更なし(このタスクの範囲外) |
| CI/CD(バックエンド) | Cloud Build → Artifact Registry → Cloud Run | 変更なし |
| CI/CD(フロントエンド) | Cloud Build → Artifact Registry → Cloud Run | Vercel の Git 連携(push時自動デプロイ) |

バックエンドが変わらないため、`CLAUDE.md` のバックエンド関連の記述(API設計・CORSの考え方・ローカル開発手順)はそのまま有効。変更が必要なのはデータベース接続とフロントエンドのデプロイ・CORS許可先のみ。

## フェーズ1: Supabaseプロジェクトの準備

1. Supabaseプロジェクトを作成する。リージョンは Cloud Run (`asia-northeast1`) に近い `ap-northeast-1` (東京) を選ぶ。
2. Database設定から接続文字列を確認する。Supabaseは用途別に3種類の接続を提供している:
   - **Direct connection**(5432番、コネクション数に制限あり)
   - **Session pooler**(5432番、PgBouncerのsessionモード)
   - **Transaction pooler**(6543番、PgBouncerのtransactionモード)
   - Cloud Runは現在 `--max-instances=1` だが、将来スケールする可能性を考えると **Transaction pooler** を使うのが安全(コネクション枯渇を避けられる)。
3. Postgres拡張機能などの追加設定は今回不要(デフォルトのままでよい)。
4. Storageバケットの作成は行わない(画像アップロードは別タスク)。

## フェーズ2: バックエンドのDB接続をPostgresへ

対象ファイル: `backend/app/database.py`, `backend/requirements.txt`

1. 依存関係を追加する: `psycopg[binary]`(SQLAlchemy 2.x + Postgresの組み合わせで推奨されるドライバ)。
2. `database.py` のハードコードされたSQLiteパスを、環境変数 `DATABASE_URL` から読む形に変更する。

   ```python
   import os

   DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")

   connect_args = (
       {"check_same_thread": False}
       if DATABASE_URL.startswith("sqlite")
       else {}
   )

   engine = create_engine(DATABASE_URL, connect_args=connect_args)
   ```

   `connect_args` の `check_same_thread` はSQLite専用のオプションなので、dialectで分岐させる。

3. **未確定事項(要判断)**: ローカル開発時のDB接続をどうするか。
   - 案A: ローカルは今まで通りSQLiteのまま(`DATABASE_URL` 未設定時はSQLiteにフォールバック)。本番・Codespacesのみ環境変数でPostgresを指す。移行リスクが低く、まずはこれを推奨。
   - 案B: ローカルもSupabaseの開発用プロジェクト(または同一プロジェクトの別スキーマ)に統一する。チーム開発になった場合はこちらが有利だが、現状は不要。
4. Supabaseの接続はSSL必須のため、接続文字列に `?sslmode=require` を付与する(SupabaseのダッシュボードでコピーできるURLには通常含まれている)。
5. `main.py` の `/health` エンドポイントが `"database": "sqlite"` を固定で返しているので、実際の接続先に応じた値を返すよう修正する(細かい修正だが移行時に忘れやすい)。

## フェーズ3: スキーマ移行とマイグレーションツールの導入

対象: `ROADMAP.md` 長期項目7「マイグレーションツールの導入」と重複するため、このタイミングでまとめて行う。

1. Alembicを導入する(`pip install alembic`、`alembic init migrations`)。
2. 現在の `models.py` から初回リビジョンを生成し、Postgres側に対して `alembic upgrade head` でスキーマを作成する。
   - `Base.metadata.create_all(bind=engine)` を `main.py` から削除し、以後のスキーマ変更はすべてAlembicのリビジョンで管理する。
3. 初回だけの選択肢として、Alembicを使わずに `create_all()` を1回Postgresに対して実行する方法もあるが、今後 `management_code` 追加時のような手動 `ALTER TABLE` 運用を繰り返さないためにも、このタイミングでAlembic導入を強く推奨する。

## フェーズ4: データ移行(SQLite → Postgres)

現状のデモデータは8件程度(2026-07-07時点)と少量なので、大掛かりなツールは不要。

1. 移行前に `backend/wine.db` をバックアップしておく(やり直しが効くように)。
2. `pandas`(既存の依存関係)を使い、テーブルごとにSQLiteから読み込んでPostgresへ書き込む簡易スクリプトを書く:
   - `wines` テーブル、`inventory_transactions` テーブルの2つ。
   - `pandas.read_sql_table` → `DataFrame.to_sql(..., con=postgres_engine, if_exists="append")` で十分。
3. 主キー(`id`)を保持したまま移行する場合は、Postgres側のシーケンス(`wines_id_seq` 等)を移行後の最大値に合わせて `setval` で調整する必要がある(忘れると次のINSERTでID衝突が起きる)。

## フェーズ5: Cloud Run側の設定変更(バックエンドのみ)

対象ファイル: `backend/Dockerfile`, `cloudbuild.yaml`

1. `Dockerfile` の `COPY wine.db ./wine.db` を削除する(本番はもうSQLiteファイルを使わないため、イメージに含める必要がない)。
2. Cloud Runの環境変数に `DATABASE_URL`(Supabaseの接続文字列)を追加する。接続文字列にはパスワードが含まれるため、`--set-env-vars` ではなく **Secret Manager + `--set-secrets`** を使うことを推奨する。
3. `cloudbuild.yaml` からフロントエンド関連のステップ(`build-frontend` / `push-frontend` / `deploy-frontend` / `get-frontend-url`)を削除し、バックエンドのみをデプロイするyamlに整理する。
4. `update-backend-cors` ステップは、参照先をCloud Runのフロントエンド決定的URLから **Vercelのドメイン** に変更する(フェーズ6参照)。フロントエンドのビルド・デプロイをVercel側のGit連携に任せる関係で、Cloud Build側でフロントエンドURLを動的計算する仕組み自体が不要になる。VercelのProduction URLは事前に固定できるため、`substitutions` に直接書ける。

## フェーズ6: フロントエンドをVercelへ

対象: Vercelダッシュボード側の設定(リポジトリ内に変更は基本不要。必要なら `frontend/vercel.json` を追加)。

1. Vercelにログインし、GitHubリポジトリ (`yuki0926`) と連携して新規プロジェクトを作成する。
2. **Root Directory** に `wine-app/frontend` を指定する(モノレポ構成のため)。
3. **Framework Preset** は "Vite" が自動検出されるはず。
   - Build Command: `npm run build`(デフォルトのまま)
   - Output Directory: `dist`(デフォルトのまま)
4. 環境変数 `VITE_API_BASE_URL` に、Cloud Runバックエンドの決定的URL(`https://wine-api-<PROJECT_NUMBER>.asia-northeast1.run.app`)を設定する。
   - Vercelは Production / Preview / Development で環境変数を分けて設定できる。**未確定事項**: Preview環境(PRごとに作られる一時URL)でも同じバックエンドを向けるか。向ける場合、バックエンドのCORSにVercelのpreviewドメインパターンを許可する必要がある(下記フェーズ7参照)。
5. デプロイを実行し、発行されたVercelのURLで動作確認する。

## フェーズ7: バックエンドCORSの許可先をVercelに変更

対象ファイル: `backend/app/main.py`

1. `CORS_ORIGINS` 環境変数(Cloud Run側)に、Vercelの本番ドメイン(例: `https://wine-web.vercel.app`、カスタムドメイン設定時はそちらも追加)を設定する。
2. Preview環境も許可する場合、既存のCodespaces向け正規表現と同様に、Vercelのpreview URLパターン用の `allow_origin_regex` を追加する(Vercelのpreview URLは `https://<project>-git-<branch>-<team>.vercel.app` の形式)。
3. Codespaces向けの既存の正規表現・環境変数はそのまま残してよい(ローカル/Codespaces開発フローに影響しないため)。

## フェーズ8: 切り替え・検証

1. VercelのURLからアプリを実際に操作し、Cloud Run上のバックエンドと通信できるか確認する(ブラウザのNetworkタブ・ConsoleタブでCORSエラーが出ていないか含めて)。
2. 一覧・詳細・入出庫登録・作成/編集フォームなど主要導線をひと通り確認する。
3. 問題がなければ、Cloud Run側のフロントエンドサービス(`wine-web`)を停止・削除し、Artifact Registry上の不要なイメージも整理してコスト削減効果を確定させる。
4. 必要であればカスタムドメインをVercel側に設定する。

## フェーズ9: ドキュメント更新

1. `CLAUDE.md` のデプロイ関連の記述を更新する(フロントエンドは「Cloud Build → Cloud Run」ではなく「Vercel Git連携」に変わる旨。ローカル/Codespacesの開発手順自体は変更不要)。
2. `ROADMAP.md` の該当項目(長期・インフラ)を完了扱いに更新する。
3. このファイル(`MIGRATION_VERCEL_SUPABASE.md`)は移行完了後、履歴として残すか削除するか判断する(実施記録として残すことを推奨)。

## 未確定・要判断事項(まとめ)

- ローカル開発時のDB接続方針(案A: SQLite併用を推奨 / 案B: Supabase統一)
- Vercel Previewデプロイからバックエンドへの疎通を許可するかどうか
- カスタムドメインを使うかどうか
- Alembic導入をこの移行と同時に行うか、切り離すか(このドキュメントでは同時実施を推奨)

## ロールバック

- データベース: `DATABASE_URL` 環境変数を元のSQLite設定に戻すだけで切り戻せる。移行前に `wine.db` をバックアップしておけば何度でもやり直せる。
- フロントエンド: Cloud Run側の `wine-web` サービスをすぐに削除せず、Vercel側の動作確認が済むまで並行稼働させておく。問題があればDNS/参照先をCloud Run側に戻すだけで良い。

## 関連ドキュメント

- `CLAUDE.md` — プロジェクト全体の実装方針・現在のインフラ構成
- `ROADMAP.md` — 実装ロードマップ(長期・インフラ項目、画像アップロードの要修正事項)
