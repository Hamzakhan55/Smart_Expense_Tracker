#!/usr/bin/env python3
"""
Check MySQL database connection and data
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

def check_mysql_connection():
    """Check if MySQL is running and accessible"""
    print("🔍 Checking MySQL connection...")
    
    try:
        import pymysql
        
        # Test connection
        connection = pymysql.connect(
            host='localhost',
            port=3307,
            user='root',
            password='',
            database='expense_tracker_db'
        )
        
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL connected: {version[0]}")
        
        # Check tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"📊 Tables found: {len(tables)}")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Check users
        try:
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"👥 Users: {user_count}")
        except:
            print("⚠️ No users table found")
        
        # Check expenses
        try:
            cursor.execute("SELECT COUNT(*) FROM expenses")
            expense_count = cursor.fetchone()[0]
            print(f"💰 Expenses: {expense_count}")
        except:
            print("⚠️ No expenses table found")
        
        connection.close()
        return True
        
    except ImportError:
        print("❌ PyMySQL not installed")
        print("Install: pip install pymysql")
        return False
        
    except Exception as e:
        print(f"❌ MySQL connection failed: {e}")
        print("Check if MySQL is running on port 3307")
        return False

def fix_env_for_mysql():
    """Update .env to use MySQL"""
    print("\n🔧 Setting up for MySQL...")
    
    env_content = 'DATABASE_URL="mysql+pymysql://root:@localhost:3307/expense_tracker_db"'
    
    with open("../.env", "w") as f:
        f.write(env_content)
    
    print("✅ .env updated for MySQL")

def install_mysql_deps():
    """Install MySQL dependencies"""
    print("\n📦 Installing MySQL dependencies...")
    
    import subprocess
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pymysql"])
        print("✅ PyMySQL installed")
    except:
        print("❌ Failed to install PyMySQL")

def main():
    print("🗄️ MySQL Database Check")
    print("=" * 30)
    
    # Install dependencies
    install_mysql_deps()
    
    # Check connection
    if check_mysql_connection():
        print("\n🎉 MySQL database is ready!")
        fix_env_for_mysql()
        print("\nStart backend with: python start_server_fixed.py")
    else:
        print("\n❌ MySQL not accessible")
        print("\nOptions:")
        print("1. Start MySQL server on port 3307")
        print("2. Use XAMPP/WAMP and start MySQL")
        print("3. Switch to SQLite: change .env to sqlite:///./expense_tracker.db")

if __name__ == "__main__":
    main()