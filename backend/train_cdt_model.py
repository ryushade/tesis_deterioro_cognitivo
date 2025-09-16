"""
Script para entrenar el modelo de clasificación CDT
"""

import os
import sys
import argparse
from pathlib import Path

# Agregar el directorio del proyecto al path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

try:
    from app.services.cdt_model import CDTClassificationModel, train_cdt_model
    print("Módulos cargados correctamente")
except ImportError as e:
    print(f"Error importando módulos: {e}")
    print("Instalando dependencias primero...")
    # Si no están las dependencias, mostrar instrucciones
    print("""
    Para entrenar el modelo, primero instala las dependencias:
    
    1. Activar el entorno virtual:
       .venv\\Scripts\\activate  (Windows)
       source .venv/bin/activate  (Linux/Mac)
    
    2. Instalar dependencias:
       pip install -r requirements.txt
    
    3. Ejecutar el entrenamiento:
       python train_cdt_model.py --dataset ../dataset --output cdt_model.h5
    """)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Entrenar modelo de clasificación CDT')
    parser.add_argument('--dataset', '-d', 
                       default='../dataset',
                       help='Ruta del dataset (default: ../dataset)')
    parser.add_argument('--output', '-o',
                       default='cdt_classification_model.h5',
                       help='Ruta de salida del modelo (default: cdt_classification_model.h5)')
    parser.add_argument('--epochs', '-e',
                       type=int,
                       default=50,
                       help='Número de épocas (default: 50)')
    parser.add_argument('--batch-size', '-b',
                       type=int,
                       default=16,
                       help='Tamaño del batch (default: 16)')
    parser.add_argument('--transfer-learning',
                       action='store_true',
                       default=True,
                       help='Usar transfer learning (default: True)')
    parser.add_argument('--validation-split',
                       type=float,
                       default=0.2,
                       help='Fracción para validación (default: 0.2)')
    
    args = parser.parse_args()
    
    # Verificar que existe el dataset
    if not os.path.exists(args.dataset):
        print(f"Error: No se encuentra el dataset en {args.dataset}")
        print("Estructura esperada:")
        print("dataset/")
        print("├── train/")
        print("│   ├── imagen1.jpg")
        print("│   ├── imagen2.jpg")
        print("│   └── ...")
        print("├── valid/")
        print("└── test/")
        return
    
    print(f"Configuración de entrenamiento:")
    print(f"  Dataset: {args.dataset}")
    print(f"  Modelo de salida: {args.output}")
    print(f"  Épocas: {args.epochs}")
    print(f"  Batch size: {args.batch_size}")
    print(f"  Transfer learning: {args.transfer_learning}")
    print(f"  Validación split: {args.validation_split}")
    print()
    
    try:
        # Crear modelo
        model = CDTClassificationModel()
        
        # Entrenar
        print("Iniciando entrenamiento...")
        history = model.train_model(
            dataset_path=args.dataset,
            epochs=args.epochs,
            batch_size=args.batch_size,
            validation_split=args.validation_split,
            use_transfer_learning=args.transfer_learning
        )
        
        # Guardar modelo
        model.save_model(args.output)
        
        # Guardar gráfico de entrenamiento
        plot_path = args.output.replace('.h5', '_training_history.png')
        model.plot_training_history(plot_path)
        
        print(f"\\n¡Entrenamiento completado exitosamente!")
        print(f"Modelo guardado en: {args.output}")
        print(f"Gráfico guardado en: {plot_path}")
        
        # Mostrar resumen del modelo
        if model.model:
            print(f"\\nResumen del modelo:")
            print(f"  Parámetros: {model.model.count_params():,}")
            print(f"  Clases: {model.class_names}")
        
    except KeyboardInterrupt:
        print("\\nEntrenamiento interrumpido por el usuario")
    except Exception as e:
        print(f"\\nError durante el entrenamiento: {e}")
        import traceback
        traceback.print_exc()


def test_single_image():
    """Función para probar una sola imagen"""
    print("Función de prueba - analizar imagen individual")
    
    # Buscar modelo entrenado
    model_path = "cdt_classification_model.h5"
    if not os.path.exists(model_path):
        print(f"No se encuentra el modelo en {model_path}")
        print("Primero entrena el modelo con: python train_cdt_model.py")
        return
    
    # Cargar modelo
    model = CDTClassificationModel()
    model.load_model(model_path)
    
    # Buscar una imagen de ejemplo
    dataset_path = "../dataset"
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
        print("No se encontró imagen de ejemplo en el dataset")
        return
    
    print(f"Analizando imagen: {example_image}")
    
    # Hacer predicción
    result = model.predict_single_image(example_image)
    
    print("Resultado:")
    print(f"  Clase predicha: {result.get('predicted_class')}")
    print(f"  Confianza: {result.get('confidence', 0):.4f}")
    print("  Probabilidades por clase:")
    for class_name, prob in result.get('class_probabilities', {}).items():
        print(f"    {class_name}: {prob:.4f}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_single_image()
    else:
        main()
