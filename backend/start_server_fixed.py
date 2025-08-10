#!/usr/bin/env python3
"""
Fixed server startup
"""

import uvicorn
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    print("🚀 Starting Smart Expense Tracker Backend...")
    print("📡 Server will be available at: http://127.0.0.1:8000")
    print("📡 API docs at: http://127.0.0.1:8000/docs")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )