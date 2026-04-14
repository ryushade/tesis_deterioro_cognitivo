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
                    p.nombres, p.apellidos,
                    pc.id_prueba, pc.nombre_prueba,
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