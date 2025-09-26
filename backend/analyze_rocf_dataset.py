"""
Análisis del dataset ROCF (Rey-Osterrieth Complex Figure) para clasificación cognitiva
"""

import os
import cv2
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import re
from collections import Counter

class ROCFDatasetAnalyzer:
    def __init__(self, dataset_path):
        self.dataset_path = Path(dataset_path)
        self.images_info = []
        
    def parse_filename(self, filename):
        """
        Extrae información del nombre del archivo
        Formato: 001_ROI_90_Psic_002Ev1.pdf_pg-27.png
        """
        pattern = r'(\d+)_ROI_(-?\d+)_Psic_(\d+)Ev(\d+).*\.png'
        match = re.match(pattern, filename)
        
        if match:
            return {
                'id': int(match.group(1)),
                'rotation': int(match.group(2)),
                'participant': int(match.group(3)),
                'evaluation': int(match.group(4)),
                'filename': filename
            }
        return None
    
    def analyze_images(self):
        """Analiza todas las imágenes del dataset"""
        print("Analizando imágenes del dataset...")
        
        for img_file in self.dataset_path.glob("*.png"):
            info = self.parse_filename(img_file.name)
            if info:
                # Cargar imagen para obtener dimensiones
                img = cv2.imread(str(img_file), cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    info.update({
                        'height': img.shape[0],
                        'width': img.shape[1],
                        'mean_intensity': np.mean(img),
                        'std_intensity': np.std(img),
                        'file_size': img_file.stat().st_size
                    })
                    self.images_info.append(info)
        
        print(f"Procesadas {len(self.images_info)} imágenes")
        return pd.DataFrame(self.images_info)
    
    def generate_report(self, df):
        """Genera reporte completo del dataset"""
        print("\n" + "="*60)
        print("REPORTE DE ANÁLISIS DEL DATASET ROCF")
        print("="*60)
        
        # Estadísticas generales
        print(f"\n📊 ESTADÍSTICAS GENERALES:")
        print(f"   • Total de imágenes: {len(df)}")
        print(f"   • Participantes únicos: {df['participant'].nunique()}")
        print(f"   • Evaluaciones por participante: {df.groupby('participant')['evaluation'].nunique().describe()}")
        
        # Distribución por participante
        print(f"\n👥 DISTRIBUCIÓN POR PARTICIPANTE:")
        participant_counts = df['participant'].value_counts().sort_index()
        print(f"   • Mínimo dibujos por participante: {participant_counts.min()}")
        print(f"   • Máximo dibujos por participante: {participant_counts.max()}")
        print(f"   • Promedio dibujos por participante: {participant_counts.mean():.2f}")
        
        # Rotaciones
        print(f"\n🔄 ANÁLISIS DE ROTACIONES:")
        rotation_counts = df['rotation'].value_counts().sort_index()
        for rotation, count in rotation_counts.items():
            print(f"   • {rotation}°: {count} imágenes ({count/len(df)*100:.1f}%)")
        
        # Calidad de imagen
        print(f"\n🖼️  CALIDAD DE IMAGEN:")
        print(f"   • Dimensiones: {df['width'].iloc[0]}x{df['height'].iloc[0]} píxeles")
        print(f"   • Intensidad promedio: {df['mean_intensity'].mean():.2f} ± {df['mean_intensity'].std():.2f}")
        print(f"   • Tamaño archivo promedio: {df['file_size'].mean()/1024:.1f} KB")
        
        return df
    
    def suggest_classification_strategy(self, df):
        """Sugiere estrategia de clasificación"""
        print(f"\n🎯 ESTRATEGIA DE CLASIFICACIÓN SUGERIDA:")
        print(f"   • Dataset balanceado: {len(df)} imágenes")
        print(f"   • Participantes: {df['participant'].nunique()}")
        
        # Sugerencias basadas en el análisis
        print(f"\n💡 RECOMENDACIONES:")
        print(f"   1. Crear etiquetas clínicas para cada participante")
        print(f"   2. Usar validación cruzada por participante (no por imagen)")
        print(f"   3. Considerar data augmentation con rotaciones existentes")
        print(f"   4. Evaluar múltiples evaluaciones por participante como ensemble")
        
        # Estrategia de etiquetado
        print(f"\n🏷️  ESTRATEGIA DE ETIQUETADO:")
        print(f"   • Crear archivo CSV con: participant_id, cognitive_status")
        print(f"   • Categorías: 0=Sano, 1=Deterioro Leve, 2=Deterioro Grave")
        print(f"   • Verificar con neuropsicólogos para validación clínica")
        
    def create_label_template(self, df):
        """Crea plantilla para etiquetado manual"""
        participants = df['participant'].unique()
        template_data = []
        
        for participant in sorted(participants):
            participant_imgs = df[df['participant'] == participant]
            template_data.append({
                'participant_id': participant,
                'num_images': len(participant_imgs),
                'evaluations': list(participant_imgs['evaluation'].unique()),
                'cognitive_status': '',  # Para llenar manualmente
                'notes': ''  # Observaciones adicionales
            })
        
        template_df = pd.DataFrame(template_data)
        template_path = self.dataset_path.parent / 'rocf_labeling_template.csv'
        template_df.to_csv(template_path, index=False)
        
        print(f"\n📝 PLANTILLA CREADA: {template_path}")
        print(f"   • Complete la columna 'cognitive_status' con: 0, 1, o 2")
        print(f"   • 0 = Cognitivamente Sano")
        print(f"   • 1 = Deterioro Cognitivo Leve") 
        print(f"   • 2 = Deterioro Cognitivo Grave")
        
        return template_df

def main():
    """Función principal"""
    dataset_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocfd528_binary_images"
    
    if not os.path.exists(dataset_path):
        print(f"❌ Error: No se encontró el directorio {dataset_path}")
        return
    
    # Inicializar analizador
    analyzer = ROCFDatasetAnalyzer(dataset_path)
    
    # Analizar dataset
    df = analyzer.analyze_images()
    
    # Generar reporte
    analyzer.generate_report(df)
    
    # Sugerir estrategia
    analyzer.suggest_classification_strategy(df)
    
    # Crear plantilla de etiquetado
    template_df = analyzer.create_label_template(df)
    
    # Guardar análisis completo
    analysis_path = Path(dataset_path).parent / 'rocf_dataset_analysis.csv'
    df.to_csv(analysis_path, index=False)
    print(f"\n💾 ANÁLISIS GUARDADO: {analysis_path}")

if __name__ == "__main__":
    main()
