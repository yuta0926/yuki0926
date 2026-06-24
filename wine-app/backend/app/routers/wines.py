from typing import Annotated, Literal

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Wine
from app.schemas import (
    WineCreate,
    WineListResponse,
    WineResponse,
    WineUpdate,
)


router = APIRouter(
    prefix="/api/wines",
    tags=["wines"],
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

    if (
        min_sale_price is not None
        and max_sale_price is not None
        and min_sale_price > max_sale_price
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "min_sale_priceは"
                "max_sale_price以下にしてください。"
            ),
        )

    filters = []

    # キーワード検索
    if keyword:
        normalized_keyword = keyword.strip()

        if normalized_keyword:
            keyword_pattern = f"%{normalized_keyword}%"

            filters.append(
                or_(
                    Wine.name.ilike(keyword_pattern),
                    Wine.name_kana.ilike(keyword_pattern),
                    Wine.producer.ilike(keyword_pattern),
                    Wine.country.ilike(keyword_pattern),
                    Wine.grape_variety.ilike(keyword_pattern),
                    Wine.comment.ilike(keyword_pattern),
                )
            )

    # 完全一致による絞り込み
    if wine_type:
        filters.append(
            Wine.wine_type == wine_type,
        )

    if style_type:
        filters.append(
            Wine.style_type == style_type,
        )

    if country:
        filters.append(
            Wine.country == country,
        )

    if vintage is not None:
        filters.append(
            Wine.vintage == vintage,
        )

    if location:
        filters.append(
            Wine.location == location,
        )

    # 部分一致による絞り込み
    if producer:
        filters.append(
            Wine.producer.ilike(
                f"%{producer.strip()}%",
            )
        )

    if grape_variety:
        filters.append(
            Wine.grape_variety.ilike(
                f"%{grape_variety.strip()}%",
            )
        )

    # 売価範囲
    if min_sale_price is not None:
        filters.append(
            Wine.sale_price >= min_sale_price,
        )

    if max_sale_price is not None:
        filters.append(
            Wine.sale_price <= max_sale_price,
        )

    # 在庫有無
    if in_stock is True:
        filters.append(
            Wine.quantity > 0,
        )

    elif in_stock is False:
        filters.append(
            Wine.quantity == 0,
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
) -> Wine:
    """
    IDを指定してワインを1件取得する。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    return wine


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

    for field_name, value in update_data.items():
        setattr(
            wine,
            field_name,
            value,
        )

    db.commit()
    db.refresh(wine)

    return wine


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

    db.delete(wine)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )