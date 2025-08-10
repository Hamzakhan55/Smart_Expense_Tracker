# Smart Expense Tracker - AI Pipeline

## Complete Voice-to-Text to Category Prediction System

This system implements a complete AI pipeline for expense tracking through voice input:

**Voice Recording** → **Whisper (Speech-to-Text)** → **MiniLM-V2 (Category Classification)** → **Amount Extraction** → **AI Review Popup** → **User Approval** → **Database Save**

## Architecture Overview

### Backend Components

1. **AI Processor** (`ai_processor_fixed.py`)
   - Handles the complete AI pipeline
   - Integrates Whisper and MiniLM-V2 models
   - Extracts amounts from transcribed text
   - Provides fallback mechanisms

2. **API Endpoints** (`main.py`)
   - `/process-voice-dry-run/` - Process audio and return AI suggestions
   - `/process-voice/` - Process audio and save directly to database
   - `/ai-status` - Check AI processor status

3. **Models Directory**
   ```
   backend/models/
   ├── whisper-large-v3/          # Speech-to-text model
   └── MiniLM-V2/                 # Your trained category classifier
       └── fine-tuned-minilm-advanced/
           ├── config.json
           ├── pytorch_model.bin
           └── label_encoder.pkl   # Category mappings
   ```

### Frontend Components

1. **Voice Recorder** (`VoiceRecorder.tsx`)
   - Records audio using MediaRecorder API
   - Handles different audio formats
   - Provides visual feedback during recording

2. **AI Confirmation Modal** (`AiConfirmationModal.tsx`)
   - Shows AI-processed results for user review
   - Allows editing before saving
   - Handles user approval workflow

3. **API Integration** (`apiService.ts`, `useTransactions.ts`)
   - Sends audio files to backend
   - Handles AI responses
   - Manages database operations

## Setup Instructions

### 1. Quick Setup (Windows)
```bash
# Run the automated setup
setup_ai_pipeline.bat
```

### 2. Manual Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements_complete.txt
```

#### Download Models
```python
# Download Whisper model
from transformers import WhisperProcessor, WhisperForConditionalGeneration

processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v3")

processor.save_pretrained("backend/models/whisper-large-v3")
model.save_pretrained("backend/models/whisper-large-v3")
```

#### Place Your Trained Model
- Copy your trained MiniLM-V2 model to `backend/models/MiniLM-V2/fine-tuned-minilm-advanced/`
- Ensure `label_encoder.pkl` is included

### 3. Verify Setup
```bash
cd backend
python setup_ai_pipeline.py
python test_complete_pipeline.py
```

## Usage Flow

### 1. User Records Voice
```typescript
// Frontend - User holds voice recorder button
<VoiceRecorder 
  onRecordingComplete={handleVoiceRecording} 
  isProcessing={isProcessingVoice} 
/>
```

### 2. Audio Processing Pipeline
```python
# Backend - Complete AI pipeline
def process_expense_audio(self, audio_file_path: str) -> Dict:
    # Step 1: Voice to Text (Whisper)
    transcription, success = self.transcribe_audio(audio_file_path)
    
    # Step 2: Text to Category (MiniLM-V2)
    category, confidence = self.classify_text(transcription)
    
    # Step 3: Extract Amount
    amount, amount_success = self.extract_amount(transcription)
    
    # Step 4: Return for AI review
    return {
        "description": transcription,
        "category": category,
        "amount": amount,
        "confidence": confidence
    }
```

### 3. AI Review Popup
```typescript
// Frontend - User reviews and approves
<AiConfirmationModal 
  aiData={aiData} 
  onClose={() => setAiData(null)} 
/>
```

### 4. Database Save
```python
# Backend - Save approved expense
expense_create = schemas.ExpenseCreate(
    amount=expense_data["amount"],
    category=expense_data["category"],
    description=expense_data["description"]
)
return crud.create_expense_for_user(db=db, expense=expense_create, user_id=current_user.id)
```

## API Endpoints

### Process Voice (Dry Run)
```http
POST /process-voice-dry-run/
Content-Type: multipart/form-data

