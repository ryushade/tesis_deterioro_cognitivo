import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import db.database as db

def migrate():
    print("--- INICIANDO CREACIÓN DE TABLA DE SUGERENCIA IA ---")
    conn = db.obtener_conexion()
    try:
        with conn.cursor() as cur:
            # 1. Crear tabla sugerencia_diagnostica_ia
            print("Creando tabla sugerencia_diagnostica_ia...")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sugerencia_diagnostica_ia (
                    id_sugerencia SERIAL PRIMARY KEY,
                    id_paciente INTEGER NOT NULL,
                    clasificacion VARCHAR(100) NOT NULL,
                    riesgo_pct INTEGER NOT NULL,
                    analisis TEXT NOT NULL,
                    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_sugerencia_paciente 
                        FOREIGN KEY (id_paciente) 
                        REFERENCES paciente(id_paciente) 
                        ON DELETE CASCADE
                );
            """)
            conn.commit()
            print("¡Tabla sugerencia_diagnostica_ia creada con éxito!")
            
            # 2. Verificar tablas actuales
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'sugerencia_diagnostica_ia'
            """)
            table = cur.fetchone()
            print(f"\nVerificación en DB: Tabla '{table['table_name']}' existe en el esquema public.")
            
    except Exception as e:
        print("Error creando la tabla:", e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
