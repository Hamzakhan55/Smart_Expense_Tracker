"""rename_expense_date_to_income_date

Revision ID: dec9f2c771f9
Revises: 6e860c13ba5d
Create Date: 2025-07-25 18:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dec9f2c771f9'
down_revision: Union[str, Sequence[str], None] = '6e860c13ba5d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename expense_date to income_date in incomes table."""
    op.execute("ALTER TABLE incomes CHANGE expense_date income_date DATETIME NOT NULL")


def downgrade() -> None:
    """Rename income_date back to expense_date."""
    op.execute("ALTER TABLE incomes CHANGE income_date expense_date DATETIME NOT NULL")