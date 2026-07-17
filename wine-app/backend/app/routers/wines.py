from typing import Annotated, Literal

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import storage
from app.auth import get_current_admin
from app.database import get_db
from app.models import InventoryTransaction, Wine
from app.schemas import (
    InventoryTransactionCreate,
    InventoryTransactionResponse,
    WineCreate,
    WineImportError,
    WineImportResult,
    WineListResponse,
    WineResponse,
    WineUpdate,
)
from app.wine_filters import build_common_wine_filters, validate_price_range
from app.wine_import import parse_import_workbook


MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024


router = APIRouter(
    prefix="/api/wines",
    tags=["wines"],
    dependencies=[Depends(get_current_admin)],
)


DbSession = Annotated[Session, Depends(get_db)]

SortField = Literal[
    "id",
    "name",
    "vintage",
    "sale_price",
    "quantity",
    "created_at",
]

SortOrder = Literal[
    "asc",
    "desc",
]

def find_duplicate_wine(
    db: Session,
    *,
    name: str,
    producer: str | None,
    vintage: int | None,
    size: str | None,
    location: str | None,
    exclude_id: int | None = None,
) -> Wine | None:
    """
    同一ワインが登録されているか確認する。

    同一判定項目:
    ・ワイン名
    ・生産者
    ・ヴィンテージ
    ・サイズ
    ・保管場所
    """

    statement = select(Wine).where(
        Wine.name == name,
        Wine.producer == producer,
        Wine.vintage == vintage,
        Wine.size == size,
        Wine.location == location,
    )

    # 更新時は、自分自身を重複判定から除外する
    if exclude_id is not None:
        statement = statement.where(
            Wine.id != exclude_id,
        )

    return db.scalar(statement)


def build_wine_response(
    db: Session,
    wine: Wine,
) -> WineResponse:
    """
    直近の入出庫履歴を最大10件埋め込んだワインレスポンスを組み立てる。
    """

    recent_transactions = db.scalars(
        select(InventoryTransaction)
        .where(InventoryTransaction.wine_id == wine.id)
        .order_by(InventoryTransaction.transaction_at.desc())
        .limit(10)
    ).all()

    response = WineResponse.model_validate(wine)
    response.recent_transactions = [
        InventoryTransactionResponse.model_validate(transaction)
        for transaction in recent_transactions
    ]

    return response


@router.post(
    "",
    response_model=WineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_wine(
    wine_data: WineCreate,
    db: DbSession,
) -> Wine:
    """
    ワインを1件登録する。
    """

    duplicate_wine = find_duplicate_wine(
        db,
        name=wine_data.name,
        producer=wine_data.producer,
        vintage=wine_data.vintage,
        size=wine_data.size,
        location=wine_data.location,
    )

    if duplicate_wine is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="同じワインが既に登録されています。",
        )

    wine = Wine(
        **wine_data.model_dump(),
    )

    db.add(wine)
    db.commit()
    db.refresh(wine)

    return wine


@router.post(
    "/import",
    response_model=WineImportResult,
    status_code=status.HTTP_201_CREATED,
)
async def import_wines(
    db: DbSession,
    file: UploadFile = File(...),
) -> WineImportResult:
    """
    Excel(WineListシート)からワインを一括登録する。

    名前が空欄の行・値が不正な行・重複するワインの行はスキップし、
    有効な行だけを登録する。スキップした行はerrorsに理由とともに返す。
    """

    content = await file.read()

    if len(content) > MAX_IMPORT_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ファイルサイズが上限(10MB)を超えています。",
        )

    try:
        parsed_rows, errors = parse_import_workbook(content)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    seen_identities: set[
        tuple[str, str | None, int | None, str | None, str | None]
    ] = set()

    created_count = 0

    for row_number, wine_data in parsed_rows:
        identity = (
            wine_data.name,
            wine_data.producer,
            wine_data.vintage,
            wine_data.size,
            wine_data.location,
        )

        if identity in seen_identities:
            errors.append(
                WineImportError(
                    row=row_number,
                    message=(
                        "ファイル内に同一のワイン"
                        "(ワイン名・生産者・ヴィンテージ・サイズ・"
                        "保管場所の組み合わせ)が複数あります。"
                    ),
                )
            )
            continue

        duplicate_wine = find_duplicate_wine(
            db,
            name=wine_data.name,
            producer=wine_data.producer,
            vintage=wine_data.vintage,
            size=wine_data.size,
            location=wine_data.location,
        )

        if duplicate_wine is not None:
            errors.append(
                WineImportError(
                    row=row_number,
                    message="同じワインが既に登録されています。",
                )
            )
            continue

        seen_identities.add(identity)
        db.add(Wine(**wine_data.model_dump()))
        created_count += 1

    db.commit()

    return WineImportResult(
        created_count=created_count,
        skipped_count=len(errors),
        errors=errors,
    )


