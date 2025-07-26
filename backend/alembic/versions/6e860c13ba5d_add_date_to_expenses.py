"""add_date_to_expenses

Revision ID: 6e860c13ba5d
Revises: f7f050117e17
Create Date: 2025-07-25 18:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e860c13ba5d'
down_revision: Union[str, Sequence[str], None] = 'f7f050117e17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add date column to expenses table."""
    # Check if column exists first
    op.execute("""
        ALTER TABLE expenses 
        ADD COLUMN IF NOT EXISTS date DATETIME DEFAULT NOW()
    """)
    
    # Update existing records
    op.execute("UPDATE expenses SET date = NOW() WHERE date IS NULL")


def downgrade() -> None:
    """Remove date column from expenses table."""
    op.drop_column('expenses', 'date')