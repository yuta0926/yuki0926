from datetime import date, datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    computed_field,
    model_validator,
)


TransactionType = Literal["in", "out", "move", "adjust"]


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
    management_code: str | None = None
    reserved_quantity: int = Field(
        default=0,
        ge=0,
    )
    image_url: str | None = None
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
    management_code: str | None = None
    reserved_quantity: int | None = Field(
        default=None,
        ge=0,
    )
    image_url: str | None = None
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


class InventoryTransactionCreate(BaseModel):
    transaction_type: TransactionType
    quantity: int = Field(gt=0)
    from_location: str | None = None
    to_location: str | None = None
    note: str | None = None
    operated_by: str | None = None

    @model_validator(mode="after")
    def validate_locations(self):
        """
        moveは在庫の保管場所を切り替える操作なので、移動先が必須。
        """

        if self.transaction_type == "move" and not self.to_location:
            raise ValueError("移動には移動先の保管場所を指定してください。")

        return self


class InventoryTransactionResponse(BaseModel):
    id: int
    transaction_type: TransactionType
    quantity: int
    from_location: str | None = None
    to_location: str | None = None
    note: str | None = None
    operated_by: str | None = None
    transaction_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class WineResponse(WineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    recent_transactions: list[InventoryTransactionResponse] = []

    model_config = ConfigDict(
        from_attributes=True,
    )

    @computed_field
    @property
    def available_quantity(self) -> int:
        return self.quantity - (self.reserved_quantity or 0)


class WineListResponse(BaseModel):
    """
    ワイン一覧APIのレスポンス。
    """

    total: int
    skip: int
    limit: int
    items: list[WineResponse]