import sys
import os

os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

print("Loading Hugging Face mrm8488/bert-spanish-cased-finetuned-pos...")
try:
    pos_pipeline = pipeline(
        "token-classification", 
        model="mrm8488/bert-spanish-cased-finetuned-pos"
    )
    print("Model loaded successfully!")
    
    test_cases = [
        "El perro corre en el parque.",
        "Mañana voy a comer una manzana muy rica.",
        "sol y luna",
        "corriendo rápido",
        "El sol.",
        "hola mundo",
        "Yo tengo setenta años.",
        "escribir oración",
        "Corro en el parque.",
        "Comí una manzana.",
        "Tengo 80 años.",
    ]
    
    for text in test_cases:
        print(f"\nTexto: '{text}'")
        results = pos_pipeline(text)
        tags = [(res["word"], res["entity"]) for res in results]
        print("Tokens & Tags:", tags)
        
        # Check standard POS tags:
        # 'v' or 'V' for verb (NC, AQ, etc. are common tags in Spanish AnCora/EAGLES)
        # In EAGLES tagset:
        # V... = Verb
        # N... = Noun (NC... common noun, NP... proper noun)
        # P... = Pronoun
        # A... = Adjective
        # R... = Adverb
        # S... = Preposition
        # D... = Determiner
        # C... = Conjunction
        # F... = Punctuation
        
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
        
except Exception as e:
    print(f"Error: {e}")
