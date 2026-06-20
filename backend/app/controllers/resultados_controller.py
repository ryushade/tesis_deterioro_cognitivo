import db.database as db


def clasificar_mmse_por_escolaridad(puntaje: int, escolaridad: str) -> str:
    if puntaje is None:
        return "No evaluado"
    
    esc = (escolaridad or "").lower()
    
    if "primaria" in esc:
        # Primaria básica: sano >= 21, leve 17-20, moderado 10-16, grave 0-9
        if puntaje >= 21:
            return "Normal"
        elif puntaje >= 17:
            return "Deterioro leve"
        elif puntaje >= 10:
            return "Deterioro moderado"
        else:
            return "Deterioro grave"
    elif "secundaria" in esc:
        # Básica completa / Secundaria completa: sano >= 22, leve 18-21, moderado 10-17, grave 0-9
        if puntaje >= 22:
            return "Normal"
        elif puntaje >= 18:
            return "Deterioro leve"
        elif puntaje >= 10:
            return "Deterioro moderado"
        else:
            return "Deterioro grave"
    else:
        # Grado superior / Superior completa: sano >= 24, leve 19-23, moderado 10-18, grave 0-9
        if puntaje >= 24:
            return "Normal"
        elif puntaje >= 19:
            return "Deterioro leve"
        elif puntaje >= 10:
            return "Deterioro moderado"
        else:
            return "Deterioro grave"


