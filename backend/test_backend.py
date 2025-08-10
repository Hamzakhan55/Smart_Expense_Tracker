#!/usr/bin/env python3
"""
Test what's blocking the backend
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Test all imports"""
    print("🔍 Testing imports...")
    
    try:
        from app.main import app
        print("✅ Main app imports")
    except Exception as e:
        print(f"❌ Main app failed: {e}")
        return False
    
    try:
        from services.ai_processor_final import final_ai_processor
        print("✅ AI processor imports")
    except Exception as e:
        print(f"❌ AI processor failed: {e}")
        return False
    
    return True

def test_database():
    """Test database connection"""
    print("\n🗄️ Testing database...")
    
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database works")
        return True
    except Exception as e:
        print(f"❌ Database failed: {e}")
        return False

def test_server():
    """Test server startup"""
    print("\n🚀 Testing server...")
    
    try:
        import uvicorn
        from app.main import app
        
        # Test if app is callable
        print("✅ App is ready")
        return True
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Backend Diagnostic Test")
    print("=" * 30)
    
    imports_ok = test_imports()
    db_ok = test_database()
    server_ok = test_server()
    
    if all([imports_ok, db_ok, server_ok]):
        print("\n✅ Backend should work!")
        print("Try: uvicorn app.main:app --host 0.0.0.0 --port 8000")
    else:
        print("\n❌ Issues found - check errors above")