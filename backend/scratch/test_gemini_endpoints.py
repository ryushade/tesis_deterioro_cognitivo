import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")

test_configs = [
    # (api_version, model_name)
    ("v1", "gemini-1.5-flash"),
    ("v1", "gemini-1.5-flash-latest"),
    ("v1beta", "gemini-1.5-flash-latest"),
    ("v1beta", "gemini-2.5-flash"),
]

prompt = "Dí 'Hola' en una palabra."
payload = {
    "contents": [{
        "parts": [{"text": prompt}]
    }]
}

for version, model in test_configs:
    url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={gemini_key}"
    headers = {"Content-Type": "application/json"}
    
    print(f"\nProbing: {version} | {model}")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            print("Success! Response:", response.json()['candidates'][0]['content']['parts'][0]['text'].strip())
            break
        else:
            print("Error details:", response.text)
    except Exception as e:
        print("Error:", e)
