import re
import os
import tempfile
from pathlib import Path
import pickle
import logging
from typing import Dict, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import models separately to handle potential issues
LOCAL_MODELS_AVAILABLE = False
WHISPER_AVAILABLE = False
DISTILBERT_AVAILABLE = False
AUDIO_PROCESSING_AVAILABLE = False

try:
    import torch
    from transformers import BertForSequenceClassification, XLMRobertaTokenizer
    DISTILBERT_AVAILABLE = True
    logger.info("BERT models available")
except ImportError as e:
    logger.error(f"BERT import failed: {e}")

try:
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    WHISPER_AVAILABLE = True
    logger.info("Whisper models available")
except ImportError as e:
    logger.error(f"Whisper import failed: {e}")

try:
    import librosa
    AUDIO_PROCESSING_AVAILABLE = True
    logger.info("Librosa available for audio processing")
except ImportError as e:
    logger.error(f"Librosa import failed: {e}")

# Fallback speech recognition
SPEECH_RECOGNITION_AVAILABLE = False
try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_RECOGNITION_AVAILABLE = True
    logger.info("Speech recognition fallback available")
except ImportError as e:
    logger.error(f"Speech recognition fallback failed: {e}")

LOCAL_MODELS_AVAILABLE = DISTILBERT_AVAILABLE and WHISPER_AVAILABLE

