#!/usr/bin/env python3
"""
Setup script for Smart Expense Tracker AI Pipeline
Verifies models, dependencies, and provides setup instructions
"""

import os
import sys
from pathlib import Path
import subprocess
import importlib.util

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    else:
        print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
        return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n📦 Checking dependencies...")
    
    required_packages = [
        ("torch", "PyTorch"),
        ("transformers", "Hugging Face Transformers"),
        ("librosa", "Librosa (audio processing)"),
        ("sklearn", "Scikit-learn"),
        ("speech_recognition", "SpeechRecognition"),
        ("pydub", "PyDub (audio conversion)"),
        ("fastapi", "FastAPI"),
        ("sqlalchemy", "SQLAlchemy")
    ]
    
    missing_packages = []
    
    for package, description in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {description}")
        except ImportError:
            print(f"❌ {description} - NOT INSTALLED")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements_complete.txt")
        return False
    else:
        print("✅ All dependencies installed")
        return True

def check_models():
    """Check if AI models are present"""
    print("\n🧠 Checking AI models...")
    
    base_path = Path(__file__).parent
    models_path = base_path / "models"
    
    # Check Whisper model
    whisper_path = models_path / "whisper-large-v3"
    if whisper_path.exists():
        print("✅ Whisper model found")
        whisper_ok = True
    else:
        print("❌ Whisper model NOT FOUND")
        print(f"Expected location: {whisper_path}")
        whisper_ok = False
    
    # Check MiniLM-V2 model
    minilm_path = models_path / "MiniLM-V2" / "fine-tuned-minilm-advanced"
    label_encoder_path = minilm_path / "label_encoder.pkl"
    
    if minilm_path.exists() and label_encoder_path.exists():
        print("✅ MiniLM-V2 category model found")
        minilm_ok = True
    else:
        print("❌ MiniLM-V2 category model NOT FOUND")
        print(f"Expected location: {minilm_path}")
        print(f"Label encoder: {label_encoder_path}")
        minilm_ok = False
    
    return whisper_ok, minilm_ok

def check_audio_system():
    """Check audio system capabilities"""
    print("\n🎵 Checking audio system...")
    
    try:
        import pyaudio
        print("✅ PyAudio available (microphone support)")
        pyaudio_ok = True
    except ImportError:
        print("⚠️ PyAudio not available (microphone recording may not work)")
        print("Install with: pip install pyaudio")
        pyaudio_ok = False
    
    try:
        import librosa
        print("✅ Librosa available (audio processing)")
        librosa_ok = True
    except ImportError:
        print("❌ Librosa not available")
        librosa_ok = False
    
    try:
        import speech_recognition
        print("✅ SpeechRecognition available (fallback transcription)")
        sr_ok = True
    except ImportError:
        print("❌ SpeechRecognition not available")
        sr_ok = False
    
    return pyaudio_ok, librosa_ok, sr_ok

def test_ai_processor():
    """Test the AI processor"""
    print("\n🧪 Testing AI processor...")
    
    try:
        from services.ai_processor_fixed import fixed_ai_processor
        
        # Get status
        status = fixed_ai_processor.get_status()
        
        print(f"Device: {status['device']}")
        print(f"Whisper loaded: {status['whisper_loaded']}")
        print(f"Category model loaded: {status['category_loaded']}")
        
        if status['whisper_loaded'] and status['category_loaded']:
            print("✅ AI processor fully functional")
            return True
        elif status['whisper_loaded'] or status['category_loaded']:
            print("⚠️ AI processor partially functional")
            return True
        else:
            print("❌ AI processor not functional")
            return False
            
    except Exception as e:
        print(f"❌ AI processor test failed: {e}")
        return False

def provide_setup_instructions():
    """Provide setup instructions"""
    print("\n📋 Setup Instructions")
    print("=" * 50)
    
    print("\n1. Install Dependencies:")
    print("   cd backend")
    print("   pip install -r requirements_complete.txt")
    
    print("\n2. Download Models:")
    print("   For Whisper (speech-to-text):")
    print("   - Download whisper-large-v3 model")
    print("   - Place in: backend/models/whisper-large-v3/")
    
    print("\n   For Category Classification:")
    print("   - Your trained MiniLM-V2 model")
    print("   - Place in: backend/models/MiniLM-V2/fine-tuned-minilm-advanced/")
    print("   - Include label_encoder.pkl file")
    
    print("\n3. Test the Pipeline:")
    print("   python test_complete_pipeline.py")
    
    print("\n4. Start the Backend:")
    print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print("\n5. Test Voice Recording:")
    print("   - Open frontend application")
    print("   - Use voice recorder button")
    print("   - Check AI review popup")
    print("   - Approve and save to database")

def main():
    """Main setup verification"""
    print("🚀 Smart Expense Tracker AI Pipeline Setup")
    print("=" * 50)
    
    # Check system requirements
    python_ok = check_python_version()
    deps_ok = check_dependencies()
    whisper_ok, minilm_ok = check_models()
    pyaudio_ok, librosa_ok, sr_ok = check_audio_system()
    
    print("\n📊 System Status Summary")
    print("=" * 30)
    print(f"Python version: {'✅' if python_ok else '❌'}")
    print(f"Dependencies: {'✅' if deps_ok else '❌'}")
    print(f"Whisper model: {'✅' if whisper_ok else '❌'}")
    print(f"Category model: {'✅' if minilm_ok else '❌'}")
    print(f"Audio system: {'✅' if (pyaudio_ok and librosa_ok) else '⚠️'}")
    
    # Test AI processor if possible
    if deps_ok:
        ai_ok = test_ai_processor()
        print(f"AI processor: {'✅' if ai_ok else '❌'}")
    
    # Determine overall status
    if python_ok and deps_ok and whisper_ok and minilm_ok:
        print("\n🎉 System is ready for AI pipeline!")
        print("Run: python test_complete_pipeline.py")
    elif python_ok and deps_ok:
        print("\n⚠️ System partially ready - missing models")
        print("Download the required models and try again")
    else:
        print("\n❌ System not ready")
        provide_setup_instructions()
    
    print("\n" + "=" * 50)
    print("For detailed setup help, see the instructions above")

if __name__ == "__main__":
    main()