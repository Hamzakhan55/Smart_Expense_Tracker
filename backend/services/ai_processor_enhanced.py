import re
from pathlib import Path
import os
import tempfile

try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False

try:
    from transformers import pipeline
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

class AIProcessor:
    def __init__(self):
        print("Initializing Enhanced AIProcessor...")
        
        # Load AI model if available
        self.classifier = None
        if AI_AVAILABLE:
            try:
                self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
                print("AI model loaded successfully.")
            except:
                self.classifier = None
        
        self.categories = ["Food & Drinks", "Transport", "Utilities", "Shopping", "Electronics & Gadgets", "Healthcare", "Education", "Rent", "Bills", "Entertainment", "Investments", "Personal Care", "Family & Kids", "Charity & Donations", "Miscellaneous"]
        
        # Enhanced keyword mapping
        self.keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee", "snack", "dining", "cafe", "kitchen", "cooking", "drinks", "beverage"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking", "toll", "car", "bike", "flight", "airline", "transportation"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "wifi", "mobile", "cable", "heating", "cooling"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon", "online", "retail", "shop", "clothing"],
            "Electronics & Gadgets": ["electronics", "gadgets", "phone", "laptop", "computer", "tablet", "headphones", "camera", "tv", "smartphone", "tech", "device"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist", "clinic", "prescription", "healthcare"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university", "college", "learning", "books", "supplies"],
            "Rent": ["rent", "rental", "lease", "housing", "apartment", "house"],
            "Bills": ["bill", "bills", "payment", "invoice", "subscription", "membership", "fee"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix", "spotify", "music", "show", "theater"],
            "Investments": ["investment", "stocks", "bonds", "mutual", "fund", "portfolio", "trading", "crypto", "bitcoin"],
            "Personal Care": ["personal", "care", "beauty", "haircut", "salon", "spa", "cosmetics", "skincare", "grooming"],
            "Family & Kids": ["family", "kids", "children", "baby", "childcare", "toys", "school", "daycare", "babysitter"],
            "Charity & Donations": ["charity", "donation", "donate", "nonprofit", "church", "temple", "mosque", "giving", "contribution"],
            "Miscellaneous": []
        }
        
        print("Enhanced AIProcessor initialized successfully.")

    def convert_to_wav(self, audio_file_path: str) -> str:
        if not SPEECH_RECOGNITION_AVAILABLE:
            return audio_file_path
        try:
            if Path(audio_file_path).suffix.lower() == '.wav':
                return audio_file_path
            audio = AudioSegment.from_file(audio_file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                audio.export(temp_wav.name, format='wav')
                return temp_wav.name
        except:
            return audio_file_path

    def transcribe_audio(self, audio_file_path: str) -> str:
        if not SPEECH_RECOGNITION_AVAILABLE:
            return ""
        wav_file = None
        try:
            r = sr.Recognizer()
            if not os.path.exists(audio_file_path):
                return ""
            wav_file = self.convert_to_wav(audio_file_path)
            with sr.AudioFile(wav_file) as source:
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio = r.record(source)
            text = r.recognize_google(audio)
            print(f"Transcribed: {text}")
            return text
        except:
            return ""
        finally:
            if wav_file and wav_file != audio_file_path and os.path.exists(wav_file):
                try:
                    os.unlink(wav_file)
                except:
                    pass

    def classify_text(self, text: str) -> str:
        if not text:
            return "Miscellaneous"
        
        text_lower = text.lower()
        
        # Try AI classification first
        if self.classifier:
            try:
                result = self.classifier(text, self.categories)
                category = result['labels'][0]
                confidence = result['scores'][0]
                if confidence > 0.3:  # Only use if confident
                    print(f"AI classified as: {category} (confidence: {confidence:.2f})")
                    return category
            except:
                pass
        
        # Fallback to keyword matching with scoring
        category_scores = {}
        for category, keywords in self.keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            print(f"Keyword classified as: {best_category}")
            return best_category
        
        return "Miscellaneous"

    def extract_amount(self, text: str) -> float:
        if not text:
            return 0.0
        
        # Remove currency words
        text = re.sub(r'\b(rupees?|dollars?|usd|pkr|inr|rs\.?|\$)\b', '', text, flags=re.IGNORECASE)
        
        # Find numbers with various patterns
        patterns = [
            r'[\$₹]\s*([0-9,]+(?:\.[0-9]{1,2})?)',  # Currency symbols
            r'\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b',  # Comma separated
            r'\b([0-9]+\.[0-9]{1,2})\b',  # Decimal
            r'\b([0-9]+)\b'  # Regular numbers
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                try:
                    amount = float(matches[0].replace(',', ''))
                    print(f"Extracted amount: {amount}")
                    return amount
                except:
                    continue
        
        return 0.0

    def process_expense_audio(self, audio_file_path: str) -> dict:
        transcription = self.transcribe_audio(audio_file_path)
        
        if not transcription:
            return {
                "description": "Could not transcribe audio. Please try again.",
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

ai_processor = AIProcessor()