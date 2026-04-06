import db.database as db


def obtener_neuropsicologo():
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM usuario WHERE id_rol = 2")
            return cursor.fetchall()
    except Exception as e:
        print("Error", e)
        return None



def registrar_neuropsicologo(nombres, apellidos, estado):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("INSERT INTO neuropsicologo (nombres, apellidos, estado) VALUES (%s,%s, %s) ",
            (nombres, apellidos, estado))
        conexion.commit()
        
    except Exception as e:
        print("Error", e)
        return None


def registrar_neuropsicologo_2(usua, contra_encriptada, nombres, apellidos):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # PASO 1: Insertar en la tabla usuario (Asumimos que id_rol = 2 es Neuropsicólogo)
            # Usamos RETURNING para que PostgreSQL nos devuelva el ID que acaba de crear
            consulta_usuario = """
                INSERT INTO usuario (id_rol, usua, contra, estado_usuario)
                VALUES (%s, %s, %s, %s)
                RETURNING id_usuario;
            """
            # Ejecutamos pasando los valores de forma segura para evitar inyección SQL
            cursor.execute(consulta_usuario, (2, usua, contra_encriptada, 1))
            
            # Capturamos el ID generado
            nuevo_id_usuario = cursor.fetchone()['id_usuario']

            # PASO 2: Insertar en la tabla neuropsicologo usando el ID capturado
            consulta_neuropsicologo = """
                INSERT INTO neuropsicologo (id_usuario, nombres, apellidos, estado)
                VALUES (%s, %s, %s, %s);
            """
            cursor.execute(consulta_neuropsicologo, (nuevo_id_usuario, nombres, apellidos, 1))

        # PASO 3: Si ambas consultas funcionaron, guardamos los cambios permanentemente
        conexion.commit()
        return {"mensaje": "Neuropsicólogo registrado con éxito", "id": nuevo_id_usuario}

    except Exception as error:
        # PASO 4: Si CUALQUIER cosa falla (ej. el 'usua' ya existe), cancelamos TODO
        print("Error", error)
        if 'conexion' in locals() and conexion:
            conexion.rollback()
        return {"error": str(error)}

#Borrado logico

def desactivar_neuropsicologo(id_neuropsicologo):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE neuropsicologo SET estado = '0' WHERE id_neuropsicologo = %s
            """, (id_neuropsicologo,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()


# Borrado fisico
def eliminar_neuropsicologo(id_neuropsicologo):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                DELETE FROM neuropsicologo WHERE id_neuropsicologo = %s
            """, (id_neuropsicologo,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()