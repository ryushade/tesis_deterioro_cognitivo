import sys
import os

os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

pos_pipeline = pipeline(
    "token-classification", 
    model="mrm8488/bert-spanish-cased-finetuned-pos-syntax"
)

test_cases = [
    "Corro en el parque.",
    "Comí una manzana.",
    "Tengo 80 años.",
    "Ayer comimos carne.",
    "El perro.",
    "correr.",
]

for text in test_cases:
    print(f"\nTexto: '{text}'")
    results = pos_pipeline(text)
    tags = [(res["word"], res["entity"]) for res in results]
    print("Tokens & Tags:", tags)
    
    # Check what entities are present
    entities = [res["entity"] for res in results]
    has_suj = "SUJ" in entities
    has_root = "ROOT" in entities
    has_cd = "CD" in entities or any(e.startswith("CD") for e in entities)
    
    print(f"-> SUJ (Sujeto): {has_suj} | ROOT (Verbo principal): {has_root} | CD (Objeto Directo): {has_cd}")
