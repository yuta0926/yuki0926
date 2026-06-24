from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class WineBase(BaseModel):
    original_no: int | None = None
    order_date: date | None = None

    wine_type: str | None = None
    style_type: str | None = None

    name: str = Field(
        min_length=1,
        max_length=255,
    )
    name_kana: str | None = None

    country: str | None = None
    producer: str | None = None
    grape_variety: str | None = None

    vintage: int | None = Field(
        default=None,
        ge=0,
    )

    size: str | None = None

    retail_price: int | None = Field(
        default=None,
        ge=0,
    )
    purchase_price: int | None = Field(
        default=None,
        ge=0,
    )
    quantity: int = Field(
        default=0,
        ge=0,
    )
    sale_price: int | None = Field(
        default=None,
        ge=0,
    )

    location: str | None = None
    comment: str | None = None
    ai_check_status: str | None = None


class WineCreate(WineBase):
    pass


class WineUpdate(BaseModel):
    """
    ワイン更新用。

    PATCHなので、すべての項目を省略可能にする。
    """

    original_no: int | None = None
    order_date: date | None = None

    wine_type: str | None = None
    style_type: str | None = None

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    name_kana: str | None = None

    country: str | None = None
    producer: str | None = None
    grape_variety: str | None = None

    vintage: int | None = Field(
        default=None,
        ge=0,
    )

    size: str | None = None

    retail_price: int | None = Field(
        default=None,
        ge=0,
    )
    purchase_price: int | None = Field(
        default=None,
        ge=0,
    )
    quantity: int | None = Field(
        default=None,
        ge=0,
    )
    sale_price: int | None = Field(
        default=None,
        ge=0,
    )

    location: str | None = None
    comment: str | None = None
    ai_check_status: str | None = None

    @model_validator(mode="after")
    def validate_required_fields(self):
        """
        nameとquantityはDB上null不可なので、
        明示的なnull指定を拒否する。
        """

        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("nameにnullは指定できません。")

        if "quantity" in self.model_fields_set and self.quantity is None:
            raise ValueError("quantityにnullは指定できません。")

        return self


class WineResponse(WineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )

class WineListResponse(BaseModel):
    """
    ワイン一覧APIのレスポンス。
    """

    total: int
    skip: int
    limit: int
    items: list[WineResponse]