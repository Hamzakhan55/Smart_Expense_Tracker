#!/usr/bin/env python3

import sys
from pathlib import Path
import pickle
import numpy as np

sys.path.append(str(Path(__file__).parent))

def check_model_training_sequence():
    """Check the exact sequence and categories the model was trained on"""
    
    print("CHECKING MODEL TRAINING SEQUENCE")
    print("=" * 50)
    
    # Load label encoder to see exact categories and their order
    try:
        label_encoder_path = Path(__file__).parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced" / "label_encoder.pkl"
        
        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        
        print("Label Encoder Information:")
        print(f"Type: {type(label_encoder)}")
        print(f"Classes: {label_encoder.classes_}")
        print(f"Number of categories: {len(label_encoder.classes_)}")
        
        print("\nCategory Sequence (Training Order):")
        for i, category in enumerate(label_encoder.classes_):
            print(f"{i:2d}: {category}")
        
        # Check if there are any additional attributes
        print(f"\nLabel Encoder Attributes:")
        for attr in dir(label_encoder):
            if not attr.startswith('_'):
                try:
                    value = getattr(label_encoder, attr)
                    if not callable(value):
                        print(f"  {attr}: {value}")
                except:
                    pass
        
        return label_encoder.classes_
        
    except Exception as e:
        print(f"Error loading label encoder: {e}")
        return None

def check_backend_category_mapping():
    """Check how backend maps categories"""
    
    print("\n" + "=" * 50)
    print("BACKEND CATEGORY MAPPING")
    print("=" * 50)
    
    try:
        from services.ai_processor_local import AIProcessor
        
        processor = AIProcessor()
        
        # Test with known examples to see actual mapping
        test_cases = [
            "phone bill payment 500",
            "credit card bill 2000", 
            "laptop purchase 50000",
            "amazon shopping 1500",
            "gas cylinder 900"
        ]
        
        print("Current Backend Classification:")
        for text in test_cases:
            if processor.category_model:
                category = processor.classify_text(text)
                print(f"'{text}' -> {category}")
            else:
                print("Model not loaded")
                break
        
        # Check keyword mapping
        print(f"\nKeyword Classification Fallback:")
        for text in test_cases:
            category = processor._classify_keywords(text)
            print(f"'{text}' -> {category}")
            
    except Exception as e:
        print(f"Error checking backend: {e}")

def analyze_model_vs_backend():
    """Analyze discrepancies between model training and backend usage"""
    
    print("\n" + "=" * 50)
    print("MODEL vs BACKEND ANALYSIS")
    print("=" * 50)
    
    # Get model categories
    model_categories = check_model_training_sequence()
    
    if model_categories is not None:
        print(f"\nModel was trained on these {len(model_categories)} categories:")
        for i, cat in enumerate(model_categories):
            print(f"  {i}: {cat}")
        
        # Check backend expected categories
        backend_categories = [
            "Food & Drinks", "Transport", "Utilities", "Shopping", 
            "Electronics & Gadgets", "Healthcare", "Education", "Rent", 
            "Bills", "Entertainment", "Investments", "Personal Care", 
            "Family & Kids", "Charity & Donations", "Miscellaneous"
        ]
        
        print(f"\nBackend expects these {len(backend_categories)} categories:")
        for i, cat in enumerate(backend_categories):
            print(f"  {i}: {cat}")
        
        # Find mismatches
        model_set = set(model_categories)
        backend_set = set(backend_categories)
        
        print(f"\nCATEGORY ANALYSIS:")
        print(f"Categories in both: {model_set & backend_set}")
        print(f"Only in model: {model_set - backend_set}")
        print(f"Only in backend: {backend_set - model_set}")
        
        # Check if there's exact match
        if model_set == backend_set:
            print("✓ Perfect match between model and backend categories")
        else:
            print("✗ Mismatch detected between model and backend categories")
    
    check_backend_category_mapping()

if __name__ == "__main__":
    analyze_model_vs_backend()