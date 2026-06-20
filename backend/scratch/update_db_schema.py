import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import db.database as db

def migrate():
    print("--- INICIANDO MIGRACIÓN DE LA BASE DE DATOS ---")
    conn = db.obtener_conexion()
    try:
        with conn.cursor() as cur:
            # 1. Agregar columnas a la tabla paciente para la caché de sugerencia IA
            print("Agregando columnas de sugerencia IA a la tabla paciente...")
            cur.execute("""
                ALTER TABLE paciente 
                ADD COLUMN IF NOT EXISTS sugerencia_ia_clasificacion VARCHAR(100),
                ADD COLUMN IF NOT EXISTS sugerencia_ia_riesgo INTEGER,
                ADD COLUMN IF NOT EXISTS sugerencia_ia_analisis TEXT,
                ADD COLUMN IF NOT EXISTS sugerencia_ia_fecha TIMESTAMP;
            """)
            conn.commit()
            print("¡Columnas añadidas con éxito!")
            
            # 2. Verificar columnas actuales
            cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'paciente'")
            columns = cur.fetchall()
            print("\nColumnas actuales de 'paciente':")
            for col in columns:
                if 'sugerencia_ia' in col['column_name']:
                    print(f"  - {col['column_name']}: {col['data_type']} [AÑADIDA]")
                else:
                    print(f"  - {col['column_name']}: {col['data_type']}")
            
    except Exception as e:
        print("Error durante la migración:", e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
