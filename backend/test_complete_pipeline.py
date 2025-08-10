#!/usr/bin/env python3
"""
Complete Voice-to-Text to Category Prediction Pipeline Test
Tests the entire flow: Audio → Whisper → MiniLM-V2 → Amount → AI Review → Save to DB
"""

import os
import sys
from pathlib import Path
import tempfile
import wave
import numpy as np

# Add the backend directory to the path
sys.path.append(str(Path(__file__).parent))

from services.ai_processor_fixed import fixed_ai_processor

def create_test_audio(text: str, filename: str) -> str:
    """
    Create a simple test audio file (sine wave) for testing
    In real scenario, this would be actual voice recording
    """
    # Create a simple sine wave as test audio
    sample_rate = 16000
    duration = 2.0  # 2 seconds
    frequency = 440  # A4 note
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = np.sin(2 * np.pi * frequency * t)
    
    # Convert to 16-bit integers
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create temporary audio file
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    audio_path = temp_dir / filename
    
    with wave.open(str(audio_path), 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    print(f"📁 Created test audio: {audio_path}")
    return str(audio_path)

def test_ai_processor_status():
    """Test 1: Check AI processor status"""
    print("🔍 Test 1: Checking AI Processor Status")
    print("=" * 50)
    
    status = fixed_ai_processor.get_status()
    
    print(f"Device: {status['device']}")
    print(f"Whisper loaded: {status['whisper_loaded']}")
    print(f"Category model loaded: {status['category_loaded']}")
    print(f"Audio processing available: {status['audio_processing_available']}")
    print(f"Speech recognition fallback: {status['speech_recognition_fallback']}")
    
    if status['available_categories']:
        print(f"Available categories: {status['available_categories']}")
    
    print()
    return status

def test_transcription():
    """Test 2: Test audio transcription (Whisper)"""
    print("🎵 Test 2: Testing Audio Transcription")
    print("=" * 50)
    
    # Create test audio file
    test_audio = create_test_audio("I spent 50 dollars on groceries", "test_transcription.wav")
    
    try:
        transcription, success = fixed_ai_processor.transcribe_audio(test_audio)
        
        if success:
            print(f"✅ Transcription successful: '{transcription}'")
        else:
            print(f"❌ Transcription failed")
            
        # Clean up
        if os.path.exists(test_audio):
            os.remove(test_audio)
            
        print()
        return transcription, success
        
    except Exception as e:
        print(f"❌ Transcription test failed: {e}")
        print()
        return "", False

def test_classification():
    """Test 3: Test text classification (MiniLM-V2)"""
    print("🏷️ Test 3: Testing Text Classification")
    print("=" * 50)
    
    test_texts = [
        "I spent 50 dollars on groceries at the supermarket",
        "Paid 25 dollars for gas at the station",
        "Bought a laptop for 800 dollars",
        "Doctor visit cost 150 dollars",
        "Monthly rent payment of 1200 dollars",
        "Coffee and breakfast for 15 dollars"
    ]
    
    results = []
    
    for text in test_texts:
        try:
            category, confidence = fixed_ai_processor.classify_text(text)
            results.append((text, category, confidence))
            print(f"Text: '{text}'")
            print(f"Category: {category} (confidence: {confidence:.3f})")
            print("-" * 30)
        except Exception as e:
            print(f"❌ Classification failed for '{text}': {e}")
    
    print()
    return results

def test_amount_extraction():
    """Test 4: Test amount extraction"""
    print("💰 Test 4: Testing Amount Extraction")
    print("=" * 50)
    
    test_texts = [
        "I spent 50 dollars on groceries",
        "Paid $25.50 for lunch",
        "Cost was 1,200 rupees",
        "Bought for 15.99 dollars",
        "Price 100 rs",
        "Spent twenty five dollars",  # This might not work without NLP
        "No amount mentioned here"
    ]
    
    results = []
    
    for text in test_texts:
        try:
            amount, success = fixed_ai_processor.extract_amount(text)
            results.append((text, amount, success))
            print(f"Text: '{text}'")
            print(f"Amount: ${amount} (success: {success})")
            print("-" * 30)
        except Exception as e:
            print(f"❌ Amount extraction failed for '{text}': {e}")
    
    print()
    return results

def test_complete_pipeline():
    """Test 5: Test complete pipeline"""
    print("🚀 Test 5: Testing Complete Pipeline")
    print("=" * 50)
    
    # Create test audio file
    test_audio = create_test_audio("I spent 75 dollars on groceries", "test_pipeline.wav")
    
    try:
        # Run complete pipeline
        result = fixed_ai_processor.process_expense_audio(test_audio)
        
        print("Pipeline Result:")
        print(f"Description: {result['description']}")
        print(f"Category: {result['category']}")
        print(f"Amount: ${result['amount']}")
        print(f"Confidence: {result['confidence']:.3f}")
        
        # Check if it's an error
        if result['category'] == 'Error':
            print("❌ Pipeline failed with error")
        else:
            print("✅ Pipeline completed successfully")
        
        # Clean up
        if os.path.exists(test_audio):
            os.remove(test_audio)
            
        print()
        return result
        
    except Exception as e:
        print(f"❌ Complete pipeline test failed: {e}")
        print()
        return None

def test_api_integration():
    """Test 6: Test API integration simulation"""
    print("🌐 Test 6: Testing API Integration Simulation")
    print("=" * 50)
    
    # Simulate the API flow
    print("Simulating API flow:")
    print("1. Frontend sends audio file")
    print("2. Backend processes with AI")
    print("3. Returns result for AI review popup")
    print("4. User approves and saves to database")
    
    # Create test audio
    test_audio = create_test_audio("I paid 30 dollars for lunch", "test_api.wav")
    
    try:
        # Step 1: Process audio (this is what /process-voice-dry-run/ does)
        ai_result = fixed_ai_processor.process_expense_audio(test_audio)
        
        print(f"AI Result for review popup:")
        print(f"  Description: {ai_result['description']}")
        print(f"  Category: {ai_result['category']}")
        print(f"  Amount: ${ai_result['amount']}")
        
        # Step 2: Simulate user approval (this is what AiConfirmationModal does)
        if ai_result['category'] != 'Error':
            print("✅ User approves the AI result")
            print("💾 Saving to database...")
            
            # This would be the actual database save
            expense_data = {
                "amount": ai_result['amount'],
                "category": ai_result['category'],
                "description": ai_result['description'],
                "date": "2024-01-01"  # Current date
            }
            
            print(f"Database entry: {expense_data}")
            print("✅ Complete flow successful!")
        else:
            print("❌ AI processing failed, user would retry")
        
        # Clean up
        if os.path.exists(test_audio):
            os.remove(test_audio)
            
        print()
        return ai_result
        
    except Exception as e:
        print(f"❌ API integration test failed: {e}")
        print()
        return None

def main():
    """Run all tests"""
    print("🧪 Smart Expense Tracker - Complete AI Pipeline Test")
    print("=" * 60)
    print("Testing Voice → Whisper → MiniLM-V2 → Amount → AI Review → DB")
    print("=" * 60)
    print()
    
    # Run all tests
    status = test_ai_processor_status()
    
    # Only run other tests if models are loaded
    if status['whisper_loaded'] or status['speech_recognition_fallback']:
        test_transcription()
    else:
        print("⚠️ Skipping transcription test - no transcription method available")
        print()
    
    if status['category_loaded']:
        test_classification()
    else:
        print("⚠️ Skipping classification test - category model not loaded")
        print()
    
    test_amount_extraction()
    
    # Complete pipeline test
    if status['whisper_loaded'] or status['speech_recognition_fallback']:
        test_complete_pipeline()
        test_api_integration()
    else:
        print("⚠️ Skipping pipeline tests - transcription not available")
    
    print("🏁 All tests completed!")
    print()
    print("Next steps:")
    print("1. If models aren't loading, check the models/ directory")
    print("2. Install missing dependencies: pip install torch transformers librosa")
    print("3. Test with real audio files")
    print("4. Start the backend server: python -m uvicorn app.main:app --reload")
    print("5. Test the frontend voice recorder")

if __name__ == "__main__":
    main()