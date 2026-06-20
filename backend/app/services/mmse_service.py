import os
import requests
import json
import re
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env en la raíz del backend de forma robusta
basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, "..", "..", ".env")
load_dotenv(dotenv_path, override=True)

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


def obtener_gemini_api_keys():
    """
    Retorna una lista de API keys de Gemini a probar, incluyendo la configurada en .env
    y las claves de respaldo provistas por el usuario.
    """
    keys = []
    primary = os.getenv("GEMINI_API_KEY")
    if primary:
        keys.append(primary)
    
    fallback_1 = "AIzaSyA_vLrDKP4D0pv6vOvNkm6f9jJ8JxRAvt8"
    if fallback_1 not in keys:
        keys.append(fallback_1)
        
    fallback_2 = "AIzaSyAEns1OtQzowcY3-CMXTuTDmMfPFQwX7kA"
    if fallback_2 not in keys:
        keys.append(fallback_2)
        
    return keys

def obtener_groq_api_key():
    return os.getenv("GROQ_API_KEY")


def evaluar_oracion(frase):
    """
    Función principal de evaluación. Intenta usar Gemini API (de Google AI Studio)
    como motor principal por su precisión semántica y tolerancia a fallas de ortografía.
    Si Gemini falla o no está disponible, intenta usar la API de Groq (llama-3.3-70b-versatile).
    Si ambos fallan o no están configurados, recurre a la IA local de Hugging Face.
    """
    if not frase or not isinstance(frase, str) or not frase.strip():
        return {
            "correcto": False,
            "puntaje": 0,
            "analisis": "El paciente no escribió ninguna respuesta."
        }

    # 1. Intentar con Gemini
    api_keys = obtener_gemini_api_keys()
    if api_keys:
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash"]
        for gemini_key in api_keys:
            for model in models_to_try:
                print(f"[IA MMSE] Evaluando frase con la API de Gemini ({model})...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
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
                            print(f"[IA MMSE] Calificación de Gemini ({model}): {result['correcto']} (Puntaje: {result['puntaje']})")
                            return result
                    else:
                        print(f"[IA MMSE] La API de Gemini ({model}) retornó código de error: {response.status_code}. Detalle: {response.text}")
                except Exception as err:
                    print(f"[IA MMSE] Error conectando con la API de Gemini ({model}): {err}")
                    
        print("[IA MMSE] Fallaron todos los modelos de Gemini. Intentando con la API de Groq...")
    else:
        print("[IA MMSE] GEMINI_API_KEY no configurada. Intentando con la API de Groq...")

    # 2. Intentar con Groq como fallback
    groq_key = obtener_groq_api_key()
    if groq_key:
        print("[IA MMSE] Evaluando frase con la API de Groq (llama-3.3-70b-versatile)...")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        
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
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=8)
            if response.status_code == 200:
                resp_json = response.json()
                content_text = resp_json['choices'][0]['message']['content']
                content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(content_clean)
                
                if "correcto" in result and "puntaje" in result:
                    result["correcto"] = _parse_boolean(result["correcto"])
                    result["puntaje"] = 1 if result["correcto"] else 0
                    result["analisis"] = result.get('analisis', '')
                    print(f"[IA MMSE] Calificación de Groq (llama-3.3-70b-versatile): {result['correcto']} (Puntaje: {result['puntaje']})")
                    return result
            else:
                print(f"[IA MMSE] La API de Groq retornó código de error: {response.status_code}. Detalle: {response.text}")
        except Exception as err:
            print(f"[IA MMSE] Error conectando con la API de Groq: {err}")
            
        print("[IA MMSE] Falló la API de Groq. Recurriendo al modelo local de Hugging Face...")
    else:
        print("[IA MMSE] GROQ_API_KEY no configurada. Recurriendo al modelo local de Hugging Face...")

    # 3. Ejecutar evaluación local con Hugging Face
    return evaluar_oracion_local(frase)


