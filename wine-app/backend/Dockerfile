FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./

RUN pip install \
    --no-cache-dir \
    -r requirements.txt

COPY app ./app

# 進捗共有用に既存のSQLiteを含める場合
COPY wine.db ./wine.db

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]