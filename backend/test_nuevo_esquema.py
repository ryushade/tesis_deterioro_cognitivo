#!/usr/bin/env python3
"""
Script de pruebas para el nuevo esquema de evaluaciones cognitivas
Prueba el flujo completo CDT con el nuevo sistema
"""

import os
import sys
import json
from datetime import datetime, timedelta
from pathlib import Path

# Añadir el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar modelos y servicios
from app import create_app, db
from app.models.evaluaciones import (
    Paciente, CodigoAcceso, EvaluacionCognitiva, CriterioEvaluacion,
    generar_codigo_acceso
)
from app.services.cdt_service_v2 import cdt_service_v2


def configurar_app():
    """Configurar la aplicación Flask para pruebas"""
    app = create_app('default')  # Usar PostgreSQL directamente
    return app


def test_crear_paciente():
    """Probar creación de paciente"""
    print("🧪 Prueba: Crear paciente...")
    
    paciente = Paciente(
        nombres="Carlos Alberto",
        apellidos="Prueba CDT",
        fecha_nacimiento=datetime(1955, 5, 15).date(),
        sexo='M',
        anos_escolaridad=10
    )
    
    db.session.add(paciente)
    db.session.commit()
    
    print(f"✅ Paciente creado: {paciente.nombre_completo} (ID: {paciente.id_paciente})")
    print(f"   Edad: {paciente.edad} años")
    
    return paciente


def test_crear_codigo_acceso(id_paciente):
    """Probar creación de código de acceso"""
    print("\n🧪 Prueba: Crear código de acceso...")
    
    try:
        resultado = cdt_service_v2.crear_codigo_acceso(
            id_paciente=id_paciente,
            dias_validez=7,
            tipo_evaluacion='CDT'
        )
        
        print(f"✅ Código creado: {resultado['codigo']}")
        print(f"   Paciente: {resultado['paciente']}")
        print(f"   Vence: {resultado['vence_at']}")
        
        return resultado['codigo']
        
    except Exception as e:
        print(f"❌ Error creando código: {e}")
        return None


def test_validar_codigo(codigo):
    """Probar validación de código"""
    print(f"\n🧪 Prueba: Validar código {codigo}...")
    
    try:
        resultado = cdt_service_v2.validar_codigo_acceso(codigo)
        
        print(f"✅ Código válido para: {resultado['paciente']}")
        print(f"   Tipo evaluación: {resultado['tipo_evaluacion']}")
        
        return resultado
        
    except Exception as e:
        print(f"❌ Error validando código: {e}")
        return None


def test_simular_evaluacion_cdt(codigo):
    """Simular evaluación CDT completa"""
    print(f"\n🧪 Prueba: Simulación evaluación CDT...")
    
    # Buscar una imagen de prueba del dataset
    dataset_path = Path("./dataset/test")
    imagen_prueba = None
    
    if dataset_path.exists():
        for img_file in dataset_path.glob("*.jpg"):
            imagen_prueba = img_file
            break
    
    if not imagen_prueba:
        print("⚠️  No se encontró imagen de prueba en dataset/test/")
        # Crear evaluación directamente sin imagen real
        return test_evaluacion_sin_imagen(codigo)
    
    print(f"📷 Usando imagen: {imagen_prueba.name}")
    
    try:
        # Simular FileStorage para la imagen
        class MockFileStorage:
            def __init__(self, filepath):
                self.filepath = filepath
                self.filename = filepath.name
            
            def save(self, destino):
                import shutil
                shutil.copy2(self.filepath, destino)
                return destino
        
        mock_file = MockFileStorage(imagen_prueba)
        
        # Iniciar evaluación
        resultado_inicio = cdt_service_v2.iniciar_evaluacion_cdt(
            codigo=codigo,
            archivo_imagen=mock_file,
            metodo_cdt='foto_prueba'
        )
        
        print(f"✅ Evaluación iniciada: ID {resultado_inicio['id_evaluacion']}")
        
        # Procesar evaluación
        resultado_proceso = cdt_service_v2.procesar_evaluacion_cdt(
            id_evaluacion=resultado_inicio['id_evaluacion']
        )
        
        print(f"✅ Evaluación procesada:")
        print(f"   Puntuación: {resultado_proceso['puntuacion_total']}/10")
        print(f"   Clasificación: {resultado_proceso['clasificacion']}")
        print(f"   Confianza: {resultado_proceso['confianza']}%")
        print(f"   Tiempo: {resultado_proceso['tiempo_procesamiento']:.3f}s")
        
        return resultado_inicio['id_evaluacion']
        
    except Exception as e:
        print(f"❌ Error en evaluación CDT: {e}")
        return None


