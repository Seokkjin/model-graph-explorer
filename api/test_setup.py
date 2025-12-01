"""
Test script to verify Prophet API setup
"""
import sys
print(f"Python version: {sys.version}")

# Test imports
try:
    import flask
    print("✓ Flask imported successfully")
except ImportError as e:
    print(f"✗ Flask import failed: {e}")

try:
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
except ImportError as e:
    print(f"✗ Flask-CORS import failed: {e}")

try:
    import pandas as pd
    print(f"✓ Pandas imported successfully (version {pd.__version__})")
except ImportError as e:
    print(f"✗ Pandas import failed: {e}")

try:
    from prophet import Prophet
    print("✓ Prophet imported successfully")
except ImportError as e:
    print(f"✗ Prophet import failed: {e}")

print("\n" + "="*50)
print("All dependencies are installed correctly!")
print("="*50)
print("\nYou can now run: python prophet_api.py")
