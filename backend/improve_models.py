#!/usr/bin/env python3

import sys
from pathlib import Path
import pickle
import torch
import json

sys.path.append(str(Path(__file__).parent))

# 1. IMPROVE MINILM-V2 WITH BETTER TRAINING DATA
def generate_improved_training_data():
    """Generate additional training data for problematic categories"""
    
    additional_data = {
        # Bills category - currently 33.3% accuracy
        "Bills": [
            "credit card bill payment 5000",
            "loan emi payment 8000", 
            "insurance premium due 3000",
            "subscription renewal fee 500",
            "membership fee payment 1200",
            "service charge bill 300",
            "annual maintenance fee 2000",
            "processing fee charged 150"
        ],
        
        # Electronics & Gadgets - currently 33.3% accuracy  
        "Electronics & Gadgets": [
            "laptop computer purchase 45000",
            "smartphone mobile phone 20000",
            "tablet device buying 15000", 
            "headphones earphones 2000",
            "camera photography equipment 25000",
            "gaming console purchase 30000",
            "smart watch buying 8000",
            "bluetooth speaker 3000"
        ],
        
        # Shopping - currently 60% accuracy
        "Shopping": [
            "online shopping spree 4000",
            "mall shopping clothes 2500",
            "amazon flipkart purchase 1800",
            "retail store buying 1200",
            "fashion shopping spree 3500",
            "grocery shopping market 800",
            "department store purchase 2200"
        ]
    }
    
    print("Additional training data generated for problematic categories:")
    for category, examples in additional_data.items():
        print(f"\n{category} ({len(examples)} examples):")
        for example in examples[:3]:  # Show first 3
            print(f"  - {example}")
    
    return additional_data

# 2. OPTIMIZE WHISPER MODEL
def optimize_whisper_config():
    """Configuration to improve Whisper performance"""
    
    optimized_config = {
        "model_size": "medium",  # Use medium instead of large for speed
        "language": "en",        # Set specific language
        "task": "transcribe",    # Explicit task
        "fp16": True,           # Use half precision for speed
        "beam_size": 1,         # Faster decoding
        "best_of": 1,           # Single pass
        "temperature": 0.0,     # Deterministic output
        "compression_ratio_threshold": 2.4,
        "logprob_threshold": -1.0,
        "no_speech_threshold": 0.6
    }
    
    print("Whisper optimization config:")
    for key, value in optimized_config.items():
        print(f"  {key}: {value}")
    
    return optimized_config

# 3. IMPROVED CATEGORY MAPPING
def create_better_category_mapping():
    """Better mapping between model predictions and categories"""
    
    improved_mapping = {
        # Original -> Improved mapping
        "bills & fees": "Bills",
        "utilities": "Utilities", 
        "phone bill": "Bills",      # New mapping
        "credit card": "Bills",     # New mapping
        "subscription": "Bills",    # New mapping
        "laptop": "Electronics & Gadgets",    # New mapping
        "smartphone": "Electronics & Gadgets", # New mapping
        "computer": "Electronics & Gadgets",   # New mapping
        "online shopping": "Shopping",         # New mapping
        "amazon": "Shopping",                  # New mapping
        "mall": "Shopping"                     # New mapping
    }
    
    return improved_mapping

# 4. ENHANCED PREPROCESSING
def improve_text_preprocessing(text):
    """Better text preprocessing for classification"""
    
    # Normalize common terms
    replacements = {
        "emi": "loan payment",
        "recharge": "bill payment", 
        "flipkart": "online shopping",
        "amazon": "online shopping",
        "uber": "taxi ride",
        "ola": "taxi ride",
        "swiggy": "food delivery",
        "zomato": "food delivery"
    }
    
    text_lower = text.lower()
    for old, new in replacements.items():
        text_lower = text_lower.replace(old, new)
    
    return text_lower

# 5. CONFIDENCE-BASED CLASSIFICATION
def classify_with_confidence(model, tokenizer, label_encoder, text, threshold=0.7):
    """Classify with confidence threshold"""
    
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)
        confidence = torch.max(probabilities).item()
        predicted_class_id = outputs.logits.argmax().item()
        predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
    
    if confidence < threshold:
        # Use keyword fallback for low confidence
        return "Miscellaneous", confidence
    
    return predicted_label, confidence

# 6. FASTER WHISPER IMPLEMENTATION
def create_faster_whisper_processor():
    """Optimized Whisper processor"""
    
    code = '''
def transcribe_audio_fast(self, audio_file_path: str) -> str:
    """Faster Whisper transcription with optimizations"""
    
    if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
        return ""
    
    try:
        # Load with optimized settings
        audio_array, sr = librosa.load(audio_file_path, sr=16000, duration=30)  # Limit duration
        
        if len(audio_array) < 1600:  # Too short
            return ""
        
        # Use optimized generation parameters
        input_features = self.whisper_processor(
            audio_array, 
            sampling_rate=sr, 
            return_tensors="pt"
        ).input_features
        
        # Faster generation
        with torch.no_grad():
            predicted_ids = self.whisper_model.generate(
                input_features,
                max_length=50,      # Limit output length
                num_beams=1,        # Greedy decoding
                do_sample=False,    # Deterministic
                early_stopping=True
            )
            
        transcription = self.whisper_processor.batch_decode(
            predicted_ids, 
            skip_special_tokens=True
        )[0]
        
        return transcription.strip()
        
    except Exception as e:
        print(f"Fast transcription failed: {e}")
        return ""
'''
    
    return code

# 7. QUICK IMPROVEMENT IMPLEMENTATION
def implement_quick_improvements():
    """Apply immediate improvements to existing models"""
    
    print("QUICK MODEL IMPROVEMENTS")
    print("=" * 50)
    
    # Generate training data
    training_data = generate_improved_training_data()
    
    # Create optimization configs
    whisper_config = optimize_whisper_config()
    
    # Better mapping
    mapping = create_better_category_mapping()
    
    print(f"\nIMPROVEMENTS READY:")
    print(f"✓ {sum(len(examples) for examples in training_data.values())} new training examples")
    print(f"✓ {len(whisper_config)} Whisper optimizations")
    print(f"✓ {len(mapping)} improved category mappings")
    
    # Save improvements
    improvements = {
        "training_data": training_data,
        "whisper_config": whisper_config,
        "category_mapping": mapping
    }
    
    with open("model_improvements.json", "w") as f:
        json.dump(improvements, f, indent=2)
    
    print("✓ Improvements saved to model_improvements.json")
    
    return improvements

if __name__ == "__main__":
    implement_quick_improvements()