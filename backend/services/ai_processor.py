# backend/services/ai_processor.py

import torch
import torchaudio
import pickle
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
        Initializes the service by loading all AI models and processors.
        This is called only once when the FastAPI application starts.
        """
        print("📦 Initializing AIProcessor: Loading all models...")

        # Define paths relative to the backend directory
        base_path = Path(__file__).parent.parent
        whisper_model_path = base_path / "models" / "whisper-large-v3"
        classifier_model_path = base_path / "models" / "distilbert-base-uncased-mnli" / "my_model"
        label_encoder_path = base_path / "models" / "distilbert-base-uncased-mnli" / "label_encoder.pkl"

        if not whisper_model_path.exists() or not classifier_model_path.exists():
            raise FileNotFoundError("AI models not found. Make sure they are placed in the `backend/models` directory.")
        
        print(f"🧠 Loading Whisper model from: {whisper_model_path}")
        print(f"🧠 Loading Classifier model from: {classifier_model_path}")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"💡 Using device: {self.device}")

        self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_model_path))
        self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_model_path)).to(self.device)

        self.classifier_tokenizer = AutoTokenizer.from_pretrained(str(classifier_model_path))
        self.classifier_model = AutoModelForSequenceClassification.from_pretrained(str(classifier_model_path)).to(self.device)

        with open(label_encoder_path, "rb") as f:
            label_encoder = pickle.load(f)
        self.id2label = {i: label for i, label in enumerate(label_encoder.classes_)}
        
        print("✅ AIProcessor initialized successfully.")

    # --- THIS IS THE CORRECTED, ROBUST FUNCTION ---
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribes any audio file to text by converting it to the format Whisper needs.
        """
        try:
            # 1. Load the audio file using pydub (handles MP3, M4A, etc.)
            audio = AudioSegment.from_file(audio_file_path)
            
            # 2. Convert to the format Whisper needs: 16kHz sample rate, mono channel
            audio = audio.set_frame_rate(16000)
            audio = audio.set_channels(1)

            # 3. Convert audio data to a PyTorch tensor
            samples = np.array(audio.get_array_of_samples()).astype(np.float32)
            # Normalize to the [-1.0, 1.0] range that Whisper expects
            samples /= (2**(audio.sample_width * 8 - 1)) # Normalize based on sample width
            
            waveform = torch.from_numpy(samples).float()

            # 4. Process the audio with the Whisper model
            inputs = self.whisper_processor(waveform, sampling_rate=16000, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # --- FIX: Use generation_config for forced_decoder_ids ---
            forced_decoder_ids = self.whisper_processor.get_decoder_prompt_ids(language="en", task="transcribe")
            generation_config = self.whisper_model.generation_config
            generation_config.forced_decoder_ids = forced_decoder_ids

            predicted_ids = self.whisper_model.generate(
                **inputs,
                generation_config=generation_config
            )
            transcription = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
            
            print(f"📝 Transcription: '{transcription}'")
            return transcription.strip()
            
        except Exception as e:
            # The most common error is that ffmpeg is not installed. This message helps with debugging.
            print(f"ERROR in transcribe_audio. A common cause is a missing 'ffmpeg' installation. Full error: {e}")
            return ""

    def classify_text(self, text: str) -> str:
        """Classifies text into an expense category."""
        if not text:
            return "Uncategorized"
        inputs = self.classifier_tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(self.device)
        with torch.no_grad():
            logits = self.classifier_model(**inputs).logits
        predicted_class_id = torch.argmax(logits, dim=1).item()
        category = self.id2label.get(predicted_class_id, "Uncategorized")
        print(f"🏷️ Classified Category: '{category}'")
        return category

    def extract_amount(self, text: str) -> float:
        """Extracts the first numerical amount from text."""
        matches = re.findall(r'\b\d+\.?\d*\b', text)
        if matches:
            amount = float(matches[0])
            print(f"💰 Extracted Amount: {amount}")
            return amount
        print("💰 No amount found, defaulting to 0.0")
        return 0.0

    def process_expense_audio(self, audio_file_path: str) -> dict:
        """The main function to process an audio file into structured expense data."""
        transcription = self.transcribe_audio(audio_file_path)
        if not transcription:
            return {
                "description": "Failed to transcribe audio",
                "category": "Error",
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