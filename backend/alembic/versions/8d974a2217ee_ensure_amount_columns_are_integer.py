"""ensure_amount_columns_are_integer

Revision ID: 8d974a2217ee
Revises: 8481f5e43cfc
Create Date: 2025-07-25 18:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d974a2217ee'
down_revision: Union[str, Sequence[str], None] = '8481f5e43cfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ensure amount columns are INTEGER type."""
    op.execute("ALTER TABLE expenses MODIFY COLUMN amount INT NOT NULL")
    op.execute("ALTER TABLE incomes MODIFY COLUMN amount INT NOT NULL")


def downgrade() -> None:
    """Revert to previous types."""
    pass