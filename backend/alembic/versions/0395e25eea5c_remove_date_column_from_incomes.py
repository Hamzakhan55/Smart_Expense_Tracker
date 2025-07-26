"""remove_date_column_from_incomes

Revision ID: 0395e25eea5c
Revises: dec9f2c771f9
Create Date: 2025-07-25 18:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0395e25eea5c'
down_revision: Union[str, Sequence[str], None] = 'dec9f2c771f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove the extra date column from incomes table."""
    op.drop_column('incomes', 'date')


def downgrade() -> None:
    """Add back the date column."""
    op.add_column('incomes', sa.Column('date', sa.DateTime(), nullable=True))