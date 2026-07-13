"""initial schema

Revision ID: ce16d0a43505
Revises: 
Create Date: 2026-07-13 13:24:02.157958

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce16d0a43505'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "wines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("original_no", sa.Integer(), nullable=True),
        sa.Column("order_date", sa.Date(), nullable=True),
        sa.Column("wine_type", sa.String(length=50), nullable=True),
        sa.Column("style_type", sa.String(length=50), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("name_kana", sa.String(length=255), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("producer", sa.String(length=255), nullable=True),
        sa.Column("grape_variety", sa.String(length=255), nullable=True),
        sa.Column("vintage", sa.Integer(), nullable=True),
        sa.Column("size", sa.String(length=50), nullable=True),
        sa.Column("retail_price", sa.Integer(), nullable=True),
        sa.Column("purchase_price", sa.Integer(), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("sale_price", sa.Integer(), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("management_code", sa.String(length=50), nullable=True),
        sa.Column(
            "reserved_quantity",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("ai_check_status", sa.String(length=50), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(op.f("ix_wines_id"), "wines", ["id"], unique=False)
    op.create_index(op.f("ix_wines_name"), "wines", ["name"], unique=False)
    op.create_index(op.f("ix_wines_country"), "wines", ["country"], unique=False)
    op.create_index(op.f("ix_wines_producer"), "wines", ["producer"], unique=False)
    op.create_index(op.f("ix_wines_location"), "wines", ["location"], unique=False)

    op.create_table(
        "inventory_transactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "wine_id",
            sa.Integer(),
            sa.ForeignKey("wines.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("transaction_type", sa.String(length=20), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("from_location", sa.String(length=100), nullable=True),
        sa.Column("to_location", sa.String(length=100), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("operated_by", sa.String(length=100), nullable=True),
        sa.Column(
            "transaction_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        op.f("ix_inventory_transactions_id"),
        "inventory_transactions",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_inventory_transactions_wine_id"),
        "inventory_transactions",
        ["wine_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_inventory_transactions_wine_id"),
        table_name="inventory_transactions",
    )
    op.drop_index(
        op.f("ix_inventory_transactions_id"),
        table_name="inventory_transactions",
    )
    op.drop_table("inventory_transactions")

    op.drop_index(op.f("ix_wines_location"), table_name="wines")
    op.drop_index(op.f("ix_wines_producer"), table_name="wines")
    op.drop_index(op.f("ix_wines_country"), table_name="wines")
    op.drop_index(op.f("ix_wines_name"), table_name="wines")
    op.drop_index(op.f("ix_wines_id"), table_name="wines")
    op.drop_table("wines")
