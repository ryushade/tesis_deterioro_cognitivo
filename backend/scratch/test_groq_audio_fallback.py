import sys
import os
import base64
import wave
import struct

# Añadir directorio raíz del backend al path para poder importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import mmse_service

# Forzar el bypass de Gemini
mmse_service.obtener_gemini_api_keys = lambda: []

def generate_tiny_wav(filepath):
    # Generar 2 segundos de silencio en un archivo WAV válido (16kHz, 16-bit, Mono)
    print(f"Generando WAV de prueba de 2 segundos en: {filepath}")
    with wave.open(filepath, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        # Escribir 32000 frames de silencio (0s)
        for _ in range(32000):
            w.writeframesraw(struct.pack("<h", 0))

def test_groq_audio():
    print("Iniciando prueba de evaluar_audio_repeticion con Groq (Whisper + Llama)...")
    
    # Comprobar si tenemos Groq API key
    groq_key = mmse_service.obtener_groq_api_key()
    if not groq_key:
        print("ERROR: GROQ_API_KEY no detectada.")
        return
        
    print(f"GROQ_API_KEY detectada: {groq_key[:10]}...")
    
    # Generar el archivo WAV de prueba pequeño
    recording_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp_test_audio.wav"))
    generate_tiny_wav(recording_path)
    mime_type = "audio/wav"
    
    # Leer archivo de audio y convertir a base64
    with open(recording_path, "rb") as f:
        audio_bytes = f.read()
    audio_base64 = f"data:{mime_type};base64," + base64.b64encode(audio_bytes).decode("utf-8")
    
    # Ejecutar la evaluación del audio
    print(f"\nEjecutando evaluar_audio_repeticion con mime_type: {mime_type}...")
    res = mmse_service.evaluar_audio_repeticion(audio_base64, mime_type=mime_type)
    
    print("\n=== RESULTADO DE EVALUACION ===")
    print("Correcto:", res.get("correcto"))
    print("Puntaje:", res.get("puntaje"))
    print("Transcripción:", res.get("transcripcion"))
    print("Análisis:", res.get("analisis"))
    
    # Limpiar archivo temporal
    if os.path.exists(recording_path):
        os.remove(recording_path)
        print("\nArchivo temporal de audio eliminado.")

if __name__ == "__main__":
    test_groq_audio()
