# AI Pipeline Troubleshooting Guide

## Voice-to-Text to Category Prediction Pipeline Issues

This guide helps you troubleshoot the complete AI pipeline: **Audio → Whisper → MiniLM-V2 → Amount → AI Review → Database**

## Quick Diagnosis

Run the setup script first:
```bash
cd backend
python setup_ai_pipeline.py
```

Then test the complete pipeline:
```bash
python test_complete_pipeline.py
```

## Common Issues and Solutions

### 1. Models Not Loading

**Issue**: `❌ Whisper model NOT FOUND` or `❌ MiniLM-V2 category model NOT FOUND`

**Solution**:
```bash
# Check model directory structure
backend/
├── models/
│   ├── whisper-large-v3/          # Whisper model files
│   │   ├── config.json
│   │   ├── pytorch_model.bin
│   │   └── ...
│   └── MiniLM-V2/
│       └── fine-tuned-minilm-advanced/  # Your trained model
│           ├── config.json
│           ├── pytorch_model.bin
│           ├── label_encoder.pkl        # Important!
│           └── ...
```

**Download Whisper Model**:
```python
from transformers import WhisperProcessor, WhisperForConditionalGeneration

# Download and save Whisper model
processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v3")

processor.save_pretrained("backend/models/whisper-large-v3")
model.save_pretrained("backend/models/whisper-large-v3")
```

### 2. Dependencies Missing

**Issue**: `❌ PyTorch - NOT INSTALLED` or similar

**Solution**:
```bash
# Install all dependencies
pip install -r requirements_complete.txt

# Or install individually
pip install torch transformers librosa scikit-learn
pip install pydub SpeechRecognition pyaudio
pip install fastapi uvicorn sqlalchemy
```

### 3. Audio Processing Issues

**Issue**: `❌ Audio file is empty` or `❌ Transcription failed`

**Solutions**:

**Check Audio Format**:
```python
# Supported formats: .wav, .mp3, .webm, .m4a
# Frontend should send .webm files
```

**Install Audio Dependencies**:
```bash
# Windows
pip install pyaudio

# Linux
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio

# macOS
brew install portaudio
pip install pyaudio
```

**Check FFmpeg** (required for audio conversion):
```bash
# Windows: Download from https://ffmpeg.org/
# Linux: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
```

### 4. Voice Recording Not Working

**Issue**: Frontend voice recorder not capturing audio

**Solutions**:

**Check Browser Permissions**:
- Allow microphone access in browser
- Use HTTPS or localhost (required for microphone API)

**Check VoiceRecorder Component**:
```typescript
// Ensure proper MIME type support
let mimeType = "audio/webm";
if (!MediaRecorder.isTypeSupported("audio/webm")) {
    mimeType = "audio/mp4"; // Fallback
}
```

### 5. Category Classification Issues

**Issue**: All expenses classified as "Miscellaneous"

**Solutions**:

**Check Label Encoder**:
```python
# Verify label_encoder.pkl exists and contains your categories
import pickle
with open("backend/models/MiniLM-V2/fine-tuned-minilm-advanced/label_encoder.pkl", "rb") as f:
    encoder = pickle.load(f)
    print("Categories:", encoder.classes_)
```

**Update Category Mapping**:
```python
# In ai_processor_fixed.py, update _map_category method
category_mapping = {
    "your_model_category": "Frontend_Category",
    # Add your specific mappings
}
```

### 6. Amount Extraction Issues

**Issue**: `⚠️ No valid amount found`

**Solutions**:

**Test Amount Patterns**:
```python
# Test with various formats
test_texts = [
    "I spent 50 dollars",
    "Cost was $25.50",
    "Paid 100 rupees",
    "Price 15.99"
]
```

**Improve Regex Patterns**:
```python
# Add more patterns in extract_amount method
patterns = [
    r'(?:spent|paid|cost)\\s+([0-9,]+(?:\\.[0-9]{1,2})?)\\s*(?:dollars?|\\$)',
    # Add your specific patterns
]
```

### 7. AI Review Popup Issues

**Issue**: Popup not showing or data not correct

**Solutions**:

**Check API Response**:
```javascript
// In frontend, check processVoiceDryRun response
console.log("AI Response:", aiResponse);
```

**Verify Modal State**:
```typescript
// Check AiConfirmationModal props
const [aiData, setAiData] = useState<AiResponse | null>(null);
```

### 8. Database Saving Issues

**Issue**: Approved expenses not saving to database

**Solutions**:

**Check Authentication**:
```python
# Ensure user is authenticated
current_user: models.User = Depends(get_current_user)
```

**Verify Database Connection**:
```python
# Test database connection
from app.database import SessionLocal
db = SessionLocal()
# Test query
```

### 9. Performance Issues

**Issue**: AI processing too slow

**Solutions**:

**Use GPU Acceleration**:
```python
# Check if CUDA is available
import torch
print("CUDA available:", torch.cuda.is_available())
```

**Optimize Model Loading**:
```python
# Use half precision on GPU
torch_dtype=torch.float16 if device == "cuda" else torch.float32
```

**Reduce Audio Length**:
```python
# Limit audio to 10 seconds for faster processing
if len(audio) > 10000:  # 10 seconds in milliseconds
    audio = audio[:10000]
```

### 10. Integration Issues

**Issue**: Frontend and backend not communicating

**Solutions**:

**Check CORS Settings**:
```python
# In main.py
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your frontend URL
]
```

**Verify API Endpoints**:
```bash
# Test endpoints
curl -X GET http://127.0.0.1:8000/health
curl -X GET http://127.0.0.1:8000/ai-status
```

## Complete Flow Verification

### Step-by-Step Testing:

1. **Test Models Loading**:
```bash
python -c "from services.ai_processor_fixed import fixed_ai_processor; print(fixed_ai_processor.get_status())"
```

2. **Test Audio Processing**:
```bash
python test_complete_pipeline.py
```

3. **Test API Endpoints**:
```bash
# Start backend
python -m uvicorn app.main:app --reload

# Test in another terminal
curl -X POST http://127.0.0.1:8000/process-voice-dry-run/ \
  -F "file=@test_audio.wav"
```

4. **Test Frontend Integration**:
- Open frontend application
- Click voice recorder
- Record a test message: "I spent 25 dollars on lunch"
- Check if AI review popup appears
- Verify data is correct
- Approve and check database

## Getting Help

If issues persist:

1. **Check Logs**: Look at backend console output for detailed error messages
2. **Run Diagnostics**: Use `setup_ai_pipeline.py` and `test_complete_pipeline.py`
3. **Verify Models**: Ensure your trained MiniLM-V2 model is properly saved
4. **Test Components**: Test each part of the pipeline individually

## Success Indicators

✅ **Working Pipeline**:
- Models load without errors
- Audio transcription works
- Category classification is accurate
- Amount extraction finds values
- AI review popup shows correct data
- Database saves approved expenses

The complete flow should be:
**Voice Recording** → **Whisper Transcription** → **MiniLM-V2 Classification** → **Amount Extraction** → **AI Review Popup** → **User Approval** → **Database Save**