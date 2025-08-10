#!/usr/bin/env python3
"""
Simple backend start without AI loading
"""

import uvicorn
import sys
from pathlib import Path

# Add path
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    print("🚀 Starting Backend (Simple Mode)")
    print("Server: http://127.0.0.1:8000")
    print("=" * 40)
    
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Server failed: {e}")
        print("\nTry manual start:")
        print("uvicorn app.main:app --host 127.0.0.1 --port 8000")