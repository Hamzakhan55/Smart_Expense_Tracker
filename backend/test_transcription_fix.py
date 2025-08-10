#!/usr/bin/env python3
"""
Quick test for transcription and amount extraction fixes
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from services.ai_processor_simple import simple_ai_processor

def test_amount_extraction():
    """Test amount extraction with various formats"""
    print("💰 Testing Amount Extraction")
    print("=" * 40)
    
    test_cases = [
        "I spent 50 dollars on groceries",
        "I paid 25 bucks for lunch", 
        "Cost was 100 rupees",
        "Price is $15.50",
        "Bought for 75 dollars",
        "Spent twenty five dollars",  # This won't work
        "I paid $30 for dinner",
        "Cost 200 rs for shopping",
        "Spent 1,500 dollars",
        "Price was 45.99 dollars"
    ]
    
    for text in test_cases:
        amount = simple_ai_processor.extract_amount(text)
        print(f"'{text}' → ${amount}")
        print("-" * 30)

def test_classification():
    """Test category classification"""
    print("\n🏷️ Testing Classification")
    print("=" * 40)
    
    test_cases = [
        "I spent 50 dollars on groceries",
        "Paid for gas at station", 
        "Bought clothes at mall",
        "Doctor visit cost money",
        "Monthly rent payment"
    ]
    
    for text in test_cases:
        category = simple_ai_processor.classify_text(text)
        print(f"'{text}' → {category}")

def test_complete_flow():
    """Test with sample text (simulating transcription)"""
    print("\n🚀 Testing Complete Flow")
    print("=" * 40)
    
    # Simulate what transcription should produce
    sample_transcriptions = [
        "I spent fifty dollars on groceries",
        "I paid 25 dollars for lunch",
        "Cost was 100 rupees for shopping",
        "Bought gas for 40 dollars"
    ]
    
    for text in sample_transcriptions:
        print(f"Input: '{text}'")
        
        category = simple_ai_processor.classify_text(text)
        amount = simple_ai_processor.extract_amount(text)
        
        result = {
            "description": text,
            "category": category, 
            "amount": amount
        }
        
        print(f"Result: {result}")
        print("-" * 30)

if __name__ == "__main__":
    print("🧪 Testing Transcription and Amount Extraction Fixes")
    print("=" * 60)
    
    test_amount_extraction()
    test_classification() 
    test_complete_flow()
    
    print("\n📋 Tips for better results:")
    print("- Speak clearly: 'I spent 25 dollars on lunch'")
    print("- Use numbers: 'fifty' → '50'") 
    print("- Include currency: 'dollars', 'rupees', '$'")
    print("- Keep it simple: 'I paid 30 dollars for groceries'")