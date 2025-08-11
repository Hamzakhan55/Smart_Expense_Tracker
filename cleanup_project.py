#!/usr/bin/env python3
"""
Clean up unnecessary files from the Smart Expense Tracker project
"""

import os
import shutil
from pathlib import Path

def cleanup_project():
    base_path = Path(".")
    
    # Files and directories to remove
    cleanup_items = [
        # Backend unnecessary files
        "backend/services/ai_processor_enhanced.py",
        "backend/services/ai_processor_final.py", 
        "backend/services/ai_processor_fixed.py",
        "backend/services/ai_processor_improved.py",
        "backend/services/ai_processor_local.py",
        "backend/services/ai_processor_simple.py",
        "backend/check_app.py",
        "backend/check_backend.py",
        "backend/check_model_sequence.py",
        "backend/check_mysql_db.py",
        "backend/debug_models.py",
        "backend/evaluate_minilm_accuracy.py",
        "backend/fix_database.py",
        "backend/fix_login_issues.py",
        "backend/fix_sklearn_version.py",
        "backend/fix_sqlalchemy.py",
        "backend/improve_models.py",
        "backend/install_audio_deps.py",
        "backend/MODEL_ACCURACY_REPORT.md",
        "backend/MODEL_IMPROVEMENT_GUIDE.md",
        "backend/requirements_complete.txt",
        "backend/requirements_minimal.txt",
        "backend/reset_user_password.py",
        "backend/setup_ai_pipeline.py",
        "backend/start_fixed.py",
        "backend/start_minimal.py",
        "backend/start_server_fixed.py",
        "backend/start_server_simple.py",
        "backend/start_server.py",
        "backend/start_simple.py",
        "backend/test_backend.py",
        "backend/test_complete_pipeline.py",
        "backend/test_direct.py",
        "backend/test_login.py",
        "backend/test_minilm.py",
        "backend/test_model_accuracy_simple.py",
        "backend/test_model_accuracy.py",
        "backend/test_models.py",
        "backend/test_mysql_connection.py",
        "backend/test_simple.py",
        "backend/test_transcription_fix.py",
        "backend/test_whisper_simple.py",
        "backend/temp_audio",
        
        # Old model directories
        "backend/models/MiniLM-V2",
        
        # Frontend build files
        "frontend/.next",
        
        # Mobile build files  
        "Smart_Expense_Tracker_Mobile/.expo",
        
        # Documentation files
        "AI_PIPELINE_README.md",
        "AI_PIPELINE_TROUBLESHOOTING.md",
        "MOBILE_APP_SUMMARY.md", 
        "MOBILE_SUCCESS.md",
        "Smart_Expense_Tracker_Mobile/API_TEST_GUIDE.md",
        "Smart_Expense_Tracker_Mobile/MOBILE_OFFLINE_MODE.md",
        "Smart_Expense_Tracker_Mobile/NAVIGATION_SETUP.md",
        
        # Batch files
        "fix_firewall.bat",
        "fix_network_access.bat",
        "QUICK_FIX.bat",
        "setup_ai_pipeline.bat",
        "setup_and_start.bat",
        "setup_demo_data.bat",
        "setup_mobile_connection.bat",
        "start_backend_mobile.bat",
        "start_backend_simple.bat",
        "start_backend.bat",
        "start_frontend.bat",
        "start_mobile_backend.bat",
        "START.bat",
        "test_connection.py",
        "test_db_connection.py",
        "test_mobile_connection.bat",
    ]
    
    removed_count = 0
    
    for item in cleanup_items:
        item_path = base_path / item
        try:
            if item_path.exists():
                if item_path.is_file():
                    item_path.unlink()
                    print(f"🗑️  Removed file: {item}")
                elif item_path.is_dir():
                    shutil.rmtree(item_path)
                    print(f"🗑️  Removed directory: {item}")
                removed_count += 1
        except Exception as e:
            print(f"❌ Failed to remove {item}: {e}")
    
    print(f"\n✅ Cleanup complete! Removed {removed_count} items.")
    print("\n📁 Keeping essential files:")
    print("   - backend/services/ai_processor.py (main AI service)")
    print("   - backend/test_category_model.py (model testing)")
    print("   - backend/debug_voice_text.py (debugging)")
    print("   - backend/retrain_model.py (model retraining)")
    print("   - All core application files")

if __name__ == "__main__":
    cleanup_project()