#!/usr/bin/env python3

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from services.ai_processor_local import AIProcessor

def test_models():
    print("Testing AI Processor initialization...")
    processor = AIProcessor()
    
    print(f"Whisper model loaded: {processor.whisper_model is not None}")
    print(f"Whisper processor loaded: {processor.whisper_processor is not None}")
    print(f"Category model loaded: {processor.category_model is not None}")
    print(f"Category tokenizer loaded: {processor.category_tokenizer is not None}")
    print(f"Label encoder loaded: {processor.label_encoder is not None}")
    
    # Test text classification
    if processor.category_model:
        test_text = "buy bags for 3000 rupees"
        category = processor.classify_text(test_text)
        amount = processor.extract_amount(test_text)
        print(f"\nTest classification:")
        print(f"Text: '{test_text}'")
        print(f"Category: {category}")
        print(f"Amount: {amount}")

if __name__ == "__main__":
    test_models()