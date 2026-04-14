import db.database as db


def obtener_pacientes(id_neuropsicologo=None):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            if id_neuropsicologo:
                cursor.execute("""
                    SELECT p.id_paciente, p.nombres, p.apellidos, p.fecha_nacimiento,
                           p.sexo, p.id_escolaridad, n.nom_escolaridad AS escolaridad, p.estado
                    FROM paciente p
                    INNER JOIN nivel_escolaridad n ON p.id_escolaridad = n.id_escolaridad
                    WHERE p.id_neuropsicologo = %s
                """, (id_neuropsicologo,))
            else:
                cursor.execute("""
                    SELECT p.id_paciente, p.nombres, p.apellidos, p.fecha_nacimiento,
                           p.sexo, p.id_escolaridad, n.nom_escolaridad AS escolaridad, p.estado
                    FROM paciente p
                    INNER JOIN nivel_escolaridad n ON p.id_escolaridad = n.id_escolaridad
                """)
            return cursor.fetchall()
    except Exception as e:
        print("Error", e)
        return None
    finally:
        if conexion:
            conexion.close()

def obtener_niveles_escolaridad():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Traemos el ID y el Nombre de los que estén activos
            cursor.execute("SELECT id_escolaridad, nom_escolaridad FROM nivel_escolaridad WHERE estado = 1")
            return cursor.fetchall()
    except Exception as e:
        print("Error obteniendo escolaridad:", e)
        return []
    finally:
        if conexion:
            conexion.close()


def registrar_paciente(nombres, apellidos, fecha_nacimiento, id_escolaridad, estado, sexo, id_neuropsicologo):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("INSERT INTO paciente (nombres, apellidos, fecha_nacimiento, id_escolaridad, estado, sexo, id_neuropsicologo) VALUES (%s, %s, %s, %s, %s, %s, %s)", (nombres, apellidos, fecha_nacimiento, id_escolaridad, estado, sexo, id_neuropsicologo))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()


def actualizar_paciente(id_paciente, nombres, apellidos, fecha_nacimiento, id_escolaridad, estado, sexo=None):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("UPDATE paciente SET nombres = %s, apellidos = %s, fecha_nacimiento = %s, id_escolaridad = %s, estado = %s, sexo = %s WHERE id_paciente = %s", (nombres, apellidos, fecha_nacimiento, id_escolaridad, estado, sexo, id_paciente))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()


def eliminar_paciente(id_paciente):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("DELETE FROM paciente WHERE id_paciente = %s", (id_paciente,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()    
