"""
Modelo CNN para clasificación de figuras complejas de Rey-Osterrieth
Especializado para detectar deterioro cognitivo
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
import numpy as np
import cv2
from pathlib import Path
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class ROCFClassifier:
    def __init__(self, img_size=384, num_classes=2):
        self.img_size = img_size
        self.num_classes = num_classes
        self.model = None
        
    def create_model(self, input_channels=3):
        """
        Crea modelo CNN especializado para ROCF
        Arquitectura diseñada para capturar patrones de deterioro cognitivo
        """
        inputs = keras.Input(shape=(self.img_size, self.img_size, input_channels))
        
        # Bloque de entrada - captura características básicas del dibujo
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.1)(x)
        
        # Bloque 1 - detecta líneas y formas básicas
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.2)(x)
        
        # Bloque 2 - captura patrones de conexión entre elementos
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.3)(x)
        
        # Bloque 3 - características de alto nivel (organización espacial)
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        x = layers.Dropout(0.4)(x)
        
        # Atención espacial - focaliza en regiones importantes
        attention = layers.Conv2D(1, 1, activation='sigmoid', padding='same')(x)
        x = layers.Multiply()([x, attention])
        
        # Global Average Pooling para reducir parámetros
        x = layers.GlobalAveragePooling2D()(x)
        
        # Capas densas con regularización
        x = layers.Dense(512, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.5)(x)
        
        # Capa de salida
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        self.model = keras.Model(inputs, outputs, name='rocf_classifier')
        
        # Compilar con métricas específicas para clasificación médica
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return self.model
    
    def preprocess_image(self, image_path):
        """Preprocesa imagen individual"""
        img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
            
        # Redimensionar manteniendo aspect ratio
        img = cv2.resize(img, (self.img_size, self.img_size))
        
        # Normalizar
        img = img.astype(np.float32) / 255.0
        
        # Expandir dimensiones
        img = np.expand_dims(img, axis=-1)
        
        return img
    
    def create_data_generators(self, df, labels_df, validation_split=0.2):
        """
        Crea generadores de datos con augmentación específica para ROCF
        """
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        
        # Data augmentation conservativo para mantener características clínicas
        train_datagen = ImageDataGenerator(
            rotation_range=10,  # Rotación limitada
            width_shift_range=0.1,
            height_shift_range=0.1,
            zoom_range=0.1,
            horizontal_flip=False,  # No flip para mantener orientación
            validation_split=validation_split,
            rescale=1./255
        )
        
        validation_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=validation_split
        )
        
        # Preparar DataFrame para generadores
        merged_df = df.merge(labels_df, left_on='participant', right_on='participant_id')
        merged_df['cognitive_status'] = merged_df['cognitive_status'].astype(str)
        
        train_generator = train_datagen.flow_from_dataframe(
            dataframe=merged_df,
            directory=self.dataset_path,
            x_col='filename',
            y_col='cognitive_status',
            target_size=(self.img_size, self.img_size),
            color_mode='grayscale',
            class_mode='sparse',
            batch_size=32,
            subset='training'
        )
        
        validation_generator = validation_datagen.flow_from_dataframe(
            dataframe=merged_df,
            directory=self.dataset_path,
            x_col='filename',
            y_col='cognitive_status',
            target_size=(self.img_size, self.img_size),
            color_mode='grayscale',
            class_mode='sparse',
            batch_size=32,
            subset='validation'
        )
        
        return train_generator, validation_generator
    
    def train_model(self, train_gen, val_gen, epochs=50):
        """Entrena el modelo con callbacks específicos"""
        
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                'best_rocf_model.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        history = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate_model(self, test_gen):
        """Evaluación completa del modelo"""
        # Predicciones
        predictions = self.model.predict(test_gen)
        y_pred = np.argmax(predictions, axis=1)
        y_true = test_gen.classes
        
        # Reporte de clasificación
        class_names = ['Sano', 'Deterioro Leve', 'Deterioro Grave']
        report = classification_report(y_true, y_pred, target_names=class_names)
        
        # Matriz de confusión
        cm = confusion_matrix(y_true, y_pred)
        
        # Visualizar resultados
        self._plot_confusion_matrix(cm, class_names)
        
        return report, cm
    
    def _plot_confusion_matrix(self, cm, class_names):
        """Visualiza matriz de confusión"""
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=class_names, yticklabels=class_names)
        plt.title('Matriz de Confusión - Clasificación ROCF')
        plt.ylabel('Verdadero')
        plt.xlabel('Predicho')
        plt.tight_layout()
        plt.savefig('rocf_confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

def main():
    """Función principal para entrenar el modelo"""
    
    # Configuración
    dataset_path = r"c:\Users\Marco\Desktop\tesis_deterioro_cognitivo\backend\rocfd528_binary_images"
    
    print("🤖 Inicializando clasificador ROCF...")
    classifier = ROCFClassifier()
    
    # Crear modelo
    model = classifier.create_model()
    print(f"📊 Modelo creado con {model.count_params():,} parámetros")
    
    # Mostrar arquitectura
    model.summary()
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("1. Ejecutar analyze_rocf_dataset.py para analizar datos")
    print("2. Completar rocf_labeling_template.csv con etiquetas clínicas")
    print("3. Ejecutar entrenamiento con datos etiquetados")
    print("4. Evaluar rendimiento y ajustar hiperparámetros")

if __name__ == "__main__":
    main()
