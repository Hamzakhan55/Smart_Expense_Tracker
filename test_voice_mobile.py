#!/usr/bin/env python3
"""
Test script to verify voice processing works for mobile app
"""
import requests
import json
from pathlib import Path

def test_voice_endpoint():
    """Test the voice processing endpoint"""
    base_url = "http://localhost:8000"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test AI status
    try:
        response = requests.get(f"{base_url}/ai-status")
        print(f"✅ AI Status: {response.json()}")
    except Exception as e:
        print(f"❌ AI status failed: {e}")
        return False
    
    # Create a dummy audio file for testing
    dummy_audio_path = Path("test_audio.wav")
    if not dummy_audio_path.exists():
        # Create a minimal WAV file (just headers, no actual audio)
        with open(dummy_audio_path, "wb") as f:
            # WAV header for 1 second of silence at 16kHz mono
            f.write(b'RIFF')
            f.write((36 + 32000).to_bytes(4, 'little'))  # File size
            f.write(b'WAVE')
            f.write(b'fmt ')
            f.write((16).to_bytes(4, 'little'))  # Subchunk1Size
            f.write((1).to_bytes(2, 'little'))   # AudioFormat (PCM)
            f.write((1).to_bytes(2, 'little'))   # NumChannels (mono)
            f.write((16000).to_bytes(4, 'little'))  # SampleRate
            f.write((32000).to_bytes(4, 'little'))  # ByteRate
            f.write((2).to_bytes(2, 'little'))   # BlockAlign
            f.write((16).to_bytes(2, 'little'))  # BitsPerSample
            f.write(b'data')
            f.write((32000).to_bytes(4, 'little'))  # Subchunk2Size
            f.write(b'\x00' * 32000)  # 1 second of silence
    
    # Test voice processing endpoint
    try:
        with open(dummy_audio_path, "rb") as audio_file:
            files = {"file": ("test.wav", audio_file, "audio/wav")}
            response = requests.post(f"{base_url}/process-voice-dry-run/", files=files)
            
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Voice processing successful: {result}")
            return True
        else:
            print(f"❌ Voice processing failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Voice processing error: {e}")
        return False
    finally:
        # Clean up test file
        if dummy_audio_path.exists():
            dummy_audio_path.unlink()

if __name__ == "__main__":
    print("🎤 Testing Voice Processing for Mobile App")
    print("=" * 50)
    
    success = test_voice_endpoint()
    
    if success:
        print("\n✅ All tests passed! Voice processing is ready for mobile app.")
    else:
        print("\n❌ Some tests failed. Check backend setup.")
        print("\nTroubleshooting:")
        print("1. Make sure backend is running: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print("2. Check if AI models are loaded properly")
        print("3. Verify network connectivity")