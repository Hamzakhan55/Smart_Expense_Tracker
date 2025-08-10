#!/usr/bin/env python3
"""
Fix sklearn version warning
"""

import subprocess
import sys

def fix_sklearn():
    print("🔧 Fixing sklearn version...")
    
    # Upgrade sklearn to match the model version
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn==1.7.1"])
        print("✅ Updated scikit-learn to 1.7.1")
    except:
        print("⚠️ Could not update sklearn - model will still work")

if __name__ == "__main__":
    fix_sklearn()