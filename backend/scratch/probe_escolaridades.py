import os
import sys

# Add the backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import db.database as db

def main():
    conexion = db.obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT id_escolaridad, nom_escolaridad FROM nivel_escolaridad")
            rows = cursor.fetchall()
            print("Niveles de escolaridad en la BD:")
            for r in rows:
                print(f"  ID: {r['id_escolaridad']}, Nombre: {r['nom_escolaridad']}")
    except Exception as e:
        print("Error:", e)
    finally:
        conexion.close()

if __name__ == '__main__':
    main()
