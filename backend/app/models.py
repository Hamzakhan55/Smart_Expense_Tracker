from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from .database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    date = Column(DateTime, default=datetime.now, nullable=False)
    

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False) 
    description = Column(String(255), nullable=True)
    income_date = Column(DateTime, default=datetime.now, nullable=False)