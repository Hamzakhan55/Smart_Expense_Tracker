# backend/services/ai_processor.py

import torch
import torchaudio
import re
from pathlib import Path
import torch.nn.functional as F
from transformers import (
    WhisperProcessor, WhisperForConditionalGeneration,
    AutoTokenizer, AutoModelForSequenceClassification
)
# --- NEW IMPORTS ---
from pydub import AudioSegment
import numpy as np

# --- Service Class for AI Processing ---

class AIProcessor:
    def __init__(self):
        """
        Preloads all models at startup for instant response.
        """
        print("📦 Initializing AIProcessor with preloading...")
        
        # Define paths
        base_path = Path(__file__).parent.parent
        self.whisper_model_path = base_path / "models" / "whisper-large-v3"
        self.classifier_model_path = base_path / "models" / "distilbert-expense" / "checkpoint-3072"
        
        if not self.whisper_model_path.exists() or not self.classifier_model_path.exists():
            raise FileNotFoundError("AI models not found.")
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"💡 Using device: {self.device}")
        
        # Load all models immediately
        self._load_models()
        print("✅ AIProcessor ready for instant predictions.")
    
    def _load_models(self):
        """Load all models at startup."""
        print("🧠 Loading Whisper model...")
        self.whisper_processor = WhisperProcessor.from_pretrained(str(self.whisper_model_path))
        self.whisper_model = WhisperForConditionalGeneration.from_pretrained(
            str(self.whisper_model_path),
            torch_dtype=torch.float32  # Use float32 for better accuracy
        ).to(self.device)
        self.whisper_model.eval()
        
        print("🧠 Loading DistilBERT classifier...")
        self.classifier_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        self.classifier_model = AutoModelForSequenceClassification.from_pretrained(
            str(self.classifier_model_path),
            torch_dtype=torch.float32  # Use float32 for better accuracy
        ).to(self.device)
        self.classifier_model.eval()
        
        self.id2label = self.classifier_model.config.id2label

    # --- THIS IS THE CORRECTED, ROBUST FUNCTION ---
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribes audio file to text with optimized settings.
        """
        try:
            print(f"Processing audio file: {audio_file_path}")
            
            # Load audio using pydub
            audio = AudioSegment.from_file(audio_file_path)
            print(f"Original audio: {len(audio)}ms, {audio.frame_rate}Hz, {audio.channels} channels")
            
            # Convert to mono and 16kHz
            audio = audio.set_channels(1).set_frame_rate(16000)
            
            # Convert to numpy array and normalize
            samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
            
            # Proper normalization for different bit depths
            if audio.sample_width == 1:  # 8-bit
                samples = samples / 128.0
            elif audio.sample_width == 2:  # 16-bit
                samples = samples / 32768.0
            elif audio.sample_width == 4:  # 32-bit
                samples = samples / 2147483648.0
            else:
                samples = samples / np.max(np.abs(samples))  # Fallback normalization
            
            print(f"Normalized audio shape: {samples.shape}, range: [{samples.min():.3f}, {samples.max():.3f}]")
            
            # Process with Whisper
            inputs = self.whisper_processor(
                samples,
                sampling_rate=16000,
                return_tensors="pt"
            )
            
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Force English transcription using forced_decoder_ids
            forced_decoder_ids = self.whisper_processor.get_decoder_prompt_ids(language="en", task="transcribe")
            
            with torch.no_grad():
                predicted_ids = self.whisper_model.generate(
                    inputs["input_features"],
                    max_length=448,
                    num_beams=1,
                    do_sample=False,
                    forced_decoder_ids=forced_decoder_ids
                )
            
            transcription = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
            print(f"📝 Transcription: '{transcription}'")
            return transcription.strip()
            
        except Exception as e:
            print(f"ERROR in transcribe_audio: {e}")
            import traceback
            traceback.print_exc()
            return ""

    def classify_text(self, text: str) -> str:
        """Pure model classification - exactly like test script."""
        if not text:
            return "Other"
        
        print(f"🔍 Text: '{text}'")
        
        # Exact same tokenization as test script - NO preprocessing
        inputs = self.classifier_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        
        # Exact same prediction as test script
        with torch.no_grad():
            outputs = self.classifier_model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
            predicted_id = torch.argmax(outputs.logits, dim=1).item()
            confidence = probabilities[0][predicted_id].item()
        
        # Use exact same mapping as test script
        id2label = {
            "0": "Charity & Donations",
            "1": "Education",
            "2": "Electronics & Gadgets",
            "3": "Entertainment",
            "4": "Family & Kids",
            "5": "Food & Drinks",
            "6": "Healthcare",
            "7": "Investments",
            "8": "Other",
            "9": "Rent",
            "10": "Shopping",
            "11": "Transport",
            "12": "Utilities & Bills"
        }
        predicted_category = id2label.get(str(predicted_id), "Other")
        print(f"🏷️ Predicted: {predicted_category} (confidence: {confidence:.3f})")
        
        return predicted_category

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
            print(f"💰 Extracted Amount (with commas): {amount}")
            return amount
        
        # Look for regular numbers (e.g., "50000", "123.45")
        regular_matches = re.findall(r'\b\d+(?:\.\d+)?\b', text)
        if regular_matches:
            # Get the largest number (likely the amount)
            amounts = [float(match) for match in regular_matches]
            amount = max(amounts)
            print(f"💰 Extracted Amount: {amount}")
            return amount
            
        print("💰 No amount found, defaulting to 0.0")
        return 0.0

    def process_expense_audio(self, audio_file_path: str) -> dict:
        """The main function to process an audio file into structured expense data."""
        transcription = self.transcribe_audio(audio_file_path)
        if not transcription:
            return {
                "description": "Could not understand audio",
                "category": "Other",
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