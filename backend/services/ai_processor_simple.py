# backend/services/ai_processor_simple.py

import re
from pathlib import Path
import os
import tempfile

# Try to import dependencies with fallback
try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("Speech recognition dependencies not available. Audio processing will be disabled.")

try:
    from transformers import pipeline
    AI_CLASSIFICATION_AVAILABLE = True
except ImportError:
    AI_CLASSIFICATION_AVAILABLE = False
    print("Transformers not available. Using keyword-based classification.")

class AIProcessor:
    def __init__(self):
        """
        Simplified AI processor that doesn't require heavy ML models.
        This allows the backend to start without dependency issues.
        """
        print("Initializing Simplified AIProcessor...")
        
        # Initialize AI classifier if available
        self.classifier = None
        self.ai_available = AI_CLASSIFICATION_AVAILABLE
        if self.ai_available:
            try:
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli"
                )
                print("AI classification model loaded successfully.")
            except Exception as e:
                print(f"Failed to load AI model: {e}")
                self.ai_available = False
        
        # Expense categories for classification
        self.expense_categories = [
            "Food & Drinks",
            "Transport",
            "Utilities",
            "Shopping",
            "Electronics & Gadgets",
            "Healthcare",
            "Education",
            "Rent",
            "Bills",
            "Entertainment",
            "Investments",
            "Personal Care",
            "Family & Kids",
            "Charity & Donations",
            "Miscellaneous"
        ]
        
        # Fallback keyword mapping
        self.category_keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee", "snack", "drinks", "beverage"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking", "toll", "transportation"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "wifi", "mobile", "heating", "cooling"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon", "online", "clothing"],
            "Electronics & Gadgets": ["electronics", "gadgets", "phone", "laptop", "computer", "tablet", "headphones", "camera", "tv", "smartphone", "tech"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist", "clinic", "healthcare"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university", "college", "books", "supplies"],
            "Rent": ["rent", "rental", "lease", "housing", "apartment", "house"],
            "Bills": ["bill", "bills", "payment", "invoice", "subscription", "membership", "fee"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix", "spotify", "theater"],
            "Investments": ["investment", "stocks", "bonds", "mutual", "fund", "portfolio", "trading", "crypto", "bitcoin"],
            "Personal Care": ["personal", "care", "beauty", "haircut", "salon", "spa", "cosmetics", "skincare", "grooming"],
            "Family & Kids": ["family", "kids", "children", "baby", "childcare", "toys", "daycare", "babysitter"],
            "Charity & Donations": ["charity", "donation", "donate", "nonprofit", "church", "temple", "mosque", "giving", "contribution"],
            "Miscellaneous": []
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

    def classify_text_ai(self, text: str) -> str:
        """Classify text using AI model."""
        if not self.classifier or not text:
            return None
            
        try:
            result = self.classifier(text, self.expense_categories)
            predicted_category = result['labels'][0]
            confidence = result['scores'][0]
            
            print(f"AI Classification: '{predicted_category}' (confidence: {confidence:.2f})")
            
            # Direct mapping since we're using the exact category names
            return predicted_category
            

            
        except Exception as e:
            print(f"AI classification failed: {e}")
            return None
    
    def classify_text_keywords(self, text: str) -> str:
        """Fallback keyword-based classification."""
        if not text:
            return "Miscellaneous"
        
        text_lower = text.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                print(f"Keyword Classification: '{category}'")
                return category
        
        print(f"Keyword Classification: 'Miscellaneous'")
        return "Miscellaneous"
    
    def classify_text(self, text: str) -> str:
        """Classify text using AI model with keyword fallback."""
        if not text:
            return "Miscellaneous"
            
        # Try AI classification first
        if self.ai_available and self.classifier:
            ai_result = self.classify_text_ai(text)
            if ai_result:
                return ai_result
        
        # Fallback to keyword matching
        return self.classify_text_keywords(text)

    def extract_amount(self, text: str) -> float:
        """Enhanced amount extraction with better patterns."""
        if not text:
            return 0.0
            
        # Remove common currency words and symbols
        text = re.sub(r'\b(rupees?|dollars?|usd|pkr|inr|rs\.?|\$)\b', '', text, flags=re.IGNORECASE)
        
        # Look for currency symbols followed by numbers
        currency_matches = re.findall(r'[\$₹]\s*([\d,]+(?:\.\d{1,2})?)', text)
        if currency_matches:
            amount_str = currency_matches[0].replace(',', '')
            amount = float(amount_str)
            print(f"Extracted Amount (currency symbol): {amount}")
            return amount
        
        # Look for numbers with commas (e.g., "50,000", "1,234.56")
        comma_matches = re.findall(r'\b\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?\b', text)
        if comma_matches:
            amount_str = comma_matches[0].replace(',', '')
            amount = float(amount_str)
            print(f"Extracted Amount (with commas): {amount}")
            return amount
        
        # Look for decimal numbers
        decimal_matches = re.findall(r'\b\d+\.\d{1,2}\b', text)
        if decimal_matches:
            amount = float(decimal_matches[0])
            print(f"Extracted Amount (decimal): {amount}")
            return amount
        
        # Look for regular numbers
        regular_matches = re.findall(r'\b\d+\b', text)
        if regular_matches:
            # Get the largest number (likely the amount)
            amounts = [float(match) for match in regular_matches]
            amount = max(amounts)
            print(f"Extracted Amount (regular): {amount}")
            return amount
            
        print("No amount found, defaulting to 0.0")
        return 0.0

    def process_expense_audio(self, audio_file_path: str) -> dict:
        """The main function to process an audio file into structured expense data."""
        transcription = self.transcribe_audio(audio_file_path)
        
        if not transcription:
            return {
                "description": "Could not transcribe audio. Please try again or enter manually.",
                "category": "Miscellaneous",
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