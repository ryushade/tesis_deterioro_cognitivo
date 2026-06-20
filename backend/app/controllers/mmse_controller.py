import db.database as db
import json


def obtener_categorias_mmse():
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    c.id_categoria,
                    c.nombre_categoria,
                    c.puntaje_maximo,
                    c.estado,
                    COUNT(DISTINCT s.id_seccion) AS total_secciones,
                    COUNT(DISTINCT i.id_item) FILTER (
                        WHERE i.estado = 1
                    ) AS total_items_configurados
                FROM public.categoria_mmse c
                JOIN public.prueba_catalogo p
                    ON p.id_prueba = c.id_prueba
                LEFT JOIN public.seccion_mmse s
                    ON s.id_categoria = c.id_categoria
                   AND s.estado = 1
                LEFT JOIN public.opcion_seccion_mmse o
                    ON o.id_seccion = s.id_seccion
                   AND o.estado = 1
                LEFT JOIN public.item_mmse i
                    ON i.id_opcion = o.id_opcion
                   AND i.estado = 1
                WHERE (UPPER(p.nombre_prueba) LIKE '%MMSE%' OR UPPER(p.nombre_prueba) LIKE '%MINI%')
                GROUP BY
                    c.id_categoria,
                    c.nombre_categoria,
                    c.puntaje_maximo,
                    c.estado
                ORDER BY c.id_categoria;
            """)
            return cur.fetchall()
    except Exception as e:
        print(f"Error obteniendo categorias MMSE: {e}")
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def obtener_estructura_mmse():
    """
    Obtiene la estructura completa del MMSE desde BD y la agrupa
    en una jerarquía: prueba → categorías → secciones → opciones → ítems.
    """
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    p.id_prueba,
                    p.nombre_prueba,
                    p.puntaje_maximo AS puntaje_maximo_prueba,
                    p.tiempo_limite_segundos,

                    c.id_categoria,
                    c.nombre_categoria,
                    c.puntaje_maximo AS puntaje_maximo_categoria,
                    c.estado AS estado_categoria,

                    s.id_seccion,
                    s.nombre_seccion,
                    s.descripcion AS descripcion_seccion,
                    s.instrucciones_aplicacion,
                    s.orden AS orden_seccion,
                    s.puntaje_maximo AS puntaje_maximo_seccion,
                    s.permite_opciones,
                    s.requiere_material,

                    o.id_opcion,
                    o.nombre_opcion,
                    o.instrucciones AS instrucciones_opcion,
                    o.orden AS orden_opcion,
                    o.es_default,
                    o.puntaje_maximo AS puntaje_maximo_opcion,

                    i.id_item,
                    i.texto_item,
                    i.criterio_correccion,
                    i.respuesta_esperada,
                    i.tipo_respuesta,
                    i.orden AS orden_item,
                    i.puntaje_maximo AS puntaje_maximo_item,
                    i.requiere_revision_manual

                FROM prueba_catalogo p
                JOIN categoria_mmse c ON c.id_prueba = p.id_prueba
                JOIN seccion_mmse s ON s.id_categoria = c.id_categoria
                JOIN opcion_seccion_mmse o ON o.id_seccion = s.id_seccion
                JOIN item_mmse i ON i.id_opcion = o.id_opcion
                WHERE (UPPER(p.nombre_prueba) LIKE '%MMSE%' OR UPPER(p.nombre_prueba) LIKE '%MINI%')
                  AND p.estado = 1
                  AND c.estado = 1
                  AND s.estado = 1
                  AND o.estado = 1
                  AND i.estado = 1
                ORDER BY
                    c.id_categoria,
                    s.orden,
                    o.orden,
                    i.orden;
            """)
            rows = cur.fetchall()

            if not rows:
                return {"error": "No se encontró estructura MMSE activa en la base de datos"}

            # Agrupar en jerarquía
            prueba = {
                "id_prueba": rows[0]["id_prueba"],
                "nombre_prueba": rows[0]["nombre_prueba"],
                "puntaje_maximo": rows[0]["puntaje_maximo_prueba"],
                "tiempo_limite_segundos": rows[0]["tiempo_limite_segundos"],
                "categorias": []
            }

            categorias_map = {}
            secciones_map = {}
            opciones_map = {}

            for row in rows:
                cat_id = row["id_categoria"]
                sec_id = row["id_seccion"]
                opc_id = row["id_opcion"]
                item_id = row["id_item"]

                # Categoría
                if cat_id not in categorias_map:
                    cat = {
                        "id_categoria": cat_id,
                        "nombre_categoria": row["nombre_categoria"],
                        "puntaje_maximo": row["puntaje_maximo_categoria"],
                        "secciones": []
                    }
                    categorias_map[cat_id] = cat
                    prueba["categorias"].append(cat)

                # Sección
                if sec_id not in secciones_map:
                    sec = {
                        "id_seccion": sec_id,
                        "nombre_seccion": row["nombre_seccion"],
                        "descripcion": row["descripcion_seccion"],
                        "instrucciones_aplicacion": row["instrucciones_aplicacion"],
                        "orden": row["orden_seccion"],
                        "puntaje_maximo": row["puntaje_maximo_seccion"],
                        "permite_opciones": row["permite_opciones"],
                        "requiere_material": row["requiere_material"],
                        "opciones": []
                    }
                    secciones_map[sec_id] = sec
                    categorias_map[cat_id]["secciones"].append(sec)

                # Opción
                if opc_id not in opciones_map:
                    opc = {
                        "id_opcion": opc_id,
                        "nombre_opcion": row["nombre_opcion"],
                        "instrucciones": row["instrucciones_opcion"],
                        "orden": row["orden_opcion"],
                        "es_default": row["es_default"],
                        "puntaje_maximo": row["puntaje_maximo_opcion"],
                        "items": []
                    }
                    opciones_map[opc_id] = opc
                    secciones_map[sec_id]["opciones"].append(opc)

                # Ítem (siempre se agrega, no hay duplicados por la query ORDER)
                item_key = f"{opc_id}_{item_id}"
                item = {
                    "id_item": item_id,
                    "texto_item": row["texto_item"],
                    "criterio_correccion": row["criterio_correccion"],
                    "respuesta_esperada": row["respuesta_esperada"],
                    "tipo_respuesta": row["tipo_respuesta"],
                    "orden": row["orden_item"],
                    "puntaje_maximo": row["puntaje_maximo_item"],
                    "requiere_revision_manual": row["requiere_revision_manual"]
                }
                opciones_map[opc_id]["items"].append(item)

            return prueba

    except Exception as e:
        print(f"Error obteniendo estructura MMSE: {e}")
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def iniciar_evaluacion(id_asignacion):
    """
    Crea o recupera una fila en evaluacion_cognitiva para la asignación dada.
    Obtiene id_neuropsicologo desde paciente (vía asignacion_prueba).
    Retorna id_evaluacion o dict con error.
    """
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            # Verificar que la asignación existe y es MMSE
            cur.execute("""
                SELECT ap.id_asignacion, ap.id_paciente, ap.id_prueba,
                       pc.nombre_prueba, p.id_neuropsicologo,
                       CONCAT(p.nombres, ' ', p.apellidos) AS nombre_paciente
                FROM asignacion_prueba ap
                JOIN prueba_catalogo pc ON pc.id_prueba = ap.id_prueba
                JOIN paciente p ON p.id_paciente = ap.id_paciente
                WHERE ap.id_asignacion = %s
            """, (id_asignacion,))
            asig = cur.fetchone()

            if not asig:
                return {"error": "Asignación no encontrada"}

            if 'mmse' not in asig["nombre_prueba"].lower() and 'mini' not in asig["nombre_prueba"].lower():
                return {"error": f"La asignación no corresponde a prueba MMSE (es: {asig['nombre_prueba']})"}

            id_neuropsicologo = asig["id_neuropsicologo"]
            if not id_neuropsicologo:
                return {"error": "No se encontró neuropsicólogo asociado al paciente"}

            # Buscar evaluación existente para esta asignación
            cur.execute("""
                SELECT id_evaluacion, estado_evaluacion, puntaje_total
                FROM evaluacion_cognitiva
                WHERE id_asignacion = %s
                ORDER BY id_evaluacion DESC
                LIMIT 1
            """, (id_asignacion,))
            eval_existente = cur.fetchone()

            if eval_existente:
                return {
                    "id_evaluacion": eval_existente["id_evaluacion"],
                    "estado_evaluacion": eval_existente["estado_evaluacion"],
                    "puntaje_total": eval_existente["puntaje_total"],
                    "nombre_paciente": asig["nombre_paciente"],
                    "es_nueva": False
                }

            # Crear nueva evaluación
            cur.execute("""
                INSERT INTO evaluacion_cognitiva
                    (id_asignacion, id_neuropsicologo, estado_evaluacion)
                VALUES (%s, %s, 1)
                RETURNING id_evaluacion
            """, (id_asignacion, id_neuropsicologo))
            row = cur.fetchone()
            id_evaluacion = row["id_evaluacion"]

            conn.commit()
            return {
                "id_evaluacion": id_evaluacion,
                "estado_evaluacion": 1,
                "puntaje_total": None,
                "nombre_paciente": asig["nombre_paciente"],
                "es_nueva": True
            }

    except Exception as e:
        print(f"Error iniciando evaluación MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def guardar_seccion(data):
    """
    Inserta o actualiza un registro en evaluacion_mmse_seccion.
    Usa ON CONFLICT (id_evaluacion, id_seccion) DO UPDATE.
    """
    conn = None
    try:
        id_evaluacion = data["id_evaluacion"]
        id_seccion = data["id_seccion"]
        id_opcion_aplicada = data["id_opcion_aplicada"]
        orden_aplicacion = data.get("orden_aplicacion", 1)
        aplicada = data.get("aplicada", True)
        omitida = data.get("omitida", False)
        motivo_omision = data.get("motivo_omision")
        intentos_aprendizaje = data.get("intentos_aprendizaje")
        aprendio_estimulos = data.get("aprendio_estimulos")
        observacion = data.get("observacion")

        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO evaluacion_mmse_seccion
                    (id_evaluacion, id_seccion, id_opcion_aplicada, orden_aplicacion,
                     aplicada, omitida, motivo_omision, intentos_aprendizaje,
                     aprendio_estimulos, observacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id_evaluacion, id_seccion)
                DO UPDATE SET
                    id_opcion_aplicada = EXCLUDED.id_opcion_aplicada,
                    orden_aplicacion = EXCLUDED.orden_aplicacion,
                    aplicada = EXCLUDED.aplicada,
                    omitida = EXCLUDED.omitida,
                    motivo_omision = EXCLUDED.motivo_omision,
                    intentos_aprendizaje = EXCLUDED.intentos_aprendizaje,
                    aprendio_estimulos = EXCLUDED.aprendio_estimulos,
                    observacion = EXCLUDED.observacion
                RETURNING id_eval_seccion
            """, (
                id_evaluacion, id_seccion, id_opcion_aplicada, orden_aplicacion,
                aplicada, omitida, motivo_omision, intentos_aprendizaje,
                aprendio_estimulos, observacion
            ))
            row = cur.fetchone()
            id_eval_seccion = row["id_eval_seccion"]

            conn.commit()
            return {"id_eval_seccion": id_eval_seccion}

    except Exception as e:
        print(f"Error guardando sección MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def guardar_respuesta_item(data):
    """
    Inserta o actualiza un registro en evaluacion_mmse_respuesta_item.
    Usa ON CONFLICT (id_eval_seccion, id_item) DO UPDATE.
    Valida que puntaje sea 0 o 1 y que correcto/puntaje sean coherentes.
    """
    conn = None
    try:
        id_eval_seccion = data["id_eval_seccion"]
        id_opcion = data["id_opcion"]
        id_item = data["id_item"]
        respuesta_texto = data.get("respuesta_texto")
        respuesta_json = data.get("respuesta_json")
        correcto = data.get("correcto")
        puntaje = data.get("puntaje", 0)
        omitido = data.get("omitido", False)
        motivo_omision = data.get("motivo_omision")
        requiere_revision = data.get("requiere_revision", False)
        archivo_evidencia = data.get("archivo_evidencia")
        observacion = data.get("observacion")

        # Obtener el tipo de respuesta del ítem desde la base de datos
        tipo_respuesta = None
        texto_item = ""
        conn_check = db.obtener_conexion()
        try:
            with conn_check.cursor() as cur:
                cur.execute("SELECT tipo_respuesta, texto_item FROM item_mmse WHERE id_item = %s", (id_item,))
                item_row = cur.fetchone()
                if item_row:
                    tipo_respuesta = item_row["tipo_respuesta"] if isinstance(item_row, dict) else item_row[0]
                    texto_item = item_row["texto_item"] if isinstance(item_row, dict) else item_row[1]
        except Exception as e:
            print(f"Error consultando tipo_respuesta: {e}")
        finally:
            conn_check.close()

        # Traducir placeholders de interfaz técnica a descripciones legibles
        if respuesta_texto == "audio_recorded":
            respuesta_texto = "🎤 [Audio Grabado]"
        elif respuesta_texto == "completed":
            lower_texto = (texto_item or "").lower()
            if "cierre" in lower_texto or "ojos" in lower_texto:
                respuesta_texto = "✓ Cerró los ojos"
            elif "dibujo" in lower_texto or "figura" in lower_texto or "copia" in lower_texto:
                respuesta_texto = "🎨 Dibujo realizado"
            elif "tres" in lower_texto or "etapas" in lower_texto or "pasos" in lower_texto or "ejecución" in lower_texto or "ejecucion" in lower_texto:
                respuesta_texto = "✓ Acción ejecutada (Tres pasos)"
            else:
                respuesta_texto = "✓ Completado"

        # Si el ítem es de tipo 'escritura' y no está omitido, evaluar con la IA
        if (tipo_respuesta == "escritura" or "escritura" in (texto_item or "").lower()) and not omitido and respuesta_texto:
            try:
                from app.services import mmse_service
                eval_res = mmse_service.evaluar_oracion(respuesta_texto)
                correcto = eval_res.get("correcto", correcto)
                puntaje = 1 if correcto else 0
                observacion = eval_res.get("analisis", observacion)
            except Exception as ia_err:
                print(f"Error ejecutando IA para escritura: {ia_err}")

        # Si el ítem es de tipo 'repetición' y no está omitido y tiene archivo_evidencia (audio grabado)
        if ("repetición" in (texto_item or "").lower() or "repeticion" in (texto_item or "").lower()) and not omitido and archivo_evidencia:
            try:
                from app.services import mmse_service
                eval_res = mmse_service.evaluar_audio_repeticion(archivo_evidencia)
                correcto = eval_res.get("correcto", correcto)
                puntaje = 1 if correcto else 0
                observacion = eval_res.get("analisis", observacion)
                
                # Guardar la transcripción de voz si está disponible para mejorar la UX
                transcripcion = eval_res.get("transcripcion")
                if transcripcion:
                    respuesta_texto = f"🎤 \"{transcripcion}\""
                else:
                    respuesta_texto = "🎤 [Audio Grabado]"
            except Exception as ia_err:
                print(f"Error ejecutando IA para repetición de voz: {ia_err}")
                respuesta_texto = "🎤 [Audio Grabado]"

        # Validaciones - Asegurar tipos consistentes
        if correcto is not None:
            if isinstance(correcto, str):
                correcto = correcto.lower() in ("true", "1", "yes", "correct", "correcto")
            else:
                correcto = bool(correcto)
        
        try:
            puntaje = int(puntaje)
        except (ValueError, TypeError):
            puntaje = 0

        if puntaje not in (0, 1):
            return {"error": "El puntaje debe ser 0 o 1"}

        if correcto is True and puntaje != 1:
            return {"error": "Si correcto=true, puntaje debe ser 1"}

        if correcto is False and puntaje != 0:
            return {"error": "Si correcto=false, puntaje debe ser 0"}

        if omitido and puntaje != 0:
            return {"error": "Si omitido=true, puntaje debe ser 0"}

        # Convertir respuesta_json a JSON string si es dict
        respuesta_json_str = None
        if respuesta_json is not None:
            respuesta_json_str = json.dumps(respuesta_json) if isinstance(respuesta_json, dict) else respuesta_json

        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO evaluacion_mmse_respuesta_item
                    (id_eval_seccion, id_opcion, id_item,
                     respuesta_texto, respuesta_json, correcto, puntaje,
                     omitido, motivo_omision, requiere_revision,
                     archivo_evidencia, observacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id_eval_seccion, id_item)
                DO UPDATE SET
                    id_opcion = EXCLUDED.id_opcion,
                    respuesta_texto = EXCLUDED.respuesta_texto,
                    respuesta_json = EXCLUDED.respuesta_json,
                    correcto = EXCLUDED.correcto,
                    puntaje = EXCLUDED.puntaje,
                    omitido = EXCLUDED.omitido,
                    motivo_omision = EXCLUDED.motivo_omision,
                    requiere_revision = EXCLUDED.requiere_revision,
                    archivo_evidencia = EXCLUDED.archivo_evidencia,
                    observacion = EXCLUDED.observacion
                RETURNING id_respuesta
            """, (
                id_eval_seccion, id_opcion, id_item,
                respuesta_texto, respuesta_json_str, correcto, puntaje,
                omitido, motivo_omision, requiere_revision,
                archivo_evidencia, observacion
            ))
            row = cur.fetchone()
            id_respuesta = row["id_respuesta"]

            conn.commit()
            return {"id_respuesta": id_respuesta}

    except Exception as e:
        print(f"Error guardando respuesta ítem MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def finalizar_evaluacion(id_evaluacion, tiempos=None, duracion_segundos=None):
    """
    Calcula puntaje por categoría y total, actualiza evaluacion_cognitiva,
    guarda el tiempo total y marca la evaluación como finalizada (estado=2).
    """
    if isinstance(tiempos, dict):
        total_duration = tiempos.get("total")
    elif duracion_segundos is not None:
        total_duration = duracion_segundos
    else:
        total_duration = None

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            # Calcular puntaje por categoría
            cur.execute("""
                SELECT
                    c.id_categoria,
                    c.nombre_categoria,
                    c.puntaje_maximo,
                    COALESCE(SUM(r.puntaje), 0) AS puntaje_obtenido
                FROM evaluacion_cognitiva e
                JOIN evaluacion_mmse_seccion es ON es.id_evaluacion = e.id_evaluacion
                JOIN seccion_mmse s ON s.id_seccion = es.id_seccion
                JOIN categoria_mmse c ON c.id_categoria = s.id_categoria
                LEFT JOIN evaluacion_mmse_respuesta_item r
                    ON r.id_eval_seccion = es.id_eval_seccion
                   AND r.omitido = false
                WHERE e.id_evaluacion = %s
                GROUP BY c.id_categoria, c.nombre_categoria, c.puntaje_maximo
                ORDER BY c.id_categoria;
            """, (id_evaluacion,))
            categorias_resultado = cur.fetchall()

            # Calcular puntaje total
            cur.execute("""
                SELECT
                    COALESCE(SUM(r.puntaje), 0) AS puntaje_total
                FROM evaluacion_cognitiva e
                JOIN evaluacion_mmse_seccion es ON es.id_evaluacion = e.id_evaluacion
                JOIN evaluacion_mmse_respuesta_item r ON r.id_eval_seccion = es.id_eval_seccion
                WHERE e.id_evaluacion = %s
                  AND r.omitido = false;
            """, (id_evaluacion,))
            total_row = cur.fetchone()
            puntaje_total = total_row["puntaje_total"] if total_row else 0

            # Guardar el tiempo total si existe
            if total_duration is not None:
                cur.execute("""
                    UPDATE evaluacion_cognitiva
                    SET puntaje_total = %s, estado_evaluacion = 2, duracion_segundos = %s
                    WHERE id_evaluacion = %s
                """, (puntaje_total, total_duration, id_evaluacion))
            else:
                cur.execute("""
                    UPDATE evaluacion_cognitiva
                    SET puntaje_total = %s, estado_evaluacion = 2
                    WHERE id_evaluacion = %s
                """, (puntaje_total, id_evaluacion))

            # Insertar/actualizar resultado_categoria
            for cat in categorias_resultado:
                cur.execute("""
                    INSERT INTO resultado_categoria
                        (id_evaluacion, id_categoria, puntaje_obtenido)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (id_evaluacion, id_categoria)
                    DO UPDATE SET puntaje_obtenido = EXCLUDED.puntaje_obtenido
                """, (id_evaluacion, cat["id_categoria"], cat["puntaje_obtenido"]))

            # Marcar código de acceso como completado (estado_codigo = 2)
            cur.execute("""
                UPDATE codigo_acceso
                SET estado_codigo = 2
                WHERE id_asignacion = (
                    SELECT id_asignacion FROM evaluacion_cognitiva WHERE id_evaluacion = %s
                )
            """, (id_evaluacion,))

            conn.commit()

            # Preparar respuesta
            resultados_categorias = []
            for cat in categorias_resultado:
                resultados_categorias.append({
                    "id_categoria": cat["id_categoria"],
                    "nombre_categoria": cat["nombre_categoria"],
                    "puntaje_maximo": cat["puntaje_maximo"],
                    "puntaje_obtenido": cat["puntaje_obtenido"]
                })

            return {
                "puntaje_total": puntaje_total,
                "categorias": resultados_categorias,
                "tiempos": tiempos
            }

    except Exception as e:
        print(f"Error finalizando evaluación MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def obtener_respuestas_evaluacion(id_evaluacion):
    """
    Obtiene todas las respuestas guardadas (secciones e ítems) para una evaluación.
    """
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    es.id_seccion,
                    es.id_opcion_aplicada,
                    es.orden_aplicacion,
                    es.aplicada,
                    es.omitida,
                    es.motivo_omision AS seccion_motivo_omision,
                    es.intentos_aprendizaje,
                    es.aprendio_estimulos,
                    es.observacion AS seccion_observacion,
                    
                    ri.id_item,
                    ri.respuesta_texto,
                    ri.respuesta_json,
                    ri.correcto,
                    ri.puntaje,
                    ri.omitido AS item_omitido,
                    ri.motivo_omision AS item_motivo_omision,
                    ri.requiere_revision,
                    ri.archivo_evidencia,
                    ri.observacion AS item_observacion
                FROM public.evaluacion_mmse_seccion es
                LEFT JOIN public.evaluacion_mmse_respuesta_item ri 
                    ON es.id_eval_seccion = ri.id_eval_seccion
                WHERE es.id_evaluacion = %s
                ORDER BY es.orden_aplicacion, ri.id_item;
            """, (id_evaluacion,))
            rows = cur.fetchall()
            
            respuestas_map = {}
            for row in rows:
                sec_id = row["id_seccion"]
                if sec_id not in respuestas_map:
                    respuestas_map[sec_id] = {
                        "id_seccion": sec_id,
                        "id_opcion_aplicada": row["id_opcion_aplicada"],
                        "orden_aplicacion": row["orden_aplicacion"],
                        "aplicada": row["aplicada"],
                        "omitida": row["omitida"],
                        "motivo_omision": row["seccion_motivo_omision"],
                        "intentos_aprendizaje": row["intentos_aprendizaje"],
                        "aprendio_estimulos": row["aprendio_estimulos"],
                        "observacion": row["seccion_observacion"],
                        "items": []
                    }
                
                if row["id_item"] is not None:
                    resp_json = row["respuesta_json"]
                    if isinstance(resp_json, str):
                        try:
                            resp_json = json.loads(resp_json)
                        except Exception:
                            pass

                    respuestas_map[sec_id]["items"].append({
                        "id_item": row["id_item"],
                        "respuesta_texto": row["respuesta_texto"],
                        "respuesta_json": resp_json,
                        "correcto": row["correcto"],
                        "puntaje": row["puntaje"],
                        "omitido": row["item_omitido"],
                        "motivo_omision": row["item_motivo_omision"],
                        "requiere_revision": row["requiere_revision"],
                        "archivo_evidencia": row["archivo_evidencia"],
                        "observacion": row["item_observacion"]
                    })
            
            return list(respuestas_map.values())
    except Exception as e:
        print(f"Error obteniendo respuestas guardadas de MMSE: {e}")
        return []
    finally:
        if conn:
            conn.close()


# ---- Funciones heredadas (no modificar) ----

def obtener_sesiones_paciente(id_paciente):
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT e.id_evaluacion, e.fecha_evaluacion
                FROM evaluacion_cognitiva e
                JOIN asignacion_prueba ap ON ap.id_asignacion = e.id_asignacion
                WHERE ap.id_paciente = %s
                ORDER BY e.fecha_evaluacion DESC
            """, (id_paciente,))
            return cur.fetchall()
    except Exception as e:
        print(f"Error obteniendo sesiones: {e}")
        return None
    finally:
        if conn:
            conn.close()


def crear_sesion(id_paciente, id_codigo):
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO evaluacion_cognitiva (id_asignacion, id_neuropsicologo, estado_evaluacion)
                SELECT ap.id_asignacion, p.id_neuropsicologo, 1
                FROM asignacion_prueba ap
                JOIN paciente p ON p.id_paciente = ap.id_paciente
                WHERE ap.id_paciente = %s
                ORDER BY ap.id_asignacion DESC LIMIT 1
                RETURNING id_evaluacion
            """, (id_paciente,))
            row = cur.fetchone()
            conn.commit()
            return row["id_evaluacion"] if row else None
    except Exception as e:
        print(f"Error creando sesion: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()


def actualizar_progreso(id_evaluacion, datos_especificos, puntuacion, estado_procesamiento):
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE evaluacion_cognitiva
                SET puntaje_total = %s, estado_evaluacion = %s
                WHERE id_evaluacion = %s
            """, (puntuacion, estado_procesamiento or 1, id_evaluacion))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error actualizando progreso: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()


def finalizar_evaluacion_legacy(id_evaluacion, puntuacion_total, datos_especificos):
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE evaluacion_cognitiva
                SET puntaje_total = %s, estado_evaluacion = 2
                WHERE id_evaluacion = %s
            """, (puntuacion_total, id_evaluacion))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error finalizando: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
