#!/usr/bin/env python3
"""
Test script to verify Gemini API is working with the correct model
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test Gemini API with the correct model name"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables")
        return False
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # List available models first
        print("🔍 Available models:")
        models = genai.list_models()
        for model in models:
            if 'gemini' in model.name.lower():
                print(f"  - {model.name}")
        
        # Test with the latest flash model
        print("\n🧪 Testing with gemini-flash-latest...")
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Simple test prompt
        response = model.generate_content("Say 'Hello, Gemini API is working!' if you can read this.")
        
        if response.text:
            print(f"✅ Success! Response: {response.text}")
            return True
        else:
            print("❌ No response from Gemini API")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Gemini API: {e}")
        return False

def test_transaction_categorization():
    """Test transaction categorization specifically"""
    try:
        from gemini_client import GeminiClient
        
        print("\n🧪 Testing transaction categorization...")
        client = GeminiClient()
        
        # Test with sample transactions
        test_transactions = [
            "HEB Grocery Store",
            "Starbucks Coffee", 
            "Shell Gas Station",
            "Netflix Subscription"
        ]
        
        result = client.categorize_transactions(test_transactions)
        
        if result and 'transactions' in result:
            print("✅ Transaction categorization working!")
            for i, tx in enumerate(test_transactions):
                category = result['transactions'][i] if i < len(result['transactions']) else 'Unknown'
                print(f"  - {tx}: {category}")
            return True
        else:
            print("❌ Transaction categorization failed")
            return False
            
    except Exception as e:
        print(f"❌ Error testing transaction categorization: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Gemini API Integration...")
    print("=" * 50)
    
    # Test basic API
    api_working = test_gemini_api()
    
    if api_working:
        # Test transaction categorization
        categorization_working = test_transaction_categorization()
        
        if categorization_working:
            print("\n🎉 All Gemini API tests passed!")
        else:
            print("\n⚠️ Basic API works but categorization needs fixing")
    else:
        print("\n❌ Gemini API not working - check your API key and model name")
