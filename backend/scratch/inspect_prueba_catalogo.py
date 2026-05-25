import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def inspect_tables():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "deterioro_cognitivo"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "060902")
        )
        with conn.cursor() as cur:
            # Inspect columns of prueba_catalogo
            cur.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'prueba_catalogo';
            """)
            print("Columns in prueba_catalogo:")
            for row in cur.fetchall():
                print(f"  {row[0]}: {row[1]}")
                
            print("\n" + "="*40 + "\n")
            
            # Inspect rows of prueba_catalogo
            cur.execute("SELECT id_prueba, nombre_prueba, puntaje_maximo, estado FROM prueba_catalogo;")
            print("Rows in prueba_catalogo:")
            for row in cur.fetchall():
                print(f"  {row[0]} - {row[1]} (Max: {row[2]}, Estado: {row[3]})")
    except Exception as e:
        print("Error inspecting tables:", e)

if __name__ == "__main__":
    inspect_tables()
