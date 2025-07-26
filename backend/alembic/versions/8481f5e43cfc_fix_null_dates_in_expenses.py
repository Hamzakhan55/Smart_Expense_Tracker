"""fix_null_dates_in_expenses

Revision ID: 8481f5e43cfc
Revises: 0395e25eea5c
Create Date: 2025-07-25 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8481f5e43cfc'
down_revision: Union[str, Sequence[str], None] = '0395e25eea5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Fix NULL dates in expenses table."""
    op.execute("UPDATE expenses SET date = NOW() WHERE date IS NULL")


def downgrade() -> None:
    """No downgrade needed."""
    pass