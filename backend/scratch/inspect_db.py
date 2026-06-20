import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import db.database as db

def inspect():
    conn = db.obtener_conexion()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'paciente'")
            columns = cur.fetchall()
            print("--- COLUMNAS DE LA TABLA PACIENTE ---")
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']}")
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    inspect()
