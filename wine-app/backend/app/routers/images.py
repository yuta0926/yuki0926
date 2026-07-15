import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app import storage
from app.schemas import ImageUploadResponse


router = APIRouter(
    prefix="/api/images",
    tags=["images"],
)


MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


@router.post(
    "",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    file: UploadFile = File(...),
) -> ImageUploadResponse:
    """
    ワイン画像をSupabase Storageにアップロードし、公開URLを返す。
    """

    if not storage.is_storage_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="画像アップロード機能は現在利用できません。",
        )

    if file.content_type not in storage.CONTENT_TYPE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="対応していない画像形式です(jpeg/png/webpのみ)。",
        )

    content = await file.read()

    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="画像サイズが上限(5MB)を超えています。",
        )

    try:
        url = storage.upload_image(content, file.content_type)
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="画像のアップロードに失敗しました。時間をおいて再度お試しください。",
        )

    return ImageUploadResponse(url=url)