def obtener_resultados_paciente_prueba(id_paciente: int, id_prueba: int = None):
    """
    Obtiene el historial de evaluaciones de un paciente.
    Filtra opcionalmente por id_prueba.
    Retorna resultados procesados como lista de diccionarios.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Construir la query base
            query = """
                SELECT 
                    ec.id_evaluacion,
                    ec.id_asignacion,
                    ec.fecha_evaluacion,
                    ec.estado_evaluacion,
                    ec.puntaje_total,
                    ec.duracion_segundos,
                    p.nombres, p.apellidos,
                    n.nom_escolaridad AS escolaridad,
                    pc.id_prueba, pc.nombre_prueba, pc.puntaje_maximo AS puntaje_maximo_prueba,
                    av.id_analisis, av.url_imagen, av.puntaje_ia, ec.diagnostico_ia, ec.observaciones, av.detalles_ia
                FROM evaluacion_cognitiva ec
                JOIN asignacion_prueba ap ON ec.id_asignacion = ap.id_asignacion
                JOIN paciente p ON ap.id_paciente = p.id_paciente
                JOIN prueba_catalogo pc ON ap.id_prueba = pc.id_prueba
                LEFT JOIN nivel_escolaridad n ON p.id_escolaridad = n.id_escolaridad
                LEFT JOIN analisis_visual av ON ec.id_evaluacion = av.id_evaluacion
                WHERE ap.id_paciente = %s
            """
            params = [id_paciente]
            if id_prueba:
                query += " AND ap.id_prueba = %s "
                params.append(id_prueba)
                
            query += " ORDER BY ec.fecha_evaluacion DESC "
            
            cursor.execute(query, tuple(params))
            resultados = cursor.fetchall()
            return resultados
    except Exception as e:
        print("Error obteniendo resultados:", e)
        return None
    finally:
        if conexion:
            conexion.close()


def obtener_resultado_categorias_mmse(id_evaluacion: int):
    """
    Obtiene el desglose por categoría de una evaluación MMSE completada.
    Retorna lista de {id_categoria, nombre_categoria, puntaje_maximo, puntaje_obtenido}.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    rc.id_categoria,
                    c.nombre_categoria,
                    c.puntaje_maximo,
                    rc.puntaje_obtenido
                FROM resultado_categoria rc
                JOIN categoria_mmse c ON c.id_categoria = rc.id_categoria
                WHERE rc.id_evaluacion = %s
                ORDER BY rc.id_categoria
            """, (id_evaluacion,))
            return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo categorías MMSE para evaluación {id_evaluacion}: {e}")
        return []
    finally:
        if conexion:
            conexion.close()

def obtener_tiempos_evaluacion(id_evaluacion: int):
    """
    Obtiene los tiempos registrados para una evaluación.
    Retorna un diccionario con las etapas y sus duraciones.
    """
    conexion = None
    tiempos = {}
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Primero intentar obtener duracion_segundos de evaluacion_cognitiva
            cursor.execute("""
                SELECT duracion_segundos 
                FROM evaluacion_cognitiva 
                WHERE id_evaluacion = %s
            """, (id_evaluacion,))
            fila = cursor.fetchone()
            if fila and fila.get('duracion_segundos') is not None:
                tiempos["total"] = fila['duracion_segundos']
            
            # Luego intentar obtener de evaluacion_tiempo
            try:
                cursor.execute("""
                    SELECT nombre_etapa, duracion_segundos 
                    FROM evaluacion_tiempo 
                    WHERE id_evaluacion = %s
                """, (id_evaluacion,))
                filas = cursor.fetchall()
                for fila in filas:
                    tiempos[fila['nombre_etapa']] = fila['duracion_segundos']
            except Exception as e:
                conexion.rollback()
                
            return tiempos
    except Exception as e:
        print(f"Error obteniendo tiempos para evaluación {id_evaluacion}: {e}")
        return tiempos
    finally:
        if conexion:
            conexion.close()


def obtener_detalles_respuestas_mmse(id_evaluacion: int):
    """
    Obtiene el listado detallado de respuestas de cada ítem de una evaluación MMSE.
    Retorna lista de diccionarios con texto_item, nombre_categoria, respuesta_texto, correcto, puntaje, observacion.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.id_item,
                    i.texto_item,
                    c.nombre_categoria,
                    ri.respuesta_texto,
                    ri.correcto,
                    ri.puntaje,
                    ri.observacion
                FROM evaluacion_mmse_respuesta_item ri
                JOIN evaluacion_mmse_seccion es ON ri.id_eval_seccion = es.id_eval_seccion
                JOIN item_mmse i ON ri.id_item = i.id_item
                JOIN opcion_seccion_mmse o ON i.id_opcion = o.id_opcion
                JOIN seccion_mmse s ON o.id_seccion = s.id_seccion
                JOIN categoria_mmse c ON s.id_categoria = c.id_categoria
                WHERE es.id_evaluacion = %s
                ORDER BY c.id_categoria, s.orden, i.orden
            """, (id_evaluacion,))
            filas = cursor.fetchall()
            
            detalles = []
            for r in filas:
                detalles.append({
                    'id_item': r.get('id_item') if isinstance(r, dict) else r[0],
                    'texto_item': r.get('texto_item') if isinstance(r, dict) else r[1],
                    'nombre_categoria': r.get('nombre_categoria') if isinstance(r, dict) else r[2],
                    'respuesta_texto': r.get('respuesta_texto') if isinstance(r, dict) else r[3],
                    'correcto': bool(r.get('correcto') if isinstance(r, dict) else r[4]),
                    'puntaje': int(r.get('puntaje') if isinstance(r, dict) else r[5]),
                    'observacion': r.get('observacion') if isinstance(r, dict) else r[6]
                })
            return detalles
    except Exception as e:
        print(f"Error obteniendo detalles respuestas MMSE para evaluacion {id_evaluacion}: {e}")
        return []
    finally:
        if conexion:
            conexion.close()


def obtener_paciente_por_id(id_paciente: int):
    """
    Obtiene los datos demográficos básicos de un paciente.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT p.id_paciente, p.nombres, p.apellidos, p.fecha_nacimiento,
                       p.sexo, p.id_escolaridad, n.nom_escolaridad AS escolaridad, p.estado
                FROM paciente p
                INNER JOIN nivel_escolaridad n ON p.id_escolaridad = n.id_escolaridad
                WHERE p.id_paciente = %s
            """, (id_paciente,))
            return cursor.fetchone()
    except Exception as e:
        print(f"Error obteniendo paciente por ID {id_paciente}: {e}")
        return None
    finally:
        if conexion:
            conexion.close()


def obtener_sugerencia_guardada_paciente(id_paciente: int):
    """
    Obtiene la sugerencia más reciente de la tabla sugerencia_diagnostica_ia para un paciente.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT clasificacion, riesgo_pct, analisis, fecha_generacion
                FROM sugerencia_diagnostica_ia
                WHERE id_paciente = %s
                ORDER BY fecha_generacion DESC
                LIMIT 1
            """, (id_paciente,))
            return cursor.fetchone()
    except Exception as e:
        print(f"Error obteniendo sugerencia de la tabla para paciente {id_paciente}: {e}")
        return None
    finally:
        if conexion:
            conexion.close()


def guardar_sugerencia_ia_en_db(id_paciente: int, sugerencia: dict):
    """
    Guarda una nueva sugerencia diagnóstica en la tabla sugerencia_diagnostica_ia.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                INSERT INTO sugerencia_diagnostica_ia (id_paciente, clasificacion, riesgo_pct, analisis)
                VALUES (%s, %s, %s, %s)
            """, (
                id_paciente,
                sugerencia.get('clasificacion'),
                sugerencia.get('riesgo_pct'),
                sugerencia.get('analisis')
            ))
            conexion.commit()
            print(f"[DB SUGERENCIA] Sugerencia insertada en tabla sugerencia_diagnostica_ia para paciente {id_paciente}.")
    except Exception as e:
        print(f"Error insertando sugerencia en tabla para paciente {id_paciente}: {e}")
    finally:
        if conexion:
            conexion.close()


def obtener_sugerencia_ia(id_paciente: int, forzar_regenerar: bool = False):
    """
    Genera u obtiene de la tabla sugerencia_diagnostica_ia una sugerencia diagnóstica para un paciente.
    """
    from datetime import date
    from app.services import mmse_service

    paciente = obtener_paciente_por_id(id_paciente)
    if not paciente:
        return {"success": False, "message": "Paciente no encontrado en el sistema."}

    # Si NO se fuerza la regeneración, y existe sugerencia almacenada, devolverla de la tabla sugerencia_diagnostica_ia
    if not forzar_regenerar:
        cached = obtener_sugerencia_guardada_paciente(id_paciente)
        if cached:
            print(f"[DB SUGERENCIA] Cargando sugerencia desde la tabla de historial para paciente {id_paciente}.")
            fecha_eval = cached.get('fecha_generacion')
            fecha_str = fecha_eval.strftime("%Y-%m-%d %H:%M") if hasattr(fecha_eval, 'strftime') else str(fecha_eval)
            return {
                "success": True,
                "data": {
                    "clasificacion": cached.get('clasificacion'),
                    "riesgo_pct": cached.get('riesgo_pct'),
                    "analisis": cached.get('analisis'),
                    "fecha_guardada": fecha_str,
                    "es_cache": True
                }
            }
        else:
            # Si no hay sugerencia guardada en caché y no se forzó regenerar, NO generamos de forma automática
            print(f"[DB SUGERENCIA] No hay sugerencia persistida para paciente {id_paciente} y no se forzó regenerar. Se solicita clic de botón.")
            return {
                "success": True,
                "data": {
                    "sin_generar": True
                }
            }

    # Calcular edad
    fecha_nac = paciente.get('fecha_nacimiento')
    edad = None
    if fecha_nac:
        today = date.today()
        edad = today.year - fecha_nac.year - ((today.month, today.day) < (fecha_nac.month, fecha_nac.day))

    # Obtener historial de evaluaciones
    evaluaciones = obtener_resultados_paciente_prueba(id_paciente)
    if not evaluaciones:
        return {
            "success": True,
            "data": {
                "sin_evaluaciones": True,
                "analisis": "El paciente no tiene evaluaciones cognitivas registradas. Realice una prueba (MMSE o Test del Reloj) para poder generar una sugerencia diagnóstica."
            }
        }

    # Formatear el resumen de evaluaciones para el modelo
    evaluaciones_resumen = []
    for raw in evaluaciones:
        nombre_prueba = raw.get('nombre_prueba', '')
        fecha_eval = raw.get('fecha_evaluacion')
        fecha_str = fecha_eval.strftime("%Y-%m-%d") if hasattr(fecha_eval, 'strftime') else str(fecha_eval)
        puntaje = raw.get('puntaje_total')
        puntaje_max = raw.get('puntaje_maximo_prueba')
        id_eval = raw.get('id_evaluacion')
        
        es_mmse = 'mmse' in nombre_prueba.lower() or 'mini-mental' in nombre_prueba.lower() or 'mini mental' in nombre_prueba.lower()
        
        resumen_eval = {
            "prueba": nombre_prueba,
            "fecha": fecha_str,
            "puntaje": puntaje,
            "puntaje_maximo": puntaje_max
        }
        
        if es_mmse and id_eval:
            categorias = obtener_resultado_categorias_mmse(id_eval)
            categorias_resumen = []
            for c in (categorias or []):
                categorias_resumen.append(f"{c.get('nombre_categoria')}: {c.get('puntaje_obtenido')}/{c.get('puntaje_maximo')}")
            resumen_eval["detalles_mmse"] = ", ".join(categorias_resumen)
            
            # Clasificación calculada para el MMSE conforme a las reglas del sistema basadas en escolaridad
            resumen_eval["clasificacion"] = clasificar_mmse_por_escolaridad(puntaje, raw.get('escolaridad'))
            
        elif 'reloj' in nombre_prueba.lower() or 'cdt' in nombre_prueba.lower():
            resumen_eval["diagnostico_ia"] = raw.get('diagnostico_ia')
            resumen_eval["observaciones_ia"] = raw.get('observaciones')
            resumen_eval["puntaje_ia"] = raw.get('puntaje_ia')
            # Clasificación del test de reloj obtenida directamente de la BD
            resumen_eval["clasificacion"] = raw.get('diagnostico_ia')
            
        evaluaciones_resumen.append(resumen_eval)

    # Invocar a Gemini a través del servicio
    resultado_ia = mmse_service.generar_sugerencia_diagnostica_ia(paciente, edad, evaluaciones_resumen)
    
    # Persistir la sugerencia diagnóstica en la tabla sugerencia_diagnostica_ia
    if resultado_ia and "clasificacion" in resultado_ia:
        guardar_sugerencia_ia_en_db(id_paciente, resultado_ia)
        resultado_ia["es_cache"] = False
        resultado_ia["fecha_guardada"] = "Justo ahora"
    
    return {
        "success": True,
        "data": resultado_ia
    }


