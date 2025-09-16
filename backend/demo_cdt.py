"""
Demo rápido del sistema CDT
Prueba el análisis de una imagen sin entrenamiento completo
"""

import os
import sys

# Agregar el path del proyecto
project_root = os.path.dirname(__file__)
sys.path.append(project_root)

def demo_image_analysis():
    """Demo del análisis de una imagen CDT"""
    print("=== DEMO: Análisis de Imagen CDT ===\\n")
    
    try:
        from app.services.cdt_analyzer import CDTAnalyzer
        
        # Crear analizador
        analyzer = CDTAnalyzer()
        print("✓ Analizador CDT inicializado")
        
        # Buscar una imagen de ejemplo en el dataset
        dataset_path = os.path.join(project_root, 'dataset')
        example_image = None
        
        for split in ['test', 'valid', 'train']:
            split_path = os.path.join(dataset_path, split)
            if os.path.exists(split_path):
                for filename in os.listdir(split_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        example_image = os.path.join(split_path, filename)
                        break
                if example_image:
                    break
        
        if not example_image:
            print("✗ No se encontró imagen de ejemplo")
            return False
        
        print(f"📷 Analizando: {os.path.basename(example_image)}")
        
        # Realizar análisis
        result = analyzer.analyze_cdt_image(example_image, "demo-patient-id")
        
        if result.get('success', False):
            print("\\n🎯 RESULTADOS DEL ANÁLISIS:")
            print(f"   Puntuación total: {result.get('puntuacion_total', 0):.1f}/10")
            print(f"   Clasificación: {result.get('clasificacion_deterioro', 'N/A')}")
            print(f"   Confianza: {result.get('probabilidad_deterioro', 0):.1%}")
            print(f"   Tiempo procesamiento: {result.get('tiempo_procesamiento', 0):.2f}s")
            
            print("\\n📊 CRITERIOS EVALUADOS:")
            criterios = result.get('criterios', {})
            for criterio, puntuacion in criterios.items():
                nombre = criterio.replace('_', ' ').title()
                print(f"   {nombre}: {puntuacion:.1f}/2.0")
            
            print("\\n💭 OBSERVACIONES:")
            print(f"   {result.get('observaciones_ia', 'Sin observaciones')}")
            
            errores = result.get('errores_detectados', [])
            if errores:
                print("\\n⚠️ ERRORES DETECTADOS:")
                for error in errores:
                    print(f"   - {error}")
            
            # Información técnica
            print("\\n🔧 INFORMACIÓN TÉCNICA:")
            deteccion = result.get('deteccion', {})
            print(f"   Confianza detección: {deteccion.get('confianza', 0):.1%}")
            
            caracteristicas = result.get('caracteristicas_extraidas', {})
            if 'circles_detected' in caracteristicas:
                print(f"   Círculos detectados: {len(caracteristicas['circles_detected'])}")
            if 'lines_detected' in caracteristicas:
                print(f"   Líneas detectadas: {len(caracteristicas['lines_detected'])}")
            if 'text_regions' in caracteristicas:
                print(f"   Regiones de texto: {len(caracteristicas['text_regions'])}")
            
            return True
        else:
            print(f"✗ Error en análisis: {result.get('error', 'Error desconocido')}")
            return False
            
    except Exception as e:
        print(f"✗ Error en demo: {e}")
        import traceback
        traceback.print_exc()
        return False

def demo_model_info():
    """Información sobre el modelo de clasificación"""
    print("\\n=== INFO: Modelo de Clasificación ===\\n")
    
    try:
        from app.services.cdt_model import CDTClassificationModel
        
        model = CDTClassificationModel()
        
        print("📋 CONFIGURACIÓN DEL MODELO:")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Clases: {len(model.class_names)}")
        for i, clase in enumerate(model.class_names):
            print(f"     {i}: {clase}")
        
        print("\\n🏗️ ARQUITECTURA:")
        # Crear modelo para mostrar resumen
        cnn_model = model.create_model()
        print(f"   Parámetros totales: {cnn_model.count_params():,}")
        print(f"   Capas: {len(cnn_model.layers)}")
        
        print("\\n📚 DATASET ESPERADO:")
        print("   Estructura:")
        print("     dataset/")
        print("     ├── train/ (imágenes de entrenamiento)")
        print("     ├── valid/ (imágenes de validación)")
        print("     └── test/ (imágenes de prueba)")
        
        print("\\n🏷️ ETIQUETADO AUTOMÁTICO:")
        print("   Basado en nombre de archivo:")
        print("     R1, R2, R3 → Normal")
        print("     R4, R5, R6 → Deterioro Leve")
        print("     R7, R8, R9 → Deterioro Moderado")
        print("     R10, R11, R12 → Deterioro Severo")
        
        return True
        
    except Exception as e:
        print(f"✗ Error obteniendo info del modelo: {e}")
        return False

def demo_api_endpoints():
    """Información sobre los endpoints de la API"""
    print("\\n=== INFO: Endpoints de la API ===\\n")
    
    endpoints = [
        ("POST", "/api/cdt/analyze", "Analizar imagen CDT"),
        ("GET", "/api/cdt/patient/{id}/evaluations", "Evaluaciones del paciente"),
        ("GET", "/api/cdt/evaluation/{id}", "Detalles de evaluación"),
        ("GET", "/api/cdt/evaluation/{id}/image", "Imagen de evaluación"),
        ("GET", "/api/cdt/statistics", "Estadísticas generales"),
        ("POST", "/api/cdt/train-model", "Entrenar modelo"),
        ("GET", "/api/cdt/model/status", "Estado del modelo"),
        ("POST", "/api/cdt/model/load", "Cargar modelo entrenado"),
        ("GET", "/api/cdt/info", "Información del sistema")
    ]
    
    print("🌐 ENDPOINTS DISPONIBLES:")
    for method, endpoint, description in endpoints:
        print(f"   {method:6} {endpoint:35} - {description}")
    
    print("\\n📝 EJEMPLO DE USO:")
    print("   curl -X POST http://localhost:5000/api/cdt/analyze \\\\")
    print("        -F 'file=@reloj.jpg' \\\\")
    print("        -F 'paciente_id=uuid-del-paciente'")
    
    return True

def main():
    """Función principal del demo"""
    print("🧠 SISTEMA DE ANÁLISIS CDT CON IA")
    print("Clock Drawing Test - Evaluación automática de deterioro cognitivo\\n")
    
    demos = [
        ("Análisis de Imagen", demo_image_analysis),
        ("Información del Modelo", demo_model_info),
        ("Endpoints de la API", demo_api_endpoints)
    ]
    
    for demo_name, demo_func in demos:
        try:
            demo_func()
        except Exception as e:
            print(f"\\n✗ Error en {demo_name}: {e}")
    
    print("\\n" + "="*60)
    print("🚀 PRÓXIMOS PASOS:")
    print("1. Entrenar modelo: python train_cdt_model.py")
    print("2. Iniciar backend: python run.py")
    print("3. Probar API: http://localhost:5000/api/cdt/info")
    print("4. Ver documentación: CDT_README.md")

if __name__ == "__main__":
    main()
