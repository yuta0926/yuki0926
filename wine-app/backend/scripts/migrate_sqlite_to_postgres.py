"""
SQLiteの既存データ(backend/wine.db)をSupabase Postgresへ移行するワンショットスクリプト。

事前準備:
  1. backend/wine.db をバックアップしておく(例: cp wine.db wine.db.bak)。
  2. Postgres側のスキーマを先に作成しておく(`alembic upgrade head` を
     DATABASE_URL=<Supabase接続文字列> で実行済みであること)。

実行方法(backendディレクトリから):
  DATABASE_URL="postgresql://...supabase接続文字列..." \
    python -m scripts.migrate_sqlite_to_postgres

SQLite側のパスを変えたい場合は SQLITE_PATH 環境変数で上書きできる
(未指定時は backend/wine.db を使う)。

このスクリプトは追記(if_exists="append")のみを行う。既にPostgres側に
同名テーブルへ行が入っている状態で再実行すると重複が発生するため、
やり直す場合はPostgres側のテーブルを空にしてから実行すること。
"""

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

TABLES = ["wines", "inventory_transactions"]


def main() -> None:
    postgres_url = os.environ["DATABASE_URL"]
    if postgres_url.startswith("postgresql://") or postgres_url.startswith("postgres://"):
        postgres_url = postgres_url.split("://", 1)[1]
        postgres_url = f"postgresql+psycopg://{postgres_url}"

    backend_dir = Path(__file__).resolve().parent.parent
    sqlite_path = os.getenv("SQLITE_PATH", str(backend_dir / "wine.db"))
    sqlite_url = f"sqlite:///{sqlite_path}"

    sqlite_engine = create_engine(sqlite_url)
    postgres_engine = create_engine(postgres_url)

    with sqlite_engine.connect() as sqlite_conn, postgres_engine.begin() as postgres_conn:
        for table in TABLES:
            df = pd.read_sql_table(table, sqlite_conn)
            print(f"{table}: {len(df)} rows read from SQLite")

            df.to_sql(table, postgres_conn, if_exists="append", index=False)
            print(f"{table}: {len(df)} rows written to Postgres")

            if len(df) > 0:
                max_id = int(df["id"].max())
                postgres_conn.execute(
                    text(
                        f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), :max_id)"
                    ),
                    {"max_id": max_id},
                )
                print(f"{table}: id sequence advanced to {max_id}")

    print("Migration complete.")


if __name__ == "__main__":
    main()
