import db.database as db


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
                    pc.id_prueba, pc.nombre_prueba, pc.puntaje_maximo AS puntaje_maximo_prueba,
                    av.id_analisis, av.url_imagen, av.puntaje_ia, ec.diagnostico_ia, ec.observaciones, av.detalles_ia
                FROM evaluacion_cognitiva ec
                JOIN asignacion_prueba ap ON ec.id_asignacion = ap.id_asignacion
                JOIN paciente p ON ap.id_paciente = p.id_paciente
                JOIN prueba_catalogo pc ON ap.id_prueba = pc.id_prueba
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