file: audio_file.webm
```

**Response:**
```json
{
  "description": "I spent 25 dollars on lunch",
  "category": "Food & Drinks",
  "amount": 25.0,
  "confidence": 0.95
}
```

### Process Voice (Save to DB)
```http
POST /process-voice/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: audio_file.webm
```

**Response:**
```json
{
  "id": 123,
  "amount": 25.0,
  "category": "Food & Drinks",
  "description": "I spent 25 dollars on lunch",
  "date": "2024-01-01T10:00:00Z"
}
```

### AI Status Check
```http
GET /ai-status
```

**Response:**
```json
{
  "status": "ok",
  "ai_processor": {
    "whisper_loaded": true,
    "category_loaded": true,
    "device": "cuda",
    "available_categories": ["Food & Drinks", "Transport", ...]
  }
}
```

## Model Configuration

### Whisper Configuration
```python
# Optimized for speed and accuracy
self.whisper_model.generate(
    input_features,
    max_length=448,
    num_beams=5,
    early_stopping=True,
    language="en",
    task="transcribe"
)
```

### MiniLM-V2 Configuration
```python
# Your trained model settings
inputs = self.category_tokenizer(
    text, 
    return_tensors="pt", 
    truncation=True, 
    padding=True,
    max_length=512
)
```

## Category Mapping

Update the category mapping in `ai_processor_fixed.py`:

```python
category_mapping = {
    # Your model's categories -> Frontend categories
    "bills & fees": "Bills",
    "education": "Education", 
    "food & drinks": "Food & Drinks",
    "healthcare": "Healthcare",
    "rent": "Rent",
    "shopping": "Shopping",
    "transport": "Transport",
    "utilities": "Utilities",
    # Add your specific categories here
}
```

## Testing

### Unit Tests
```bash
# Test individual components
python test_complete_pipeline.py
```

### Integration Tests
```bash
# Start backend
python -m uvicorn app.main:app --reload

# Test API endpoints
curl -X POST http://127.0.0.1:8000/process-voice-dry-run/ \
  -F "file=@test_audio.wav"
```

### Frontend Tests
1. Open frontend application
2. Click voice recorder button
3. Record: "I spent 30 dollars on groceries"
4. Verify AI review popup shows correct data
5. Approve and check database

## Performance Optimization

### GPU Acceleration
```python
# Enable CUDA if available
self.device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
```

### Audio Optimization
```python
# Limit audio length for faster processing
if len(audio) > 10000:  # 10 seconds
    audio = audio[:10000]
```

### Model Optimization
```python
# Compile models for speed (PyTorch 2.0+)
if self.device == "cuda":
    self.whisper_model = torch.compile(self.whisper_model, mode="max-autotune")
```

## Troubleshooting

See `AI_PIPELINE_TROUBLESHOOTING.md` for detailed troubleshooting guide.

### Common Issues:
- **Models not loading**: Check model paths and dependencies
- **Audio processing fails**: Install FFmpeg and audio libraries
- **Category classification poor**: Verify your trained model and label encoder
- **Amount extraction fails**: Update regex patterns for your use case

## Development

### Adding New Categories
1. Retrain your MiniLM-V2 model with new categories
2. Update `label_encoder.pkl`
3. Update category mapping in `_map_category()`
4. Update frontend category constants

### Improving Accuracy
1. **Transcription**: Fine-tune Whisper on your specific audio data
2. **Classification**: Retrain MiniLM-V2 with more diverse examples
3. **Amount Extraction**: Add more regex patterns for your language/currency

### Extending Functionality
- Add support for multiple languages
- Implement confidence thresholds
- Add voice commands for different transaction types
- Integrate with receipt OCR for verification

## Production Deployment

### Security Considerations
- Implement rate limiting for voice processing
- Add audio file size limits
- Sanitize user inputs
- Use HTTPS for audio transmission

### Scalability
- Use model serving frameworks (TorchServe, TensorFlow Serving)
- Implement caching for frequent requests
- Consider cloud-based speech services for fallback

### Monitoring
- Log AI processing metrics
- Monitor model performance
- Track user approval rates
- Alert on processing failures

## License

This AI pipeline is part of the Smart Expense Tracker project. See main project license for details.