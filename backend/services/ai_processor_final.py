import re
import os
import tempfile
from pathlib import Path
import pickle
import logging

logger = logging.getLogger(__name__)

# Imports with fallbacks
try:
    import torch
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    CATEGORY_AVAILABLE = True
except ImportError:
    CATEGORY_AVAILABLE = False

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SR_AVAILABLE = True
except ImportError:
    SR_AVAILABLE = False

class FinalAIProcessor:
    def __init__(self):
        self.whisper_model = None
        self.whisper_processor = None
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        
        self._load_models()
    
    def _load_models(self):
        # Load Whisper
        if WHISPER_AVAILABLE:
            try:
                whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
                if whisper_path.exists():
                    self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                    self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
                    self.whisper_model.eval()
                    print("Whisper loaded successfully")
            except Exception as e:
                print(f"Whisper failed: {e}")
        
        # Load category model - FIXED PATHS
        if CATEGORY_AVAILABLE:
            try:
                # Try MiniLM-V2 first
                model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
                label_path = model_path / "label_encoder.pkl"
                
                # If not found, try distilbert location
                if not label_path.exists():
                    label_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "label_encoder.pkl"
                    model_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "my_model"
                
                if model_path.exists() and label_path.exists():
                    self.category_tokenizer = AutoTokenizer.from_pretrained(str(model_path))
                    self.category_model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                    self.category_model.eval()
                    
                    with open(label_path, "rb") as f:
                        self.label_encoder = pickle.load(f)
                    print(f"Category model loaded from {model_path}")
                    print(f"Categories: {list(self.label_encoder.classes_)}")
                else:
                    print("Category model not found")
            except Exception as e:
                print(f"Category model failed: {e}")
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        if not os.path.exists(audio_file_path):
            return ""
        
        # Try speech recognition first
        if SR_AVAILABLE:
            try:
                r = sr.Recognizer()
                r.energy_threshold = 200
                r.pause_threshold = 0.5
                
                audio = AudioSegment.from_file(audio_file_path)
                audio = audio.set_frame_rate(16000).set_channels(1)
                
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                    audio.export(tmp.name, format='wav')
                    
                    with sr.AudioFile(tmp.name) as source:
                        r.adjust_for_ambient_noise(source, duration=0.1)
                        audio_data = r.record(source)
                    
                    text = r.recognize_google(audio_data, language='en-US')
                    os.unlink(tmp.name)
                    print(f"Transcribed: '{text}'")
                    return text.strip()
                    
            except Exception as e:
                print(f"Speech recognition failed: {e}")
        
        # Fallback to Whisper
        if self.whisper_model and LIBROSA_AVAILABLE:
            try:
                audio_array, _ = librosa.load(audio_file_path, sr=16000)
                if len(audio_array) < 1600:
                    return ""
                
                inputs = self.whisper_processor(audio_array, sampling_rate=16000, return_tensors="pt")
                
                with torch.no_grad():
                    predicted_ids = self.whisper_model.generate(
                        inputs.input_features,
                        max_length=100,
                        num_beams=1,
                        do_sample=False
                    )
                    text = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                    print(f"Whisper: '{text}'")
                    return text.strip()
                    
            except Exception as e:
                print(f"Whisper failed: {e}")
        
        return ""
    
    def classify_text(self, text: str) -> str:
        if not text:
            return "Miscellaneous"
        
        # Try model first
        if self.category_model and self.label_encoder:
            try:
                inputs = self.category_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
                with torch.no_grad():
                    outputs = self.category_model(**inputs)
                    predicted_id = outputs.logits.argmax().item()
                    category = self.label_encoder.inverse_transform([predicted_id])[0]
                    print(f"Model classified: {category}")
                    return self._map_category(category)
                    
            except Exception as e:
                print(f"Model classification failed: {e}")
        
        # Keyword fallback
        return self._classify_keywords(text)
    
    def _map_category(self, model_category: str) -> str:
        """Model categories already match frontend - return directly"""
        valid_categories = {
            "Bills", "Charity & Donations", "Education", "Electronics & Gadgets",
            "Entertainment", "Family & Kids", "Food & Drinks", "Healthcare", 
            "Investments", "Miscellaneous", "Personal Care", "Rent", 
            "Shopping", "Transport", "Utilities"
        }
        return model_category if model_category in valid_categories else "Miscellaneous"
    
    def _classify_keywords(self, text: str) -> str:
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["karachi", "islamabad", "lahore", "travel", "trip", "going", "flight", "train", "bus", "taxi", "uber", "transport", "gas", "fuel", "parking"]):
            return "Transport"
        elif any(word in text_lower for word in ["food", "lunch", "dinner", "restaurant", "eat", "grocery", "meal"]):
            return "Food & Drinks"
        elif any(word in text_lower for word in ["shop", "buy", "store", "purchase", "clothes", "shopping"]):
            return "Shopping"
        elif any(word in text_lower for word in ["bill", "payment", "subscription", "electric", "water", "fee"]):
            return "Bills"
        elif any(word in text_lower for word in ["doctor", "medicine", "hospital", "health", "pharmacy"]):
            return "Healthcare"
        elif any(word in text_lower for word in ["rent", "apartment", "house", "rental"]):
            return "Rent"
        elif any(word in text_lower for word in ["electricity", "internet", "phone", "utility"]):
            return "Utilities"
        elif any(word in text_lower for word in ["movie", "game", "entertainment", "concert", "show"]):
            return "Entertainment"
        elif any(word in text_lower for word in ["book", "course", "school", "education", "tuition"]):
            return "Education"
        elif any(word in text_lower for word in ["laptop", "computer", "electronics", "gadget"]):
            return "Electronics & Gadgets"
        elif any(word in text_lower for word in ["haircut", "salon", "cosmetics", "personal"]):
            return "Personal Care"
        elif any(word in text_lower for word in ["donation", "charity", "donate"]):
            return "Charity & Donations"
        elif any(word in text_lower for word in ["investment", "stock", "mutual fund"]):
            return "Investments"
        elif any(word in text_lower for word in ["kids", "children", "family", "baby"]):
            return "Family & Kids"
        else:
            return "Miscellaneous"
    
    def extract_amount(self, text: str) -> int:
        if not text:
            return 0
        
        text_lower = text.lower()
        print(f"Extracting from: '{text_lower}'")
        
        # ENHANCED patterns for better amount extraction
        patterns = [
            # "spent 50 dollars", "paid 25 bucks", "cost 100 rupees"
            r'(?:spent|paid|cost|worth|price|bought)\s+(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|rupees?|rs|usd)',
            # "50 dollars", "25.50 bucks", "100 rupees"  
            r'(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|rupees?|rs|usd)',
            # "$50", "$ 25.50"
            r'\$\s*(\d+(?:\.\d{1,2})?)',
            # "dollars 50", "rupees 100"
            r'(?:dollars?|rupees?|rs)\s+(\d+(?:\.\d{1,2})?)',
            # Numbers with commas "1,000", "1,500"
            r'(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)',
            # Decimal numbers "25.50", "99.99"
            r'(\d+\.\d{1,2})',
            # Any reasonable number (10-99999)
            r'\b(\d{2,5})\b'
        ]
        
        for i, pattern in enumerate(patterns):
            matches = re.findall(pattern, text_lower)
            if matches:
                print(f"Pattern {i+1} found: {matches}")
                for match in matches:
                    try:
                        amount = int(float(match.replace(',', '')))
                        if 1 <= amount <= 100000:
                            print(f"Extracted: ${amount}")
                            return amount
                    except ValueError:
                        continue
        
        print("No amount found")
        return 0.0
    
    def process_expense_audio(self, audio_file_path: str) -> dict:
        print(f"Processing: {os.path.basename(audio_file_path)}")
        
        if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
            return {"description": "Audio file error", "category": "Error", "amount": 0.0}
        
        # Step 1: Transcribe
        transcription = self.transcribe_audio(audio_file_path)
        if not transcription:
            return {"description": "Could not understand audio", "category": "Error", "amount": 0.0}
        
        # Step 2: Classify
        category = self.classify_text(transcription)
        
        # Step 3: Extract amount
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        
        print(f"Final result: {result}")
        return result

# Global instance
final_ai_processor = FinalAIProcessor()