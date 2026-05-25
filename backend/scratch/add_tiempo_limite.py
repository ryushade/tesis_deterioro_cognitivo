import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "deterioro_cognitivo"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "060902")
        )
        with conn.cursor() as cur:
            print("Altering table prueba_catalogo to add column tiempo_limite_segundos...")
            cur.execute("ALTER TABLE prueba_catalogo ADD COLUMN IF NOT EXISTS tiempo_limite_segundos INTEGER;")
            
            print("Setting default time limit of 900 seconds (15 minutes) for MMSE...")
            cur.execute("""
                UPDATE prueba_catalogo 
                SET tiempo_limite_segundos = 900 
                WHERE UPPER(nombre_prueba) LIKE '%%MMSE%%' OR UPPER(nombre_prueba) LIKE '%%MINI%%';
            """)
            
            # Print updated table rows to confirm
            cur.execute("SELECT id_prueba, nombre_prueba, tiempo_limite_segundos FROM prueba_catalogo;")
            print("\nRows in prueba_catalogo after migration:")
            for row in cur.fetchall():
                print(f"  {row[0]} - {row[1]}: Limit = {row[2]} seconds")
                
            conn.commit()
            print("\nMigration successful!")
    except Exception as e:
        print("Error during migration:", e)

if __name__ == "__main__":
    run_migration()
