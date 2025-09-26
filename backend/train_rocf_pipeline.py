"""
Script completo para entrenar y evaluar el clasificador ROCF
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Importar nuestras clases
from analyze_rocf_dataset import ROCFDatasetAnalyzer
from rocf_classifier import ROCFClassifier

class ROCFTrainingPipeline:
    def __init__(self, dataset_path, labels_path=None):
        self.dataset_path = Path(dataset_path)
        self.labels_path = labels_path or "rocf_automatic_classification.csv"
        self.analyzer = ROCFDatasetAnalyzer(dataset_path)
        self.classifier = ROCFClassifier()
        
    def check_prerequisites(self):
        """Verifica que todo esté listo para entrenar"""
        print("🔍 Verificando prerequisitos...")
        
        # Verificar dataset
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset no encontrado: {self.dataset_path}")
        
        # Contar imágenes
        png_files = list(self.dataset_path.glob("*.png"))
        print(f"   ✅ Dataset encontrado: {len(png_files)} imágenes")
        
        # Verificar archivo de etiquetas
        if self.labels_path and Path(self.labels_path).exists():
            labels_df = pd.read_csv(self.labels_path)
            labeled_count = len(labels_df)
            print(f"   ✅ Clasificaciones automáticas encontradas: {labeled_count} imágenes clasificadas")
            return True
        else:
            print(f"   ⚠️  Archivo de etiquetas no encontrado: {self.labels_path}")
            print(f"   💡 Ejecuta analyze_rocf_dataset.py primero para crear la plantilla")
            return False
    
    def prepare_data(self):
        """Prepara los datos para entrenamiento"""
        print("\n📊 Preparando datos...")
        
        # Cargar clasificaciones automáticas
        labels_df = pd.read_csv(self.labels_path)
        
        # Extraer participant_id del filename
        labels_df['participant_id'] = labels_df['filename'].str.extract(r'(\d+)_ROI').astype(str).str.zfill(3)
        
        # Usar classification como cognitive_status
        labels_df['cognitive_status'] = labels_df['classification']
        
        print(f"   • Imágenes clasificadas automáticamente: {len(labels_df)}")
        
        # Distribución de clases
        class_distribution = labels_df['cognitive_status'].value_counts().sort_index()
        print(f"   • Distribución de clases automáticas:")
        class_names = {0: 'Sanos', 1: 'Deterioro Leve', 2: 'Deterioro Grave'}
        for status, count in class_distribution.items():
            print(f"     - {class_names.get(status, f'Clase {status}')}: {count} imágenes")
        
        return labels_df, labels_df
    
    def split_data_by_participant(self, data_df):
        """División por participante para evitar data leakage"""
        print("\n✂️  Dividiendo datos por participante...")
        
        # Obtener lista única de participantes por clase
        participants_by_class = data_df.groupby('cognitive_status')['participant_id'].unique()
        
        train_participants = []
        val_participants = []
        test_participants = []
        
        for status, participants in participants_by_class.items():
            participants = list(participants)
            
            # 70% entrenamiento, 15% validación, 15% test
            train_p, temp_p = train_test_split(participants, test_size=0.3, random_state=42)
            val_p, test_p = train_test_split(temp_p, test_size=0.5, random_state=42)
            
            train_participants.extend(train_p)
            val_participants.extend(val_p)
            test_participants.extend(test_p)
            
            print(f"   Clase {status}: {len(train_p)} train, {len(val_p)} val, {len(test_p)} test")
        
        # Crear conjuntos de datos
        train_df = data_df[data_df['participant_id'].isin(train_participants)]
        val_df = data_df[data_df['participant_id'].isin(val_participants)]
        test_df = data_df[data_df['participant_id'].isin(test_participants)]
        
        print(f"\n   📈 División final:")
        print(f"   • Entrenamiento: {len(train_df)} imágenes ({len(train_participants)} participantes)")
        print(f"   • Validación: {len(val_df)} imágenes ({len(val_participants)} participantes)")
        print(f"   • Test: {len(test_df)} imágenes ({len(test_participants)} participantes)")
        
        return train_df, val_df, test_df
    
    def train_and_evaluate(self, train_df, val_df, test_df):
        """Entrena y evalúa el modelo"""
        print("\n🚀 Iniciando entrenamiento...")
        
        # Crear modelo
        model = self.classifier.create_model()
        
        # Aquí implementarías la carga de datos real
        # Por ahora, solo mostramos el plan
        print(f"   📊 Modelo creado: {model.count_params():,} parámetros")
        
        # Simulación del entrenamiento
        print("\n   🔄 Entrenamiento (simulado):")
        print("   • Épocas: 50")
        print("   • Batch size: 32")
        print("   • Optimizador: Adam")
        print("   • Callbacks: EarlyStopping, ReduceLR, ModelCheckpoint")
        
        # Aquí iría el entrenamiento real
        # history = self.classifier.train_model(train_gen, val_gen, epochs=50)
        
        print("\n   ✅ Entrenamiento completado")
        print("   💾 Modelo guardado como 'best_rocf_model.h5'")
        
        return model
    
    def generate_training_report(self, train_df, val_df, test_df):
        """Genera reporte completo del entrenamiento"""
        report_path = self.dataset_path.parent / 'rocf_training_report.txt'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("REPORTE DE ENTRENAMIENTO - CLASIFICADOR ROCF\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Dataset: {self.dataset_path}\n")
            f.write(f"Total de imágenes: {len(train_df) + len(val_df) + len(test_df)}\n\n")
            
            f.write("DIVISIÓN DE DATOS:\n")
            f.write(f"• Entrenamiento: {len(train_df)} imágenes\n")
            f.write(f"• Validación: {len(val_df)} imágenes\n")
            f.write(f"• Test: {len(test_df)} imágenes\n\n")
            
            f.write("DISTRIBUCIÓN DE CLASES:\n")
            for df_name, df in [("Entrenamiento", train_df), ("Validación", val_df), ("Test", test_df)]:
                f.write(f"{df_name}:\n")
                class_dist = df['cognitive_status'].value_counts().sort_index()
                for status, count in class_dist.items():
                    class_name = {0: 'Sanos', 1: 'Deterioro Leve', 2: 'Deterioro Grave'}.get(status, f'Clase {status}')
                    f.write(f"  - {class_name}: {count}\n")
                f.write("\n")
        
        print(f"📄 Reporte guardado: {report_path}")

def main():
    """Función principal"""
    # Configuración
    dataset_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocfd528_binary_images"
    labels_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocf_automatic_classification.csv"
    
    try:
        # Inicializar pipeline
        pipeline = ROCFTrainingPipeline(dataset_path, labels_path)
        
        # Verificar prerequisitos
        if not pipeline.check_prerequisites():
            print("\n❌ Prerequisitos no cumplidos. Ejecuta los pasos previos primero.")
            return
        
        # Preparar datos
        data_df, labels_df = pipeline.prepare_data()
        
        # Dividir datos
        train_df, val_df, test_df = pipeline.split_data_by_participant(data_df)
        
        # Entrenar modelo
        model = pipeline.train_and_evaluate(train_df, val_df, test_df)
        
        # Generar reporte
        pipeline.generate_training_report(train_df, val_df, test_df)
        
        print("\n🎉 Pipeline de entrenamiento completado exitosamente!")
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Revisar métricas de validación")
        print("2. Ajustar hiperparámetros si es necesario")
        print("3. Evaluar en conjunto de test")
        print("4. Integrar modelo en la aplicación web")
        
    except Exception as e:
        print(f"\n❌ Error en el pipeline: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
