import sys
import os

# Añadir directorio raíz del backend al path para poder importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import mmse_service

# Borrar claves de Gemini para forzar el fallback a Groq
if "GEMINI_API_KEY" in os.environ:
    del os.environ["GEMINI_API_KEY"]
mmse_service.obtener_gemini_api_keys = lambda: []

def test_groq_evaluation():
    print("Iniciando prueba de evaluar_oracion con Groq (sin Gemini)...")
    
    # Comprobar si tenemos Groq API key configurada
    groq_key = mmse_service.obtener_groq_api_key()
    if not groq_key:
        print("ERROR: GROQ_API_KEY no detectada.")
        return
        
    print(f"GROQ_API_KEY detectada: {groq_key[:10]}...")
    
    # Caso 1: Oración válida
    frase_valida = "Hoy es un día soleado y saldré a caminar por el parque."
    print(f"\nEvaluando frase válida: '{frase_valida}'")
    res1 = mmse_service.evaluar_oracion(frase_valida)
    print("Resultado 1:")
    print("  Correcto:", res1.get("correcto"))
    print("  Puntaje:", res1.get("puntaje"))
    print("  Análisis:", res1.get("analisis"))
    
    # Caso 2: Oración inválida (palabra suelta)
    frase_invalida = "sol"
    print(f"\nEvaluando frase inválida: '{frase_invalida}'")
    res2 = mmse_service.evaluar_oracion(frase_invalida)
    print("Resultado 2:")
    print("  Correcto:", res2.get("correcto"))
    print("  Puntaje:", res2.get("puntaje"))
    print("  Análisis:", res2.get("analisis"))

if __name__ == "__main__":
    test_groq_evaluation()
