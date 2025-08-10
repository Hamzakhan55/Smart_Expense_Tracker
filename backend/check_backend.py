#!/usr/bin/env python3
"""
Quick backend diagnostic
"""

import sys
import os
from pathlib import Path

def check_basic_imports():
    """Check if basic imports work"""
    print("🔍 Checking imports...")
    
    try:
        import fastapi
        print("✅ FastAPI")
    except ImportError as e:
        print(f"❌ FastAPI: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn")
    except ImportError as e:
        print(f"❌ Uvicorn: {e}")
        return False
    
    try:
        import sqlalchemy
        print("✅ SQLAlchemy")
    except ImportError as e:
        print(f"❌ SQLAlchemy: {e}")
        return False
    
    return True

def check_app_structure():
    """Check if app files exist"""
    print("\n📁 Checking app structure...")
    
    app_path = Path("app")
    required_files = ["main.py", "database.py", "models.py", "crud.py"]
    
    if not app_path.exists():
        print("❌ app/ directory not found")
        return False
    
    for file in required_files:
        file_path = app_path / file
        if file_path.exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} missing")
            return False
    
    return True

def check_database():
    """Check database"""
    print("\n💾 Checking database...")
    
    db_files = ["expense_tracker.db", "app/expense_tracker.db"]
    
    for db_file in db_files:
        if Path(db_file).exists():
            print(f"✅ Database found: {db_file}")
            return True
    
    print("⚠️ No database found - will create new one")
    return True

def test_import_main():
    """Test importing main app"""
    print("\n🚀 Testing main app import...")
    
    try:
        sys.path.append(str(Path.cwd()))
        from app.main import app
        print("✅ Main app imports successfully")
        return True
    except Exception as e:
        print(f"❌ Main app import failed: {e}")
        return False

def main():
    print("🔧 Backend Diagnostic")
    print("=" * 30)
    
    # Change to backend directory if not already there
    if not Path("app").exists():
        backend_path = Path("backend")
        if backend_path.exists():
            os.chdir(backend_path)
            print(f"📂 Changed to: {Path.cwd()}")
        else:
            print("❌ Cannot find backend directory")
            return
    
    imports_ok = check_basic_imports()
    structure_ok = check_app_structure()
    db_ok = check_database()
    main_ok = test_import_main()
    
    print("\n📊 Summary:")
    print(f"Imports: {'✅' if imports_ok else '❌'}")
    print(f"Structure: {'✅' if structure_ok else '❌'}")
    print(f"Database: {'✅' if db_ok else '❌'}")
    print(f"Main app: {'✅' if main_ok else '❌'}")
    
    if all([imports_ok, structure_ok, main_ok]):
        print("\n🎉 Backend should work!")
        print("Start with: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("\n❌ Fix the issues above first")
        
        if not imports_ok:
            print("Install: pip install fastapi uvicorn sqlalchemy")
        
        if not structure_ok:
            print("Check if you're in the right directory")

if __name__ == "__main__":
    main()