#!/usr/bin/env python3
"""
Install audio dependencies for better transcription
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")
        return False

def main():
    print("🔧 Installing Audio Dependencies for Better Transcription")
    print("=" * 60)
    
    # Essential packages for audio processing
    packages = [
        "SpeechRecognition",
        "pydub", 
        "pyaudio",
        "librosa",
        "soundfile"
    ]
    
    for package in packages:
        print(f"\nInstalling {package}...")
        install_package(package)
    
    print("\n🎵 Testing audio capabilities...")
    
    # Test imports
    try:
        import speech_recognition as sr
        print("✅ SpeechRecognition working")
    except ImportError:
        print("❌ SpeechRecognition not working")
    
    try:
        from pydub import AudioSegment
        print("✅ PyDub working")
    except ImportError:
        print("❌ PyDub not working")
    
    try:
        import pyaudio
        print("✅ PyAudio working")
    except ImportError:
        print("❌ PyAudio not working - microphone recording may fail")
    
    try:
        import librosa
        print("✅ Librosa working")
    except ImportError:
        print("❌ Librosa not working")
    
    print("\n📋 Next steps:")
    print("1. Test transcription: python test_transcription_fix.py")
    print("2. Start backend: python -m uvicorn app.main:app --reload")
    print("3. Test voice recording in frontend")

if __name__ == "__main__":
    main()