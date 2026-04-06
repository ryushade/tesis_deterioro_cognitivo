import db.database as db


def obtener_codigo_prueba():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT ap.id_asignacion,
                       COALESCE(c.codigo_texto, 'SIN CÓDIGO') AS codigo_generado,
                       c.estado_codigo AS estado_codigo,
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

def asignar_y_generar_codigo(id_paciente, id_prueba, codigo_texto):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # 1. Registrar asignación asociando la prueba al paciente
            cursor.execute("""
                INSERT INTO asignacion_prueba (id_paciente, id_prueba) 
                VALUES (%s, %s) RETURNING id_asignacion
            """, (id_paciente, id_prueba))
            res = cursor.fetchone()
            id_asignacion = res['id_asignacion'] if isinstance(res, dict) else res[0]
            
            # 2. Generar código relacionado
            cursor.execute("""
                INSERT INTO codigo_acceso (id_asignacion, codigo_texto, estado_codigo, fecha_generacion) 
                VALUES (%s, %s, 1, CURRENT_TIMESTAMP)
            """, (id_asignacion, codigo_texto))
            
            conexion.commit()
            return id_asignacion    
    except Exception as e:
        print("Error en transaccion de codigo:", e)
        if conexion:
            conexion.rollback()
        return None
    finally:
        if conexion:
            conexion.close()