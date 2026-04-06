import db.database as db


def obtener_codigo_prueba():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT ap.id_asignacion,
                       c.codigo_texto AS codigo_generado,
                       c.estado_codigo,
                       CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
                       pc.nombre_prueba,
                       ap.fecha_asignacion,
                       c.fecha_generacion
                FROM asignacion_prueba ap
                INNER JOIN paciente p ON ap.id_paciente = p.id_paciente
                INNER JOIN prueba_catalogo pc ON ap.id_prueba = pc.id_prueba
                LEFT JOIN codigo_acceso c ON c.id_asignacion = ap.id_asignacion;
            """)
            return cursor.fetchall()
    except Exception as e:
        print("Error", e)
        return None 
    finally:
        if conexion:
            conexion.close()