import re
import os
from pathlib import Path
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
import json

try:
    import torch
    from transformers import WhisperProcessor, WhisperForConditionalGeneration, AutoTokenizer, AutoModelForSequenceClassification
    import librosa
    import numpy as np
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

class OfflineAIProcessor:
    def __init__(self):
        self.whisper_model = None
        self.whisper_processor = None
        self.category_model = None
        self.category_tokenizer = None
        self.category_labels = {}
        self.executor = ThreadPoolExecutor(max_workers=1)
        self._models_loaded = False
        self._load_start_time = time.time()
        
        # Load models immediately
        self._load_models()
    

    
    def _load_models(self):
        """Load your trained models with optimizations"""
        print("🔄 Loading offline models...")
        
        # Load DistilBERT (your trained model)
        try:
            model_dir = Path(__file__).parent.parent / "models" / "distilbert-expense"
            checkpoint_dir = model_dir / "checkpoint-3072"
            
            # Load config to get labels
            config_path = model_dir / "config.json"
            if config_path.exists():
                with open(config_path) as f:
                    config = json.load(f)
                    self.category_labels = config.get("id2label", {})
            
            # Load model and tokenizer
            self.category_tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
            self.category_model = AutoModelForSequenceClassification.from_pretrained(str(checkpoint_dir))
            self.category_model.eval()
            
            # Optimize for inference
            if torch.cuda.is_available():
                self.category_model = self.category_model.cuda()
            
            print(f"✅ DistilBERT loaded with {len(self.category_labels)} categories")
            
        except Exception as e:
            print(f"❌ DistilBERT loading failed: {e}")
        
        # Load Whisper with optimizations
        try:
            whisper_dir = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            
            self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_dir))
            self.whisper_model = WhisperForConditionalGeneration.from_pretrained(
                str(whisper_dir),
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            self.whisper_model.eval()
            
            print(f"✅ Whisper Large V3 loaded")
            
        except Exception as e:
            print(f"❌ Whisper loading failed: {e}")
        
        self._models_loaded = True
        load_time = time.time() - self._load_start_time
        print(f"🚀 All offline models ready in {load_time:.2f}s")
    
    def transcribe_audio(self, audio_path: str) -> str:
        """Optimized Whisper transcription"""
        if not self.whisper_model or not os.path.exists(audio_path):
            return ""
        
        try:
            # Load and preprocess audio
            audio, _ = librosa.load(audio_path, sr=16000, duration=30)
            if len(audio) < 1600:  # Too short
                return ""
            
            # Normalize audio
            audio = audio / np.max(np.abs(audio))
            
            # Process with Whisper
            inputs = self.whisper_processor(audio, sampling_rate=16000, return_tensors="pt")
            
            with torch.no_grad():
                predicted_ids = self.whisper_model.generate(
                    inputs.input_features,
                    max_length=50,
                    num_beams=1,
                    do_sample=False,
                    early_stopping=True,
                    pad_token_id=self.whisper_processor.tokenizer.pad_token_id
                )
                
                transcription = self.whisper_processor.batch_decode(
                    predicted_ids, skip_special_tokens=True
                )[0].strip()
                
                return transcription
                
        except Exception as e:
            print(f"Transcription error: {e}")
            import traceback
            traceback.print_exc()
            return ""
    
    def classify_expense(self, text: str) -> str:
        """Smart classification with your trained model"""
        if not text:
            return "Other"
        
        # Fast keyword pre-filtering
        quick_category = self._quick_classify(text)
        if quick_category:
            return quick_category
        
        # Use your trained DistilBERT model
        if self.category_model and self.category_tokenizer:
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
                    predicted_id = str(outputs.logits.argmax().item())
                    
                    # Get category from your model's labels
                    category = self.category_labels.get(predicted_id, "Other")
                    return self._normalize_category(category)
                    
            except Exception as e:
                print(f"Classification error: {e}")
                import traceback
                traceback.print_exc()
        
        return "Other"
    
    def _quick_classify(self, text: str) -> str:
        """Fast keyword-based classification for common patterns"""
        text_lower = text.lower()
        
        # Transport patterns (most common in your logs)
        if any(word in text_lower for word in ["bart", "motorway", "tour", "ticket", "travel", "transport", "taxi", "bus", "train", "flight"]):
            return "Transport"
        
        # Food patterns
        elif any(word in text_lower for word in ["food", "lunch", "dinner", "restaurant", "meal", "grocery"]):
            return "Food & Drinks"
        
        # Bills/Utilities
        elif any(word in text_lower for word in ["bill", "electric", "water", "internet", "phone", "utility"]):
            return "Utilities & Bills"
        
        return None
    
    def _normalize_category(self, category: str) -> str:
        """Normalize category names to match frontend"""
        mapping = {
            "Utilities & Bills": "Bills",
            "Other": "Miscellaneous"
        }
        return mapping.get(category, category)
    
    def extract_amount(self, text: str) -> float:
        """Optimized amount extraction for Pakistani context"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        # Pakistani rupee patterns (prioritized)
        patterns = [
            r'(\d+(?:,\d{3})*)\s*(?:rupees?|rs|pkr)',  # "3397 rupees"
            r'(?:for|cost|paid)\s+(\d+(?:,\d{3})*)',   # "for 3397"
            r'(\d{1,3}(?:,\d{3})+)',                   # "3,397"
            r'\b(\d{3,5})\b'                           # "3397"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    amount = float(match.replace(',', ''))
                    if 10 <= amount <= 100000:  # Reasonable range
                        return amount
                except ValueError:
                    continue
        
        return 0.0
    
    def process_audio(self, audio_path: str) -> dict:
        """Main processing pipeline"""
        start_time = time.time()
        
        if not os.path.exists(audio_path):
            return {"description": "File not found", "category": "Error", "amount": 0.0}
        
        if not self._models_loaded:
            return {"description": "Models not loaded", "category": "Error", "amount": 0.0}
        
        # Process audio
        transcription = self.transcribe_audio(audio_path)
        if not transcription:
            return {"description": "Could not transcribe audio", "category": "Error", "amount": 0.0}
        
        # Extract information
        category = self.classify_expense(transcription)
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        
        processing_time = time.time() - start_time
        print(f"🎯 Processed offline in {processing_time:.2f}s: {result}")
        
        return result
    
    async def process_audio_async(self, audio_path: str) -> dict:
        """Async wrapper for audio processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.process_audio, audio_path)
    
    def get_status(self) -> dict:
        """System status for monitoring"""
        return {
            "mode": "FULLY_OFFLINE",
            "models_loaded": self._models_loaded,
            "whisper_ready": self.whisper_model is not None,
            "distilbert_ready": self.category_model is not None,
            "categories": len(self.category_labels),
            "load_time": f"{time.time() - self._load_start_time:.2f}s" if self._models_loaded else "Loading...",
            "models": ["Whisper Large V3 (Local)", "DistilBERT (Your Trained Model)"]
        }

# Global instance
offline_processor = OfflineAIProcessor()