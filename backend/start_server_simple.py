#!/usr/bin/env python3
"""
Simple server startup script to avoid socket buffer issues
"""
import uvicorn
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    """Start the FastAPI server with optimized settings"""
    print("Starting Smart Expense Tracker Backend...")
    print(f"Backend directory: {backend_dir}")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Server configuration optimized for Windows
    config = {
        "app": "app.main:app",
        "host": "127.0.0.1",
        "port": 8000,
        "reload": False,  # Disable reload to avoid socket issues
        "workers": 1,     # Single worker to avoid conflicts
        "log_level": "info",
        "access_log": True,
        "loop": "asyncio",  # Use asyncio loop
        "http": "h11",      # Use h11 HTTP implementation
    }
    
    try:
        print(f"Server starting on http://{config['host']}:{config['port']}")
        print("Press Ctrl+C to stop the server")
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()