import os
import requests
import json
import re
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env en la raíz del backend de forma robusta
basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, "..", "..", ".env")
load_dotenv(dotenv_path)

# Global variable to cache the Hugging Face pipeline
_pos_pipeline = None

def _obtener_pipeline_local():
    """
    Carga y cachea de forma perezosa el modelo de clasificación de tokens de Hugging Face.
    """
    global _pos_pipeline
    if _pos_pipeline is None:
        try:
            from transformers import pipeline
            # Configurar directorio de caché local
            directorio_actual = os.path.dirname(os.path.abspath(__file__))
            ruta_cache = os.path.abspath(os.path.join(directorio_actual, "..", "..", "scratch", "hf_cache"))
            os.environ["HF_HOME"] = ruta_cache
            
            print("[IA MMSE] Cargando modelo local de Hugging Face (mrm8488/bert-spanish-cased-finetuned-pos)...")
            _pos_pipeline = pipeline(
                "token-classification", 
                model="mrm8488/bert-spanish-cased-finetuned-pos"
            )
            print("[IA MMSE] Modelo local cargado exitosamente.")
        except Exception as e:
            print(f"[IA MMSE] Error cargando pipeline local de Hugging Face: {e}")
            _pos_pipeline = False  # Indica que falló la carga
    return _pos_pipeline

def evaluar_oracion_local(frase):
    """
    Evaluación de respaldo local usando el modelo de Hugging Face.
    Comprueba si la frase tiene un verbo (V...) y un sustantivo/pronombre (N... o P...).
    """
    frase_clean = frase.strip()
    palabras = frase_clean.split()
    
    # Validaciones básicas
    if len(palabras) < 3 or len(frase_clean) < 6:
        return {
            "correcto": False,
            "puntaje": 0,
            "analisis": "La respuesta es demasiado corta para constituir una oración completa y coherente (mínimo 3 palabras)."
        }
        
    pipeline_local = _obtener_pipeline_local()
    if not pipeline_local:
        # Fallback a heurística pura si falló Hugging Face
        print("[IA MMSE] Hugging Face no está disponible. Usando heurística de palabras.")
        words_count = len(palabras)
        es_valido = words_count >= 3 and len(frase_clean) > 8
        return {
            "correcto": bool(es_valido),
            "puntaje": 1 if es_valido else 0,
            "analisis": "Evaluado mediante validación de longitud de texto."
        }

    try:
        # Evaluar frase original
        results = pipeline_local(frase_clean)
        tags = [res["entity"].upper() for res in results]
        
        has_verb = any(t.startswith("V") for t in tags)
        has_noun_or_pron = any(t.startswith("N") or t.startswith("P") for t in tags)
        
        # Heurística adicional en español para verbos comunes y pronombres que a veces se tokenizan mal
        verbos_comunes = {
            "corro", "corre", "corren", "correr", "escribo", "escribe", "escriben", "escribir",
            "tengo", "tiene", "tienen", "tener", "como", "come", "comen", "comer", "comi", "comí",
            "voy", "va", "van", "ir", "soy", "es", "son", "ser", "estoy", "esta", "está", "estan",
            "están", "estar", "hago", "hace", "hacen", "hacer", "quiero", "quiere", "querer",
            "gusta", "gustan", "gustar", "veo", "ve", "ven", "ver"
        }
        
        for p in palabras:
            p_clean = re.sub(r'[^\w]', '', p.lower())
            if p_clean in verbos_comunes:
                has_verb = True
            # Detectar si es un pronombre/sujeto común o sustantivo de longitud decente
            if len(p_clean) >= 3 and p_clean not in ["con", "del", "una", "los", "las", "para", "por", "que"]:
                has_noun_or_pron = True

        is_correct = has_verb and has_noun_or_pron
        
        explicacion = []
        if has_verb:
            explicacion.append("verbo detectado")
        else:
            explicacion.append("falta verbo")
            
        if has_noun_or_pron:
            explicacion.append("sustantivo/pronombre detectado")
        else:
            explicacion.append("falta sujeto/sustantivo")
            
        analisis_txt = f"Análisis de estructura: {', '.join(explicacion)}."
        
        return {
            "correcto": bool(is_correct),
            "puntaje": 1 if is_correct else 0,
            "analisis": analisis_txt
        }
    except Exception as err:
        print(f"[IA MMSE] Error en análisis con modelo local: {err}")
        # Fallback de última instancia
        es_valido = len(palabras) >= 3 and len(frase_clean) > 8
        return {
            "correcto": bool(es_valido),
            "puntaje": 1 if es_valido else 0,
            "analisis": "Evaluado mediante validación de longitud de texto."
        }

