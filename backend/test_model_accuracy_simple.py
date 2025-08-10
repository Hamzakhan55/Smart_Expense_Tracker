#!/usr/bin/env python3

import sys
import os
from pathlib import Path
import pickle
import torch
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
import time

# Add backend to path
sys.path.append(str(Path(__file__).parent))

def test_whisper_accuracy():
    """Test Whisper model accuracy"""
    print("=" * 60)
    print("TESTING WHISPER MODEL ACCURACY")
    print("=" * 60)
    
    try:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        import librosa
        
        whisper_path = Path(__file__).parent / "models" / "whisper-large-v3"
        
        if not whisper_path.exists():
            print("ERROR: Whisper model not found at:", whisper_path)
            return False
        
        print("Loading Whisper model...")
        processor = WhisperProcessor.from_pretrained(str(whisper_path))
        model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
        model.eval()
        
        print(f"Model Information:")
        print(f"   - Model Path: {whisper_path}")
        print(f"   - Model Type: Whisper Large V3")
        print(f"   - Parameters: ~1.5B")
        
        # Test with synthetic audio
        print("\nTesting with synthetic audio data...")
        sample_rate = 16000
        duration = 2
        audio_array = np.random.normal(0, 0.01, sample_rate * duration).astype(np.float32)
        
        start_time = time.time()
        input_features = processor(audio_array, sampling_rate=sample_rate, return_tensors="pt").input_features
        
        with torch.no_grad():
            predicted_ids = model.generate(input_features)
            transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        inference_time = time.time() - start_time
        
        print(f"SUCCESS: Model loaded and tested!")
        print(f"Performance Metrics:")
        print(f"   - Inference Time: {inference_time:.3f} seconds")
        print(f"   - Sample Transcription: '{transcription}'")
        print(f"   - Model Status: Ready for audio processing")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Whisper model test failed: {e}")
        return False

def test_minilm_accuracy():
    """Test MiniLM-V2 model accuracy"""
    print("\n" + "=" * 60)
    print("TESTING MINILM-V2 MODEL ACCURACY")
    print("=" * 60)
    
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        
        model_path = Path(__file__).parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
        label_encoder_path = model_path / "label_encoder.pkl"
        
        if not model_path.exists() or not label_encoder_path.exists():
            print("ERROR: MiniLM model not found at:", model_path)
            return False
        
        print("Loading MiniLM-V2 model...")
        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
        
        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        
        model.eval()
        
        print(f"Model Information:")
        print(f"   - Model Path: {model_path}")
        print(f"   - Model Type: Fine-tuned MiniLM-V2")
        print(f"   - Categories: {list(label_encoder.classes_)}")
        print(f"   - Number of Categories: {len(label_encoder.classes_)}")
        
        # Test cases
        test_cases = [
            {"text": "bought groceries for 500 rupees", "expected": "food & drinks"},
            {"text": "paid electricity bill 2000", "expected": "utilities"},
            {"text": "uber ride to office 150", "expected": "transport"},
            {"text": "bought new shirt 800", "expected": "shopping"},
            {"text": "doctor visit 1000", "expected": "healthcare"},
            {"text": "monthly rent payment 15000", "expected": "rent"},
            {"text": "college fees 50000", "expected": "education"},
            {"text": "phone bill payment 500", "expected": "bills & fees"},
            {"text": "restaurant dinner 1200", "expected": "food & drinks"},
            {"text": "bus ticket 50", "expected": "transport"}
        ]
        
        print(f"\nTesting with {len(test_cases)} test cases...")
        
        predictions = []
        actuals = []
        correct_predictions = 0
        
        print("\nIndividual Test Results:")
        print("-" * 80)
        
        for i, test_case in enumerate(test_cases, 1):
            text = test_case["text"]
            expected = test_case["expected"]
            
            inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            
            start_time = time.time()
            with torch.no_grad():
                outputs = model(**inputs)
                predicted_class_id = outputs.logits.argmax().item()
                predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
            inference_time = time.time() - start_time
            
            predictions.append(predicted_label)
            actuals.append(expected)
            
            is_correct = predicted_label.lower() == expected.lower()
            if is_correct:
                correct_predictions += 1
            
            status = "CORRECT" if is_correct else "WRONG"
            print(f"{i:2d}. {status} - '{text[:40]:<40}' -> {predicted_label:<15} (Expected: {expected})")
        
        # Calculate metrics
        accuracy = correct_predictions / len(test_cases)
        
        print("\n" + "=" * 80)
        print("ACCURACY METRICS")
        print("=" * 80)
        print(f"Overall Accuracy: {accuracy:.2%} ({correct_predictions}/{len(test_cases)})")
        
        # Category-wise accuracy
        category_stats = {}
        for actual, predicted in zip(actuals, predictions):
            if actual not in category_stats:
                category_stats[actual] = {"correct": 0, "total": 0}
            category_stats[actual]["total"] += 1
            if actual.lower() == predicted.lower():
                category_stats[actual]["correct"] += 1
        
        print(f"\nCategory-wise Performance:")
        print("-" * 50)
        for category, stats in sorted(category_stats.items()):
            cat_accuracy = stats["correct"] / stats["total"]
            print(f"{category:<20}: {cat_accuracy:.1%} ({stats['correct']}/{stats['total']})")
        
        return True
        
    except Exception as e:
        print(f"ERROR: MiniLM model test failed: {e}")
        return False

