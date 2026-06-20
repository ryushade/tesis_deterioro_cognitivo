import os
import requests
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")

test_models = [
    "gemini-2.0-flash-lite",
    "gemini-3.5-flash",
    "gemma-4-31b-it"
]

payload = {
    "contents": [{
        "parts": [{"text": "Dí Hola."}]
    }]
}

for model in test_models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
    headers = {"Content-Type": "application/json"}
    
    print(f"\nProbing: {model}")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        print("Status Code:", response.status_code)
        print("Response:", response.text[:200])
    except Exception as e:
        print("Error:", e)
