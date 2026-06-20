import sys
import os

os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

pos_pipeline = pipeline(
    "token-classification", 
    model="mrm8488/bert-spanish-cased-finetuned-pos"
)

# Test lowercased sentence
text = "corro en el parque."
print(f"Texto: '{text}'")
results = pos_pipeline(text)
tags = [(res["word"], res["entity"]) for res in results]
print("Tokens & Tags:", tags)
