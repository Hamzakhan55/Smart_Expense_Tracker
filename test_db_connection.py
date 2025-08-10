import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    try:
        conn = pymysql.connect(
            host='localhost',
            port=3307,
            user='root',
            password='',
            database='expense_tracker_db'
        )
        print("✅ Connection successful!")
        
        # Test basic query
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"📋 Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_connection()