#!/usr/bin/env python3
"""
Optimized startup script for Smart Expense Tracker backend
Includes performance monitoring and faster AI model loading
"""

import uvicorn
import asyncio
import time
from pathlib import Path
import sys

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def main():
    print("🚀 Starting Smart Expense Tracker (Optimized)")
    print("=" * 50)
    
    # Pre-load AI models in background
    print("📦 Pre-loading AI models...")
    start_time = time.time()
    
    try:
        from services.ai_processor_optimized import optimized_ai_processor
        
        # Wait for models to load (with timeout)
        timeout = 30
        while not optimized_ai_processor._models_loaded and (time.time() - start_time) < timeout:
            await asyncio.sleep(0.5)
            print(".", end="", flush=True)
        
        if optimized_ai_processor._models_loaded:
            load_time = time.time() - start_time
            print(f"\n✅ Models loaded in {load_time:.2f}s")
            
            # Show status
            status = optimized_ai_processor.get_status()
            print(f"🎤 Whisper: {'✅' if status['whisper_available'] else '❌'}")
            print(f"🏷️ Category: {'✅' if status['category_available'] else '❌'}")
            print(f"🎯 Speech Recognition: {'✅' if status['sr_available'] else '❌'}")
        else:
            print(f"\n⚠️ Models still loading after {timeout}s - server will start anyway")
    
    except Exception as e:
        print(f"\n❌ Error loading models: {e}")
        print("Server will start with fallback processing")
    
    print("\n🌐 Starting FastAPI server...")
    print("📍 URL: http://localhost:8000")
    print("📊 Status: http://localhost:8000/ai-status")
    print("🏥 Health: http://localhost:8000/health")
    print("=" * 50)
    
    # Start the server
    config = uvicorn.Config(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload for better performance
        workers=1,     # Single worker for model sharing
        log_level="info",
        access_log=False  # Disable access logs for better performance
    )
    
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())