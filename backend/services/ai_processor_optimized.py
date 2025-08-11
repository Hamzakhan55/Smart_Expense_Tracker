import re
import os
import tempfile
from pathlib import Path
import pickle
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

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

class OptimizedAIProcessor:
    def __init__(self):
        self.whisper_model = None
        self.whisper_processor = None
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Performance optimizations
        self._models_loaded = False
        self._load_start_time = None
        
        # Load models in background
        asyncio.create_task(self._async_load_models())
    
    async def _async_load_models(self):
        """Load models asynchronously to avoid blocking"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self.executor, self._load_models)
    
    def _load_models(self):
        """Optimized model loading with caching"""
        self._load_start_time = time.time()
        
        # Load category model first (faster and more critical)
        if CATEGORY_AVAILABLE:
            try:
                model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
                label_path = model_path / "label_encoder.pkl"
                
                if not label_path.exists():
                    label_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "label_encoder.pkl"
                    model_path = Path(__file__).parent.parent / "models" / "distilbert-base-uncased-mnli" / "my_model"
                
                if model_path.exists() and label_path.exists():
                    self.category_tokenizer = AutoTokenizer.from_pretrained(str(model_path))
                    self.category_model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                    self.category_model.eval()
                    
                    # Enable inference optimizations
                    if hasattr(torch, 'jit') and torch.cuda.is_available():
                        self.category_model = torch.jit.script(self.category_model)
                    
                    with open(label_path, "rb") as f:
                        self.label_encoder = pickle.load(f)
                    print(f"✅ Category model loaded ({time.time() - self._load_start_time:.2f}s)")
            except Exception as e:
                print(f"❌ Category model failed: {e}")
        
        # Load Whisper with optimizations
        if WHISPER_AVAILABLE:
            try:
                whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
                if whisper_path.exists():
                    self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                    self.whisper_model = WhisperForConditionalGeneration.from_pretrained(
                        str(whisper_path),
                        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                        device_map="auto" if torch.cuda.is_available() else None
                    )
                    self.whisper_model.eval()
                    print(f"✅ Whisper loaded ({time.time() - self._load_start_time:.2f}s)")
            except Exception as e:
                print(f"❌ Whisper failed: {e}")
        
        self._models_loaded = True
        print(f"🚀 All models loaded in {time.time() - self._load_start_time:.2f}s")
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """Optimized transcription with multiple fallbacks"""
        if not os.path.exists(audio_file_path):
            return ""
        
        start_time = time.time()
        
        # Fast path: Google Speech Recognition (usually fastest)
        if SR_AVAILABLE:
            try:
                r = sr.Recognizer()
                r.energy_threshold = 150  # Lower threshold for faster processing
                r.pause_threshold = 0.3   # Shorter pause for speed
                r.phrase_threshold = 0.2  # Faster phrase detection
                
                # Quick audio preprocessing
                audio = AudioSegment.from_file(audio_file_path)
                if len(audio) > 30000:  # Limit to 30 seconds for speed
                    audio = audio[:30000]
                
                audio = audio.set_frame_rate(16000).set_channels(1)
                
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                    audio.export(tmp.name, format='wav')
                    
                    with sr.AudioFile(tmp.name) as source:
                        r.adjust_for_ambient_noise(source, duration=0.05)  # Faster noise adjustment
                        audio_data = r.record(source)
                    
                    text = r.recognize_google(audio_data, language='en-US')
                    os.unlink(tmp.name)
                    
                    print(f"📝 Transcribed in {time.time() - start_time:.2f}s: '{text}'")
                    return text.strip()
                    
            except Exception as e:
                print(f"⚠️ Speech recognition failed ({time.time() - start_time:.2f}s): {e}")
        
        # Fallback: Whisper (slower but more accurate)
        if self.whisper_model and LIBROSA_AVAILABLE:
            try:
                audio_array, _ = librosa.load(audio_file_path, sr=16000, duration=30)  # Limit duration
                if len(audio_array) < 1600:
                    return ""
                
                # Optimize input processing
                inputs = self.whisper_processor(
                    audio_array, 
                    sampling_rate=16000, 
                    return_tensors="pt",
                    truncation=True,
                    max_length=3000  # Limit input length
                )
                
                with torch.no_grad():
                    predicted_ids = self.whisper_model.generate(
                        inputs.input_features,
                        max_length=50,      # Shorter output for speed
                        num_beams=1,        # Greedy decoding (fastest)
                        do_sample=False,
                        early_stopping=True
                    )
                    text = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                    print(f"🎤 Whisper transcribed in {time.time() - start_time:.2f}s: '{text}'")
                    return text.strip()
                    
            except Exception as e:
                print(f"❌ Whisper failed ({time.time() - start_time:.2f}s): {e}")
        
        return ""
    
    def classify_text(self, text: str) -> str:
        """Optimized text classification"""
        if not text:
            return "Miscellaneous"
        
        start_time = time.time()
        
        # Fast keyword classification first
        keyword_result = self._classify_keywords(text)
        if keyword_result != "Miscellaneous":
            print(f"🏷️ Keyword classified in {time.time() - start_time:.3f}s: {keyword_result}")
            return keyword_result
        
        # Model classification for ambiguous cases
        if self.category_model and self.label_encoder:
            try:
                inputs = self.category_tokenizer(
                    text, 
                    return_tensors="pt", 
                    truncation=True, 
                    padding=True,
                    max_length=128  # Limit input length for speed
                )
                
                with torch.no_grad():
                    outputs = self.category_model(**inputs)
                    predicted_id = outputs.logits.argmax().item()
                    category = self.label_encoder.inverse_transform([predicted_id])[0]
                    
                    print(f"🤖 Model classified in {time.time() - start_time:.3f}s: {category}")
                    return self._map_category(category)
                    
            except Exception as e:
                print(f"❌ Model classification failed: {e}")
        
        return "Miscellaneous"
    
    def _map_category(self, model_category: str) -> str:
        """Fast category mapping"""
        valid_categories = {
            "Bills", "Charity & Donations", "Education", "Electronics & Gadgets",
            "Entertainment", "Family & Kids", "Food & Drinks", "Healthcare", 
            "Investments", "Miscellaneous", "Personal Care", "Rent", 
            "Shopping", "Transport", "Utilities"
        }
        return model_category if model_category in valid_categories else "Miscellaneous"
    
    def _classify_keywords(self, text: str) -> str:
        """Optimized keyword classification with better patterns"""
        text_lower = text.lower()
        
        # Transport keywords (most common in your logs)
        if any(word in text_lower for word in ["bart", "motorway", "tour", "ticket", "travel", "trip", "flight", "train", "bus", "taxi", "uber", "transport", "gas", "fuel", "parking", "karachi", "islamabad", "lahore"]):
            return "Transport"
        
        # Food & Drinks
        elif any(word in text_lower for word in ["food", "lunch", "dinner", "restaurant", "eat", "grocery", "meal", "coffee", "drink"]):
            return "Food & Drinks"
        
        # Shopping
        elif any(word in text_lower for word in ["shop", "buy", "store", "purchase", "clothes", "shopping", "amazon", "mall"]):
            return "Shopping"
        
        # Bills & Utilities
        elif any(word in text_lower for word in ["bill", "payment", "subscription", "electric", "water", "fee", "electricity", "internet", "phone", "utility"]):
            return "Bills"
        
        # Healthcare
        elif any(word in text_lower for word in ["doctor", "medicine", "hospital", "health", "pharmacy", "medical"]):
            return "Healthcare"
        
        # Entertainment
        elif any(word in text_lower for word in ["movie", "game", "entertainment", "concert", "show", "netflix", "spotify"]):
            return "Entertainment"
        
        return "Miscellaneous"
    
    def extract_amount(self, text: str) -> float:
        """Optimized amount extraction with better patterns"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        # Enhanced patterns for Pakistani context
        patterns = [
            # "3397 rupees", "100 rs"
            r'(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rupees?|rs|pkr)',
            # "spent 50 dollars", "paid 25 bucks"
            r'(?:spent|paid|cost|worth|price|bought)\s+(\d+(?:,\d{3})*(?:\.\d{1,2})?)',
            # "$50", "$ 25.50"
            r'\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)',
            # Numbers with commas "1,000", "3,397"
            r'(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)',
            # Decimal numbers "25.50", "99.99"
            r'(\d+\.\d{1,2})',
            # Any reasonable number (10-99999)
            r'\b(\d{2,5})\b'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                for match in matches:
                    try:
                        amount = float(match.replace(',', ''))
                        if 1 <= amount <= 100000:
                            return amount
                    except ValueError:
                        continue
        
        return 0.0
    
    async def process_expense_audio_async(self, audio_file_path: str) -> dict:
        """Async wrapper for audio processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.process_expense_audio, audio_file_path)
    
    def process_expense_audio(self, audio_file_path: str) -> dict:
        """Optimized audio processing pipeline"""
        start_time = time.time()
        print(f"🎯 Processing: {os.path.basename(audio_file_path)}")
        
        if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
            return {"description": "Audio file error", "category": "Error", "amount": 0.0}
        
        # Wait for models if not loaded (with timeout)
        timeout = 10  # 10 second timeout
        wait_start = time.time()
        while not self._models_loaded and (time.time() - wait_start) < timeout:
            time.sleep(0.1)
        
        # Step 1: Transcribe (parallel processing ready)
        transcription = self.transcribe_audio(audio_file_path)
        if not transcription:
            return {"description": "Could not understand audio", "category": "Error", "amount": 0.0}
        
        # Step 2 & 3: Classify and extract amount in parallel
        category = self.classify_text(transcription)
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        
        total_time = time.time() - start_time
        print(f"✅ Processed in {total_time:.2f}s: {result}")
        
        return result
    
    def get_status(self) -> dict:
        """Get processor status for debugging"""
        return {
            "models_loaded": self._models_loaded,
            "whisper_available": self.whisper_model is not None,
            "category_available": self.category_model is not None,
            "sr_available": SR_AVAILABLE,
            "librosa_available": LIBROSA_AVAILABLE,
            "load_time": time.time() - self._load_start_time if self._load_start_time else None
        }

# Global instance
optimized_ai_processor = OptimizedAIProcessor()