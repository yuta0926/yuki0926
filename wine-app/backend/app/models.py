from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Wine(Base):
    __tablename__ = "wines"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    original_no: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    order_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    wine_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    style_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    name_kana: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    producer: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    grape_variety: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    vintage: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    size: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    retail_price: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    purchase_price: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    sale_price: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    management_code: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    reserved_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_check_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction",
        back_populates="wine",
        cascade="all, delete-orphan",
        order_by="InventoryTransaction.transaction_at.desc()",
    )


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    wine_id: Mapped[int] = mapped_column(
        ForeignKey("wines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    transaction_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    from_location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    to_location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    operated_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    transaction_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    wine: Mapped["Wine"] = relationship(
        "Wine",
        back_populates="transactions",
    )