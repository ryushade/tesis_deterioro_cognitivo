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
            print("Creating table evaluacion_tiempo if not exists...")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS evaluacion_tiempo (
                    id_tiempo SERIAL PRIMARY KEY,
                    id_evaluacion INTEGER NOT NULL,
                    nombre_etapa VARCHAR(100) NOT NULL, -- 'total', 'orientacion', 'fijacion', 'atencion', 'memoria', 'lenguaje'
                    duracion_segundos INTEGER NOT NULL,
                    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_et_evaluacion FOREIGN KEY (id_evaluacion)
                        REFERENCES evaluacion_cognitiva(id_evaluacion)
                        ON UPDATE CASCADE ON DELETE CASCADE,
                    CONSTRAINT uq_evaluacion_etapa UNIQUE (id_evaluacion, nombre_etapa)
                );
            """)
            conn.commit()
            print("Migration successful! Table evaluacion_tiempo created.")
    except Exception as e:
        print("Error during migration:", e)

if __name__ == "__main__":
    run_migration()
