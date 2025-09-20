#!/usr/bin/env python3
"""
Script para verificar el esquema de la tabla paciente
"""

from app.services.database_service import db_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verificar_esquema_paciente():
    """Verificar las columnas de la tabla paciente"""
    try:
        # Obtener información de las columnas
        query = """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'paciente' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        """
        
        columnas = db_service.execute_query(query)
        
        print("=== ESQUEMA DE LA TABLA PACIENTE ===")
        print(f"{'Columna':<20} {'Tipo':<15} {'Nullable':<10} {'Default':<15}")
        print("-" * 65)
        
        for col in columnas:
            print(f"{col['column_name']:<20} {col['data_type']:<15} {col['is_nullable']:<10} {str(col['column_default']):<15}")
        
        print("\n=== VERIFICANDO DATOS EXISTENTES ===")
        # Verificar si hay datos
        count_query = "SELECT COUNT(*) as total FROM paciente"
        result = db_service.execute_one(count_query)
        print(f"Total de registros: {result['total']}")
        
        if result['total'] > 0:
            # Mostrar una muestra de datos
            sample_query = "SELECT * FROM paciente LIMIT 1"
            sample = db_service.execute_one(sample_query)
            print("\nMuestra de datos:")
            for key, value in sample.items():
                print(f"  {key}: {value}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error verificando esquema: {e}")
        return False

if __name__ == "__main__":
    print("Verificando esquema de la tabla paciente...")
    verificar_esquema_paciente()
