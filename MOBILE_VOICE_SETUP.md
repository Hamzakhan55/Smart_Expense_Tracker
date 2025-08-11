# Mobile Voice Recording Setup

## Overview
The mobile app now includes enhanced voice recording functionality that matches the web frontend experience with proper popup modals and backend integration.

## Features Added

### 1. Enhanced Voice Recording FAB
- **Recording Modal**: Shows popup during recording with visual feedback
- **Processing Modal**: Displays AI processing status with cancel option
- **Pulse Animation**: Visual indicator during recording
- **Better Error Handling**: Validates audio files before processing

### 2. Improved Backend Integration
- **Proper API Client**: Uses dynamic backend URL detection
- **Enhanced Parsing**: Better text parsing for amounts and categories
- **Fallback Support**: Graceful degradation when backend is unavailable
- **Audio Validation**: Checks file size and format before sending

### 3. Better User Experience
- **Visual Feedback**: Clear recording and processing states
- **Cancel Functionality**: Users can cancel recording/processing
- **Error Messages**: Informative error handling
- **Fallback Input**: Text input when voice processing fails

## Setup Instructions

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test Voice Processing
```bash
python test_voice_mobile.py
```

### 3. Start Mobile App
```bash
cd Smart_Expense_Tracker_Mobile
npm start
```

### 4. Quick Setup (All-in-one)
```bash
setup_mobile_voice.bat
```

## How It Works

### Recording Process
1. **Hold FAB Button**: Long press to start recording
2. **Recording Modal**: Shows with pulsing microphone icon
3. **Release to Stop**: Recording stops and processing begins
4. **Processing Modal**: Shows AI analysis in progress
5. **Result Modal**: Displays parsed expense data for confirmation

### Backend Processing
1. **Audio Upload**: WAV file sent to `/process-voice-dry-run/`
2. **AI Processing**: Whisper transcription + DistilBERT categorization
3. **Response**: Returns description, category, and amount
4. **Fallback**: Text input prompt if processing fails

### Error Handling
- **No Permission**: Prompts for microphone access
- **Short Recording**: Warns about minimum recording time
- **Invalid Audio**: Validates file before processing
- **Backend Offline**: Falls back to text input
- **Processing Failed**: Offers manual text entry

## Technical Details

### Audio Configuration
```javascript
{
  android: {
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    audioQuality: 'HIGH',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  }
}
```

### API Endpoints
- `POST /process-voice-dry-run/` - Process audio and return parsed data
- `POST /process-voice/` - Process audio and create expense directly
- `GET /ai-status` - Check AI processor status

### Enhanced Parsing
- **Amount Extraction**: Handles comma-separated numbers (50,000)
- **Category Prediction**: Expanded keyword matching
- **Context Awareness**: Better understanding of expense descriptions

## Troubleshooting

### Voice Not Working
1. Check microphone permissions
2. Verify backend is running on port 8000
3. Test with `python test_voice_mobile.py`
4. Check network connectivity to backend

### Processing Fails
1. Ensure AI models are loaded (`/ai-status` endpoint)
2. Check audio file size (should be > 1KB)
3. Verify audio format is supported
4. Try manual text input as fallback

### Backend Connection Issues
1. Check if backend is accessible at `http://192.168.1.22:8000`
2. Verify CORS settings allow mobile app origin
3. Test with `curl http://localhost:8000/health`

## Files Modified

### Mobile App
- `src/components/VoiceInputFAB.tsx` - Enhanced with modal and animations
- `src/services/apiService.ts` - Improved voice processing API calls
- `src/services/speechService.ts` - Better parsing and validation

### Backend
- `app/main.py` - Voice processing endpoints
- `services/ai_processor.py` - AI processing pipeline

### Setup Scripts
- `setup_mobile_voice.bat` - Complete setup automation
- `test_voice_mobile.py` - Backend testing script

## Usage Examples

### Basic Voice Recording
1. Open mobile app
2. Long press the blue microphone FAB
3. Speak: "I bought groceries for 50 dollars"
4. Release button
5. Confirm the parsed expense details

### Fallback Text Input
If voice processing fails, the app will prompt:
"Please type your expense details:"
Enter: "groceries 50 dollars"

The app will parse this text using the same logic as voice processing.