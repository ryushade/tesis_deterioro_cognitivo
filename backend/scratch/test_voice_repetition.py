import sys
import os

# Añadir directorio raíz del backend al path para poder importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import mmse_service

def test_evaluar_audio():
    print("Iniciando prueba de evaluar_audio_repeticion...")
    
    # 1. Probar con base64 vacío
    print("\n--- TEST 1: Base64 vacío ---")
    res1 = mmse_service.evaluar_audio_repeticion("")
    print("Resultado:", res1)
    assert res1["correcto"] is False
    assert res1["puntaje"] == 0

    # 2. Probar con un mock de base64 (simulando audio silenciado)
    # GkXfo59ChoEB es la cabecera típica de WebM
    mock_base64 = "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibWR1cHBsZXJUZW1wbGF0ZUFjdGl2ZUludGVydmFs"
    print("\n--- TEST 2: Mock de audio (con/sin Gemini) ---")
    
    # Comprobar si tenemos API key configurada
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY no detectada. Se espera fallback.")
        res2 = mmse_service.evaluar_audio_repeticion(mock_base64)
        print("Resultado:", res2)
        assert res2["correcto"] is True
        assert res2["puntaje"] == 1
        assert "fallback" in res2["analisis"].lower()
    else:
        print("GEMINI_API_KEY detectada. Probando llamada real a Gemini...")
        res2 = mmse_service.evaluar_audio_repeticion(mock_base64)
        print("Resultado:", res2)
        # Como el audio del mock es inválido o no tiene voz, Gemini debería retornar correcto=False o fallback si hay error de formato
        print("Prueba completada con Gemini.")
        
    print("\n¡Prueba de integración completada exitosamente!")

if __name__ == "__main__":
    test_evaluar_audio()
