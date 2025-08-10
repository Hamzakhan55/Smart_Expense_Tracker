import re
import os
import tempfile
from pathlib import Path
import pickle

# Import models separately to handle potential issues
LOCAL_MODELS_AVAILABLE = False
WHISPER_AVAILABLE = False
DISTILBERT_AVAILABLE = False

try:
    import torch
    from transformers import BertForSequenceClassification, XLMRobertaTokenizer
    DISTILBERT_AVAILABLE = True
    print("BERT models available")
except ImportError as e:
    print(f"BERT import failed: {e}")

try:
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    WHISPER_AVAILABLE = True
    print("Whisper models available")
except ImportError as e:
    print(f"Whisper import failed: {e}")
    # Fallback to speech_recognition
    try:
        import speech_recognition as sr
        from pydub import AudioSegment
        SPEECH_RECOGNITION_AVAILABLE = True
        print("Using speech_recognition as fallback")
    except ImportError:
        SPEECH_RECOGNITION_AVAILABLE = False
        print("No speech recognition available")

LOCAL_MODELS_AVAILABLE = DISTILBERT_AVAILABLE or WHISPER_AVAILABLE

try:
    import librosa
    AUDIO_PROCESSING_AVAILABLE = True
except ImportError:
    AUDIO_PROCESSING_AVAILABLE = False

