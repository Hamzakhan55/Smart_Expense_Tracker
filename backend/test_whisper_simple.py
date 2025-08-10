#!/usr/bin/env python3

import sys
from pathlib import Path
import numpy as np
import time

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def test_whisper_model():
    print("Testing Whisper model...")
    
    whisper_path = Path(__file__).parent / "models" / "whisper-large-v3"
    
    print(f"Model path: {whisper_path}")
    print(f"Model exists: {whisper_path.exists()}")
    
    if whisper_path.exists():
        print(f"Model files: {list(whisper_path.glob('*'))}")
    
    # Test loading
    try:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        
        processor = WhisperProcessor.from_pretrained(str(whisper_path))
        model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
        model.eval()
        
        print("Whisper model loaded successfully")
        print(f"Model type: {type(model)}")
        print(f"Processor type: {type(processor)}")
        
        # Test with synthetic audio
        print("Testing with synthetic audio...")
        sample_rate = 16000
        duration = 2  # 2 seconds
        audio_array = np.random.normal(0, 0.01, sample_rate * duration).astype(np.float32)
        
        start_time = time.time()
        input_features = processor(audio_array, sampling_rate=sample_rate, return_tensors="pt").input_features
        
        with torch.no_grad():
            predicted_ids = model.generate(input_features)
            transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        inference_time = time.time() - start_time
        
        print(f"Inference time: {inference_time:.3f} seconds")
        print(f"Transcription result: '{transcription}'")
        print("Whisper model test: SUCCESS")
        
    except Exception as e:
        print(f"Whisper model loading failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import torch
    test_whisper_model()