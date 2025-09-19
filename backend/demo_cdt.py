"""
Demo completo del sistema CDT mejorado
Prueba el análisis real de imágenes con computer vision
"""

import os
import sys
import cv2
import numpy as np
from datetime import datetime

# Agregar el path del proyecto
project_root = os.path.dirname(__file__)
sys.path.append(project_root)

def demo_real_cdt_analysis():
    """Demo del análisis CDT mejorado con computer vision"""
    print("=== DEMO: Análisis CDT Mejorado (Computer Vision) ===\n")
    
    try:
        from app.services.cdt_analyzer import CDTAnalyzer
        
        # Crear analizador
        analyzer = CDTAnalyzer()
        print("✓ Analizador CDT con Computer Vision inicializado")
        
        # Buscar imágenes de prueba
        test_images = [
            "reloj_correcto_10_10.jpg",
            "reloj_incorrecto_3_15.jpg", 
            "reloj_incorrecto_12_00.jpg"
        ]
        
        print("\n🔍 PROBANDO CON IMÁGENES DE PRUEBA:")
        print("-" * 50)
        
        resultados = []
        
        for img_name in test_images:
            if os.path.exists(img_name):
                print(f"\n📷 Analizando: {img_name}")
                
                # Cargar imagen
                image = cv2.imread(img_name)
                if image is not None:
                    # Análisis con el nuevo sistema
                    resultado = analyzer.analyze_cdt(image)
                    resultados.append((img_name, resultado))
                    
                    # Mostrar resultados detallados
                    print(f"   🎯 Puntuación total: {resultado['puntuacion_total']:.2f}/10")
                    print(f"   ⏰ Precisión tiempo: {resultado['tiempo_precision']:.2f}/2 (objetivo: 10:10)")
                    print(f"   🔢 Números: {resultado['numeros_presentes']:.2f}/2")
                    print(f"   🎨 Calidad: {resultado['calidad_dibujo']:.2f}/6")
                    
                    # Detalles del análisis de tiempo
                    if 'detalles_tiempo' in resultado:
                        detalles = resultado['detalles_tiempo']
                        print(f"   📐 Manecillas detectadas: {detalles.get('manecillas_detectadas', 0)}")
                        print(f"   ✅ Hora correcta: {'Sí' if detalles.get('hora_correcta', False) else 'No'}")
                        
                        if 'angulos_detectados' in detalles:
                            angulos = detalles['angulos_detectados']
                            print(f"   📏 Ángulos detectados: {[f'{a:.1f}°' for a in angulos]}")
                else:
                    print(f"   ❌ Error al cargar imagen: {img_name}")
            else:
                print(f"   ⚠️ Imagen no encontrada: {img_name}")
        
        # Tabla comparativa
        if resultados:
            print("\n� COMPARACIÓN DE RESULTADOS:")
            print("=" * 80)
            print(f"{'Imagen':<25} {'Total':<8} {'Tiempo':<8} {'Números':<8} {'Calidad':<8} {'Estado'}")
            print("-" * 80)
            
            for img_name, resultado in resultados:
                nombre_corto = img_name[:22] + "..." if len(img_name) > 25 else img_name
                tiempo_ok = "✅" if resultado.get('detalles_tiempo', {}).get('hora_correcta', False) else "❌"
                print(f"{nombre_corto:<25} "
                      f"{resultado['puntuacion_total']:.1f}/10{'':<2} "
                      f"{resultado['tiempo_precision']:.1f}/2{'':<4} "
                      f"{resultado['numeros_presentes']:.1f}/2{'':<4} "
                      f"{resultado['calidad_dibujo']:.1f}/6{'':<4} "
                      f"{tiempo_ok}")
        
        print("\n💡 DIFERENCIAS CLAVE DEL SISTEMA MEJORADO:")
        print("   • ⏰ Análisis REAL del tiempo (antes era simulado)")
        print("   • 📐 Detección de ángulos de manecillas con OpenCV")
        print("   • 🎯 Verificación específica de hora 10:10")
        print("   • 📏 Tolerancia configurable para precisión")
        print("   • 🔍 Computer vision en lugar de scores aleatorios")
        
        return True
        
    except Exception as e:
        print(f"✗ Error en demo: {e}")
        import traceback
        traceback.print_exc()
        return False

