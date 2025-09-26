"""
Entrenamiento REAL del clasificador ROCF usando las clasificaciones automáticas
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Imports de TensorFlow
try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
    print("✅ TensorFlow importado correctamente")
except ImportError:
    print("❌ Error: TensorFlow no está instalado")
    sys.exit(1)

# Importar nuestro clasificador
from rocf_classifier import ROCFClassifier

class ROCFRealTrainer:
    def __init__(self, dataset_path, labels_path, img_size=(224, 224)):
        self.dataset_path = Path(dataset_path)
        self.labels_path = labels_path
        self.img_size = img_size
        self.classifier = ROCFClassifier(img_size=img_size[0], num_classes=2)
        
    def load_and_preprocess_image(self, image_path):
        """Carga y preprocesa una imagen"""
        try:
            # Leer imagen
            img = cv2.imread(str(image_path))
            if img is None:
                return None
                
            # Convertir a RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Redimensionar
            img = cv2.resize(img, self.img_size)
            
            # Normalizar
            img = img.astype(np.float32) / 255.0
            
            return img
        except Exception as e:
            print(f"Error procesando {image_path}: {e}")
            return None
    
    def create_data_generators(self, train_df, val_df, batch_size=32):
        """Crea generadores de datos para entrenamiento"""
        
        def data_generator(df, batch_size, shuffle=True):
            """Generador de datos personalizado"""
            while True:
                if shuffle:
                    df = df.sample(frac=1).reset_index(drop=True)
                
                for i in range(0, len(df), batch_size):
                    batch_df = df.iloc[i:i+batch_size]
                    
                    batch_images = []
                    batch_labels = []
                    
                    for _, row in batch_df.iterrows():
                        # Cargar imagen
                        img_path = self.dataset_path / row['filename']
                        img = self.load_and_preprocess_image(img_path)
                        
                        if img is not None:
                            batch_images.append(img)
                            batch_labels.append(row['classification'])
                    
                    if len(batch_images) > 0:
                        yield (
                            np.array(batch_images),
                            tf.keras.utils.to_categorical(batch_labels, num_classes=2)
                        )
        
        # Crear generadores
        train_gen = data_generator(train_df, batch_size, shuffle=True)
        val_gen = data_generator(val_df, batch_size, shuffle=False)
        
        # Calcular pasos por época
        train_steps = len(train_df) // batch_size
        val_steps = len(val_df) // batch_size
        
        return train_gen, val_gen, train_steps, val_steps
    
    def train_model(self, train_df, val_df, epochs=50, batch_size=32):
        """Entrena el modelo"""
        print("🚀 Iniciando entrenamiento real...")
        
        # Crear modelo
        model = self.classifier.create_model(input_channels=3)
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(f"📊 Modelo creado: {model.count_params():,} parámetros")
        
        # Crear generadores de datos
        train_gen, val_gen, train_steps, val_steps = self.create_data_generators(
            train_df, val_df, batch_size
        )
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                'best_rocf_model_real.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Entrenar
        print(f"🔄 Entrenando por {epochs} épocas...")
        history = model.fit(
            train_gen,
            steps_per_epoch=train_steps,
            epochs=epochs,
            validation_data=val_gen,
            validation_steps=val_steps,
            callbacks=callbacks,
            verbose=1
        )
        
        print("✅ Entrenamiento completado!")
        return model, history
    
    def evaluate_model(self, model, test_df):
        """Evalúa el modelo en el conjunto de test"""
        print("📊 Evaluando modelo...")
        
        # Preparar datos de test
        test_images = []
        test_labels = []
        
        for _, row in test_df.iterrows():
            img_path = self.dataset_path / row['filename']
            img = self.load_and_preprocess_image(img_path)
            
            if img is not None:
                test_images.append(img)
                test_labels.append(row['classification'])
        
        test_images = np.array(test_images)
        test_labels = np.array(test_labels)
        
        # Predicciones
        predictions = model.predict(test_images)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Métricas
        unique_classes = np.unique(test_labels)
        class_names = ['Sanos', 'Deterioro Cognitivo']
        target_names = [class_names[i] for i in unique_classes]
        
        print("\n📈 RESULTADOS DE EVALUACIÓN:")
        print(classification_report(
            test_labels, 
            predicted_classes,
            target_names=target_names,
            labels=unique_classes
        ))
        
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
        plt.savefig('rocf_confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return predictions, predicted_classes
    
    def plot_training_history(self, history):
        """Grafica el historial de entrenamiento"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Accuracy
        ax1.plot(history.history['accuracy'], label='Train Accuracy')
        ax1.plot(history.history['val_accuracy'], label='Val Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        
        # Loss
        ax2.plot(history.history['loss'], label='Train Loss')
        ax2.plot(history.history['val_loss'], label='Val Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig('rocf_training_history.png', dpi=300, bbox_inches='tight')
        plt.close()

def main():
    """Función principal de entrenamiento"""
    print("🧠 ENTRENAMIENTO ROCF - CLASIFICACIONES REALES")
    print("=" * 50)
    
    # Configuración
    dataset_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocfd528_binary_images"
    labels_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocf_automatic_classification.csv"
    
    try:
        # Verificar paths
        if not Path(dataset_path).exists():
            print(f"❌ Dataset no encontrado: {dataset_path}")
            return
        
        if not Path(labels_path).exists():
            print(f"❌ Archivo de clasificaciones no encontrado: {labels_path}")
            return
        
        # Cargar datos
        print("📊 Cargando clasificaciones automáticas...")
        labels_df = pd.read_csv(labels_path)
        
        # Extraer participant_id y preparar datos
        labels_df['participant_id'] = labels_df['filename'].str.extract(r'(\d+)_ROI')[0].astype(str).str.zfill(3)
        
        print(f"   • Total de imágenes: {len(labels_df)}")
        
        # Distribución de clases
        class_dist = labels_df['classification'].value_counts().sort_index()
        print(f"   • Distribución de clases:")
        class_names = {0: 'Sanos', 1: 'Deterioro Leve', 2: 'Deterioro Grave'}
        for cls, count in class_dist.items():
            print(f"     - {class_names[cls]}: {count} imágenes")
        
        # División de datos por participante para evitar data leakage
        print("\n✂️  Dividiendo datos por participante...")
        unique_participants = labels_df['participant_id'].unique()
        
        # División estratificada por participante
        participants_by_class = {}
        for cls in [0, 1]:  # Solo 2 clases ahora
            class_participants = labels_df[labels_df['classification'] == cls]['participant_id'].unique()
            participants_by_class[cls] = list(class_participants)
        
        train_participants = []
        val_participants = []
        test_participants = []
        
        for cls, participants in participants_by_class.items():
            if len(participants) > 0:
                # 70% train, 15% val, 15% test
                train_p, temp_p = train_test_split(participants, test_size=0.3, random_state=42)
                val_p, test_p = train_test_split(temp_p, test_size=0.5, random_state=42)
                
                train_participants.extend(train_p)
                val_participants.extend(val_p)
                test_participants.extend(test_p)
                
                print(f"   Clase {class_names[cls]}: {len(train_p)} train, {len(val_p)} val, {len(test_p)} test")
        
        # Crear datasets
        train_df = labels_df[labels_df['participant_id'].isin(train_participants)]
        val_df = labels_df[labels_df['participant_id'].isin(val_participants)]
        test_df = labels_df[labels_df['participant_id'].isin(test_participants)]
        
        print(f"\n📈 División final:")
        print(f"   • Entrenamiento: {len(train_df)} imágenes")
        print(f"   • Validación: {len(val_df)} imágenes")
        print(f"   • Test: {len(test_df)} imágenes")
        
        # Inicializar entrenador
        trainer = ROCFRealTrainer(dataset_path, labels_path)
        
        # Entrenar modelo
        model, history = trainer.train_model(
            train_df, val_df, 
            epochs=30,  # Reducido para prueba inicial
            batch_size=16  # Reducido para memoria
        )
        
        # Evaluar modelo
        predictions, predicted_classes = trainer.evaluate_model(model, test_df)
        
        # Guardar gráficos
        trainer.plot_training_history(history)
        
        print("\n🎉 ENTRENAMIENTO COMPLETADO!")
        print("📄 Archivos generados:")
        print("   • best_rocf_model_real.h5 - Mejor modelo")
        print("   • rocf_training_history.png - Historial de entrenamiento")
        print("   • rocf_confusion_matrix.png - Matriz de confusión")
        
    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
