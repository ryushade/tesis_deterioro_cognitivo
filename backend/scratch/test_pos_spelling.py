import sys
import os

os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

pos_pipeline = pipeline(
    "token-classification", 
    model="mrm8488/bert-spanish-cased-finetuned-pos"
)

# Test cases with typical spelling/grammar mistakes
test_cases = [
    "el pero corre.",       # 'pero' instead of 'perro' (spelling mistake)
    "yo comer fruta.",      # infinitive verb instead of conjugated
    "mi casa es lindo.",    # gender agreement mistake (casa [f] vs lindo [m])
    "tengo hamvre.",        # spelling mistake ('hamvre' instead of 'hambre')
]

for text in test_cases:
    print(f"\nTexto: '{text}'")
    results = pos_pipeline(text)
    tags = [(res["word"], res["entity"]) for res in results]
    print("Tokens & Tags:", tags)
    
    has_verb = False
    has_noun_or_pron = False
    
    for word, tag in tags:
        tag_upper = tag.upper()
        if tag_upper.startswith("V"):
            has_verb = True
        if tag_upper.startswith("N") or tag_upper.startswith("P"):
            has_noun_or_pron = True
            
    is_valid = has_verb and has_noun_or_pron and len(text.split()) >= 3
    print(f"-> Contiene Verbo: {has_verb} | Contiene Sustantivo/Pronombre: {has_noun_or_pron}")
    print(f"-> ¿Oración válida?: {is_valid}")
