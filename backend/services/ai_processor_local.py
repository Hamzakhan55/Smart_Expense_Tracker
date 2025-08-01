import re
import os
import tempfile
from pathlib import Path
import pickle

try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False

try:
    import torch
    from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
    LOCAL_MODELS_AVAILABLE = True
except ImportError:
    LOCAL_MODELS_AVAILABLE = False

class AIProcessor:
    def __init__(self):
        print("Initializing Local AI Processor...")
        
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None

        
        # Load local models
        if LOCAL_MODELS_AVAILABLE:
            self._load_category_model()
        
        print("Local AI Processor initialized successfully.")
    
    def _load_category_model(self):
        try:
            model_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "my_model"
            label_encoder_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "label_encoder.pkl"
            
            if model_path.exists() and label_encoder_path.exists():
                self.category_model = DistilBertForSequenceClassification.from_pretrained(str(model_path))
                self.category_tokenizer = DistilBertTokenizerFast.from_pretrained(str(model_path))
                
                with open(label_encoder_path, "rb") as f:
                    self.label_encoder = pickle.load(f)
                
                print("Category classification model loaded successfully.")
            else:
                print("Local category model not found.")
        except Exception as e:
            print(f"Failed to load category model: {e}")
    

    
    def transcribe_audio(self, audio_file_path: str) -> str:
        if not os.path.exists(audio_file_path):
            return ""
        

        
        # Fallback to speech_recognition
        if not SPEECH_RECOGNITION_AVAILABLE:
            return ""
        
        wav_file = None
        try:
            r = sr.Recognizer()
            wav_file = self._convert_to_wav(audio_file_path)
            
            with sr.AudioFile(wav_file) as source:
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio = r.record(source)
            
            text = r.recognize_google(audio)
            print(f"Google Speech transcribed: {text}")
            return text
        except:
            return ""
        finally:
            if wav_file and wav_file != audio_file_path and os.path.exists(wav_file):
                try:
                    os.unlink(wav_file)
                except:
                    pass
    
    def _convert_to_wav(self, audio_file_path: str) -> str:
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
    
    def classify_text(self, text: str) -> str:
        if not text:
            return "other"
        
        # Use local DistilBERT model if available
        if self.category_model and self.category_tokenizer and self.label_encoder:
            try:
                inputs = self.category_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
                with torch.no_grad():
                    outputs = self.category_model(**inputs)
                    logits = outputs.logits
                    predicted_class_id = logits.argmax().item()
                    predicted_label = self.label_encoder.inverse_transform([predicted_class_id])[0]
                    
                print(f"Local model classified as: {predicted_label}")
                
                # Map your model's actual categories to frontend categories (exact match)
                category_mapping = {
                    "bills & fees": "Bills & Fees",
                    "education": "Education", 
                    "food & drinks": "Food & Drinks",
                    "healthcare": "Healthcare",
                    "rent": "Rent",
                    "shopping": "Shopping",
                    "transport": "Transport",
                    "utilities": "Utilities"
                }
                
                mapped_category = category_mapping.get(predicted_label.lower(), "other")
                print(f"Mapped to: {mapped_category}")
                return mapped_category
            except Exception as e:
                print(f"Local classification failed: {e}")
        
        # Fallback to keyword matching
        return self._classify_keywords(text)
    
    def _classify_keywords(self, text: str) -> str:
        keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "bill", "utility", "wifi"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university"],
            "Other": []
        }
        
        text_lower = text.lower()
        for category, words in keywords.items():
            if any(word in text_lower for word in words):
                print(f"Keyword classified as: {category}")
                return category
        
        return "Other"
    
    def extract_amount(self, text: str) -> float:
        if not text:
            return 0.0
        
        patterns = [
            r'[\$₹]\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            r'\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b',
            r'\b([0-9]+\.[0-9]{1,2})\b',
            r'\b([0-9]+)\b'
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

ai_processor = AIProcessor()