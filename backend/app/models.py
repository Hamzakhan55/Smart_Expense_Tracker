from sqlalchemy import Column, Integer, String, Float, Date
from .database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    expense_date = Column(Date, nullable=False)