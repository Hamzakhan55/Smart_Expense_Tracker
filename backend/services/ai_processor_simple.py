# backend/services/ai_processor_simple.py

import re
from pathlib import Path
import os
import tempfile

# Try to import speech recognition dependencies with fallback
try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("Speech recognition dependencies not available. Audio processing will be disabled.")

class AIProcessor:
    def __init__(self):
        """
        Simplified AI processor that doesn't require heavy ML models.
        This allows the backend to start without dependency issues.
        """
        print("Initializing Simplified AIProcessor...")
        
        # Simple category mapping based on keywords
        self.category_keywords = {
            "food": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger"],
            "transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro"],
            "shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt"],
            "entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert"],
            "utilities": ["electricity", "water", "gas", "internet", "phone", "bill", "utility"],
            "healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical"],
            "education": ["book", "course", "school", "education", "tuition", "study"],
            "other": []
        }
        
        print("Simplified AIProcessor initialized successfully.")

    def convert_to_wav(self, audio_file_path: str) -> str:
        """
        Convert audio file to WAV format for speech recognition.
        """
        if not SPEECH_RECOGNITION_AVAILABLE:
            return audio_file_path
            
        try:
            file_ext = Path(audio_file_path).suffix.lower()
            if file_ext == '.wav':
                return audio_file_path
            
            audio = AudioSegment.from_file(audio_file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                audio.export(temp_wav.name, format='wav')
                return temp_wav.name
        except Exception as e:
            print(f"Error converting audio: {e}")
            return audio_file_path
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text using speech recognition.
        """
        if not SPEECH_RECOGNITION_AVAILABLE:
            print("Speech recognition not available - install dependencies: pip install speechrecognition pydub pyaudio")
            return ""
            
        wav_file = None
        try:
            r = sr.Recognizer()
            
            if not os.path.exists(audio_file_path):
                print(f"Audio file not found: {audio_file_path}")
                return ""
            
            wav_file = self.convert_to_wav(audio_file_path)
            
            with sr.AudioFile(wav_file) as source:
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio = r.record(source)
            
            text = r.recognize_google(audio)
            print(f"Transcribed text: {text}")
            return text
            
        except sr.UnknownValueError:
            print("Could not understand audio")
            return ""
        except sr.RequestError as e:
            print(f"Error with speech recognition service: {e}")
            return ""
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return ""
        finally:
            if wav_file and wav_file != audio_file_path and os.path.exists(wav_file):
                try:
                    os.unlink(wav_file)
                except:
                    pass

    def classify_text(self, text: str) -> str:
        """Classifies text into an expense category using keyword matching."""
        if not text:
            return "other"
        
        text_lower = text.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                print(f"Classified Category: '{category}'")
                return category
        
        print(f"Classified Category: 'other'")
        return "other"

    def extract_amount(self, text: str) -> float:
        """Extracts numerical amount from text, handling commas and various formats."""
        # Remove common currency words and symbols
        text = re.sub(r'\b(rupees?|dollars?|usd|pkr|inr)\b', '', text, flags=re.IGNORECASE)
        
        # Look for numbers with commas (e.g., "50,000", "1,234.56")
        comma_matches = re.findall(r'\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b', text)
        if comma_matches:
            # Remove commas and convert to float
            amount_str = comma_matches[0].replace(',', '')
            amount = float(amount_str)
            print(f"Extracted Amount (with commas): {amount}")
            return amount
        
        # Look for regular numbers (e.g., "50000", "123.45")
        regular_matches = re.findall(r'\b\d+(?:\.\d+)?\b', text)
        if regular_matches:
            # Get the largest number (likely the amount)
            amounts = [float(match) for match in regular_matches]
            amount = max(amounts)
            print(f"Extracted Amount: {amount}")
            return amount
            
        print("No amount found, defaulting to 0.0")
        return 0.0

    def process_expense_audio(self, audio_file_path: str) -> dict:
        """The main function to process an audio file into structured expense data."""
        transcription = self.transcribe_audio(audio_file_path)
        
        if not transcription:
            return {
                "description": "Could not transcribe audio. Please try again or enter manually.",
                "category": "other",
                "amount": 0.0
            }
        
        category = self.classify_text(transcription)
        amount = self.extract_amount(transcription)
        
        return {
            "description": transcription,
            "category": category,
            "amount": amount
        }

# This makes the AIProcessor a singleton, ensuring we only ever have one instance.
ai_processor = AIProcessor()