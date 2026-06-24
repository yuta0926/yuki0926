import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routers import wines


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wine Stocker API",
    version="0.1.0",
)


def get_allowed_origins() -> list[str]:
    default_origins = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    origins_text = os.getenv(
        "CORS_ORIGINS",
        default_origins,
    )

    return [
        origin.strip()
        for origin in origins_text.split(",")
        if origin.strip()
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wines.router)


@app.get("/")
def health_check():
    return {
        "message": "Wine Stocker API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "database": "sqlite",
    }