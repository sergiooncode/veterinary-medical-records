"""add run_status to processing run

Revision ID: aea5d2e3e4f4
Revises: d8052f692db3
Create Date: 2025-12-17 07:30:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "aea5d2e3e4f4"
down_revision: Union[str, None] = "d8052f692db3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "document_processing_runs",
        sa.Column(
            "run_status",
            sa.String(),
            nullable=False,
            server_default="uploaded",
        ),
    )


def downgrade() -> None:
    op.drop_column("document_processing_runs", "run_status")


