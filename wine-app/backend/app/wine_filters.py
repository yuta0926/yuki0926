from fastapi import HTTPException, status
from sqlalchemy import ColumnElement, or_

from app.models import Wine


def build_common_wine_filters(
    *,
    keyword: str | None,
    wine_type: str | None,
    style_type: str | None,
    country: str | None,
    producer: str | None,
    grape_variety: str | None,
    vintage: int | None,
    min_sale_price: int | None,
    max_sale_price: int | None,
    in_stock: bool | None,
) -> list[ColumnElement[bool]]:
    """
    管理者向け・顧客向け一覧で共通の絞り込み条件を組み立てる。

    保管場所(location)による絞り込みは管理者向けのみで使うため、
    ここには含めない。
    """

    filters: list[ColumnElement[bool]] = []

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

    if wine_type:
        filters.append(Wine.wine_type == wine_type)

    if style_type:
        filters.append(Wine.style_type == style_type)

    if country:
        filters.append(Wine.country == country)

    if vintage is not None:
        filters.append(Wine.vintage == vintage)

    if producer:
        filters.append(
            Wine.producer.ilike(f"%{producer.strip()}%"),
        )

    if grape_variety:
        filters.append(
            Wine.grape_variety.ilike(f"%{grape_variety.strip()}%"),
        )

    if min_sale_price is not None:
        filters.append(Wine.sale_price >= min_sale_price)

    if max_sale_price is not None:
        filters.append(Wine.sale_price <= max_sale_price)

    if in_stock is True:
        filters.append(Wine.quantity > 0)
    elif in_stock is False:
        filters.append(Wine.quantity == 0)

    return filters


def validate_price_range(
    min_price: int | None,
    max_price: int | None,
    *,
    field_label: str = "sale_price",
) -> None:
    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"min_{field_label}はmax_{field_label}以下にしてください。",
        )