@router.get(
    "",
    response_model=WineListResponse,
)
def get_wines(
    db: DbSession,

    # 全文キーワード検索
    keyword: Annotated[
        str | None,
        Query(
            max_length=100,
            description=(
                "ワイン名、カナ、生産者、国、品種、コメントを"
                "部分一致で検索します。"
            ),
        ),
    ] = None,

    # 個別条件
    wine_type: Annotated[
        str | None,
        Query(
            max_length=50,
            description="赤、白、オレンジ、ロゼなど",
        ),
    ] = None,

    style_type: Annotated[
        str | None,
        Query(
            max_length=50,
            description="Classic、ナチュールなど",
        ),
    ] = None,

    country: Annotated[
        str | None,
        Query(
            max_length=100,
            description="生産国",
        ),
    ] = None,

    producer: Annotated[
        str | None,
        Query(
            max_length=255,
            description="生産者名の部分一致",
        ),
    ] = None,

    grape_variety: Annotated[
        str | None,
        Query(
            max_length=255,
            description="品種の部分一致",
        ),
    ] = None,

    vintage: Annotated[
        int | None,
        Query(
            ge=0,
            description="ヴィンテージ",
        ),
    ] = None,

    location: Annotated[
        str | None,
        Query(
            max_length=100,
            description="横浜、駒沢などの保管場所",
        ),
    ] = None,

    min_sale_price: Annotated[
        int | None,
        Query(
            ge=0,
            description="売価の下限",
        ),
    ] = None,

    max_sale_price: Annotated[
        int | None,
        Query(
            ge=0,
            description="売価の上限",
        ),
    ] = None,

    in_stock: Annotated[
        bool | None,
        Query(
            description=(
                "trueなら在庫あり、falseなら在庫なし、"
                "未指定なら両方"
            ),
        ),
    ] = None,

    # 並び替え
    sort_by: Annotated[
        SortField,
        Query(
            description="並び替え対象",
        ),
    ] = "id",

    sort_order: Annotated[
        SortOrder,
        Query(
            description="ascまたはdesc",
        ),
    ] = "desc",

    # ページング
    skip: Annotated[
        int,
        Query(
            ge=0,
            description="取得開始位置",
        ),
    ] = 0,

    limit: Annotated[
        int,
        Query(
            ge=1,
            le=500,
            description="取得件数",
        ),
    ] = 20,
) -> WineListResponse:
    """
    ワイン一覧を検索する。
    """

    validate_price_range(min_sale_price, max_sale_price)

    filters = build_common_wine_filters(
        keyword=keyword,
        wine_type=wine_type,
        style_type=style_type,
        country=country,
        producer=producer,
        grape_variety=grape_variety,
        vintage=vintage,
        min_sale_price=min_sale_price,
        max_sale_price=max_sale_price,
        in_stock=in_stock,
    )

    # 保管場所による絞り込み(管理者向けのみ)
    if location:
        filters.append(
            Wine.location == location,
        )

    # 総件数取得
    count_statement = (
        select(func.count())
        .select_from(Wine)
        .where(*filters)
    )

    total = db.scalar(count_statement) or 0

    # 並び替え対象のカラム
    sort_columns = {
        "id": Wine.id,
        "name": Wine.name,
        "vintage": Wine.vintage,
        "sale_price": Wine.sale_price,
        "quantity": Wine.quantity,
        "created_at": Wine.created_at,
    }

    sort_column = sort_columns[sort_by]

    if sort_order == "asc":
        order_expression = sort_column.asc()
    else:
        order_expression = sort_column.desc()

    # 一覧取得
    statement = (
        select(Wine)
        .where(*filters)
        .order_by(order_expression, Wine.id.desc())
        .offset(skip)
        .limit(limit)
    )

    wines = db.scalars(statement).all()

    return WineListResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=list(wines),
    )

