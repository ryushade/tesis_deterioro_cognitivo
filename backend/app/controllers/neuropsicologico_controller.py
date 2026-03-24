import db.database as db


def obtener_neuropsicologo():
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM neuropsicologo")
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
