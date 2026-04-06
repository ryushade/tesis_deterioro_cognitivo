import db.database as db
import json

def obtener_sesiones_paciente(id_paciente):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Crear la tabla de manera idempotente por seguridad si no existe en la BD del usuario
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS evaluacion_mmse (
                    id_evaluacion SERIAL PRIMARY KEY,
                    id_paciente INTEGER,
                    id_codigo_acceso INTEGER,
                    estado_procesamiento VARCHAR(50) DEFAULT 'en_progreso',
                    puntuacion_total INTEGER DEFAULT 0,
                    datos_especificos JSONB,
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conexion.commit()
            
            cursor.execute("""
                SELECT id_evaluacion, id_paciente, id_codigo_acceso, estado_procesamiento, 
                       puntuacion_total, datos_especificos, fecha_creacion, fecha_actualizacion 
                FROM evaluacion_mmse 
                WHERE id_paciente = %s 
                ORDER BY fecha_actualizacion DESC
            """, (id_paciente,))
            
            rows = cursor.fetchall()
            return rows
    except Exception as e:
        print("Error en obtener_sesiones_paciente MMSE:", e)
        return None
    finally:
        if conexion:
            conexion.close()

def crear_sesion(id_paciente, id_codigo):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Idempotencia tabla
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS evaluacion_mmse (
                    id_evaluacion SERIAL PRIMARY KEY,
                    id_paciente INTEGER,
                    id_codigo_acceso INTEGER,
                    estado_procesamiento VARCHAR(50) DEFAULT 'en_progreso',
                    puntuacion_total INTEGER DEFAULT 0,
                    datos_especificos JSONB,
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Crear sesión vacía
            datos_iniciales = json.dumps({"current_section": 0, "answers": {}, "progress": 0})
            
            cursor.execute("""
                INSERT INTO evaluacion_mmse (id_paciente, id_codigo_acceso, estado_procesamiento, datos_especificos)
                VALUES (%s, %s, 'en_progreso', %s)
                RETURNING id_evaluacion
            """, (id_paciente, id_codigo, datos_iniciales))
            
            id_evaluacion = cursor.fetchone()
            # Compatible con diccionarios o tuplas
            if isinstance(id_evaluacion, dict):
                sesion_id = id_evaluacion['id_evaluacion']
            else:
                sesion_id = id_evaluacion[0]
                
            conexion.commit()
            return sesion_id
    except Exception as e:
        print("Error en crear_sesion MMSE:", e)
        return None
    finally:
        if conexion:
            conexion.close()

def actualizar_progreso(id_evaluacion, datos_especificos, score, estado='en_progreso'):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            query = """
                UPDATE evaluacion_mmse 
                SET datos_especificos = %s, 
                    puntuacion_total = %s,
                    estado_procesamiento = %s,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id_evaluacion = %s
            """
            cursor.execute(query, (json.dumps(datos_especificos), score, estado, id_evaluacion))
            conexion.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print("Error en actualizar_progreso MMSE:", e)
        return False
    finally:
        if conexion:
            conexion.close()

def finalizar_evaluacion(id_evaluacion, puntuacion_total, datos_especificos):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            query = """
                UPDATE evaluacion_mmse 
                SET datos_especificos = %s, 
                    puntuacion_total = %s,
                    estado_procesamiento = 'completada',
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id_evaluacion = %s
            """
            cursor.execute(query, (json.dumps(datos_especificos), puntuacion_total, id_evaluacion))
            
            # TODO: Idealmente, actualizar tambien el STATUS de 'codigo_acceso' a 'usado' aquí.
            cursor.execute("UPDATE codigo_acceso SET estado_codigo = 'usado' WHERE id_asignacion = (SELECT id_codigo_acceso FROM evaluacion_mmse WHERE id_evaluacion = %s)", (id_evaluacion,))
            
            conexion.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print("Error en finalizar_evaluacion MMSE:", e)
        return False
    finally:
        if conexion:
            conexion.close()
