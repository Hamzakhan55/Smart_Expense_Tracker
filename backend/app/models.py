from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base

__all__ = ["User", "Expense", "Income", "MonthlySummary", "Budget", "Goal", "NetWorth", "Asset", "Liability"]


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    date = Column(DateTime, default=datetime.now, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)



    

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False) 
    description = Column(String(255), nullable=True)
    income_date = Column(DateTime, default=datetime.now, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


    
    @property
    def date(self):
        return self.income_date

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Integer, default=1)

class MonthlySummary(Base):
    __tablename__ = "monthly_summaries"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    total_income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # cash, savings, investment, property
    current_value = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date_added = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")

class Liability(Base):
    __tablename__ = "liabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # loan, credit_card, mortgage
    current_amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date_added = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")

class NetWorth(Base):
    __tablename__ = "net_worth_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    total_assets = Column(Float, nullable=False)
    total_liabilities = Column(Float, nullable=False)
    net_worth = Column(Float, nullable=False)
    snapshot_date = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")