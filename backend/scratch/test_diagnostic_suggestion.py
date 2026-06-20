import os
import sys

# Agregar el directorio backend al sys.path para poder realizar las importaciones correctas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import db.database as db
from app.controllers import resultados_controller

def test_sugerencia():
    print("--- INICIANDO PRUEBA DE SUGERENCIA DIAGNÓSTICA IA ---")
    conexion = db.obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Buscar el primer paciente con evaluaciones
            cursor.execute("""
                SELECT DISTINCT p.id_paciente, p.nombres, p.apellidos 
                FROM paciente p
                JOIN asignacion_prueba ap ON p.id_paciente = ap.id_paciente
                JOIN evaluacion_cognitiva ec ON ap.id_asignacion = ec.id_asignacion
                LIMIT 1
            """)
            paciente = cursor.fetchone()
            
            if not paciente:
                # Si no hay con evaluaciones, buscar cualquier paciente
                cursor.execute("SELECT id_paciente, nombres, apellidos FROM paciente LIMIT 1")
                paciente = cursor.fetchone()
                
            if not paciente:
                print("No se encontraron pacientes en la base de datos para la prueba.")
                return
            
            id_paciente = paciente['id_paciente']
            nombre = f"{paciente['nombres']} {paciente['apellidos']}"
            print(f"Paciente para prueba: {nombre} (ID: {id_paciente})")
            
            # 2. Generar sugerencia
            print("\nGenerando sugerencia con resultados_controller.obtener_sugerencia_ia...")
            resultado = resultados_controller.obtener_sugerencia_ia(id_paciente)
            print("\n--- RESPUESTA DEL CONTROLADOR ---")
            print(resultado)
            
            # Validar formato
            if resultado.get("success"):
                data = resultado.get("data", {})
                print("\nCampos validados:")
                print(f"  - Clasificación: {data.get('clasificacion')}")
                print(f"  - Riesgo PCT: {data.get('riesgo_pct')}%")
                print(f"  - Análisis: {data.get('analisis')}")
                print("\n¡Prueba completada con éxito!")
            else:
                print("\nError: El controlador falló al generar la sugerencia.")
            
    except Exception as e:
        print("Error en ejecución de prueba:", e)
    finally:
        conexion.close()

if __name__ == "__main__":
    test_sugerencia()