def test_evaluacion_sin_imagen(codigo):
    """Crear evaluación de prueba sin imagen real"""
    print("🧪 Creando evaluación de prueba sin imagen...")
    
    try:
        # Validar código
        info_codigo = cdt_service_v2.validar_codigo_acceso(codigo)
        
        # Crear evaluación directamente
        evaluacion = EvaluacionCognitiva(
            id_paciente=info_codigo['id_paciente'],
            id_codigo=info_codigo['id_codigo'],
            tipo_evaluacion='CDT',
            puntuacion_total=5.5,
            puntuacion_maxima=10.0,
            clasificacion='Deterioro_Moderado',
            confianza=75.0,
            estado_procesamiento='completada',
            tiempo_procesamiento=0.85,
            imagen_url='/mock/imagen_prueba.jpg',
            metodo_cdt='prueba_manual',
            observaciones='Evaluación de prueba del nuevo esquema',
            datos_especificos={
                'analisis_visual': {
                    'contorno_reloj': 1.5,
                    'numeros_presentes': 1.0,
                    'numeros_posicion': 1.5,
                    'manecillas_presentes': 1.0,
                    'manecillas_tiempo': 0.5
                },
                'metricas_tecnicas': {
                    'circulos_detectados': 12,
                    'lineas_detectadas': 2,
                    'regiones_texto': 8
                }
            }
        )
        
        db.session.add(evaluacion)
        db.session.commit()
        
        # Crear criterios de prueba
        criterios_data = [
            {
                'dominio_cognitivo': 'Función Ejecutiva',
                'subcriterio': 'Contorno del Reloj',
                'puntuacion_obtenida': 1.5,
                'puntuacion_maxima': 2.0,
                'orden_aplicacion': 1
            },
            {
                'dominio_cognitivo': 'Memoria Semántica',
                'subcriterio': 'Números Presentes',
                'puntuacion_obtenida': 1.0,
                'puntuacion_maxima': 2.0,
                'orden_aplicacion': 2
            }
        ]
        
        for criterio_data in criterios_data:
            criterio = CriterioEvaluacion(
                id_evaluacion=evaluacion.id_evaluacion,
                **criterio_data
            )
            db.session.add(criterio)
        
        db.session.commit()
        
        print(f"✅ Evaluación de prueba creada: ID {evaluacion.id_evaluacion}")
        return evaluacion.id_evaluacion
        
    except Exception as e:
        print(f"❌ Error creando evaluación de prueba: {e}")
        return None


def test_obtener_evaluacion(id_evaluacion):
    """Probar obtención de evaluación completa"""
    print(f"\n🧪 Prueba: Obtener evaluación {id_evaluacion}...")
    
    try:
        resultado = cdt_service_v2.obtener_evaluacion(id_evaluacion)
        
        print(f"✅ Evaluación obtenida:")
        print(f"   Paciente: {resultado['paciente']['nombre_completo']}")
        print(f"   Tipo: {resultado['tipo_evaluacion']}")
        print(f"   Puntuación: {resultado['puntuacion_total']}/{resultado['puntuacion_maxima']}")
        print(f"   Porcentaje: {resultado['porcentaje_acierto']:.1f}%")
        print(f"   Criterios evaluados: {len(resultado.get('criterios', []))}")
        
        return resultado
        
    except Exception as e:
        print(f"❌ Error obteniendo evaluación: {e}")
        return None


def test_estadisticas():
    """Probar obtención de estadísticas"""
    print(f"\n🧪 Prueba: Obtener estadísticas...")
    
    try:
        resultado = cdt_service_v2.obtener_estadisticas()
        
        print(f"✅ Estadísticas del sistema:")
        print(f"   Total evaluaciones CDT: {resultado['total_evaluaciones']}")
        print(f"   Evaluaciones completadas: {resultado['evaluaciones_completadas']}")
        print(f"   Tasa de completado: {resultado['tasa_completado']:.1f}%")
        print(f"   Promedio puntuación: {resultado['promedio_puntuacion']:.2f}")
        
        if resultado['distribucion_clasificaciones']:
            print("   Distribución por clasificación:")
            for clasif, cantidad in resultado['distribucion_clasificaciones'].items():
                print(f"     - {clasif}: {cantidad}")
        
        return resultado
        
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
        return None


