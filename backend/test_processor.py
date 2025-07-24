# backend/test_processor.py

import sys
from pathlib import Path

# This helps Python find your services module
sys.path.append(str(Path(__file__).parent.parent))

from backend.services.ai_processor import ai_processor

def run_test():
    """
    A simple, direct test of the AIProcessor on a local file.
    """
    print("--- Starting Direct AI Processor Test ---")
    
    # The path to the audio file you placed in the 'backend' folder
    test_file = Path("D:/College/Courses/Smart_Expense_Tracker/backend/rrrr.wav")

    if not test_file.exists():
        print(f"ERROR: Test file not found at '{test_file.resolve()}'")
        print("Please make sure 'burgers800.mp3' is inside the 'backend' folder.")
        return

    print(f"Attempting to process file: {test_file.resolve()}")
    
    # Directly call the function that is failing
    result = ai_processor.process_expense_audio(str(test_file))

    print("\n--- Test Complete ---")
    print("Final Result:")
    print(result)

if __name__ == "__main__":
    run_test()