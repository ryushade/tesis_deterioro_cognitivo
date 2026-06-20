import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")

test_configs = [
    ("v1beta", "gemini-1.5-flash"),
    ("v1beta", "gemini-2.5-flash"),
    ("v1beta", "gemini-1.5-pro"),
]

payload = {
    "contents": [{
        "parts": [{"text": "Dí Hola."}]
    }]
}

for version, model in test_configs:
    url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={gemini_key}"
    headers = {"Content-Type": "application/json"}
    
    print(f"\nProbing: {version} | {model}")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        print("Status Code:", response.status_code)
        print("Response:", response.text[:200])
    except Exception as e:
        print("Error:", e)