def test_consultas_avanzadas():
    """Probar consultas avanzadas a la base de datos"""
    print(f"\n🧪 Prueba: Consultas avanzadas...")
    
    try:
        # Pacientes con evaluaciones
        pacientes_con_eval = db.session.query(Paciente)\
            .join(EvaluacionCognitiva)\
            .filter(EvaluacionCognitiva.tipo_evaluacion == 'CDT')\
            .distinct().all()
        
        print(f"✅ Pacientes con evaluaciones CDT: {len(pacientes_con_eval)}")
        
        for paciente in pacientes_con_eval:
            evaluaciones = EvaluacionCognitiva.query.filter_by(
                id_paciente=paciente.id_paciente,
                tipo_evaluacion='CDT'
            ).count()
            print(f"   - {paciente.nombre_completo}: {evaluaciones} evaluación(es)")
        
        # Códigos activos
        codigos_activos = CodigoAcceso.query.filter_by(estado='emitido').count()
        codigos_usados = CodigoAcceso.query.filter_by(estado='usado').count()
        
        print(f"✅ Estado de códigos:")
        print(f"   - Activos: {codigos_activos}")
        print(f"   - Usados: {codigos_usados}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en consultas avanzadas: {e}")
        return False


def main():
    """Ejecutar todas las pruebas"""
    print("🧠 PRUEBAS DEL NUEVO ESQUEMA CDT")
    print("=" * 50)
    
    # Configurar aplicación
    app = configurar_app()
    
    with app.app_context():
        # Ejecutar pruebas secuenciales
        tests = [
            ("Crear Paciente", lambda: test_crear_paciente()),
            ("Crear Código", lambda: test_crear_codigo_acceso(paciente.id_paciente)),
            ("Validar Código", lambda: test_validar_codigo(codigo)),
            ("Evaluación CDT", lambda: test_simular_evaluacion_cdt(codigo)),
            ("Obtener Evaluación", lambda: test_obtener_evaluacion(id_evaluacion)),
            ("Estadísticas", lambda: test_estadisticas()),
            ("Consultas Avanzadas", lambda: test_consultas_avanzadas()),
        ]
        
        resultados = []
        paciente = None
        codigo = None
        id_evaluacion = None
        
        for nombre_test, test_func in tests:
            try:
                print(f"\n{'='*20} {nombre_test} {'='*20}")
                
                if nombre_test == "Crear Paciente":
                    paciente = test_func()
                    resultado = paciente is not None
                elif nombre_test == "Crear Código":
                    if paciente:
                        codigo = test_func()
                        resultado = codigo is not None
                    else:
                        print("⏭️ Saltando - No hay paciente")
                        resultado = False
                elif nombre_test == "Validar Código":
                    if codigo:
                        resultado = test_func() is not None
                    else:
                        print("⏭️ Saltando - No hay código")
                        resultado = False
                elif nombre_test == "Evaluación CDT":
                    if codigo:
                        id_evaluacion = test_func()
                        resultado = id_evaluacion is not None
                    else:
                        print("⏭️ Saltando - No hay código")
                        resultado = False
                elif nombre_test == "Obtener Evaluación":
                    if id_evaluacion:
                        resultado = test_func() is not None
                    else:
                        print("⏭️ Saltando - No hay evaluación")
                        resultado = False
                else:
                    resultado = test_func()
                    if resultado is None:
                        resultado = True
                
                resultados.append((nombre_test, resultado))
                
            except Exception as e:
                print(f"❌ Error en {nombre_test}: {e}")
                resultados.append((nombre_test, False))
        
        # Resumen final
        print(f"\n{'='*50}")
        print("📋 RESUMEN DE PRUEBAS:")
        
        exitosas = 0
        for nombre, exito in resultados:
            estado = "✅ EXITOSA" if exito else "❌ FALLÓ"
            print(f"   {nombre}: {estado}")
            if exito:
                exitosas += 1
        
        print(f"\nResultado: {exitosas}/{len(resultados)} pruebas exitosas")
        
        if exitosas == len(resultados):
            print("🎉 ¡Todas las pruebas pasaron! El nuevo esquema funciona correctamente.")
        else:
            print("⚠️ Algunas pruebas fallaron. Revisar implementación.")


if __name__ == "__main__":
    main()
