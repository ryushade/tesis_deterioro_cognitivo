import db.database as db


def obtener_codigo_prueba():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT ap.id_asignacion,
                       COALESCE(c.codigo_texto, 'SIN CÓDIGO') AS codigo_generado,
                       COALESCE(c.estado_codigo, 'emitido') AS estado_codigo,
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

def asignar_codigo_prueba(id_asignacion, codigo_texto, estado_codigo, fecha_generacion):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("INSERT INTO codigo_acceso (id_asignacion, codigo_texto, estado_codigo, fecha_generacion) VALUES (%s,%s, %s, %s) ",
            (id_asignacion, codigo_texto, estado_codigo, fecha_generacion))
        conexion.commit()
        
    except Exception as e:
        print("Error", e)
        return None 
    finally:
        if conexion:
            conexion.close( )            