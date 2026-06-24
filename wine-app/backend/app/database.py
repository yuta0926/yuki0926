from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# backendディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# backend/wine.db にSQLiteファイルを作成
DATABASE_PATH = BASE_DIR / "wine.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
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