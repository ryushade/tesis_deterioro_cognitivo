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
            print("Altering table evaluacion_cognitiva to add duracion_segundos column...")
            cur.execute("ALTER TABLE evaluacion_cognitiva ADD COLUMN IF NOT EXISTS duracion_segundos INTEGER;")
            conn.commit()
            print("Migration successful! Column duracion_segundos added.")
    except Exception as e:
        print("Error during migration:", e)

if __name__ == "__main__":
    run_migration()