class AIProcessor:
    def __init__(self):
        print("Initializing Local AI Processor...")
        
        # Category classification models
        self.category_model = None
        self.category_tokenizer = None
        self.label_encoder = None
        
        # Whisper speech-to-text models
        self.whisper_model = None
        self.whisper_processor = None
        
        # Load local models
        if DISTILBERT_AVAILABLE:
            self._load_category_model()
        if WHISPER_AVAILABLE:
            self._load_whisper_model()
        elif 'SPEECH_RECOGNITION_AVAILABLE' in globals() and SPEECH_RECOGNITION_AVAILABLE:
            print("Using speech_recognition fallback for audio processing")
        
        print("Local AI Processor initialized successfully.")
    
    def _load_category_model(self):
        if not DISTILBERT_AVAILABLE:
            return
            
        try:
            model_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced"
            label_encoder_path = Path(__file__).parent.parent / "models" / "MiniLM-V2" / "fine-tuned-minilm-advanced" / "label_encoder.pkl"
            
            if model_path.exists() and label_encoder_path.exists():
                from transformers import BertForSequenceClassification, XLMRobertaTokenizer
                self.category_model = BertForSequenceClassification.from_pretrained(str(model_path))
                self.category_tokenizer = XLMRobertaTokenizer.from_pretrained(str(model_path))
                
                with open(label_encoder_path, "rb") as f:
                    self.label_encoder = pickle.load(f)
                
                print("Category classification model loaded successfully.")
            else:
                print("Local category model not found.")
        except Exception as e:
            print(f"Failed to load category model: {e}")
    
    def _load_whisper_model(self):
        if not WHISPER_AVAILABLE:
            return
            
        try:
            whisper_path = Path(__file__).parent.parent / "models" / "whisper-large-v3"
            
            if whisper_path.exists():
                from transformers import WhisperProcessor, WhisperForConditionalGeneration
                self.whisper_processor = WhisperProcessor.from_pretrained(str(whisper_path))
                self.whisper_model = WhisperForConditionalGeneration.from_pretrained(str(whisper_path))
                
                # Set to evaluation mode
                self.whisper_model.eval()
                
                print("Whisper speech-to-text model loaded successfully.")
            else:
                print("Local Whisper model not found.")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
    

    
    def transcribe_audio(self, audio_file_path: str) -> str:
        if not os.path.exists(audio_file_path):
            print(f"Audio file not found: {audio_file_path}")
            return ""
        
        file_size = os.path.getsize(audio_file_path)
        print(f"Transcribing audio file: {audio_file_path} (size: {file_size} bytes)")
        
        if file_size == 0:
            print("Audio file is empty")
            return ""
        
        # Try Whisper model first
        if self.whisper_model and self.whisper_processor and AUDIO_PROCESSING_AVAILABLE:
            try:
                print(f"Using Whisper model to transcribe: {audio_file_path}")
                
                # Load audio with librosa
                audio_array, sampling_rate = librosa.load(audio_file_path, sr=16000)
                print(f"Audio loaded: {len(audio_array)} samples at {sampling_rate}Hz")
                
                if len(audio_array) == 0:
                    print("Audio array is empty after loading")
                    return ""
                
                # Check if audio is too short (less than 0.1 seconds)
                if len(audio_array) < 1600:  # 0.1 seconds at 16kHz
                    print("Audio is too short for transcription")
                    return ""
                
                # Process with Whisper
                input_features = self.whisper_processor(audio_array, sampling_rate=sampling_rate, return_tensors="pt").input_features
                
                # Generate transcription
                with torch.no_grad():
                    predicted_ids = self.whisper_model.generate(input_features)
                    transcription = self.whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                
                print(f"Whisper transcribed: '{transcription}'")
                
                # Check if transcription is meaningful
                if not transcription or transcription.strip() == "" or len(transcription.strip()) < 2:
                    print("Transcription is empty or too short")
                    return ""
                
                return transcription.strip()
                
            except Exception as e:
                print(f"Whisper transcription failed: {e}")
                import traceback
                traceback.print_exc()
        
        # Fallback to speech_recognition if available
        if 'SPEECH_RECOGNITION_AVAILABLE' in globals() and SPEECH_RECOGNITION_AVAILABLE:
            try:
                print(f"Using speech_recognition fallback for: {audio_file_path}")
                r = sr.Recognizer()
                r.energy_threshold = 300
                r.pause_threshold = 0.8
                
                wav_file = self._convert_to_wav(audio_file_path)
                
                with sr.AudioFile(wav_file) as source:
                    r.adjust_for_ambient_noise(source, duration=0.2)
                    audio = r.record(source)
                
                text = r.recognize_google(audio, language='en-US')
                print(f"Speech recognition transcribed: '{text}'")
                return text.strip()
                
            except Exception as e:
                print(f"Speech recognition failed: {e}")
        
        print("No transcription method available")
        return ""
    
    def _convert_to_wav(self, audio_file_path: str) -> str:
        """Convert audio file to WAV format if needed"""
        if not 'SPEECH_RECOGNITION_AVAILABLE' in globals() or not SPEECH_RECOGNITION_AVAILABLE:
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
            return "Miscellaneous"
        
        # Use local DistilBERT model if available
        if self.category_model and self.category_tokenizer and self.label_encoder and DISTILBERT_AVAILABLE:
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
                    "bills & fees": "Bills",
                    "education": "Education", 
                    "food & drinks": "Food & Drinks",
                    "healthcare": "Healthcare",
                    "rent": "Rent",
                    "shopping": "Shopping",
                    "transport": "Transport",
                    "utilities": "Utilities"
                }
                
                mapped_category = category_mapping.get(predicted_label.lower(), "Miscellaneous")
                print(f"Mapped to: {mapped_category}")
                return mapped_category
            except Exception as e:
                print(f"Local classification failed: {e}")
        
        # Fallback to keyword matching
        return self._classify_keywords(text)
    
    def _classify_keywords(self, text: str) -> str:
        keywords = {
            "Food & Drinks": ["food", "restaurant", "meal", "lunch", "dinner", "breakfast", "eat", "pizza", "burger", "coffee", "drink", "snack", "tea", "beverage"],
            "Transport": ["transport", "taxi", "bus", "train", "fuel", "gas", "uber", "lyft", "metro", "parking", "ride", "auto", "transportation"],
            "Utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "wifi", "mobile", "heating", "cooling"],
            "Shopping": ["shopping", "store", "buy", "purchase", "market", "mall", "clothes", "shirt", "amazon", "bag", "bags", "shoes", "dress", "bought", "clothing"],
            "Electronics & Gadgets": ["electronics", "gadgets", "phone", "laptop", "computer", "tablet", "headphones", "camera", "tv", "smartphone", "tech", "device"],
            "Healthcare": ["doctor", "medicine", "hospital", "pharmacy", "health", "medical", "dentist", "clinic", "healthcare"],
            "Education": ["book", "course", "school", "education", "tuition", "study", "university", "college", "books", "supplies"],
            "Rent": ["rent", "rental", "lease", "housing", "apartment", "house"],
            "Bills": ["bill", "bills", "payment", "invoice", "subscription", "membership", "fee"],
            "Entertainment": ["movie", "cinema", "game", "entertainment", "fun", "party", "concert", "netflix", "show", "ticket", "theater"],
            "Investments": ["investment", "stocks", "bonds", "mutual", "fund", "portfolio", "trading", "crypto", "bitcoin"],
            "Personal Care": ["personal", "care", "beauty", "haircut", "salon", "spa", "cosmetics", "skincare", "grooming"],
            "Family & Kids": ["family", "kids", "children", "baby", "childcare", "toys", "daycare", "babysitter"],
            "Charity & Donations": ["charity", "donation", "donate", "nonprofit", "church", "temple", "mosque", "giving", "contribution"],
            "Miscellaneous": []
        }
        
        text_lower = text.lower()
        print(f"Classifying text: '{text_lower}'")
        
        # Score each category based on keyword matches
        category_scores = {}
        for category, words in keywords.items():
            score = 0
            matched_words = []
            for word in words:
                if word in text_lower:
                    score += 1
                    matched_words.append(word)
            if score > 0:
                category_scores[category] = score
                print(f"Category '{category}' scored {score} (matched: {matched_words})")
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            print(f"Best match: {best_category} with score {category_scores[best_category]}")
            return best_category
        
        print("No keyword matches found, defaulting to Miscellaneous")
        return "Miscellaneous"
    
    def extract_amount(self, text: str) -> float:
        if not text:
            return 0.0
        
        text_lower = text.lower()
        print(f"Extracting amount from: '{text_lower}'")
        
        # Enhanced patterns with word boundaries and context
        patterns = [
            # "for 2000 rupees", "cost 500 rs", "paid 1000 rupees"
            r'(?:for|cost|paid|spent|worth|price)\s+([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?)',
            # "2000 rupees", "500 rs", "1000 dollars", "3000 pesos"
            r'\b([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|rs?\.?|dollars?|\$|pesos?)\b',
            # "rupees 2000", "rs 500", "$ 1000", "pesos 3000"
            r'(?:rupees?|rs?\.?|dollars?|\$|pesos?)\s+([0-9,]+(?:\.[0-9]{1,2})?)',
            # "$2000"
            r'\$\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            # Numbers with commas "1,000" or "10,000"
            r'\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b',
            # Decimal numbers "25.50"
            r'\b([0-9]+\.[0-9]{1,2})\b',
            # Any number (last resort) but must be reasonable (10-1000000)
            r'\b([1-9][0-9]{1,6})\b'
        ]
        
        for i, pattern in enumerate(patterns):
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            print(f"Pattern {i+1}: {pattern} -> Matches: {matches}")
            
            if matches:
                for match in matches:
                    try:
                        amount = float(match.replace(',', ''))
                        # Filter out unreasonable amounts
                        if 1 <= amount <= 1000000:  # Between 1 and 1 million
                            print(f"Extracted amount: {amount}")
                            return amount
                    except ValueError:
                        continue
        
        print("No valid amount found")
        return 0.0
    
    def process_expense_audio(self, audio_file_path: str) -> dict:
        print(f"Processing audio file: {audio_file_path}")
        
        # Check if file exists
        if not os.path.exists(audio_file_path):
            print(f"Audio file not found: {audio_file_path}")
            return {
                "description": "Sorry, we couldn't understand that. Please try again.",
                "category": "Error",
                "amount": 0.0
            }
        
        # Check file size
        file_size = os.path.getsize(audio_file_path)
        print(f"Audio file size: {file_size} bytes")
        
        if file_size == 0:
            print("Audio file is empty")
            return {
                "description": "Sorry, we couldn't understand that. Please try again.",
                "category": "Error",
                "amount": 0.0
            }
        
        transcription = self.transcribe_audio(audio_file_path)
        
        if not transcription or transcription.strip() == "":
            print("Transcription failed or empty, returning error response")
            return {
                "description": "Sorry, we couldn't understand that. Please try again.",
                "category": "Error",
                "amount": 0.0
            }
        
        print(f"Transcription successful: {transcription}")
        category = self.classify_text(transcription)
        amount = self.extract_amount(transcription)
        
        result = {
            "description": transcription,
            "category": category,
            "amount": amount
        }
        print(f"Final result: {result}")
        return result

ai_processor = AIProcessor()