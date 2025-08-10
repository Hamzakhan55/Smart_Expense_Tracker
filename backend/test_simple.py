#!/usr/bin/env python3

import sys
from pathlib import Path

# Test the AI processor directly
sys.path.append(str(Path(__file__).parent))

def test_ai_processor():
    print("Testing AI Processor with MiniLM-V2...")
    
    try:
        from services.ai_processor_local import ai_processor
        
        # Test text classification
        test_texts = [
            "bought groceries for 500 rupees",
            "paid electricity bill 2000 rs",
            "taxi fare 150 rupees",
            "restaurant dinner 800 rupees"
        ]
        
        for text in test_texts:
            category = ai_processor.classify_text(text)
            amount = ai_processor.extract_amount(text)
            print(f"Text: {text} -> Category: {category}, Amount: {amount}")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_ai_processor()