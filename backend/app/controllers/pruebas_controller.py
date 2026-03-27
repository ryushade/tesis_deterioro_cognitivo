import db.database as db


def obtener_pruebas():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Agregué p.id_paciente, p.nombres y p.sexo como ejemplo
            cursor.execute("SELECT id_prueba, nombre_prueba, puntaje_maximo, estado FROM prueba_catalogo;")
            return cursor.fetchall()
    except Exception as e:
        print("Error", e)
        return None 
    finally:
        if conexion:
            conexion.close()

def registrar_pruebas(nombre_prueba, puntaje_maximo, estado):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("INSERT INTO pruebas (nombre_prueba, puntaje_maximo, estado) VALUES (%s,%s, %s) ",
            (nombre_prueba, puntaje_maximo, estado))
        conexion.commit()
        
    except Exception as e:
        print("Error", e)
        return None
    finally:
        if conexion:
            conexion.close()     


def actualizar_pruebas(id_prueba, nombre_prueba, puntaje_maximo, estado):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("UPDATE pruebas SET nombre_prueba = %s, puntaje_maximo = %s, estado = %s WHERE id_prueba = %s ",
            (nombre_prueba, puntaje_maximo, estado, id_prueba))
        conexion.commit()
        
    except Exception as e:
        print("Error", e)
        return None 
    finally:
        if conexion:
            conexion.close() 



def eliminar_pruebas(id_prueba):
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("DELETE FROM pruebas WHERE id_prueba = %s ",
            (id_prueba))
        conexion.commit()
        
    except Exception as e:
        print("Error", e)
        return None
    finally:
        if conexion:
            conexion.close()     


