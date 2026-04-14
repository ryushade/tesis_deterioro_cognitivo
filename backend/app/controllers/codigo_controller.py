import db.database as db

#----------------Estado de los códigos-------------------
# 0 = Cancelado, 1 = Pendiente, 2 = Completado


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
            # 0. Verificación de seguridad: Evitar cualquier código activo de cualquier prueba para ese paciente
            cursor.execute("""
                SELECT c.codigo_texto
                FROM codigo_acceso c
                INNER JOIN asignacion_prueba ap ON c.id_asignacion = ap.id_asignacion
                WHERE ap.id_paciente = %s 
                  AND c.estado_codigo = 1
            """, (id_paciente, ))
            if cursor.fetchone():
                return {'error': 'El paciente ya cuenta con una evaluación activa. Debe culminar o cancelar la prueba actual antes de asignarle otra distinta.'}

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
            return {'id_asignacion': id_asignacion}    
    except Exception as e:
        print("Error en transaccion de codigo:", e)
        if conexion:
            conexion.rollback()
        return None
    finally:
        if conexion:
            conexion.close()

def desactivar_codigo_acceso_prueba(id_asignacion):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE codigo_acceso SET estado_codigo = '0' WHERE id_asignacion = %s
            """, (id_asignacion,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()


def actualizar_codigo(id_asignacion, estado_codigo, id_prueba=None):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Actualizar estado
            if estado_codigo is not None:
                cursor.execute("""
                    UPDATE codigo_acceso SET estado_codigo = %s WHERE id_asignacion = %s
                """, (estado_codigo, id_asignacion))
            
            # Actualizar prueba asignada
            if id_prueba is not None:
                cursor.execute("""
                    UPDATE asignacion_prueba SET id_prueba = %s WHERE id_asignacion = %s
                """, (id_prueba, id_asignacion))
            
            conexion.commit()
            return True
    except Exception as e:
        print("Error en actualizar_codigo:", e)
        if conexion:
            conexion.rollback()
        return False
    finally:
        if conexion:
            conexion.close()

def eliminar_codigo(id_asignacion):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Primero eliminamos de codigo_acceso si existe
            cursor.execute("""
                DELETE FROM codigo_acceso WHERE id_asignacion = %s
            """, (id_asignacion,))
            # Luego eliminamos la asignacion de la prueba
            cursor.execute("""
                DELETE FROM asignacion_prueba WHERE id_asignacion = %s
            """, (id_asignacion,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error eliminando código/asignación:", e)
        if conexion:
            conexion.rollback()
        return False
    finally:
        if conexion:
            conexion.close()