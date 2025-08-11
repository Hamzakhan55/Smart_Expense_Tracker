"""
Performance configuration for Smart Expense Tracker AI
Adjust these settings to optimize for your hardware
"""

# Audio Processing Settings
AUDIO_CONFIG = {
    "max_duration": 30,          # Limit audio to 30 seconds for speed
    "sample_rate": 16000,        # Standard rate for speech recognition
    "energy_threshold": 150,     # Lower = more sensitive, faster processing
    "pause_threshold": 0.3,      # Shorter pause detection for speed
    "phrase_threshold": 0.2,     # Faster phrase detection
    "noise_duration": 0.05,      # Minimal noise adjustment time
}

# Model Settings
MODEL_CONFIG = {
    "whisper_max_length": 3000,  # Limit input length for speed
    "whisper_output_length": 50, # Shorter output for speed
    "category_max_length": 128,  # Limit text classification input
    "use_gpu": True,             # Use GPU if available
    "use_fp16": True,            # Use half precision for speed
    "num_beams": 1,              # Greedy decoding (fastest)
    "early_stopping": True,      # Stop generation early when possible
}

# Processing Settings
PROCESSING_CONFIG = {
    "model_load_timeout": 30,    # Max time to wait for models
    "max_workers": 2,            # Thread pool size
    "enable_async": True,        # Use async processing
    "cache_models": True,        # Keep models in memory
    "fast_keyword_first": True,  # Try keyword classification first
}

# Performance Thresholds
PERFORMANCE_TARGETS = {
    "transcription_time": 3.0,   # Target: < 3 seconds
    "classification_time": 0.1,  # Target: < 100ms
    "extraction_time": 0.05,     # Target: < 50ms
    "total_processing": 5.0,     # Target: < 5 seconds total
}

# Optimization Flags
OPTIMIZATIONS = {
    "reduce_logging": True,      # Minimize console output
    "skip_model_warmup": False,  # Skip model warmup for faster startup
    "use_speech_recognition": True,  # Prefer Google Speech API
    "parallel_processing": True, # Process steps in parallel when possible
    "aggressive_caching": True,  # Cache everything possible
}

def get_config():
    """Get current performance configuration"""
    return {
        "audio": AUDIO_CONFIG,
        "model": MODEL_CONFIG,
        "processing": PROCESSING_CONFIG,
        "targets": PERFORMANCE_TARGETS,
        "optimizations": OPTIMIZATIONS
    }

def print_config():
    """Print current configuration"""
    config = get_config()
    print("⚙️ Performance Configuration:")
    print("=" * 30)
    
    for section, settings in config.items():
        print(f"\n📋 {section.upper()}:")
        for key, value in settings.items():
            print(f"  {key}: {value}")
    
    print("\n🎯 Performance Tips:")
    print("• Use SSD storage for faster model loading")
    print("• Ensure stable internet for Google Speech API")
    print("• Close unnecessary applications for more RAM")
    print("• Use GPU if available for model inference")

if __name__ == "__main__":
    print_config()