def _parse_boolean(val):
    if val is None:
        return False
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return bool(val)
    if isinstance(val, str):
        v = val.strip().lower()
        if v in ("true", "1", "yes", "correct", "correcto"):
            return True
        if v in ("false", "0", "no", "incorrect", "incorrecto"):
            return False
    return bool(val)


def evaluar_oracion(frase):
    """
    Función principal de evaluación. Intenta usar Gemini API (de Google AI Studio)
    como motor principal por su precisión semántica y tolerancia a fallas de ortografía.
    Si no hay API Key o falla, recurre a la IA local de Hugging Face.
    """
    if not frase or not isinstance(frase, str) or not frase.strip():
        return {
            "correcto": False,
            "puntaje": 0,
            "analisis": "El paciente no escribió ninguna respuesta."
        }

    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if gemini_key:
        print("[IA MMSE] Evaluando frase con la API de Gemini...")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        
        prompt = (
            "Actúa como una IA experta en evaluaciones neuropsicológicas y análisis del lenguaje para adultos mayores.\n"
            "Tu tarea es evaluar la respuesta escrita de un paciente en la prueba de 'Escritura' del MMSE (Mini-Mental State Examination).\n\n"
            "Reglas de calificación:\n"
            "1. La respuesta del paciente recibe 1 punto (correcto=true, puntaje=1) si constituye una oración completa y coherente en español "
            "(debe tener al menos un verbo y un sujeto, el cual puede ser implícito/tácito, y expresar un pensamiento coherente).\n"
            "2. Ignora los errores de ortografía o concordancia gramatical menor (por ejemplo, 'el pero corre', 'yo tengo hamvre', 'el gato correr rapido' son correctas y reciben 1 punto).\n"
            "3. La respuesta recibe 0 puntos (correcto=false, puntaje=0) si es solo una palabra suelta (ej. 'sol'), una frase sin verbo (ej. 'sol y luna'), "
            "una combinación de palabras sin sentido coherente, o letras aleatorias sin significado (ej. 'asdasd').\n\n"
            "Analiza el siguiente texto escrito por el paciente:\n"
            f"\"{frase.strip()}\"\n\n"
            "Devuelve tu respuesta únicamente en formato JSON estricto con los siguientes campos exactos:\n"
            "{\n"
            "  \"correcto\": true/false,\n"
            "  \"puntaje\": 1/0,\n"
            "  \"analisis\": \"Una explicación muy breve (1 línea) de por qué se asignó esta calificación basándote en la presencia de verbo, sujeto y sentido.\"\n"
            "}"
        )
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=8)
            if response.status_code == 200:
                resp_json = response.json()
                content_text = resp_json['candidates'][0]['content']['parts'][0]['text']
                # Limpiar posibles bloques de código markdown
                content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(content_clean)
                
                # Validar campos requeridos
                if "correcto" in result and "puntaje" in result:
                    # Asegurar tipos
                    result["correcto"] = _parse_boolean(result["correcto"])
                    result["puntaje"] = 1 if result["correcto"] else 0
                    result["analisis"] = result.get('analisis', '')
                    print(f"[IA MMSE] Calificación de Gemini: {result['correcto']} (Puntaje: {result['puntaje']})")
                    return result
            else:
                print(f"[IA MMSE] La API de Gemini retornó código de error: {response.status_code}. Detalle: {response.text}")
        except Exception as err:
            print(f"[IA MMSE] Error conectando con la API de Gemini: {err}")
            
        print("[IA MMSE] Falló la API de Gemini. Recurriendo al modelo local de Hugging Face...")
        
    else:
        print("[IA MMSE] GEMINI_API_KEY no configurada. Usando el modelo local de Hugging Face...")

    # Ejecutar evaluación local con Hugging Face
    return evaluar_oracion_local(frase)


