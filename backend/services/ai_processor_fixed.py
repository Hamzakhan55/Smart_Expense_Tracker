import re
import os
import tempfile
from pathlib import Path
import pickle
import logging
from typing import Dict, Optional, Tuple
import warnings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import models with proper error handling
WHISPER_AVAILABLE = False
CATEGORY_MODEL_AVAILABLE = False
AUDIO_PROCESSING_AVAILABLE = False
SPEECH_RECOGNITION_AVAILABLE = False

try:
    import torch
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    WHISPER_AVAILABLE = True
    logger.info("✅ Whisper models available")
except ImportError as e:
    logger.error(f"❌ Whisper import failed: {e}")

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    CATEGORY_MODEL_AVAILABLE = True
    logger.info("✅ Category classification models available")
except ImportError as e:
    logger.error(f"❌ Category model import failed: {e}")

try:
    import librosa
    AUDIO_PROCESSING_AVAILABLE = True
    logger.info("✅ Librosa available for audio processing")
except ImportError as e:
    logger.error(f"❌ Librosa import failed: {e}")

# Fallback speech recognition
try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
    logger.info("✅ Speech recognition fallback available")
except ImportError as e:
    logger.error(f"❌ Speech recognition fallback failed: {e}")

class FixedAIProcessor:
    def __init__(self):
        logger.info("🚀 Initializing Fixed AI Processor...")
        
        # Model instances
        self.whisper_model = None
        self.whisper_processor = None
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        
        # Model loading status
        self.whisper_loaded = False
        self.category_loaded = False
        
        # Device configuration
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"💻 Using device: {self.device}")
        
        # Load models
        self._load_models()
        
        logger.info(f"✅ Fixed AI Processor initialized. Whisper: {self.whisper_loaded}, Category: {self.category_loaded}")
    
    def _load_models(self):
        """Load both Whisper and category classification models"""
        self.whisper_loaded = self._load_whisper_model()
        self.category_loaded = self._load_category_model()
    
    def _load_whisper_model(self) -> bool:
        """Load Whisper speech-to-text model"""
        if not WHISPER_AVAILABLE:
            logger.error("❌ Whisper not available")
            return False
            
        try:
            whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            
            if not whisper_path.exists():
                logger.error(f"❌ Whisper model path not found: {whisper_path}")
                return False
            
            logger.info(f"📦 Loading Whisper from: {whisper_path}")
            
            # Load with proper error handling
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=UserWarning)
                
                self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                self.whisper_model = WhisperForConditionalGeneration.from_pretrained(
                    str(whisper_path),
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                ).to(self.device)
                
                # Set to evaluation mode
                self.whisper_model.eval()
            
            logger.info("✅ Whisper model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {e}")
            return False
    
    def _load_category_model(self) -> bool:
        """Load custom category classification model"""
        if not CATEGORY_MODEL_AVAILABLE:
            logger.error("❌ Category model dependencies not available")
            return False
            
        try:
            model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
            label_encoder_path = model_path / "label_encoder.pkl"
            
            if not model_path.exists():
                logger.error(f"❌ Category model path not found: {model_path}")
                return False
                
            if not label_encoder_path.exists():
                logger.error(f"❌ Label encoder not found: {label_encoder_path}")
                return False
            
            logger.info(f"📦 Loading category model from: {model_path}")
            
            # Load with proper error handling
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=UserWarning)
                
                self.category_tokenizer = AutoTokenizer.from_pretrained(str(model_path))
                self.category_model = AutoModelForSequenceClassification.from_pretrained(
                    str(model_path),
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                ).to(self.device)
                
                # Load label encoder
                with open(label_encoder_path, "rb") as f:
                    self.label_encoder = pickle.load(f)
                
                # Set to evaluation mode
                self.category_model.eval()
            
            logger.info("✅ Category model loaded successfully")
            logger.info(f"📋 Available categories: {list(self.label_encoder.classes_)}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load category model: {e}")
            return False
    
    def transcribe_audio(self, audio_file_path: str) -> Tuple[str, bool]:
        """
        Step 1: Transcribe audio file to text using Whisper
        Returns: (transcription, success)
        """
        if not os.path.exists(audio_file_path):
            logger.error(f"❌ Audio file not found: {audio_file_path}")
            return "", False
        
        file_size = os.path.getsize(audio_file_path)
        logger.info(f"🎵 Transcribing audio: {os.path.basename(audio_file_path)} ({file_size} bytes)")
        
        if file_size == 0:
            logger.error("❌ Audio file is empty")
            return "", False
        
        # Try Whisper model first (preferred method)
        if self.whisper_loaded and AUDIO_PROCESSING_AVAILABLE:
            try:
                return self._transcribe_with_whisper(audio_file_path)
            except Exception as e:
                logger.error(f"❌ Whisper transcription failed: {e}")
        
        # Fallback to speech recognition
        if SPEECH_RECOGNITION_AVAILABLE:
            try:
                return self._transcribe_with_speech_recognition(audio_file_path)
            except Exception as e:
                logger.error(f"❌ Speech recognition failed: {e}")
        
        logger.error("❌ No transcription method available")
        return "", False
    
    def _transcribe_with_whisper(self, audio_file_path: str) -> Tuple[str, bool]:
        """Transcribe using Whisper model (primary method)"""
        logger.info("🎯 Using Whisper model for transcription")
        
        # Load and preprocess audio
        audio_array, sampling_rate = librosa.load(audio_file_path, sr=16000)
        logger.info(f"📊 Audio loaded: {len(audio_array)} samples at {sampling_rate}Hz")
        
        if len(audio_array) == 0:
            logger.error("❌ Audio array is empty")
            return "", False
        
        # Check minimum duration (0.1 seconds)
        if len(audio_array) < 1600:  # 0.1 seconds at 16kHz
            logger.error("❌ Audio too short for transcription")
            return "", False
        
        # Process with Whisper
        input_features = self.whisper_processor(
            audio_array, 
            sampling_rate=sampling_rate, 
            return_tensors="pt"
        ).input_features.to(self.device)
        
        # Generate transcription with optimized settings
        with torch.no_grad():
            predicted_ids = self.whisper_model.generate(
                input_features,
                max_length=448,
                num_beams=5,
                early_stopping=True,
                language="en",
                task="transcribe"
            )
            transcription = self.whisper_processor.batch_decode(
                predicted_ids, 
                skip_special_tokens=True
            )[0]
        
        transcription = transcription.strip()
        logger.info(f"✅ Whisper transcribed: '{transcription}'")
        
        if not transcription or len(transcription) < 2:
            logger.error("❌ Transcription empty or too short")
            return "", False
        
        return transcription, True
    
    def _transcribe_with_speech_recognition(self, audio_file_path: str) -> Tuple[str, bool]:
        """Fallback transcription using speech_recognition"""
        logger.info("🔄 Using speech_recognition fallback")
        
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.pause_threshold = 0.8
        
        # Convert to WAV if needed
        wav_file = self._convert_to_wav(audio_file_path)
        
        with sr.AudioFile(wav_file) as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            audio = r.record(source)
        
        text = r.recognize_google(audio, language='en-US')
        logger.info(f"✅ Speech recognition transcribed: '{text}'")
        
        return text.strip(), True
    
    def _convert_to_wav(self, audio_file_path: str) -> str:
        """Convert audio file to WAV format if needed"""
        try:
            if Path(audio_file_path).suffix.lower() == '.wav':
                return audio_file_path
                
            audio = AudioSegment.from_file(audio_file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                audio.export(temp_wav.name, format='wav')
                return temp_wav.name
        except Exception as e:
            logger.error(f"❌ Audio conversion failed: {e}")
            return audio_file_path
    
    def classify_text(self, text: str) -> Tuple[str, float]:
        """
        Step 2: Classify transcribed text into expense category using MiniLM-V2
        Returns: (category, confidence)
        """
        if not text:
            return "Miscellaneous", 0.0
        
        logger.info(f"🏷️ Classifying text: '{text}'")
        
        # Use trained model if available (preferred method)
        if self.category_loaded:
            try:
                return self._classify_with_model(text)
            except Exception as e:
                logger.error(f"❌ Model classification failed: {e}")
        
        # Fallback to keyword matching
        category = self._classify_with_keywords(text)
        return category, 0.5
    
    def _classify_with_model(self, text: str) -> Tuple[str, float]:
        """Classify using the trained MiniLM-V2 model"""
        logger.info("🎯 Using trained MiniLM-V2 model for classification")
        
        # Tokenize input
        inputs = self.category_tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True,
            max_length=512
        ).to(self.device)
        
        # Get prediction
        with torch.no_grad():
            outputs = self.category_model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
            
            predicted_class_id = logits.argmax().item()
            confidence = probabilities[0][predicted_class_id].item()
            predicted_label = self.label_encoder.inverse_transform([predicted_class_id])[0]
        
        logger.info(f"🎯 Model predicted: {predicted_label} (confidence: {confidence:.3f})")
        
        # Map to frontend categories
        mapped_category = self._map_category(predicted_label)
        logger.info(f"📋 Mapped to: {mapped_category}")
        
        return mapped_category, confidence
    
    def _map_category(self, model_category: str) -> str:
        """Map model categories to frontend categories"""
        category_mapping = {
            "bills & fees": "Bills",
            "education": "Education", 
            "food & drinks": "Food & Drinks",
            "healthcare": "Healthcare",
            "rent": "Rent",
            "shopping": "Shopping",
            "transport": "Transport",
            "utilities": "Utilities",
            "entertainment": "Entertainment",
            "personal care": "Personal Care",
            "family & kids": "Family & Kids",
            "charity & donations": "Charity & Donations",
            "investments": "Investments",
            "electronics & gadgets": "Electronics & Gadgets",
        }
        
        return category_mapping.get(model_category.lower(), "Miscellaneous")
    
    def _classify_with_keywords(self, text: str) -> str:
        """Fallback keyword-based classification"""
        logger.info("🔄 Using keyword-based classification fallback")
        
        keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee", "drink", "snack", "tea", "beverage"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking", "ride", "auto", "transportation"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "wifi", "mobile", "heating", "cooling"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon", "bag", "shoes", "dress", "bought", "clothing"],
            "Electronics & Gadgets": ["electronics", "gadgets", "phone", "laptop", "computer", "tablet", "headphones", "camera", "tv", "smartphone", "tech", "device"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist", "clinic", "healthcare"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university", "college", "books", "supplies"],
            "Rent": ["rent", "rental", "lease", "housing", "apartment", "house"],
            "Bills": ["bill", "bills", "payment", "invoice", "subscription", "membership", "fee"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix", "show", "ticket", "theater"],
        }
        
        text_lower = text.lower()
        
        # Score each category
        category_scores = {}
        for category, words in keywords.items():
            score = sum(1 for word in words if word in text_lower)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            logger.info(f"✅ Keyword classification: {best_category}")
            return best_category
        
        logger.info("🔄 No matches, defaulting to Miscellaneous")
        return "Miscellaneous"
    
    def extract_amount(self, text: str) -> Tuple[float, bool]:
        """
        Step 3: Extract monetary amount from transcribed text
        Returns: (amount, success)
        """
        if not text:
            return 0.0, False
        
        text_lower = text.lower()
        logger.info(f"💰 Extracting amount from: '{text_lower}'")
        
        # Enhanced patterns for amount extraction
        patterns = [
            # Context-based patterns (highest priority)
            r'(?:for|cost|paid|spent|worth|price|bought)\\s+([0-9,]+(?:\\.[0-9]{1,2})?)\\s*(?:rupees?|rs?\\.?|dollars?|\\$|pesos?|bucks?)',
            r'([0-9,]+(?:\\.[0-9]{1,2})?)\\s*(?:rupees?|rs?\\.?|dollars?|\\$|pesos?|bucks?)',
            r'(?:rupees?|rs?\\.?|dollars?|\\$|pesos?)\\s+([0-9,]+(?:\\.[0-9]{1,2})?)',
            r'\\$\\s*([0-9,]+(?:\\.[0-9]{1,2})?)',
            # Number patterns
            r'\\b([0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?)\\b',  # With commas
            r'\\b([0-9]+\\.[0-9]{1,2})\\b',  # Decimal numbers
            r'\\b([1-9][0-9]{1,6})\\b'  # 10 to 9,999,999
        ]
        
        for i, pattern in enumerate(patterns):
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                logger.info(f"🔍 Pattern {i+1} found: {matches}")
                
                for match in matches:
                    try:
                        amount = float(match.replace(',', ''))
                        # Validate reasonable amount range
                        if 0.01 <= amount <= 1000000:  # $0.01 to $1M
                            logger.info(f"✅ Extracted amount: ${amount}")
                            return amount, True
                    except ValueError:
                        continue
        
        logger.warning("⚠️ No valid amount found")
        return 0.0, False
    
    def process_expense_audio(self, audio_file_path: str) -> Dict:
        """
        Main processing pipeline: Audio → Whisper → MiniLM-V2 → Amount → Response
        This is the complete voice-to-text to category prediction pipeline
        """
        logger.info(f"🚀 Starting complete AI pipeline for: {os.path.basename(audio_file_path)}")
        
        # Step 1: Validate audio file
        if not os.path.exists(audio_file_path):
            logger.error(f"❌ Audio file not found: {audio_file_path}")
            return self._error_response("Audio file not found")
        
        file_size = os.path.getsize(audio_file_path)
        if file_size == 0:
            logger.error("❌ Audio file is empty")
            return self._error_response("Audio file is empty")
        
        logger.info(f"📁 Processing audio file: {file_size} bytes")
        
        # Step 2: Voice to Text (Whisper)
        logger.info("🎵 Step 1: Voice to Text using Whisper...")
        transcription, transcribe_success = self.transcribe_audio(audio_file_path)
        
        if not transcribe_success or not transcription:
            logger.error("❌ Step 1 failed: Audio transcription failed")
            return self._error_response("Sorry, we couldn't understand that. Please try again.")
        
        logger.info(f"✅ Step 1 complete: '{transcription}'")
        
        # Step 3: Text to Category (MiniLM-V2)
        logger.info("🏷️ Step 2: Category prediction using MiniLM-V2...")
        category, confidence = self.classify_text(transcription)
        logger.info(f"✅ Step 2 complete: {category} (confidence: {confidence:.3f})")
        
        # Step 4: Amount Extraction
        logger.info("💰 Step 3: Amount extraction...")
        amount, amount_success = self.extract_amount(transcription)
        
        if not amount_success or amount <= 0:
            logger.warning(f"⚠️ Step 3 warning: Amount extraction failed or invalid: {amount}")
            # Don't fail completely, let user edit in AI review popup
        else:
            logger.info(f"✅ Step 3 complete: ${amount}")
        
        # Step 5: Prepare response for AI review popup
        result = {
            "description": transcription,
            "category": category,
            "amount": amount,
            "confidence": confidence if isinstance(confidence, (int, float)) else 0.5
        }
        
        logger.info(f"🎉 Pipeline complete! Result: {result}")
        return result
    
    def _error_response(self, message: str) -> Dict:
        """Generate error response"""
        return {
            "description": message,
            "category": "Error",
            "amount": 0.0,
            "confidence": 0.0
        }
    
    def get_status(self) -> Dict:
        """Get processor status for debugging"""
        return {
            "whisper_loaded": self.whisper_loaded,
            "category_loaded": self.category_loaded,
            "device": self.device,
            "whisper_available": WHISPER_AVAILABLE,
            "category_model_available": CATEGORY_MODEL_AVAILABLE,
            "audio_processing_available": AUDIO_PROCESSING_AVAILABLE,
            "speech_recognition_fallback": SPEECH_RECOGNITION_AVAILABLE,
            "available_categories": list(self.label_encoder.classes_) if self.label_encoder else []
        }

# Create global instance
fixed_ai_processor = FixedAIProcessor()