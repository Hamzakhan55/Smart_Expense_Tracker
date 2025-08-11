import re
import os
from pathlib import Path
import pickle
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor

try:
    import torch
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import librosa
    MODELS_AVAILABLE = True
except ImportError:
    MODELS_AVAILABLE = False

class LocalOnlyAIProcessor:
    def __init__(self):
        self.whisper_model = None
        self.whisper_processor = None
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        self.executor = ThreadPoolExecutor(max_workers=1)
        self._models_loaded = False
        
        # Load models in background
        asyncio.create_task(self._async_load_models())
    
    async def _async_load_models(self):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self.executor, self._load_models)
    
    def _load_models(self):
        start_time = time.time()
        
        # Load DistilBERT from checkpoint
        try:
            model_path = Path(__file__).parent.parent / "models" / "distilbert-expense" / "checkpoint-3072"
            tokenizer_path = Path(__file__).parent.parent / "models" / "distilbert-expense"
            
            if model_path.exists():
                self.category_tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_path))
                self.category_model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                self.category_model.eval()
                
                print(f"✅ DistilBERT loaded ({time.time() - start_time:.2f}s)")
        except Exception as e:
            print(f"❌ DistilBERT failed: {e}")
            print("Using keyword-only classification")
        
        # Load Whisper with optimizations
        try:
            whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            if whisper_path.exists():
                self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                self.whisper_model = WhisperForConditionalGeneration.from_pretrained(
                    str(whisper_path),
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                )
                self.whisper_model.eval()
                print(f"✅ Whisper loaded ({time.time() - start_time:.2f}s)")
        except Exception as e:
            print(f"❌ Whisper failed: {e}")
        
        self._models_loaded = True
        print(f"🚀 Local models loaded in {time.time() - start_time:.2f}s")
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        if not self.whisper_model or not os.path.exists(audio_file_path):
            return ""
        
        try:
            # Optimized audio loading
            audio_array, _ = librosa.load(audio_file_path, sr=16000, duration=30)
            if len(audio_array) < 1600:
                return ""
            
            # Faster processing
            inputs = self.whisper_processor(
                audio_array, 
                sampling_rate=16000, 
                return_tensors="pt",
                truncation=True
            )
            
            with torch.no_grad():
                predicted_ids = self.whisper_model.generate(
                    inputs.input_features,
                    max_length=50,
                    num_beams=1,
                    do_sample=False,
                    early_stopping=True
                )
                text = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                return text.strip()
                
        except Exception as e:
            print(f"Whisper error: {e}")
            return ""
    
    def classify_text(self, text: str) -> str:
        if not text:
            return "Miscellaneous"
        
        # Fast keyword classification first
        keyword_result = self._classify_keywords(text)
        if keyword_result != "Miscellaneous":
            return keyword_result
        
        # Use DistilBERT for ambiguous cases
        if self.category_model:
            try:
                inputs = self.category_tokenizer(
                    text, 
                    return_tensors="pt", 
                    truncation=True, 
                    padding=True,
                    max_length=128
                )
                
                with torch.no_grad():
                    outputs = self.category_model(**inputs)
                    predicted_id = outputs.logits.argmax().item()
                    
                    # Map to categories directly
                    categories = ["Bills", "Food & Drinks", "Healthcare", "Shopping", "Transport", "Utilities", "Entertainment", "Miscellaneous"]
                    if predicted_id < len(categories):
                        return categories[predicted_id]
                    
            except Exception as e:
                print(f"Classification error: {e}")
        
        return "Miscellaneous"
    
    def _classify_keywords(self, text: str) -> str:
        text_lower = text.lower()
        
        # Transport (most common)
        if any(word in text_lower for word in ["bart", "motorway", "tour", "ticket", "travel", "trip", "transport", "taxi", "bus", "train"]):
            return "Transport"
        elif any(word in text_lower for word in ["food", "lunch", "dinner", "restaurant", "meal"]):
            return "Food & Drinks"
        elif any(word in text_lower for word in ["shop", "shopping", "buy", "store"]):
            return "Shopping"
        elif any(word in text_lower for word in ["bill", "payment", "electric", "utility"]):
            return "Bills"
        elif any(word in text_lower for word in ["doctor", "medicine", "hospital", "health"]):
            return "Healthcare"
        
        return "Miscellaneous"
    
    def _map_category(self, model_category: str) -> str:
        valid_categories = {
            "Bills", "Charity & Donations", "Education", "Electronics & Gadgets",
            "Entertainment", "Family & Kids", "Food & Drinks", "Healthcare", 
            "Investments", "Miscellaneous", "Personal Care", "Rent", 
            "Shopping", "Transport", "Utilities"
        }
        return model_category if model_category in valid_categories else "Miscellaneous"
    
    def extract_amount(self, text: str) -> float:
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        patterns = [
            r'(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rupees?|rs)',
            r'(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)',
            r'(\d+\.\d{1,2})',
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
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.process_expense_audio, audio_file_path)
    
    def process_expense_audio(self, audio_file_path: str) -> dict:
        start_time = time.time()
        
        if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
            return {"description": "Audio file error", "category": "Error", "amount": 0.0}
        
        # Wait for models
        timeout = 15
        wait_start = time.time()
        while not self._models_loaded and (time.time() - wait_start) < timeout:
            time.sleep(0.1)
        
        # Transcribe
        transcription = self.transcribe_audio(audio_file_path)
        if not transcription:
            return {"description": "Could not understand audio", "category": "Error", "amount": 0.0}
        
        # Classify and extract
        category = self.classify_text(transcription)
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        
        print(f"✅ Processed locally in {time.time() - start_time:.2f}s: {result}")
        return result
    
    def get_status(self) -> dict:
        return {
            "models_loaded": self._models_loaded,
            "whisper_available": self.whisper_model is not None,
            "category_available": self.category_model is not None,
            "mode": "LOCAL_ONLY",
            "models": ["Whisper Large V3", "DistilBERT"]
        }

# Global instance
local_ai_processor = LocalOnlyAIProcessor()