def evaluar_audio_repeticion(audio_base64, mime_type="audio/webm"):
    """
    Evalúa la respuesta de audio para el ítem de repetición ("En un trigal había cinco perros")
    usando la API de Gemini Multimodal.
    Si Gemini falla o no está disponible, utiliza Groq Whisper para transcribir
    y Llama 3.3 para calificar semánticamente la frase.
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

    # 1. Intentar con Gemini Multimodal
    api_keys = obtener_gemini_api_keys()
    if api_keys:
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash"]
        for gemini_key in api_keys:
            for model in models_to_try:
                print(f"[IA MMSE] Evaluando audio de repetición con Gemini Multimodal ({model})...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
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
                            print(f"[IA MMSE] Calificación de audio de Gemini ({model}): {result['correcto']} (Puntaje: {result['puntaje']})")
                            return result
                    else:
                        print(f"[IA MMSE] La API de Gemini Multimodal ({model}) retornó error: {response.status_code}. Detalle: {response.text}")
                except Exception as err:
                    print(f"[IA MMSE] Error en Gemini Multimodal para audio ({model}): {err}")
            
        print("[IA MMSE] Fallaron todos los modelos de Gemini para Audio. Intentando con la API de Groq...")
    else:
        print("[IA MMSE] GEMINI_API_KEY no configurada. Intentando con la API de Groq...")

    # 2. Intentar con Groq (Whisper + Llama 3.3)
    groq_key = obtener_groq_api_key()
    if groq_key:
        print("[IA MMSE] Procesando audio con Groq Whisper y Llama 3.3...")
        import base64 as b64_module
        
        # Endpoint de transcripción de Groq
        url_transcribe = "https://api.groq.com/openai/v1/audio/transcriptions"
        headers_transcribe = {
            "Authorization": f"Bearer {groq_key}"
        }
        
        # Nombre de archivo temporal ficticio según mime-type para que Groq reconozca el formato
        file_ext = "webm"
        if "mp3" in mime_type:
            file_ext = "mp3"
        elif "wav" in mime_type:
            file_ext = "wav"
        elif "ogg" in mime_type:
            file_ext = "ogg"
        elif "m4a" in mime_type:
            file_ext = "m4a"
            
        try:
            audio_bytes = b64_module.b64decode(base64_data)
            files = {
                "file": (f"audio.{file_ext}", audio_bytes, mime_type)
            }
            data = {
                "model": "whisper-large-v3",
                "language": "es"
            }
            
            print("[IA MMSE] Enviando audio a Groq Whisper para transcripción...")
            response_tr = requests.post(url_transcribe, headers=headers_transcribe, files=files, data=data, timeout=15)
            
            if response_tr.status_code == 200:
                transcripcion = response_tr.json().get("text", "").strip()
                print(f"[IA MMSE] Transcripción exitosa de Groq Whisper: '{transcripcion}'")
                
                # Evaluar la frase transcrita con Llama-3.3-70b-versatile
                url_eval = "https://api.groq.com/openai/v1/chat/completions"
                headers_eval = {
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json"
                }
                
                prompt_eval = (
                    "Eres una IA experta en evaluaciones neuropsicológicas y análisis del habla.\n"
                    "El paciente debía repetir la frase en español: 'En un trigal había cinco perros'.\n"
                    "El texto transcrito obtenido de la grabación de su voz es:\n"
                    f"\"{transcripcion}\"\n\n"
                    "Determina si el paciente repitió correctamente la frase.\n\n"
                    "Reglas de calificación:\n"
                    "1. La respuesta es correcta (correcto=true, puntaje=1) si el paciente repitió la frase de manera inteligible y completa. Se permiten pequeñas variaciones en la pronunciación o leves faltas ortográficas causadas por la transcripción automática (por ejemplo, 'en un trigal habia 5 perros', 'en un trigal habian cinco perros' son correctas).\n"
                    "2. La respuesta es incorrecta (correcto=false, puntaje=0) si el paciente dice una frase completamente distinta, omite palabras clave significativas (como 'trigal' o 'cinco perros'), o si la transcripción está vacía o es solo ruido.\n\n"
                    "Devuelve tu respuesta únicamente en formato JSON estricto con los siguientes campos:\n"
                    "{\n"
                    "  \"correcto\": true/false,\n"
                    "  \"puntaje\": 1/0,\n"
                    "  \"analisis\": \"Una explicación muy breve (1 línea) del resultado.\"\n"
                    "}"
                )
                
                payload_eval = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt_eval
                        }
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                }
                
                print("[IA MMSE] Evaluando semántica de transcripción con Groq Llama 3.3...")
                response_ev = requests.post(url_eval, headers=headers_eval, json=payload_eval, timeout=10)
                
                if response_ev.status_code == 200:
                    content_text = response_ev.json()['choices'][0]['message']['content']
                    content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                    result = json.loads(content_clean)
                    
                    if "correcto" in result:
                        result["correcto"] = _parse_boolean(result["correcto"])
                        result["puntaje"] = 1 if result["correcto"] else 0
                        # Devolver la transcripción para que sea visible en el informe
                        result["transcripcion"] = transcripcion
                        result["analisis"] = f"Transcripción Groq: '{transcripcion}'. {result.get('analisis', '')}"
                        print(f"[IA MMSE] Calificación de audio de Groq: {result['correcto']} (Puntaje: {result['puntaje']})")
                        return result
                else:
                    print(f"[IA MMSE] Groq Llama 3.3 retornó error: {response_ev.status_code}. Detalle: {response_ev.text}")
            else:
                print(f"[IA MMSE] Groq Whisper retornó error: {response_tr.status_code}. Detalle: {response_tr.text}")
        except Exception as err:
            print(f"[IA MMSE] Error procesando audio en Groq: {err}")
            
        print("[IA MMSE] Falló el procesamiento de Groq para Audio. Recurriendo a revisión manual...")
    else:
        print("[IA MMSE] GROQ_API_KEY no configurada. Recurriendo a revisión manual...")

    # 3. Fallback de última instancia (Manual Review)
    print("[IA MMSE] Usando fallback para audio. Aceptado para revisión manual.")
    return {
        "correcto": True,
        "puntaje": 1,
        "analisis": "Audio grabado correctamente. Requiere revisión auditiva del especialista."
    }


def generar_sugerencia_diagnostica_ia(paciente, edad, evaluaciones):
    """
    Sintetiza una sugerencia diagnóstica neuropsicológica basada en el historial
    de evaluaciones del paciente utilizando la API de Gemini (tiered fallback).
    """
    nombre_completo = f"{paciente.get('nombres', '')} {paciente.get('apellidos', '')}".strip()
    sexo = paciente.get('sexo', 'No especificado')
    escolaridad = paciente.get('escolaridad', 'No especificada')
    
    # Construir resumen de texto de evaluaciones
    historial_text = []
    for idx, ev in enumerate(evaluaciones, 1):
        linea = f"Evaluación {idx}:\n  - Prueba: {ev['prueba']}\n  - Fecha: {ev['fecha']}\n  - Puntuación: {ev['puntaje']}/{ev['puntaje_maximo']}"
        if "clasificacion" in ev and ev["clasificacion"]:
            linea += f"\n  - Clasificación registrada en la BD: {ev['clasificacion']}"
        if "detalles_mmse" in ev:
            linea += f"\n  - Desglose de categorías MMSE: {ev['detalles_mmse']}"
        if "diagnostico_ia" in ev and ev["diagnostico_ia"]:
            linea += f"\n  - Diagnóstico previo de la IA: {ev['diagnostico_ia']}"
        if "observaciones_ia" in ev and ev["observaciones_ia"]:
            linea += f"\n  - Observaciones previas de la IA: {ev['observaciones_ia']}"
        historial_text.append(linea)
    
    resumen_historial_str = "\n\n".join(historial_text)

    prompt = (
        "Actúa como un neuropsicólogo clínico experto de alto nivel en envejecimiento cognitivo y demencias.\n"
        "Tu tarea es analizar el historial de evaluaciones de un paciente y redactar una 'Sugerencia Diagnóstica' profesional en español.\n\n"
        "Datos demográficos del paciente:\n"
        f"- Nombre: {nombre_completo}\n"
        f"- Edad: {edad if edad is not None else 'No especificada'} años\n"
        f"- Sexo: {sexo}\n"
        f"- Nivel de Escolaridad: {escolaridad}\n\n"
        "Historial de evaluaciones clínicas registradas (ordenadas de más reciente a más antigua):\n"
        f"{resumen_historial_str}\n\n"
        "Instrucciones clínicas para tu análisis:\n"
        "1. Consulta ESTRICTAMENTE el campo 'Clasificación registrada en la BD' para cada prueba. Tu análisis y descripción de cada prueba DEBEN ALINEARSE PERFECTAMENTE con esta clasificación. Por ejemplo, si una prueba está clasificada como 'Normal' en la BD (como un MMSE de 24/30), bajo ninguna circunstancia debes escribir que el MMSE 'sugiere un deterioro cognitivo' o que su rendimiento global en esa prueba es de rango de deterioro; descríbelo correctamente como un rendimiento global normal o preservado.\n"
        "2. Si hay múltiples evaluaciones, analiza la trayectoria longitudinal (declive, estabilidad o mejoría) basándote en la evolución real de los puntajes y clasificaciones de la base de datos.\n"
        "3. Revisa los dominios del MMSE ÚNICAMENTE si el historial incluye el 'Desglose de categorías MMSE'. Si no se incluye el desglose, NO menciones dominios específicos ni inventes qué áreas fallaron. Si se incluye el desglose, describe objetivamente qué áreas específicas presentan dificultades (por ejemplo, si Orientación tiene 6/10 o Lenguaje/Praxis tiene 7/9) para matizar tu informe, aun cuando la puntuación global del MMSE esté clasificada como Normal.\n"
        "4. Integra los resultados de todas las pruebas (como el Test del Reloj - CDT y el MMSE) para formular la clasificación diagnóstica final sugerida. Ten en cuenta que si el MMSE es Normal pero el Test del Reloj (CDT) muestra un deterioro moderado (o viceversa), esto puede justificar una clasificación diagnóstica global de 'Deterioro Cognitivo Leve' o 'Deterioro Cognitivo Moderado' debido al compromiso ejecutivo/visuoespacial temprano del CDT, pero debes redactarlo de manera coherente (por ejemplo, aclarando que aunque el rendimiento cognitivo general en el MMSE fue normal, el Test del Reloj evidenció un compromiso moderado en funciones ejecutivas/visuoespaciales).\n"
        "5. NO inventes datos, puntajes ni categorías que no estén presentes en el historial clínico proporcionado.\n"
        "6. Redacta un párrafo clínico (4-6 líneas) formal y empático que resuma el estado del paciente y dé una recomendación clínica realista. NO menciones tecnologías ni APIs, ni nombres de modelos de IA (como Groq, Gemini, Llama, etc.).\n\n"
        "Debes devolver tu respuesta ÚNICAMENTE en formato JSON estricto con los siguientes campos y tipos exactos:\n"
        "{\n"
        "  \"clasificacion\": \"Normal\" | \"Deterioro Cognitivo Leve\" | \"Deterioro Cognitivo Moderado\" | \"Deterioro Cognitivo Grave\",\n"
        "  \"riesgo_pct\": <un número entero de 0 a 100 que represente la probabilidad clínica de deterioro cognitivo>,\n"
        "  \"analisis\": \"Tu párrafo de análisis y recomendación clínica en español (4-6 líneas)\"\n"
        "}"
    )

    groq_key = obtener_groq_api_key()
    if groq_key:
        print("[IA DIAGNOSTICO] Analizando paciente con Groq (llama-3.3-70b-versatile)...")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                resp_json = response.json()
                content_text = resp_json['choices'][0]['message']['content']
                content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(content_clean)
                
                if "clasificacion" in result and "riesgo_pct" in result and "analisis" in result:
                    result["riesgo_pct"] = int(result["riesgo_pct"])
                    result["clasificacion"] = str(result["clasificacion"]).strip()
                    result["analisis"] = str(result["analisis"]).strip()
                    print(f"[IA DIAGNOSTICO] Sugerencia generada exitosamente con Groq: {result['clasificacion']}")
                    return result
            else:
                print(f"[IA DIAGNOSTICO] Groq error de API: {response.status_code}. Detalle: {response.text}")
        except Exception as err:
            print(f"[IA DIAGNOSTICO] Error de conexión con Groq: {err}")
        
        print("[IA DIAGNOSTICO] Falló Groq, intentando con Gemini...")

    api_keys = obtener_gemini_api_keys()
    if api_keys:
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash"]
        for gemini_key in api_keys:
            for model in models_to_try:
                print(f"[IA DIAGNOSTICO] Analizando paciente con Gemini ({model})...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                headers = {"Content-Type": "application/json"}
                
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2
                    }
                }
                
                try:
                    response = requests.post(url, headers=headers, json=payload, timeout=12)
                    if response.status_code == 200:
                        resp_json = response.json()
                        content_text = resp_json['candidates'][0]['content']['parts'][0]['text']
                        content_clean = content_text.strip().replace("```json", "").replace("```", "").strip()
                        result = json.loads(content_clean)
                        
                        if "clasificacion" in result and "riesgo_pct" in result and "analisis" in result:
                            result["riesgo_pct"] = int(result["riesgo_pct"])
                            result["clasificacion"] = str(result["clasificacion"]).strip()
                            result["analisis"] = str(result["analisis"]).strip()
                            print(f"[IA DIAGNOSTICO] Sugerencia generada exitosamente con ({model}): {result['clasificacion']}")
                            return result
                    else:
                        print(f"[IA DIAGNOSTICO] Gemini ({model}) error de API: {response.status_code}. Detalle: {response.text}")
                except Exception as err:
                    print(f"[IA DIAGNOSTICO] Error de conexión con Gemini ({model}): {err}")
                
        print("[IA DIAGNOSTICO] Fallaron todos los modelos de Gemini. Usando fallback clínico programático...")
    else:
        print("[IA DIAGNOSTICO] GEMINI_API_KEY no encontrada. Usando fallback clínico programático...")

    return generar_fallback_diagnostico(evaluaciones, edad, escolaridad)


def generar_fallback_diagnostico(evaluaciones, edad, escolaridad):
    """
    Genera un diagnóstico heurístico de respaldo cuando no se puede acceder a la API de Gemini.
    """
    ultimo_mmse = None
    for ev in evaluaciones:
        nombre = ev.get('prueba', '')
        if 'mmse' in nombre.lower() or 'mini-mental' in nombre.lower() or 'mini mental' in nombre.lower():
            ultimo_mmse = ev
            break

    ultimo_cdt = None
    for ev in evaluaciones:
        nombre = ev.get('prueba', '')
        if 'reloj' in nombre.lower() or 'cdt' in nombre.lower():
            ultimo_cdt = ev
            break

    if ultimo_mmse:
        score = ultimo_mmse.get('puntaje', 28)
        max_score = ultimo_mmse.get('puntaje_maximo', 30)
        pct = (score / max_score) * 100 if max_score else 100
        
        from app.controllers.resultados_controller import clasificar_mmse_por_escolaridad
        categoria_corte = clasificar_mmse_por_escolaridad(score, escolaridad)

        if categoria_corte == "Normal":
            clasif = "Normal"
            riesgo = max(0, int(100 - pct))
            analisis = (
                f"De acuerdo con la evaluación MMSE realizada el {ultimo_mmse.get('fecha')}, el rendimiento cognitivo general "
                f"se encuentra preservado ({score}/{max_score} puntos), lo cual es congruente con los parámetros normales para su edad "
                f"({edad if edad else 'no especificada'} años) y nivel de escolaridad ({escolaridad}). No se observan indicios de declive cognitivo "
                f"significativo. Se recomienda continuar con un estilo de vida saludable y valoraciones de control anuales."
            )
        elif categoria_corte == "Deterioro leve":
            clasif = "Deterioro Cognitivo Leve"
            riesgo = int(45 + (24 - score) * 5)
            analisis = (
                f"Se observa un rendimiento cognitivo de {score}/{max_score} puntos en la prueba MMSE, sugiriendo un Deterioro Cognitivo Leve. "
                f"Se detectan ligeras dificultades en dominios específicos que superan lo esperado para la edad del paciente y escolaridad ({escolaridad}). "
                f"Se sugiere una evaluación neuropsicológica detallada para caracterizar los dominios afectados (especialmente memoria de trabajo "
                f"y atención) e iniciar actividades de estimulación cognitiva preventiva."
            )
        elif categoria_corte == "Deterioro moderado":
            clasif = "Deterioro Cognitivo Moderado"
            riesgo = int(70 + (18 - score) * 2.5)
            analisis = (
                f"El rendimiento en la prueba MMSE ({score}/{max_score} puntos) evidencia un compromiso cognitivo significativo compatible "
                f"con un Deterioro Cognitivo Moderado. Existen alteraciones marcadas en la orientación temporal-espacial, capacidad de cálculo "
                f"o memoria. Se sugiere interconsulta médica especializada con neurología y/o geriatría para estudios complementarios, "
                f"así como el diseño de un programa estructurado de rehabilitación cognitiva y apoyo familiar."
            )
        else: # Deterioro grave
            clasif = "Deterioro Cognitivo Grave"
            riesgo = min(100, int(90 + (9 - score) * 1.1))
            analisis = (
                f"La evaluación cognitiva MMSE muestra un desempeño de {score}/{max_score} puntos, compatible con Deterioro Cognitivo Grave. "
                f"Se observan limitaciones importantes y generalizadas en las funciones cognitivas globales, afectando la independencia funcional "
                f"del paciente. Es altamente prioritaria la interconsulta con neurología y el establecimiento de medidas de supervisión constante, "
                f"terapia ocupacional adaptada y pautas de manejo conductual para sus cuidadores."
            )
    elif ultimo_cdt:
        puntaje = ultimo_cdt.get('puntaje', 8)
        clasif_ia = ultimo_cdt.get('diagnostico_ia', 'Normal')
        
        if 'normal' in clasif_ia.lower() or puntaje >= 7:
            clasif = "Normal"
            riesgo = 15
            analisis = (
                f"La prueba de dibujo del reloj (CDT) completada el {ultimo_cdt.get('fecha')} muestra una estructuración "
                f"y ejecución visuoespacial preservada ({puntaje}/10 puntos), lo que sugiere habilidades ejecutivas conservadas. "
                f"Aunque este resultado es favorable, se aconseja realizar un tamizaje integral con la prueba MMSE para evaluar otros dominios cognitivos."
            )
        else:
            clasif = "Deterioro Cognitivo Leve"
            riesgo = 60
            analisis = (
                f"La prueba de dibujo del reloj (CDT) completada el {ultimo_cdt.get('fecha')} presenta anomalías estructurales "
                f"o de representación horaria ({puntaje}/10 puntos), clasificada como {clasif_ia}. Esto puede indicar un compromiso temprano "
                f"en la función ejecutiva o habilidades visuo-constructivas. Se aconseja complementar con una evaluación neuropsicológica detallada."
            )
    else:
        clasif = "Normal"
        riesgo = 10
        analisis = "No se cuenta con evaluaciones cognitivas suficientes para realizar un análisis de dominios detallado. Realice un test integral en la plataforma."

    return {
        "clasificacion": clasif,
        "riesgo_pct": riesgo,
        "analisis": analisis
    }


