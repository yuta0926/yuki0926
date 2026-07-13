import os
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# backendディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# backend/wine.db にSQLiteファイルを作成
DATABASE_PATH = BASE_DIR / "wine.db"


def _build_database_url() -> str:
    """
    DATABASE_URL未設定時はローカルSQLiteにフォールバックする。
    Supabaseダッシュボードが払い出す postgresql:// / postgres:// のURLは、
    psycopg(v3)ドライバを使うために postgresql+psycopg:// へ正規化する。
    """
    raw_url = os.getenv("DATABASE_URL")

    if not raw_url:
        return f"sqlite:///{DATABASE_PATH}"

    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)

    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)

    return raw_url


DATABASE_URL = _build_database_url()

connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPIの各リクエストで利用するDBセッション。
    リクエスト終了時に必ずセッションを閉じる。
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()