# backend/app/config.py

from dotenv import load_dotenv
import os

# Load the .env file from the project root
# The path points two levels up from this file (app -> backend -> root)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Load the database URL from the environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Basic check to ensure the variable was loaded
if DATABASE_URL is None:
    print("Error: DATABASE_URL environment variable not found.")
    print("Please check your .env file in the project root.")
    exit(1)