#!/usr/bin/env python3

import sys
from pathlib import Path
import pickle
import torch

# Test direct model loading
sys.path.append(str(Path(__file__).parent))

def test_direct_loading():
    print("Testing direct model loading...")
    
    model_path = Path(__file__).parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
    label_encoder_path = model_path / "label_encoder.pkl"
    
    try:
        from transformers import BertForSequenceClassification, XLMRobertaTokenizer
        
        print(f"Loading model from: {model_path}")
        model = BertForSequenceClassification.from_pretrained(str(model_path))
        tokenizer = XLMRobertaTokenizer.from_pretrained(str(model_path))
        
        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        
        print("Model loaded successfully!")
        print(f"Categories: {label_encoder.classes_}")
        
        # Test classification
        test_text = "bought groceries for 500 rupees"
        inputs = tokenizer(test_text, return_tensors="pt", truncation=True, padding=True)
        
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_class_id = outputs.logits.argmax().item()
            predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
        
        print(f"Test: '{test_text}' -> '{predicted_label}'")
        
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_direct_loading()