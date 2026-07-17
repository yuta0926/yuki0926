from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Wine
from app.schemas import WineCustomerListResponse, WineCustomerResponse
from app.wine_filters import build_common_wine_filters, validate_price_range


router = APIRouter(
    prefix="/api/public/wines",
    tags=["public-wines"],
)


DbSession = Annotated[Session, Depends(get_db)]

PublicSortField = Literal[
    "id",
    "name",
    "vintage",
    "sale_price",
]

SortOrder = Literal[
    "asc",
    "desc",
]


@router.get(
    "",
    response_model=WineCustomerListResponse,
)
def get_public_wines(
    db: DbSession,

    keyword: Annotated[
        str | None,
        Query(
            max_length=100,
            description=(
                "ワイン名、カナ、生産者、国、品種を"
                "部分一致で検索します。"
            ),
        ),
    ] = None,

    wine_type: Annotated[
        str | None,
        Query(max_length=50, description="赤、白、オレンジ、ロゼなど"),
    ] = None,

    style_type: Annotated[
        str | None,
        Query(max_length=50, description="Classic、ナチュールなど"),
    ] = None,

    country: Annotated[
        str | None,
        Query(max_length=100, description="生産国"),
    ] = None,

    producer: Annotated[
        str | None,
        Query(max_length=255, description="生産者名の部分一致"),
    ] = None,

    grape_variety: Annotated[
        str | None,
        Query(max_length=255, description="品種の部分一致"),
    ] = None,

    vintage: Annotated[
        int | None,
        Query(ge=0, description="ヴィンテージ"),
    ] = None,

    min_sale_price: Annotated[
        int | None,
        Query(ge=0, description="売価の下限"),
    ] = None,

    max_sale_price: Annotated[
        int | None,
        Query(ge=0, description="売価の上限"),
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

    sort_by: Annotated[
        PublicSortField,
        Query(description="並び替え対象"),
    ] = "id",

    sort_order: Annotated[
        SortOrder,
        Query(description="ascまたはdesc"),
    ] = "desc",

    skip: Annotated[
        int,
        Query(ge=0, description="取得開始位置"),
    ] = 0,

    limit: Annotated[
        int,
        Query(ge=1, le=500, description="取得件数"),
    ] = 20,
) -> WineCustomerListResponse:
    """
    顧客向けワイン一覧を検索する(認証不要)。

    仕入値・在庫本数・保管場所などの社内向け情報は返さない。
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

    count_statement = (
        select(func.count())
        .select_from(Wine)
        .where(*filters)
    )

    total = db.scalar(count_statement) or 0

    sort_columns = {
        "id": Wine.id,
        "name": Wine.name,
        "vintage": Wine.vintage,
        "sale_price": Wine.sale_price,
    }

    sort_column = sort_columns[sort_by]

    order_expression = (
        sort_column.asc()
        if sort_order == "asc"
        else sort_column.desc()
    )

    statement = (
        select(Wine)
        .where(*filters)
        .order_by(order_expression, Wine.id.desc())
        .offset(skip)
        .limit(limit)
    )

    wines = db.scalars(statement).all()

    return WineCustomerListResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=list(wines),
    )


@router.get(
    "/{wine_id}",
    response_model=WineCustomerResponse,
)
def get_public_wine(
    wine_id: int,
    db: DbSession,
) -> Wine:
    """
    顧客向けワイン詳細を取得する(認証不要)。
    """

    wine = db.get(Wine, wine_id)

    if wine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたワインが見つかりません。",
        )

    return wine
