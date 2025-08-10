#!/usr/bin/env python3

import sys
from pathlib import Path
import pickle
import torch
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import numpy as np

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def evaluate_minilm_accuracy():
    """Comprehensive accuracy evaluation for MiniLM-V2 model"""
    print("=" * 70)
    print("MINILM-V2 MODEL ACCURACY EVALUATION")
    print("=" * 70)
    
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        
        model_path = Path(__file__).parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
        label_encoder_path = model_path / "label_encoder.pkl"
        
        print("Loading MiniLM-V2 model...")
        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
        
        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        
        model.eval()
        
        print(f"Model loaded successfully!")
        print(f"Categories: {list(label_encoder.classes_)}")
        print(f"Number of categories: {len(label_encoder.classes_)}")
        
        # Comprehensive test dataset
        test_cases = [
            # Food & Drinks
            {"text": "bought groceries for 500 rupees", "expected": "Food & Drinks"},
            {"text": "restaurant dinner with friends 1200", "expected": "Food & Drinks"},
            {"text": "coffee at starbucks 300", "expected": "Food & Drinks"},
            {"text": "pizza delivery 800", "expected": "Food & Drinks"},
            {"text": "lunch at office canteen 150", "expected": "Food & Drinks"},
            
            # Transport
            {"text": "uber ride to office 150", "expected": "Transport"},
            {"text": "bus ticket to home 50", "expected": "Transport"},
            {"text": "petrol for car 2000", "expected": "Transport"},
            {"text": "metro card recharge 500", "expected": "Transport"},
            {"text": "taxi fare 200", "expected": "Transport"},
            
            # Utilities
            {"text": "paid electricity bill 2000", "expected": "Utilities"},
            {"text": "water bill payment 800", "expected": "Utilities"},
            {"text": "gas cylinder 900", "expected": "Utilities"},
            {"text": "internet bill 1500", "expected": "Utilities"},
            {"text": "mobile phone bill 600", "expected": "Utilities"},
            
            # Shopping
            {"text": "bought new shirt 800", "expected": "Shopping"},
            {"text": "shopping at mall 3000", "expected": "Shopping"},
            {"text": "amazon purchase 1500", "expected": "Shopping"},
            {"text": "clothes shopping 2500", "expected": "Shopping"},
            {"text": "shoes purchase 1800", "expected": "Shopping"},
            
            # Healthcare
            {"text": "doctor visit 1000", "expected": "Healthcare"},
            {"text": "medicine from pharmacy 500", "expected": "Healthcare"},
            {"text": "dental checkup 2000", "expected": "Healthcare"},
            {"text": "hospital bill 5000", "expected": "Healthcare"},
            {"text": "health insurance 3000", "expected": "Healthcare"},
            
            # Rent
            {"text": "monthly rent payment 15000", "expected": "Rent"},
            {"text": "house rent 20000", "expected": "Rent"},
            {"text": "apartment rental 18000", "expected": "Rent"},
            
            # Education
            {"text": "college fees 50000", "expected": "Education"},
            {"text": "book purchase 400", "expected": "Education"},
            {"text": "online course fee 2000", "expected": "Education"},
            {"text": "school supplies 800", "expected": "Education"},
            
            # Bills
            {"text": "phone bill payment 500", "expected": "Bills"},
            {"text": "credit card bill 8000", "expected": "Bills"},
            {"text": "insurance premium 5000", "expected": "Bills"},
            
            # Entertainment
            {"text": "movie tickets 600", "expected": "Entertainment"},
            {"text": "netflix subscription 500", "expected": "Entertainment"},
            {"text": "concert tickets 2000", "expected": "Entertainment"},
            
            # Electronics & Gadgets
            {"text": "new smartphone 25000", "expected": "Electronics & Gadgets"},
            {"text": "laptop purchase 60000", "expected": "Electronics & Gadgets"},
            {"text": "headphones 3000", "expected": "Electronics & Gadgets"},
        ]
        
        print(f"\nTesting with {len(test_cases)} comprehensive test cases...")
        print("=" * 70)
        
        predictions = []
        actuals = []
        correct_predictions = 0
        
        # Test each case
        for i, test_case in enumerate(test_cases, 1):
            text = test_case["text"]
            expected = test_case["expected"]
            
            # Tokenize and predict
            inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            
            with torch.no_grad():
                outputs = model(**inputs)
                predicted_class_id = outputs.logits.argmax().item()
                predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
            
            predictions.append(predicted_label)
            actuals.append(expected)
            
            is_correct = predicted_label == expected
            if is_correct:
                correct_predictions += 1
            
            status = "CORRECT" if is_correct else "WRONG"
            print(f"{i:2d}. {status:7} | '{text[:35]:<35}' -> {predicted_label:<20} | Expected: {expected}")
        
        # Calculate overall accuracy
        accuracy = correct_predictions / len(test_cases)
        
        print("\n" + "=" * 70)
        print("ACCURACY RESULTS")
        print("=" * 70)
        print(f"Overall Accuracy: {accuracy:.2%} ({correct_predictions}/{len(test_cases)})")
        
        # Category-wise performance
        category_stats = {}
        for actual, predicted in zip(actuals, predictions):
            if actual not in category_stats:
                category_stats[actual] = {"correct": 0, "total": 0}
            category_stats[actual]["total"] += 1
            if actual == predicted:
                category_stats[actual]["correct"] += 1
        
        print(f"\nCategory-wise Performance:")
        print("-" * 50)
        for category, stats in sorted(category_stats.items()):
            cat_accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            print(f"{category:<25}: {cat_accuracy:6.1%} ({stats['correct']:2d}/{stats['total']:2d})")
        
        # Confusion matrix for most common categories
        common_categories = [cat for cat, stats in category_stats.items() if stats["total"] >= 3]
        if len(common_categories) > 1:
            print(f"\nConfusion Matrix (for categories with 3+ samples):")
            print("-" * 50)
            
            # Filter predictions and actuals for common categories
            filtered_actuals = [a for a in actuals if a in common_categories]
            filtered_predictions = [p for a, p in zip(actuals, predictions) if a in common_categories]
            
            if filtered_actuals:
                cm = confusion_matrix(filtered_actuals, filtered_predictions, labels=common_categories)
                print(f"Categories: {common_categories}")
                print("Confusion Matrix:")
                print(cm)
        
        # Performance summary
        print(f"\n" + "=" * 70)
        print("PERFORMANCE SUMMARY")
        print("=" * 70)
        
        if accuracy >= 0.9:
            print("EXCELLENT: Model accuracy is above 90%")
        elif accuracy >= 0.8:
            print("GOOD: Model accuracy is above 80%")
        elif accuracy >= 0.7:
            print("FAIR: Model accuracy is above 70%")
        else:
            print("NEEDS IMPROVEMENT: Model accuracy is below 70%")
        
        # Identify problematic categories
        problem_categories = [cat for cat, stats in category_stats.items() 
                            if stats["total"] > 0 and (stats["correct"] / stats["total"]) < 0.7]
        
        if problem_categories:
            print(f"\nCategories needing improvement (< 70% accuracy):")
            for cat in problem_categories:
                stats = category_stats[cat]
                acc = stats["correct"] / stats["total"]
                print(f"  - {cat}: {acc:.1%}")
        
        return accuracy
        
    except Exception as e:
        print(f"ERROR: Model evaluation failed: {e}")
        import traceback
        traceback.print_exc()
        return 0.0

if __name__ == "__main__":
    evaluate_minilm_accuracy()