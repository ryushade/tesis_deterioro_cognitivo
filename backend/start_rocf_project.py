"""
Script de inicio rápido para el proyecto ROCF
Guía paso a paso para comenzar con la clasificación
"""

import os
import sys
from pathlib import Path

def print_header():
    """Imprime header del proyecto"""
    print("=" * 80)
    print("🧠 CLASIFICADOR DE FIGURAS COMPLEJAS DE REY-OSTERRIETH (ROCF)")
    print("   Sistema de Detección de Deterioro Cognitivo")
    print("=" * 80)

def check_dependencies():
    """Verifica dependencias necesarias"""
    print("\n🔍 Verificando dependencias...")
    
    required_packages = [
        ('tensorflow', 'tensorflow'), 
        ('opencv-python', 'cv2'), 
        ('numpy', 'numpy'), 
        ('pandas', 'pandas'), 
        ('matplotlib', 'matplotlib'), 
        ('seaborn', 'seaborn'), 
        ('scikit-learn', 'sklearn')
    ]
    
    missing_packages = []
    
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print(f"   ✅ {package_name}")
        except ImportError:
            print(f"   ❌ {package_name}")
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n📦 Instala las dependencias faltantes:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_dataset():
    """Verifica dataset"""
    print("\n📊 Verificando dataset...")
    
    dataset_path = Path("rocfd528_binary_images")
    
    if not dataset_path.exists():
        print(f"   ❌ Dataset no encontrado: {dataset_path}")
        print(f"   💡 Asegúrate de que el directorio existe en el backend")
        return False
    
    png_files = list(dataset_path.glob("*.png"))
    print(f"   ✅ Dataset encontrado: {len(png_files)} imágenes")
    
    if len(png_files) < 100:
        print(f"   ⚠️  Pocas imágenes encontradas. Esperado: ~528")
    
    return True

def show_workflow():
    """Muestra el flujo de trabajo recomendado"""
    print("\n🚀 FLUJO DE TRABAJO RECOMENDADO:")
    print("\n1️⃣  ANÁLISIS INICIAL DEL DATASET")
    print("   python analyze_rocf_dataset.py")
    print("   • Analiza estructura del dataset")
    print("   • Genera estadísticas descriptivas")
    print("   • Crea plantilla para etiquetado")
    
    print("\n2️⃣  ETIQUETADO CLÍNICO")
    print("   • Completa 'rocf_labeling_template.csv'")
    print("   • Asigna etiquetas: 0=Sano, 1=Leve, 2=Grave")
    print("   • Validar con neuropsicólogos")
    
    print("\n3️⃣  ENTRENAMIENTO DEL MODELO")
    print("   python train_rocf_pipeline.py")
    print("   • Prepara datos etiquetados")
    print("   • Entrena modelo CNN especializado")
    print("   • Genera métricas de evaluación")
    
    print("\n4️⃣  INTEGRACIÓN CON APLICACIÓN WEB")
    print("   • Usar rocf_prediction_service.py")
    print("   • Integrar con endpoints Flask")
    print("   • Configurar interfaz de usuario")

def create_config_file():
    """Crea archivo de configuración"""
    config_content = """# Configuración del Clasificador ROCF

# Rutas
DATASET_PATH = "rocfd528_binary_images"
LABELS_PATH = "rocf_labeling_template.csv"
MODEL_PATH = "best_rocf_model.h5"
LOGS_PATH = "logs"

# Parámetros del modelo
IMAGE_SIZE = 384
NUM_CLASSES = 3
BATCH_SIZE = 32
EPOCHS = 50

# Umbrales de confianza
CONFIDENCE_HIGH = 0.8
CONFIDENCE_MEDIUM = 0.6
CONFIDENCE_LOW = 0.4

# Clases
CLASS_NAMES = {
    0: "Cognitivamente Sano",
    1: "Deterioro Cognitivo Leve", 
    2: "Deterioro Cognitivo Grave"
}
"""
    
    with open('rocf_config.py', 'w', encoding='utf-8') as f:
        f.write(config_content)
    
    print("   ✅ Archivo de configuración creado: rocf_config.py")

def show_next_steps():
    """Muestra próximos pasos específicos"""
    print("\n📋 PRÓXIMOS PASOS INMEDIATOS:")
    
    # Verificar qué archivos existen
    analysis_exists = Path("rocf_dataset_analysis.csv").exists()
    labels_exists = Path("rocf_labeling_template.csv").exists()
    model_exists = Path("best_rocf_model.h5").exists()
    
    if not analysis_exists:
        print("\n🔥 PASO 1: Analizar dataset")
        print("   python analyze_rocf_dataset.py")
        print("   Esto creará el análisis inicial y la plantilla de etiquetado")
    
    elif not labels_exists:
        print("\n🔥 PASO 1: Completar etiquetado")
        print("   Edita 'rocf_labeling_template.csv'")
        print("   Asigna cognitive_status para cada participante")
    
    elif not model_exists:
        print("\n🔥 PASO 1: Entrenar modelo")
        print("   python train_rocf_pipeline.py")
        print("   Esto entrenará el modelo con tus etiquetas")
    
    else:
        print("\n🔥 PASO 1: Integrar con aplicación web")
        print("   El modelo está listo para usar en producción")

def main():
    """Función principal"""
    print_header()
    
    # Verificaciones
    deps_ok = check_dependencies()
    dataset_ok = check_dataset()
    
    if not deps_ok:
        print("\n❌ Instala las dependencias faltantes antes de continuar")
        return
    
    if not dataset_ok:
        print("\n❌ Configura el dataset antes de continuar")
        return
    
    # Crear configuración
    print("\n⚙️  Creando archivos de configuración...")
    create_config_file()
    
    # Mostrar flujo de trabajo
    show_workflow()
    
    # Próximos pasos
    show_next_steps()
    
    print("\n" + "=" * 80)
    print("🎯 OBJETIVO: Clasificar deterioro cognitivo usando ROCF")
    print("📈 METODOLOGÍA: Deep Learning con CNN especializada")
    print("🏥 APLICACIÓN: Herramienta de apoyo diagnóstico")
    print("=" * 80)
    
    print(f"\n✨ Sistema inicializado. ¡Comienza con el Paso 1!")

if __name__ == "__main__":
    main()
