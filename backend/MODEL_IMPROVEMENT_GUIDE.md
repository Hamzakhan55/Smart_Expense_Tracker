# Model Improvement Guide

## Quick Improvements (Ready to Use)

### 1. Use Improved AI Processor
Replace your current AI processor with the improved version:

```python
# In your main application, replace:
from services.ai_processor_local import ai_processor

# With:
from services.ai_processor_improved import improved_ai_processor as ai_processor
```

**Improvements:**
- Better text preprocessing (handles "emi", "amazon", "uber" etc.)
- Confidence scoring for classifications
- Enhanced keyword fallback
- Faster Whisper transcription (30s limit, optimized parameters)

### 2. MiniLM-V2 Improvements

#### A. Better Category Mapping
The improved processor includes better mapping:
- "phone bill" → Bills (not Utilities)
- "laptop" → Electronics & Gadgets
- "amazon purchase" → Shopping

#### B. Enhanced Preprocessing
Automatically converts:
- "emi" → "loan payment"
- "amazon/flipkart" → "online shopping"
- "uber/ola" → "taxi ride"

#### C. Confidence-Based Classification
- Uses confidence threshold (default 0.6)
- Falls back to keyword matching for low confidence
- Returns confidence score with predictions

### 3. Whisper Improvements

#### A. Speed Optimizations
- Limits audio to 30 seconds max
- Uses greedy decoding (beam_size=1)
- Early stopping enabled
- Reduced max output length

#### B. Better Error Handling
- Checks audio file size before processing
- Handles empty/corrupted audio files
- Graceful fallback on errors

## Advanced Improvements (Requires Retraining)

### 1. Retrain MiniLM-V2 with More Data

**Problem Categories (Need more training data):**
- Bills: 33.3% accuracy
- Electronics & Gadgets: 33.3% accuracy  
- Shopping: 60% accuracy

**Additional Training Examples Needed:**

```python
# Bills category
bills_examples = [
    "credit card bill payment 5000",
    "loan emi payment 8000",
    "insurance premium due 3000",
    "subscription renewal fee 500",
    "membership fee payment 1200"
]

# Electronics & Gadgets
electronics_examples = [
    "laptop computer purchase 45000",
    "smartphone mobile phone 20000", 
    "tablet device buying 15000",
    "headphones earphones 2000",
    "gaming console purchase 30000"
]

# Shopping
shopping_examples = [
    "online shopping spree 4000",
    "mall shopping clothes 2500",
    "amazon flipkart purchase 1800",
    "retail store buying 1200"
]
```

### 2. Use Smaller Whisper Model

For faster inference, consider using Whisper-medium or Whisper-small:

```python
# Download smaller model
from transformers import WhisperProcessor, WhisperForConditionalGeneration

# Use medium model (faster, slightly less accurate)
processor = WhisperProcessor.from_pretrained("openai/whisper-medium")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-medium")
```

**Trade-offs:**
- Whisper-large: Best accuracy, ~27s inference
- Whisper-medium: Good accuracy, ~15s inference  
- Whisper-small: Fair accuracy, ~8s inference

### 3. GPU Acceleration

Add GPU support for faster processing:

```python
# Check for GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Move inputs to GPU
input_features = input_features.to(device)
```

## Implementation Steps

### Step 1: Quick Win (5 minutes)
1. Use the improved AI processor
2. Test with problematic examples
3. Verify confidence scores

### Step 2: Medium Term (1-2 hours)
1. Collect more training data for problem categories
2. Fine-tune MiniLM-V2 with additional examples
3. Test and validate improvements

### Step 3: Long Term (1-2 days)
1. Switch to smaller Whisper model for speed
2. Implement GPU acceleration
3. Add model monitoring and feedback collection

## Expected Results

### After Quick Improvements:
- Bills accuracy: 33% → 60%
- Electronics accuracy: 33% → 70%
- Shopping accuracy: 60% → 80%
- Whisper speed: 27s → 15s

### After Retraining:
- Overall accuracy: 83% → 90%+
- All categories above 80% accuracy
- Faster inference times

### After Full Optimization:
- Real-time audio processing (<5s)
- 95%+ classification accuracy
- Production-ready performance

## Testing Your Improvements

Run the accuracy test after each improvement:

```bash
cd backend
python evaluate_minilm_accuracy.py
python test_whisper_simple.py
```

Monitor the accuracy improvements and inference speed changes.