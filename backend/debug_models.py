#!/usr/bin/env python3

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    print("Testing imports...")
    try:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        print("✓ Whisper imports successful")
    except ImportError as e:
        print("✗ Whisper import failed:", e)
        return False

    try:
        from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
        print("✓ DistilBERT imports successful")
    except ImportError as e:
        print("✗ DistilBERT import failed:", e)
        return False

    try:
        import torch
        print("✓ PyTorch available")
    except ImportError as e:
        print("✗ PyTorch import failed:", e)
        return False
    
    return True

def test_model_paths():
    print("\nTesting model paths...")
    base_path = Path(__file__).parent / "models"
    
    whisper_path = base_path / "whisper-large-v3"
    distilbert_path = base_path / "distilbert-base-uncased-mnli" / "my_model"
    label_encoder_path = base_path / "distilbert-base-uncased-mnli" / "label_encoder.pkl"
    
    print(f"Base models path: {base_path}")
    print(f"Whisper path exists: {whisper_path.exists()} - {whisper_path}")
    print(f"DistilBERT path exists: {distilbert_path.exists()} - {distilbert_path}")
    print(f"Label encoder exists: {label_encoder_path.exists()} - {label_encoder_path}")
    
    if whisper_path.exists():
        print(f"Whisper files: {list(whisper_path.glob('*'))}")
    
    if distilbert_path.exists():
        print(f"DistilBERT files: {list(distilbert_path.glob('*'))}")

def test_model_loading():
    print("\nTesting model loading...")
    
    if not test_imports():
        return
    
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
    import pickle
    
    base_path = Path(__file__).parent / "models"
    
    # Test Whisper loading
    try:
        whisper_path = base_path / "whisper-large-v3"
        if whisper_path.exists():
            print(f"Loading Whisper from: {whisper_path}")
            processor = WhisperProcessor.from_pretrained(str(whisper_path))
            model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
            print("✓ Whisper model loaded successfully")
        else:
            print("✗ Whisper path does not exist")
    except Exception as e:
        print(f"✗ Whisper loading failed: {e}")
    
    # Test DistilBERT loading
    try:
        distilbert_path = base_path / "distilbert-base-uncased-mnli" / "my_model"
        label_encoder_path = base_path / "distilbert-base-uncased-mnli" / "label_encoder.pkl"
        
        if distilbert_path.exists() and label_encoder_path.exists():
            print(f"Loading DistilBERT from: {distilbert_path}")
            tokenizer = DistilBertTokenizerFast.from_pretrained(str(distilbert_path))
            model = DistilBertForSequenceClassification.from_pretrained(str(distilbert_path))
            
            with open(label_encoder_path, "rb") as f:
                label_encoder = pickle.load(f)
            
            print("✓ DistilBERT model loaded successfully")
        else:
            print("✗ DistilBERT paths do not exist")
    except Exception as e:
        print(f"✗ DistilBERT loading failed: {e}")

if __name__ == "__main__":
    test_model_paths()
    test_model_loading()