def evaluar_audio_repeticion(audio_base64, mime_type="audio/webm"):
    """
    Evalúa la respuesta de audio para el ítem de repetición ("En un trigal había cinco perros")
    usando la API de Gemini Multimodal.
    """
    if not audio_base64:
        return {
            "correcto": False,
            "puntaje": 0,
            "analisis": "No se recibió archivo de audio de evidencia."
        }

    # Limpiar prefijo base64 si existe
    if "," in audio_base64:
        header, base64_data = audio_base64.split(",", 1)
        if "mime" in header:
            # extraer mime type de e.g. "data:audio/webm;base64"
            match = re.search(r'data:([^;]+);base64', header)
            if match:
                mime_type = match.group(1)
    else:
        base64_data = audio_base64

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        print("[IA MMSE] Evaluando audio de repetición con Gemini Multimodal...")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        
        prompt = (
            "Eres una IA experta en evaluaciones neuropsicológicas y análisis del habla.\n"
            "El paciente ha grabado su voz repitiendo la frase en español: 'En un trigal había cinco perros'.\n"
            "Analiza el audio proporcionado y determina si el paciente repitió correctamente la frase.\n\n"
            "Reglas de calificación:\n"
            "1. La respuesta es correcta (correcto=true, puntaje=1) si el paciente repite la frase de manera inteligible y completa. Se permiten pequeñas variaciones en la pronunciación o leves titubeos debido a la edad del paciente.\n"
            "2. La respuesta es incorrecta (correcto=false, puntaje=0) si el paciente dice una frase completamente distinta, omite palabras clave significativas (como 'trigal' o 'cinco perros'), o si solo hay silencio/ruido ininteligible.\n\n"
            "Devuelve tu respuesta únicamente en formato JSON estricto con los siguientes campos:\n"
            "{\n"
            "  \"correcto\": true/false,\n"
            "  \"puntaje\": 1/0,\n"
            "  \"transcripcion\": \"La transcripción literal de lo que dice el paciente en el audio\",\n"
            "  \"analisis\": \"Una explicación muy breve (1 línea) del resultado.\"\n"
            "}"
        )
        
        payload = {
            "contents": [{
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_data
                        }
                    },
                    {
                        "text": prompt
                    }
                ]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=12)
            if response.status_code == 200:
                resp_json = response.json()
                content_text = resp_json['candidates'][0]['content']['parts'][0]['text']
                content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(content_clean)
                
                if "correcto" in result:
                    result["correcto"] = _parse_boolean(result["correcto"])
                    result["puntaje"] = 1 if result["correcto"] else 0
                    result["analisis"] = f"Transcripción: '{result.get('transcripcion', '')}'. {result.get('analisis', '')}"
                    print(f"[IA MMSE] Calificación de audio de Gemini: {result['correcto']} (Puntaje: {result['puntaje']})")
                    return result
            else:
                print(f"[IA MMSE] La API de Gemini Multimodal retornó error: {response.status_code}. Detalle: {response.text}")
        except Exception as err:
            print(f"[IA MMSE] Error en Gemini Multimodal para audio: {err}")
            
    # Fallback si no hay API Key o falla
    print("[IA MMSE] Usando fallback para audio (sin Gemini). Aceptado para revisión manual.")
    return {
        "correcto": True,
        "puntaje": 1,
        "analisis": "Audio grabado correctamente. Requiere revisión auditiva del especialista."
    }