@router.get(
    "/{wine_id}",
    response_model=WineResponse,
)
def get_wine(
    wine_id: int,
    db: DbSession,
) -> WineResponse:
    """
    IDを指定してワインを1件取得する。

    直近の入出庫履歴を最大10件、詳細レスポンスに埋め込む。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    return build_wine_response(db, wine)


@router.patch(
    "/{wine_id}",
    response_model=WineResponse,
)
def update_wine(
    wine_id: int,
    wine_data: WineUpdate,
    db: DbSession,
) -> Wine:
    """
    ワインの指定された項目だけを更新する。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    update_data = wine_data.model_dump(
        exclude_unset=True,
    )

    # 重複判定に関係する項目
    identity_fields = {
        "name",
        "producer",
        "vintage",
        "size",
        "location",
    }

    # 同一判定項目が変更される場合だけ重複確認する
    if identity_fields.intersection(update_data.keys()):
        new_name = update_data.get(
            "name",
            wine.name,
        )
        new_producer = update_data.get(
            "producer",
            wine.producer,
        )
        new_vintage = update_data.get(
            "vintage",
            wine.vintage,
        )
        new_size = update_data.get(
            "size",
            wine.size,
        )
        new_location = update_data.get(
            "location",
            wine.location,
        )

        duplicate_wine = find_duplicate_wine(
            db,
            name=new_name,
            producer=new_producer,
            vintage=new_vintage,
            size=new_size,
            location=new_location,
            exclude_id=wine.id,
        )

        if duplicate_wine is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="変更後の内容と同じワインが既に登録されています。",
            )

    previous_image_url = wine.image_url

    for field_name, value in update_data.items():
        setattr(
            wine,
            field_name,
            value,
        )

    db.commit()
    db.refresh(wine)

    # 画像が差し替え・削除された場合、古い画像をベストエフォートで削除する
    if (
        "image_url" in update_data
        and previous_image_url
        and previous_image_url != wine.image_url
    ):
        storage.delete_image(previous_image_url)

    return wine


@router.post(
    "/{wine_id}/transactions",
    response_model=WineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_wine_transaction(
    wine_id: int,
    transaction_data: InventoryTransactionCreate,
    db: DbSession,
) -> WineResponse:
    """
    入庫/出庫/移動/調整を記録し、在庫数・保管場所へ反映する。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    transaction_type = transaction_data.transaction_type
    quantity = transaction_data.quantity

    from_location = transaction_data.from_location
    to_location = transaction_data.to_location

    if transaction_type == "in":
        wine.quantity += quantity
        to_location = to_location or wine.location

    elif transaction_type == "out":
        if quantity > wine.quantity:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="出庫数量が在庫数を超えています。",
            )

        wine.quantity -= quantity
        from_location = from_location or wine.location

    elif transaction_type == "move":
        if wine.quantity == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="在庫がないため移動できません。",
            )

        # 保管場所は1本ごとではなくワイン単位で管理しているため、
        # 移動は現在庫すべてを対象として扱う。
        quantity = wine.quantity
        from_location = from_location or wine.location
        wine.location = to_location

    elif transaction_type == "adjust":
        wine.quantity = quantity

    transaction = InventoryTransaction(
        wine_id=wine.id,
        transaction_type=transaction_type,
        quantity=quantity,
        from_location=from_location,
        to_location=to_location,
        note=transaction_data.note,
        operated_by=transaction_data.operated_by,
    )

    db.add(transaction)
    db.commit()
    db.refresh(wine)

    return build_wine_response(db, wine)


@router.delete(
    "/{wine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_wine(
    wine_id: int,
    db: DbSession,
) -> Response:
    """
    ワインを1件削除する。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    image_url = wine.image_url

    db.delete(wine)
    db.commit()

    if image_url:
        storage.delete_image(image_url)

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )