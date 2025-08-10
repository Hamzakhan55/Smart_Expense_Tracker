import re
import os
import tempfile
from pathlib import Path
import pickle
import torch
import numpy as np

try:
    import torch
    from transformers import BertForSequenceClassification, XLMRobertaTokenizer
    DISTILBERT_AVAILABLE = True
except ImportError:
    DISTILBERT_AVAILABLE = False

try:
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    import librosa
    AUDIO_PROCESSING_AVAILABLE = True
except ImportError:
    AUDIO_PROCESSING_AVAILABLE = False

class ImprovedAIProcessor:
    def __init__(self):
        print("Initializing Improved AI Processor...")
        
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        self.whisper_model = None
        self.whisper_processor = None
        
        # Load models
        if DISTILBERT_AVAILABLE:
            self._load_category_model()
        if WHISPER_AVAILABLE:
            self._load_whisper_model()
        
        # Improved category mapping
        self.category_mapping = {
            "bills & fees": "Bills",
            "utilities": "Utilities",
            "phone bill": "Bills",
            "credit card": "Bills", 
            "subscription": "Bills",
            "laptop": "Electronics & Gadgets",
            "smartphone": "Electronics & Gadgets",
            "computer": "Electronics & Gadgets",
            "online shopping": "Shopping",
            "amazon": "Shopping",
            "mall": "Shopping"
        }
        
        print("Improved AI Processor initialized.")
    
    def _load_category_model(self):
        try:
            model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
            label_encoder_path = model_path / "label_encoder.pkl"
            
            if model_path.exists() and label_encoder_path.exists():
                self.category_model = BertForSequenceClassification.from_pretrained(str(model_path))
                self.category_tokenizer = XLMRobertaTokenizer.from_pretrained(str(model_path))
                
                with open(label_encoder_path, "rb") as f:
                    self.label_encoder = pickle.load(f)
                
                print("Category model loaded with improvements.")
        except Exception as e:
            print(f"Failed to load category model: {e}")
    
    def _load_whisper_model(self):
        try:
            whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            
            if whisper_path.exists():
                self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
                self.whisper_model.eval()
                print("Whisper model loaded with optimizations.")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
    
    def preprocess_text(self, text):
        """Improved text preprocessing"""
        replacements = {
            "emi": "loan payment",
            "recharge": "bill payment",
            "flipkart": "online shopping", 
            "amazon": "online shopping",
            "uber": "taxi ride",
            "ola": "taxi ride",
            "swiggy": "food delivery",
            "zomato": "food delivery",
            "laptop": "computer purchase",
            "smartphone": "mobile phone",
            "credit card bill": "bill payment",
            "phone bill": "bill payment"
        }
        
        text_lower = text.lower()
        for old, new in replacements.items():
            text_lower = text_lower.replace(old, new)
        
        return text_lower
    
    def classify_text_with_confidence(self, text, threshold=0.6):
        """Enhanced classification with confidence scoring"""
        if not text:
            return "Miscellaneous", 0.0
        
        # Preprocess text
        processed_text = self.preprocess_text(text)
        
        if self.category_model and self.category_tokenizer and self.label_encoder:
            try:
                inputs = self.category_tokenizer(processed_text, return_tensors="pt", truncation=True, padding=True)
                
                with torch.no_grad():
                    outputs = self.category_model(**inputs)
                    probabilities = torch.softmax(outputs.logits, dim=-1)
                    confidence = torch.max(probabilities).item()
                    predicted_class_id = outputs.logits.argmax().item()
                    predicted_label = self.label_encoder.inverse_transform([predicted_class_id])[0]
                
                # Apply improved mapping
                mapped_category = self.category_mapping.get(predicted_label.lower(), predicted_label)
                
                if confidence < threshold:
                    # Use keyword fallback for low confidence
                    keyword_category = self._classify_keywords_enhanced(text)
                    return keyword_category, confidence
                
                return mapped_category, confidence
                
            except Exception as e:
                print(f"Classification failed: {e}")
        
        return self._classify_keywords_enhanced(text), 0.0
    
    def classify_text(self, text):
        """Backward compatible classification method"""
        category, _ = self.classify_text_with_confidence(text)
        return category
    
    def _classify_keywords_enhanced(self, text):
        """Enhanced keyword classification"""
        keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee", "drink", "snack", "tea", "beverage", "swiggy", "zomato", "delivery"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking", "ride", "auto", "ola", "petrol"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "wifi", "mobile", "heating", "cooling", "cylinder"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon", "flipkart", "bag", "shoes", "dress", "bought", "clothing", "online"],
            "Electronics & Gadgets": ["electronics", "gadgets", "phone", "laptop", "computer", "tablet", "headphones", "camera", "tv", "smartphone", "tech", "device"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist", "clinic", "healthcare"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university", "college", "books", "supplies"],
            "Rent": ["rent", "rental", "lease", "housing", "apartment", "house"],
            "Bills": ["bill", "bills", "payment", "invoice", "subscription", "membership", "fee", "emi", "loan", "credit card", "insurance", "premium"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix", "show", "ticket", "theater"],
            "Investments": ["investment", "stocks", "bonds", "mutual", "fund", "portfolio", "trading", "crypto", "bitcoin"],
            "Personal Care": ["personal", "care", "beauty", "haircut", "salon", "spa", "cosmetics", "skincare", "grooming"],
            "Family & Kids": ["family", "kids", "children", "baby", "childcare", "toys", "daycare", "babysitter"],
            "Charity & Donations": ["charity", "donation", "donate", "nonprofit", "church", "temple", "mosque", "giving", "contribution"],
            "Miscellaneous": []
        }
        
        text_lower = text.lower()
        category_scores = {}
        
        for category, words in keywords.items():
            score = sum(1 for word in words if word in text_lower)
            if score > 0:
                category_scores[category] = score
        
        return max(category_scores, key=category_scores.get) if category_scores else "Miscellaneous"
    
    def transcribe_audio_fast(self, audio_file_path: str) -> str:
        """Optimized Whisper transcription"""
        if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
            return ""
        
        if self.whisper_model and self.whisper_processor and AUDIO_PROCESSING_AVAILABLE:
            try:
                # Load with duration limit for speed
                audio_array, sr = librosa.load(audio_file_path, sr=16000, duration=30)
                
                if len(audio_array) < 1600:
                    return ""
                
                input_features = self.whisper_processor(
                    audio_array, 
                    sampling_rate=sr, 
                    return_tensors="pt"
                ).input_features
                
                # Optimized generation parameters
                with torch.no_grad():
                    predicted_ids = self.whisper_model.generate(
                        input_features,
                        max_length=50,
                        num_beams=1,
                        do_sample=False,
                        early_stopping=True,
                        pad_token_id=self.whisper_processor.tokenizer.eos_token_id
                    )
                
                transcription = self.whisper_processor.batch_decode(
                    predicted_ids, 
                    skip_special_tokens=True
                )[0]
                
                return transcription.strip()
                
            except Exception as e:
                print(f"Fast transcription failed: {e}")
        
        return ""
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """Backward compatible transcription method"""
        return self.transcribe_audio_fast(audio_file_path)
    
    def extract_amount(self, text: str) -> float:
        """Enhanced amount extraction"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        patterns = [
            r'(?:for|cost|paid|spent|worth|price)\s+([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?)',
            r'\b([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?)\b',
            r'(?:rupees?|rs?\.?|dollars?|\$|pesos?)\s+([0-9,]+(?:\.[0-9]{1,2})?)',
            r'\$\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            r'\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b',
            r'\b([0-9]+\.[0-9]{1,2})\b',
            r'\b([1-9][0-9]{1,6})\b'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                for match in matches:
                    try:
                        amount = float(match.replace(',', ''))
                        if 1 <= amount <= 1000000:
                            return amount
                    except ValueError:
                        continue
        
        return 0.0
    
    def process_expense_audio(self, audio_file_path: str) -> dict:
        """Enhanced audio processing pipeline"""
        if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
            return {
                "description": "Sorry, we couldn't understand that. Please try again.",
                "category": "Error",
                "amount": 0.0,
                "confidence": 0.0
            }
        
        transcription = self.transcribe_audio_fast(audio_file_path)
        
        if not transcription or transcription.strip() == "":
            return {
                "description": "Sorry, we couldn't understand that. Please try again.",
                "category": "Error", 
                "amount": 0.0,
                "confidence": 0.0
            }
        
        category, confidence = self.classify_text_with_confidence(transcription)
        amount = self.extract_amount(transcription)
        
        return {
            "description": transcription,
            "category": category,
            "amount": amount,
            "confidence": confidence
        }

# Create improved processor instance
improved_ai_processor = ImprovedAIProcessor()