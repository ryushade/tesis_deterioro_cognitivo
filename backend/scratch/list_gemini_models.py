import os
import requests
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
try:
    response = requests.get(url, timeout=5)
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        models = response.json().get("models", [])
        print(f"Found {len(models)} models:")
        for m in models:
            print(f"- {m['name']} | Supported actions: {m.get('supportedGenerationMethods')}")
    else:
        print("Error details:", response.text)
except Exception as e:
    print("Error:", e)