def demo_interactive_testing():
    """Demo interactivo para probar con imágenes propias"""
    print("\n=== DEMO: Prueba Interactiva ===\n")
    
    print("🎮 MODO INTERACTIVO PARA PROBAR TU MODELO:")
    print("1. Coloca una imagen de reloj en este directorio")
    print("2. Escribe el nombre del archivo")
    print("3. Ve el análisis en tiempo real")
    print("4. Escribe 'salir' para terminar\n")
    
    try:
        from app.services.cdt_analyzer import CDTAnalyzer
        analyzer = CDTAnalyzer()
        
        while True:
            archivo = input("➤ Nombre del archivo (o 'salir'): ").strip()
            
            if archivo.lower() == 'salir':
                print("� ¡Hasta luego!")
                break
            
            if not archivo:
                continue
                
            if not os.path.exists(archivo):
                print(f"❌ Archivo no encontrado: {archivo}")
                # Mostrar archivos disponibles
                archivos_img = [f for f in os.listdir('.') 
                              if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
                if archivos_img:
                    print("📁 Archivos disponibles:")
                    for f in archivos_img:
                        print(f"   • {f}")
                continue
            
            print(f"\n🔍 Analizando: {archivo}")
            print("-" * 40)
            
            try:
                image = cv2.imread(archivo)
                if image is None:
                    print("❌ Error al cargar la imagen")
                    continue
                
                resultado = analyzer.analyze_cdt(image)
                
                print(f"🎯 RESULTADO PARA {archivo}:")
                print(f"   📊 Puntuación total: {resultado['puntuacion_total']:.2f}/10")
                print(f"   ⏰ Tiempo (10:10): {resultado['tiempo_precision']:.2f}/2")
                print(f"   🔢 Números: {resultado['numeros_presentes']:.2f}/2")
                print(f"   🎨 Calidad: {resultado['calidad_dibujo']:.2f}/6")
                
                # Análisis específico del tiempo
                if 'detalles_tiempo' in resultado:
                    detalles = resultado['detalles_tiempo']
                    hora_correcta = detalles.get('hora_correcta', False)
                    print(f"   {'✅' if hora_correcta else '❌'} Hora 10:10: {'Correcta' if hora_correcta else 'Incorrecta'}")
                    print(f"   📐 Manecillas: {detalles.get('manecillas_detectadas', 0)} detectadas")
                
                # Interpretación
                puntuacion = resultado['puntuacion_total']
                if puntuacion >= 8:
                    print("   🟢 Interpretación: Excelente - Sin deterioro aparente")
                elif puntuacion >= 6:
                    print("   🟡 Interpretación: Bueno - Deterioro leve posible")
                elif puntuacion >= 4:
                    print("   🟠 Interpretación: Regular - Deterioro moderado")
                else:
                    print("   🔴 Interpretación: Deficiente - Deterioro severo")
                
            except Exception as e:
                print(f"❌ Error al analizar: {str(e)}")
            
            print()  # Línea en blanco
    
    except Exception as e:
        print(f"✗ Error en modo interactivo: {e}")
        return False
    
    return True

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
    print("🧠 SISTEMA DE ANÁLISIS CDT MEJORADO")
    print("Clock Drawing Test - Evaluación con Computer Vision\n")
    
    demos = [
        ("Análisis CDT Mejorado", demo_real_cdt_analysis),
        ("Prueba Interactiva", demo_interactive_testing),
        ("Endpoints de la API", demo_api_endpoints)
    ]
    
    for demo_name, demo_func in demos:
        try:
            demo_func()
        except Exception as e:
            print(f"\n✗ Error en {demo_name}: {e}")
    
    print("\n" + "="*60)
    print("🚀 PRÓXIMOS PASOS:")
    print("1. Iniciar backend: python run.py")
    print("2. Probar API: http://localhost:5000/api/cdt/info") 
    print("3. Modo interactivo: python demo_cdt.py")
    print("4. Frontend web: npm run dev (en carpeta frontend)")
    print("\n💡 TU MODELO AHORA ANALIZA REALMENTE LOS RELOJES!")
    print("   ✅ Computer vision con OpenCV")
    print("   ✅ Detección real de manecillas") 
    print("   ✅ Verificación de hora 10:10")
    print("   ✅ Sin más scores falsos")

if __name__ == "__main__":
    main()
