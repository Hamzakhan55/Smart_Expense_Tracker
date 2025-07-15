# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, Date
from datetime import date

# CHANGE THIS LINE:
from .db_base import Base # Import from our new file

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    
    
    # Use the date object for the expense date
    expense_date = Column(Date, default=date.today, nullable=False)