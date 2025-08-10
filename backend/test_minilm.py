#!/usr/bin/env python3

import sys
from pathlib import Path
import pickle

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def test_minilm_model():
    print("Testing MiniLM-V2 model...")
    
    model_path = Path(__file__).parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
    label_encoder_path = model_path / "label_encoder.pkl"
    
    print(f"Model path: {model_path}")
    print(f"Model exists: {model_path.exists()}")
    print(f"Label encoder exists: {label_encoder_path.exists()}")
    
    if model_path.exists():
        print(f"Model files: {list(model_path.glob('*'))}")
    
    # Test loading
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        
        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
        
        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        
        print("Model loaded successfully")
        print(f"Categories: {label_encoder.classes_}")
        
        # Test classification
        test_text = "bought groceries for 500 rupees"
        inputs = tokenizer(test_text, return_tensors="pt", truncation=True, padding=True)
        
        import torch
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_class_id = outputs.logits.argmax().item()
            predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
        
        print(f"Test classification: '{test_text}' -> '{predicted_label}'")
        
    except Exception as e:
        print(f"Model loading failed: {e}")

if __name__ == "__main__":
    test_minilm_model()