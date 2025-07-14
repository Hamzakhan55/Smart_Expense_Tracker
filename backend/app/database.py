import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load the environment variables from our .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# This is the main "engine" that connects SQLAlchemy to our database
engine = create_engine(DATABASE_URL)

# This creates a class that we can use to create database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# We will inherit from this class to create each of the database models
Base = declarative_base()