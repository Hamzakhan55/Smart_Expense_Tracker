import re
import os
from pathlib import Path
import time

class SimpleOfflineProcessor:
    def __init__(self):
        self._models_loaded = True
        print("✅ Simple offline processor ready")
    
    def transcribe_audio(self, audio_path: str) -> str:
        """Whisper transcription"""
        if not os.path.exists(audio_path):
            return ""
        
        try:
            import torch
            from transformers import WhisperProcessor, WhisperForConditionalGeneration
            import librosa
            
            # Load Whisper if not loaded
            if not hasattr(self, 'whisper_model'):
                whisper_dir = Path(__file__).parent.parent / "models" / "whisper-large-v3"
                self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_dir))
                self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_dir))
                self.whisper_model.eval()
                print("✅ Whisper loaded")
            
            # Process audio
            audio, _ = librosa.load(audio_path, sr=16000, duration=30)
            inputs = self.whisper_processor(audio, sampling_rate=16000, return_tensors="pt")
            
            # Force English output
            forced_decoder_ids = self.whisper_processor.get_decoder_prompt_ids(
                language="en", 
                task="translate"  # This translates to English
            )
            
            with torch.no_grad():
                predicted_ids = self.whisper_model.generate(
                    inputs.input_features,
                    max_length=50,
                    num_beams=1,
                    do_sample=False,
                    forced_decoder_ids=forced_decoder_ids
                )
                transcription = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                return transcription.strip()
                
        except Exception as e:
            print(f"Whisper error: {e}")
            return ""
    
    def classify_expense(self, text: str) -> str:
        """Keyword-based classification"""
        if not text:
            return "Miscellaneous"
        
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["bart", "motorway", "tour", "ticket", "travel", "transport", "taxi", "bus", "train"]):
            return "Transport"
        elif any(word in text_lower for word in ["food", "lunch", "dinner", "restaurant", "meal"]):
            return "Food & Drinks"
        elif any(word in text_lower for word in ["shop", "shopping", "buy", "store"]):
            return "Shopping"
        elif any(word in text_lower for word in ["bill", "payment", "electric", "utility"]):
            return "Bills"
        elif any(word in text_lower for word in ["doctor", "medicine", "hospital", "health"]):
            return "Healthcare"
        else:
            return "Miscellaneous"
    
    def extract_amount(self, text: str) -> float:
        """Extract amount from text"""
        if not text:
            return 0.0
        
        patterns = [
            r'(\d+(?:,\d{3})*)\s*(?:rupees?|rs)',
            r'(\d{1,3}(?:,\d{3})+)',
            r'\b(\d{3,5})\b'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                try:
                    amount = float(match.replace(',', ''))
                    if 10 <= amount <= 100000:
                        return amount
                except ValueError:
                    continue
        
        return 0.0
    
    def process_audio(self, audio_path: str) -> dict:
        """Process audio file"""
        start_time = time.time()
        
        if not os.path.exists(audio_path):
            return {"description": "File not found", "category": "Error", "amount": 0.0}
        
        # Transcribe
        transcription = self.transcribe_audio(audio_path)
        if not transcription:
            return {"description": "Could not transcribe", "category": "Error", "amount": 0.0}
        
        # Classify and extract
        category = self.classify_expense(transcription)
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        
        print(f"🎯 Processed in {time.time() - start_time:.2f}s: {result}")
        return result
    
    async def process_audio_async(self, audio_path: str) -> dict:
        """Async wrapper"""
        return self.process_audio(audio_path)
    
    def get_status(self) -> dict:
        return {
            "mode": "SIMPLE_OFFLINE",
            "models_loaded": True,
            "whisper_ready": hasattr(self, 'whisper_model'),
            "distilbert_ready": False,
            "models": ["Whisper (English Only)", "Keyword Classification"],
            "language_support": "Auto-translate to English"
        }

# Global instance
simple_processor = SimpleOfflineProcessor()