class EnhancedAIProcessor:
    def __init__(self):
        logger.info("Initializing Enhanced AI Processor...")
        
        # Category classification models
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        
        # Whisper speech-to-text models
        self.whisper_model = None
        self.whisper_processor = None
        
        # Model loading status
        self.models_loaded = False
        
        # Load local models
        self._load_models()
        
        logger.info(f"Enhanced AI Processor initialized. Models loaded: {self.models_loaded}")
    
    def _load_models(self):
        """Load both Whisper and category classification models"""
        whisper_loaded = self._load_whisper_model()
        category_loaded = self._load_category_model()
        
        self.models_loaded = whisper_loaded and category_loaded
        
        if not self.models_loaded:
            logger.warning("Not all models loaded successfully. Fallback methods will be used.")
    
    def _load_category_model(self) -> bool:
        """Load the custom category classification model"""
        if not DISTILBERT_AVAILABLE:
            logger.error("BERT not available for category classification")
            return False
            
        try:
            model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
            label_encoder_path = model_path / "label_encoder.pkl"
            
            if not model_path.exists():
                logger.error(f"Category model path not found: {model_path}")
                return False
                
            if not label_encoder_path.exists():
                logger.error(f"Label encoder not found: {label_encoder_path}")
                return False
            
            # Load model and tokenizer
            self.category_model = BertForSequenceClassification.from_pretrained(str(model_path))
            self.category_tokenizer = XLMRobertaTokenizer.from_pretrained(str(model_path))
            
            # Load label encoder
            with open(label_encoder_path, "rb") as f:
                self.label_encoder = pickle.load(f)
            
            # Set model to evaluation mode
            self.category_model.eval()
            
            logger.info("Category classification model loaded successfully")
            logger.info(f"Available categories: {list(self.label_encoder.classes_)}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load category model: {e}")
            return False
    
    def _load_whisper_model(self) -> bool:
        """Load the Whisper speech-to-text model"""
        if not WHISPER_AVAILABLE:
            logger.error("Whisper not available for speech-to-text")
            return False
            
        try:
            whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            
            if not whisper_path.exists():
                logger.error(f"Whisper model path not found: {whisper_path}")
                return False
            
            # Load Whisper model and processor
            self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
            self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
            
            # Set to evaluation mode
            self.whisper_model.eval()
            
            logger.info("Whisper speech-to-text model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            return False
    
    def transcribe_audio(self, audio_file_path: str) -> Tuple[str, bool]:
        """
        Transcribe audio file to text
        Returns: (transcription, success)
        """
        if not os.path.exists(audio_file_path):
            logger.error(f"Audio file not found: {audio_file_path}")
            return "", False
        
        file_size = os.path.getsize(audio_file_path)
        logger.info(f"Transcribing audio: {audio_file_path} (size: {file_size} bytes)")
        
        if file_size == 0:
            logger.error("Audio file is empty")
            return "", False
        
        # Try Whisper model first
        if self.whisper_model and self.whisper_processor and AUDIO_PROCESSING_AVAILABLE:
            try:
                return self._transcribe_with_whisper(audio_file_path)
            except Exception as e:
                logger.error(f"Whisper transcription failed: {e}")
        
        # Fallback to speech recognition
        if SPEECH_RECOGNITION_AVAILABLE:
            try:
                return self._transcribe_with_speech_recognition(audio_file_path)
            except Exception as e:
                logger.error(f"Speech recognition failed: {e}")
        
        logger.error("No transcription method available")
        return "", False
    
    def _transcribe_with_whisper(self, audio_file_path: str) -> Tuple[str, bool]:
        """Transcribe using Whisper model"""
        logger.info(f"Using Whisper model for transcription: {audio_file_path}")
        
        # Load audio with librosa
        audio_array, sampling_rate = librosa.load(audio_file_path, sr=16000)
        logger.info(f"Audio loaded: {len(audio_array)} samples at {sampling_rate}Hz")
        
        if len(audio_array) == 0:
            logger.error("Audio array is empty after loading")
            return "", False
        
        # Check minimum duration (0.1 seconds)
        if len(audio_array) < 1600:  # 0.1 seconds at 16kHz
            logger.error("Audio is too short for transcription")
            return "", False
        
        # Process with Whisper
        input_features = self.whisper_processor(
            audio_array, 
            sampling_rate=sampling_rate, 
            return_tensors="pt"
        ).input_features
        
        # Generate transcription
        with torch.no_grad():
            predicted_ids = self.whisper_model.generate(
                input_features,
                max_length=448,
                num_beams=5,
                early_stopping=True
            )
            transcription = self.whisper_processor.batch_decode(
                predicted_ids, 
                skip_special_tokens=True
            )[0]
        
        transcription = transcription.strip()
        logger.info(f"Whisper transcribed: '{transcription}'")
        
        if not transcription or len(transcription) < 2:
            logger.error("Transcription is empty or too short")
            return "", False
        
        return transcription, True
    
    def _transcribe_with_speech_recognition(self, audio_file_path: str) -> Tuple[str, bool]:
        """Fallback transcription using speech_recognition"""
        logger.info(f"Using speech_recognition fallback: {audio_file_path}")
        
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.pause_threshold = 0.8
        
        # Convert to WAV if needed
        wav_file = self._convert_to_wav(audio_file_path)
        
        with sr.AudioFile(wav_file) as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            audio = r.record(source)
        
        text = r.recognize_google(audio, language='en-US')
        logger.info(f"Speech recognition transcribed: '{text}'")
        
        return text.strip(), True
    
    def _convert_to_wav(self, audio_file_path: str) -> str:
        """Convert audio file to WAV format if needed"""
        if not SPEECH_RECOGNITION_AVAILABLE:
            return audio_file_path
            
        try:
            if Path(audio_file_path).suffix.lower() == '.wav':
                return audio_file_path
                
            audio = AudioSegment.from_file(audio_file_path)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                audio.export(temp_wav.name, format='wav')
                return temp_wav.name
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            return audio_file_path
    
    def classify_text(self, text: str) -> Tuple[str, float]:
        """
        Classify text into expense category
        Returns: (category, confidence)
        """
        if not text:
            return "Miscellaneous", 0.0
        
        # Use local model if available
        if self.category_model and self.category_tokenizer and self.label_encoder:
            try:
                return self._classify_with_model(text)
            except Exception as e:
                logger.error(f"Model classification failed: {e}")
        
        # Fallback to keyword matching
        return self._classify_with_keywords(text), 0.5
    
    def _classify_with_model(self, text: str) -> Tuple[str, float]:
        """Classify using the trained model"""
        logger.info(f"Classifying with model: '{text}'")
        
        # Tokenize input
        inputs = self.category_tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True,
            max_length=512
        )
        
        # Get prediction
        with torch.no_grad():
            outputs = self.category_model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
            
            predicted_class_id = logits.argmax().item()
            confidence = probabilities[0][predicted_class_id].item()
            predicted_label = self.label_encoder.inverse_transform([predicted_class_id])[0]
        
        logger.info(f"Model predicted: {predicted_label} (confidence: {confidence:.3f})")
        
        # Map model categories to frontend categories
        mapped_category = self._map_category(predicted_label)
        logger.info(f"Mapped to frontend category: {mapped_category}")
        
        return mapped_category, confidence
    
    def _map_category(self, model_category: str) -> str:
        """Model categories already match frontend - return directly"""
        # Model outputs: ['Bills', 'Charity & Donations', 'Education', 'Electronics & Gadgets', 
        # 'Entertainment', 'Family & Kids', 'Food & Drinks', 'Healthcare', 'Investments', 
        # 'Miscellaneous', 'Personal Care', 'Rent', 'Shopping', 'Transport', 'Utilities']
        
        # Valid frontend categories
        valid_categories = {
            "Bills", "Charity & Donations", "Education", "Electronics & Gadgets",
            "Entertainment", "Family & Kids", "Food & Drinks", "Healthcare", 
            "Investments", "Miscellaneous", "Personal Care", "Rent", 
            "Shopping", "Transport", "Utilities"
        }
        
        return model_category if model_category in valid_categories else "Miscellaneous"
    
    def _classify_with_keywords(self, text: str) -> str:
        """Fallback keyword-based classification"""
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
        logger.info(f"Keyword classification for: '{text_lower}'")
        
        # Score each category
        category_scores = {}
        for category, words in keywords.items():
            score = sum(1 for word in words if word in text_lower)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            logger.info(f"Keyword classification result: {best_category}")
            return best_category
        
        logger.info("No keyword matches, defaulting to Miscellaneous")
        return "Miscellaneous"
    
    def extract_amount(self, text: str) -> Tuple[float, bool]:
        """
        Extract monetary amount from text
        Returns: (amount, success)
        """
        if not text:
            return 0.0, False
        
        text_lower = text.lower()
        logger.info(f"Extracting amount from: '{text_lower}'")
        
        # Enhanced patterns for amount extraction
        patterns = [
            # Context-based patterns
            r'(?:for|cost|paid|spent|worth|price|bought)\s+([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?|bucks?)',
            r'([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?|bucks?)',
            r'(?:rupees?|rs?\.?|dollars?|\$|pesos?)\s+([0-9,]+(?:\.[0-9]{1,2})?)',
            r'\$\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            # Number patterns
            r'\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b',
            r'\b([0-9]+\.[0-9]{1,2})\b',
            r'\b([1-9][0-9]{1,6})\b'  # 10 to 9,999,999
        ]
        
        for i, pattern in enumerate(patterns):
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            logger.info(f"Pattern {i+1}: Found matches: {matches}")
            
            for match in matches:
                try:
                    amount = float(match.replace(',', ''))
                    # Validate reasonable amount range
                    if 0.01 <= amount <= 1000000:  # $0.01 to $1M
                        logger.info(f"Extracted amount: ${amount}")
                        return amount, True
                except ValueError:
                    continue
        
        logger.warning("No valid amount found in text")
        return 0.0, False
    
    def process_expense_audio(self, audio_file_path: str) -> Dict:
        """
        Main processing function: Audio -> Text -> Category + Amount
        """
        logger.info(f"Processing expense audio: {audio_file_path}")
        
        # Step 1: Validate file
        if not os.path.exists(audio_file_path):
            logger.error(f"Audio file not found: {audio_file_path}")
            return self._error_response("Audio file not found")
        
        file_size = os.path.getsize(audio_file_path)
        if file_size == 0:
            logger.error("Audio file is empty")
            return self._error_response("Audio file is empty")
        
        logger.info(f"Processing audio file: {file_size} bytes")
        
        # Step 2: Transcribe audio to text
        transcription, transcribe_success = self.transcribe_audio(audio_file_path)
        if not transcribe_success or not transcription:
            logger.error("Audio transcription failed")
            return self._error_response("Sorry, we couldn't understand that. Please try again.")
        
        logger.info(f"Transcription successful: '{transcription}'")
        
        # Step 3: Classify category
        category, confidence = self.classify_text(transcription)
        logger.info(f"Category classification: {category} (confidence: {confidence:.3f})")
        
        # Step 4: Extract amount
        amount, amount_success = self.extract_amount(transcription)
        if not amount_success or amount <= 0:
            logger.warning(f"Amount extraction failed or invalid: {amount}")
            # Don't fail completely, let user edit in UI
        
        # Step 5: Return result
        result = {
            "description": transcription,
            "category": category,
            "amount": amount,
            "confidence": confidence if hasattr(confidence, '__float__') else 0.5
        }
        
        logger.info(f"Processing complete: {result}")
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
            "models_loaded": self.models_loaded,
            "whisper_available": self.whisper_model is not None,
            "category_model_available": self.category_model is not None,
            "audio_processing_available": AUDIO_PROCESSING_AVAILABLE,
            "speech_recognition_fallback": SPEECH_RECOGNITION_AVAILABLE,
            "available_categories": list(self.label_encoder.classes_) if self.label_encoder else []
        }

# Create global instance
enhanced_ai_processor = EnhancedAIProcessor()