import logging
import os
import uuid

import httpx


logger = logging.getLogger(__name__)


CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _supabase_url() -> str | None:
    url = os.getenv("SUPABASE_URL")
    return url.rstrip("/") if url else None


def _service_role_key() -> str | None:
    return os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def _bucket() -> str:
    return os.getenv("SUPABASE_STORAGE_BUCKET", "wine-images")


def is_storage_configured() -> bool:
    return bool(_supabase_url() and _service_role_key())


def _public_url_prefix() -> str | None:
    supabase_url = _supabase_url()

    if not supabase_url:
        return None

    return f"{supabase_url}/storage/v1/object/public/{_bucket()}/"


def upload_image(content: bytes, content_type: str) -> str:
    """
    画像をSupabase Storageにアップロードし、公開URLを返す。

    呼び出し前に is_storage_configured() で設定済みであることを
    確認しておくこと。
    """

    supabase_url = _supabase_url()
    service_role_key = _service_role_key()
    bucket = _bucket()

    extension = CONTENT_TYPE_EXTENSIONS[content_type]
    object_path = f"wines/{uuid.uuid4().hex}{extension}"

    response = httpx.post(
        f"{supabase_url}/storage/v1/object/{bucket}/{object_path}",
        content=content,
        headers={
            "Authorization": f"Bearer {service_role_key}",
            "apikey": service_role_key,
            "Content-Type": content_type,
        },
        timeout=30.0,
    )
    response.raise_for_status()

    return f"{_public_url_prefix()}{object_path}"


def delete_image(url: str) -> None:
    """
    このアプリが管理するバケット配下の画像であればベストエフォートで削除する。

    失敗しても呼び出し元の処理は止めない。
    """

    if not is_storage_configured():
        logger.warning(
            "Supabase Storage未設定のため画像削除をスキップしました: url=%s",
            url,
        )
        return

    prefix = _public_url_prefix()

    if not prefix or not url.startswith(prefix):
        logger.warning(
            "画像URLがバケットのプレフィックスと一致しないため削除をスキップしました: "
            "url=%s prefix=%s",
            url,
            prefix,
        )
        return

    object_path = url[len(prefix) :]

    try:
        response = httpx.request(
            "DELETE",
            f"{_supabase_url()}/storage/v1/object/{_bucket()}",
            json={"prefixes": [object_path]},
            headers={
                "Authorization": f"Bearer {_service_role_key()}",
                "apikey": _service_role_key(),
            },
            timeout=30.0,
        )

        if response.status_code >= 400:
            logger.error(
                "Supabase Storageからの画像削除に失敗しました: "
                "status=%s body=%s object_path=%s",
                response.status_code,
                response.text,
                object_path,
            )
        else:
            logger.info(
                "Supabase Storageから画像を削除しました: object_path=%s",
                object_path,
            )
    except httpx.HTTPError:
        logger.exception(
            "Supabase Storageへの画像削除リクエストが失敗しました: object_path=%s",
            object_path,
        )
