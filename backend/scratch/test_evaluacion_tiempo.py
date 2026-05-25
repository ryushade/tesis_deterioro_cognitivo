import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "deterioro_cognitivo"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "060902")
        )
        with conn.cursor() as cur:
            # 1. Fetch an existing evaluation ID to test with
            cur.execute("SELECT id_evaluacion FROM evaluacion_cognitiva LIMIT 1;")
            row = cur.fetchone()
            if not row:
                print("No evaluations found in database to test with.")
                return
            
            id_eval = row[0] if isinstance(row, tuple) else row["id_evaluacion"]
            print(f"Testing with id_evaluacion = {id_eval}")
            
            # 2. Insert test stage time (using ON CONFLICT)
            cur.execute("""
                INSERT INTO evaluacion_tiempo (id_evaluacion, nombre_etapa, duracion_segundos)
                VALUES (%s, %s, %s)
                ON CONFLICT (id_evaluacion, nombre_etapa)
                DO UPDATE SET duracion_segundos = EXCLUDED.duracion_segundos;
            """, (id_eval, "test_etapa", 45))
            conn.commit()
            print("Inserted test_etapa = 45.")
            
            # 3. Retrieve and print
            cur.execute("SELECT * FROM evaluacion_tiempo WHERE id_evaluacion = %s AND nombre_etapa = %s;", (id_eval, "test_etapa"))
            test_row = cur.fetchone()
            print("Retrieved row:", test_row)
            
            # 4. Update the same stage to different duration to check ON CONFLICT DO UPDATE
            cur.execute("""
                INSERT INTO evaluacion_tiempo (id_evaluacion, nombre_etapa, duracion_segundos)
                VALUES (%s, %s, %s)
                ON CONFLICT (id_evaluacion, nombre_etapa)
                DO UPDATE SET duracion_segundos = EXCLUDED.duracion_segundos;
            """, (id_eval, "test_etapa", 55))
            conn.commit()
            print("Updated test_etapa = 55.")
            
            cur.execute("SELECT * FROM evaluacion_tiempo WHERE id_evaluacion = %s AND nombre_etapa = %s;", (id_eval, "test_etapa"))
            test_row_updated = cur.fetchone()
            print("Retrieved updated row:", test_row_updated)
            
            # Clean up the test row
            cur.execute("DELETE FROM evaluacion_tiempo WHERE id_evaluacion = %s AND nombre_etapa = %s;", (id_eval, "test_etapa"))
            conn.commit()
            print("Cleaned up test row.")
            
    except Exception as e:
        print("Error testing database operations:", e)

if __name__ == "__main__":
    test_db()
