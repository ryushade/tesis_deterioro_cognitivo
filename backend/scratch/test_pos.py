import sys
import os

os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

print("Loading Hugging Face POS Tagging model...")
try:
    pos_pipeline = pipeline(
        "token-classification", 
        model="mrm8488/bert-spanish-cased-finetuned-pos-syntax"
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
    ]
    
    for text in test_cases:
        print(f"\nTexto: '{text}'")
        results = pos_pipeline(text)
        
        # Aggregate tags
        tags = [(res["word"], res["entity"]) for res in results]
        print("Tokens & Tags:", tags)
        
        # Check for presence of verb (typically contains 'V' or 'v') and noun/pronoun
        has_verb = False
        has_noun = False
        
        for word, tag in tags:
            tag_upper = tag.upper()
            # In AnCora tagset (standard for Spanish POS tagging in BETO/CoNLL):
            # 'v' stands for verb (e.g. VMIP3S0, VSIP3S0, v...)
            # 'n' stands for noun (e.g. NCMS000, np...)
            # 'p' stands for pronoun
            if tag_upper.startswith("V"):
                has_verb = True
            if tag_upper.startswith("N") or tag_upper.startswith("P"):
                has_noun = True
                
        # Basic validation rule
        is_sentence = has_verb and has_noun and len(text.split()) >= 3
        print(f"-> Contiene Verbo: {has_verb} | Contiene Sustantivo/Pronombre: {has_noun}")
        print(f"-> ¿Es oración válida?: {is_sentence}")
        
except Exception as e:
    print(f"Error: {e}")
