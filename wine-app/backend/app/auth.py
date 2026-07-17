import os
from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(auto_error=False)


def _supabase_url() -> str:
    url = os.getenv("SUPABASE_URL")

    if not url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="認証機能が設定されていません。",
        )

    return url.rstrip("/")


@lru_cache(maxsize=1)
def _jwk_client(supabase_url: str) -> jwt.PyJWKClient:
    """
    Supabase Auth(JWT Signing Keys)の公開鍵セットをJWKSエンドポイントから取得するクライアント。

    Supabaseはトークン署名にES256(非対称鍵)を使うため、従来のJWT Secret(共有鍵)
    ではなくこのJWKSで検証する。鍵はPyJWKClient内でkid単位にキャッシュされる。
    """

    return jwt.PyJWKClient(
        f"{supabase_url}/auth/v1/.well-known/jwks.json",
    )


def get_current_admin(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> dict[str, Any]:
    """
    Supabase AuthのJWTを検証し、app_metadata.role=adminのユーザーのみ通す。
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証が必要です。",
        )

    supabase_url = _supabase_url()

    try:
        signing_key = _jwk_client(supabase_url).get_signing_key_from_jwt(
            credentials.credentials,
        )

        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="トークンが無効です。",
        )

    role = (payload.get("app_metadata") or {}).get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です。",
        )

    return payload
