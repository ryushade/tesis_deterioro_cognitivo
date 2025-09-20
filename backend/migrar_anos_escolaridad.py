#!/usr/bin/env python3
"""
Script para migrar el campo anos_escolaridad de smallint a varchar
con opciones predefinidas de niveles educativos.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os

# Agregar el directorio padre al path para importar config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config.config import Config

def conectar_db():
    """Establece conexión con la base de datos PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def mapear_anos_a_nivel(anos):
    """Mapea años de escolaridad a niveles educativos"""
    if anos is None:
        return None
    elif anos <= 6:
        return "Primaria Básica"
    elif anos <= 12:
        return "Básica Completa"
    else:
        return "Grado Superior"

def migrar_anos_escolaridad():
    """Ejecuta la migración del campo anos_escolaridad"""
    conn = conectar_db()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔍 Verificando estructura actual de la tabla...")
        
        # Verificar si la tabla existe y obtener datos actuales
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'paciente' AND column_name = 'anos_escolaridad';
        """)
        
        columna_actual = cursor.fetchone()
        if not columna_actual:
            print("❌ No se encontró la columna anos_escolaridad en la tabla paciente")
            return False
            
        print(f"📊 Tipo actual: {columna_actual['data_type']}")
        
        if columna_actual['data_type'] == 'character varying':
            print("✅ La columna ya es varchar, no se necesita migración")
            return True
        
        # Obtener datos actuales para migración
        cursor.execute("SELECT id_paciente, anos_escolaridad FROM paciente WHERE anos_escolaridad IS NOT NULL;")
        pacientes_actuales = cursor.fetchall()
        
        print(f"📝 Encontrados {len(pacientes_actuales)} pacientes con datos de escolaridad")
        
        # Crear columna temporal
        print("🔧 Creando columna temporal...")
        cursor.execute("""
            ALTER TABLE paciente 
            ADD COLUMN IF NOT EXISTS nivel_educativo_temp VARCHAR(50);
        """)
        
        # Migrar datos existentes
        print("📋 Migrando datos existentes...")
        for paciente in pacientes_actuales:
            nivel = mapear_anos_a_nivel(paciente['anos_escolaridad'])
            if nivel:
                cursor.execute("""
                    UPDATE paciente 
                    SET nivel_educativo_temp = %s 
                    WHERE id_paciente = %s;
                """, (nivel, paciente['id_paciente']))
        
        # Eliminar columna antigua
        print("🗑️ Eliminando columna antigua...")
        cursor.execute("ALTER TABLE paciente DROP COLUMN IF EXISTS anos_escolaridad;")
        
        # Renombrar columna temporal
        print("🔄 Renombrando columna...")
        cursor.execute("""
            ALTER TABLE paciente 
            RENAME COLUMN nivel_educativo_temp TO anos_escolaridad;
        """)
        
        # Agregar constraint para valores válidos
        print("✅ Agregando constraint de valores válidos...")
        cursor.execute("""
            ALTER TABLE paciente 
            ADD CONSTRAINT check_nivel_educativo 
            CHECK (anos_escolaridad IN (
                'Primaria Básica', 
                'Básica Completa', 
                'Grado Superior'
            ) OR anos_escolaridad IS NULL);
        """)
        
        # Confirmar cambios
        conn.commit()
        
        print("🎉 Migración completada exitosamente!")
        print("\n📋 Niveles educativos disponibles:")
        print("   • Primaria Básica (≤ 6 años)")
        print("   • Básica Completa (7-12 años)")
        print("   • Grado Superior (> 12 años)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def verificar_migracion():
    """Verifica que la migración se haya completado correctamente"""
    conn = conectar_db()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar nueva estructura
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'paciente' AND column_name = 'anos_escolaridad';
        """)
        
        columna = cursor.fetchone()
        if columna:
            print(f"\n✅ Verificación - Tipo actual: {columna['data_type']}")
            if columna['character_maximum_length']:
                print(f"   Longitud máxima: {columna['character_maximum_length']}")
        
        # Verificar datos migrados
        cursor.execute("""
            SELECT anos_escolaridad, COUNT(*) as cantidad
            FROM paciente 
            WHERE anos_escolaridad IS NOT NULL
            GROUP BY anos_escolaridad
            ORDER BY cantidad DESC;
        """)
        
        resultados = cursor.fetchall()
        if resultados:
            print("\n📊 Distribución de datos migrados:")
            for resultado in resultados:
                print(f"   • {resultado['anos_escolaridad']}: {resultado['cantidad']} pacientes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando migración: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Iniciando migración de anos_escolaridad...")
    print("=" * 50)
    
    if migrar_anos_escolaridad():
        verificar_migracion()
        print("\n🎯 Migración completada. Recuerda actualizar el código del frontend.")
    else:
        print("\n❌ La migración falló. Revisa los errores anteriores.")
