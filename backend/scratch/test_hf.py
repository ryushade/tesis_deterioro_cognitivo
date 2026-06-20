import sys
import os

# Set cache directory inside workspace to avoid permissions issues
os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "hf_cache")

from transformers import pipeline

print("Loading Hugging Face Zero-Shot Classification model...")
try:
    classifier = pipeline(
        "zero-shot-classification", 
        model="MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7"
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
    
    candidate_labels = [
        "una oración completa y coherente con sujeto y verbo", 
        "texto incompleto, palabras sueltas o sin sentido"
    ]
    
    for text in test_cases:
        res = classifier(text, candidate_labels, hypothesis_template="Este texto es {}")
        scores = dict(zip(res["labels"], res["scores"]))
        best_label = res["labels"][0]
        score = scores[best_label]
        print(f"\nTexto: '{text}'")
        print(f"Clasificación: '{best_label}' (Confianza: {score:.2%})")
        
except Exception as e:
    print(f"Error: {e}")