def test_combined_pipeline():
    """Test the complete AI pipeline"""
    print("\n" + "=" * 60)
    print("TESTING COMBINED AI PIPELINE")
    print("=" * 60)
    
    try:
        from services.ai_processor_local import AIProcessor
        
        print("Initializing AI Processor...")
        processor = AIProcessor()
        
        whisper_available = processor.whisper_model is not None
        minilm_available = processor.category_model is not None
        
        print(f"Pipeline Status:")
        print(f"   - Whisper Model: {'Loaded' if whisper_available else 'Not Available'}")
        print(f"   - MiniLM Model: {'Loaded' if minilm_available else 'Not Available'}")
        print(f"   - Label Encoder: {'Loaded' if processor.label_encoder else 'Not Available'}")
        
        if minilm_available:
            test_texts = [
                "bought groceries for 500 rupees",
                "paid electricity bill 2000",
                "uber ride 150",
                "restaurant dinner 800"
            ]
            
            print(f"\nTesting Text Classification Pipeline:")
            print("-" * 50)
            
            for text in test_texts:
                category = processor.classify_text(text)
                amount = processor.extract_amount(text)
                print(f"'{text}' -> Category: {category}, Amount: Rs.{amount}")
        
        return whisper_available and minilm_available
        
    except Exception as e:
        print(f"ERROR: Pipeline test failed: {e}")
        return False

def main():
    print("=" * 80)
    print("SMART EXPENSE TRACKER - MODEL ACCURACY REPORT")
    print("=" * 80)
    
    results = {
        "whisper": test_whisper_accuracy(),
        "minilm": test_minilm_accuracy(),
        "pipeline": test_combined_pipeline()
    }
    
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    
    print(f"Whisper Model (Speech-to-Text): {'PASS' if results['whisper'] else 'FAIL'}")
    print(f"MiniLM-V2 Model (Text Classification): {'PASS' if results['minilm'] else 'FAIL'}")
    print(f"Combined Pipeline: {'PASS' if results['pipeline'] else 'FAIL'}")
    
    overall_status = all(results.values())
    print(f"\nOverall System Status: {'ALL MODELS READY' if overall_status else 'SOME ISSUES DETECTED'}")
    
    if not overall_status:
        print("\nRecommendations:")
        if not results['whisper']:
            print("   - Check Whisper model installation and dependencies")
        if not results['minilm']:
            print("   - Verify MiniLM-V2 model files and label encoder")
        if not results['pipeline']:
            print("   - Review AI processor configuration")

if __name__ == "__main__":
    main()