import sys
import os

# Añadir directorio raíz del backend al path para poder importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import mmse_service

def test_evaluar_oracion():
    print("Iniciando prueba de evaluar_oracion...")
    
    # Comprobar si tenemos API key configurada
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY no detectada.")
        return
        
    print("GEMINI_API_KEY detectada. Probando llamada real a Gemini...")
    frase = "El hospital y la sala de psicología son muy acogedoras."
    res = mmse_service.evaluar_oracion(frase)
    print("\nResultado:")
    print("Correcto:", res.get("correcto"))
    print("Puntaje:", res.get("puntaje"))
    print("Análisis:", res.get("analisis"))

if __name__ == "__main__":
    test_evaluar_oracion()
