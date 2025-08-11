#!/usr/bin/env python3
"""
Test script for category prediction model
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pathlib import Path

def test_category_model():
    # Model path
    model_path = Path("models/distilbert-expense/checkpoint-3072")
    
    # Load model and tokenizer
    print("Loading model...")
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
    
    # Test cases
    test_texts = [
        "I have given you a pizza for Rs. 2000",
        "going from karachi to islamabad i spent 300 rupees", 
        "ordered pizza from shop for 200 rupees",
        "book a car for 4500 rupees",
        "paid electricity bill 7200 rupees",
        "grocery shopping",
        "monthly rent payment",
        "doctor visit",
        "movie tickets",
        "stock investment",
        "baby toys",
        "give 400 rupees to a poor man"
    ]
    
    print("\n=== Testing Category Predictions ===")
    
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
    test_category_model()