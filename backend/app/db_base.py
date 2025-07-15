# backend/app/db_base.py

from sqlalchemy.orm import declarative_base

# This is the single source of truth for our declarative base
Base = declarative_base()