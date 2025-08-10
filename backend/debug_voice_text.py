#!/usr/bin/env python3
"""
Debug script to compare voice transcription vs direct text classification
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pathlib import Path

def test_exact_text():
    # Model path
    model_path = Path("models/distilbert-expense/checkpoint-3072")
    
    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
    model.eval()
    
    # Category mapping
    id2label = {
        "0": "Charity & Donations",
        "1": "Education",
        "2": "Electronics & Gadgets",
        "3": "Entertainment",
        "4": "Family & Kids",
        "5": "Food & Drinks",
        "6": "Healthcare",
        "7": "Investments",
        "8": "Other",
        "9": "Rent",
        "10": "Shopping",
        "11": "Transport",
        "12": "Utilities & Bills"
    }
    
    # Test the exact transcription from voice
    test_texts = [
        "Buy books for 4000 rupees",  # Voice transcription
        " Buy books for 4000 rupees", # With leading space
        "buy books for 4000 rupees",  # Lowercase
        "Buy books for school",       # Without amount
        "books for education"         # Simple version
    ]
    
    print("=== Debugging Voice vs Text Classification ===")
    
    for text in test_texts:
        # Tokenize
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        
        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
            predicted_id = torch.argmax(outputs.logits, dim=1).item()
            confidence = probabilities[0][predicted_id].item()
        
        predicted_category = id2label.get(str(predicted_id), "Unknown")
        
        print(f"Text: '{text}'")
        print(f"Predicted: {predicted_category} (confidence: {confidence:.3f})")
        
        # Show top 3 predictions
        top_3 = torch.topk(probabilities[0], 3)
        print("Top 3:")
        for i, (prob, idx) in enumerate(zip(top_3.values, top_3.indices)):
            cat = id2label.get(str(idx.item()), "Unknown")
            print(f"  {i+1}. {cat}: {prob.item():.3f}")
        print("-" * 50)

if __name__ == "__main__":
    test_exact_text()