"""
Script para evaluar el modelo entrenado ROCF
"""

import os
import pandas as pd
import numpy as np
from pathlib import Path
import cv2
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf

def load_and_preprocess_image(image_path, img_size=(224, 224)):
    """Carga y preprocesa una imagen"""
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, img_size)
        img = img.astype(np.float32) / 255.0
        return img
    except Exception as e:
        print(f"Error procesando {image_path}: {e}")
        return None

def main():
    """Evalúa el modelo entrenado"""
    print("📊 EVALUACIÓN MODELO ROCF ENTRENADO")
    print("=" * 40)
    
    # Cargar modelo
    model_path = "best_rocf_model_real.h5"
    if not Path(model_path).exists():
        print(f"❌ Modelo no encontrado: {model_path}")
        return
    
    model = tf.keras.models.load_model(model_path)
    print(f"✅ Modelo cargado: {model.count_params():,} parámetros")
    
    # Cargar datos de test
    dataset_path = Path("rocfd528_binary_images")
    labels_path = "rocf_automatic_classification.csv"
    
    labels_df = pd.read_csv(labels_path)
    labels_df['participant_id'] = labels_df['filename'].str.extract(r'(\d+)_ROI')[0].astype(str).str.zfill(3)
    
    # Recrear división de test (mismo random_state)
    from sklearn.model_selection import train_test_split
    
    unique_participants = labels_df['participant_id'].unique()
    participants_by_class = {}
    for cls in [0, 1, 2]:
        class_participants = labels_df[labels_df['classification'] == cls]['participant_id'].unique()
        participants_by_class[cls] = list(class_participants)
    
    test_participants = []
    for cls, participants in participants_by_class.items():
        if len(participants) > 0:
            train_p, temp_p = train_test_split(participants, test_size=0.3, random_state=42)
            val_p, test_p = train_test_split(temp_p, test_size=0.5, random_state=42)
            test_participants.extend(test_p)
    
    test_df = labels_df[labels_df['participant_id'].isin(test_participants)]
    
    print(f"📈 Evaluando en {len(test_df)} imágenes de test")
    
    # Preparar datos de test
    test_images = []
    test_labels = []
    
    for _, row in test_df.iterrows():
        img_path = dataset_path / row['filename']
        img = load_and_preprocess_image(img_path)
        
        if img is not None:
            test_images.append(img)
            test_labels.append(row['classification'])
    
    test_images = np.array(test_images)
    test_labels = np.array(test_labels)
    
    print(f"   • Imágenes cargadas exitosamente: {len(test_images)}")
    
    # Predicciones
    predictions = model.predict(test_images)
    predicted_classes = np.argmax(predictions, axis=1)
    
    # Métricas
    unique_classes = np.unique(test_labels)
    class_names = ['Sanos', 'Deterioro Leve', 'Deterioro Grave']
    target_names = [class_names[i] for i in unique_classes]
    
    print("\n📈 RESULTADOS DE EVALUACIÓN:")
    print(classification_report(
        test_labels, 
        predicted_classes,
        target_names=target_names,
        labels=unique_classes
    ))
    
    # Accuracy por clase
    print("\n📊 DISTRIBUCIÓN Y ACCURACY POR CLASE:")
    for cls in unique_classes:
        mask = test_labels == cls
        class_acc = (predicted_classes[mask] == cls).mean()
        count = mask.sum()
        print(f"   • {class_names[cls]}: {count} imágenes, accuracy: {class_acc:.3f}")
    
    # Matriz de confusión
    cm = confusion_matrix(test_labels, predicted_classes, labels=unique_classes)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
               xticklabels=target_names,
               yticklabels=target_names)
    plt.title('Matriz de Confusión - Clasificador ROCF')
    plt.ylabel('Etiqueta Real')
    plt.xlabel('Predicción')
    plt.tight_layout()
    plt.savefig('rocf_confusion_matrix_final.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # Confianza de predicciones
    prediction_confidence = np.max(predictions, axis=1)
    print(f"\n🎯 CONFIANZA DE PREDICCIONES:")
    print(f"   • Confianza promedio: {prediction_confidence.mean():.3f}")
    print(f"   • Confianza mínima: {prediction_confidence.min():.3f}")
    print(f"   • Confianza máxima: {prediction_confidence.max():.3f}")
    
    # Casos con baja confianza
    low_confidence_threshold = 0.6
    low_conf_mask = prediction_confidence < low_confidence_threshold
    if low_conf_mask.sum() > 0:
        print(f"   • Predicciones con baja confianza (<{low_confidence_threshold}): {low_conf_mask.sum()}")
    
    print("\n🎉 EVALUACIÓN COMPLETADA!")
    print("📄 Archivo generado: rocf_confusion_matrix_final.png")

if __name__ == "__main__":
    main()
