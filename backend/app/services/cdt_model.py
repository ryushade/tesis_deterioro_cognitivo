"""
Modelo de clasificación y entrenamiento para CDT
Utiliza TensorFlow/Keras para clasificar el nivel de deterioro cognitivo
"""

import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from typing import Tuple, List, Dict, Any
import json
import pickle
from pathlib import Path


class CDTClassificationModel:
    """
    Modelo de clasificación para el Clock Drawing Test
    """
    
    def __init__(self, input_shape: Tuple[int, int, int] = (224, 224, 3)):
        self.input_shape = input_shape
        self.model = None
        self.history = None
        self.class_names = ['Deterioro_Leve', 'Deterioro_Moderado', 'Deterioro_Severo']
        self.label_mapping = {name: idx for idx, name in enumerate(self.class_names)}
        
    def create_model(self) -> keras.Model:
        """
        Crea el modelo de clasificación CNN
        """
        model = models.Sequential([
            # Capa de entrada
            layers.Input(shape=self.input_shape),
            
            # Primera capa convolucional
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Segunda capa convolucional
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Tercera capa convolucional
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Cuarta capa convolucional
            layers.Conv2D(256, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Capas densas
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            # Capa de salida
            layers.Dense(len(self.class_names), activation='softmax')
        ])
        
        # Compilar modelo
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def create_transfer_learning_model(self) -> keras.Model:
        """
        Crea modelo usando transfer learning con ResNet50
        """
        # Cargar modelo preentrenado
        base_model = keras.applications.ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=self.input_shape
        )
        
        # Congelar capas del modelo base
        base_model.trainable = False
        
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(len(self.class_names), activation='softmax')
        ])
        
        # Compilar
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def load_and_preprocess_dataset(self, dataset_path: str) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Carga y preprocesa el dataset de imágenes CDT
        """
        images = []
        labels = []
        filenames = []
        
        # Asignar etiquetas basadas en el nombre del archivo (R1-R12)
        # Esto es una aproximación - en un caso real necesitarías etiquetas médicas
        def get_label_from_filename(filename: str) -> int:
            # Extraer número de región R1, R2, etc.
            if filename.startswith('R1') or filename.startswith('R2') or filename.startswith('R3'):
                return 0  # Normal
            elif filename.startswith('R4') or filename.startswith('R5') or filename.startswith('R6'):
                return 1  # Deterioro_Leve
            elif filename.startswith('R7') or filename.startswith('R8') or filename.startswith('R9'):
                return 2  # Deterioro_Moderado
            else:  # R10, R11, R12
                return 3  # Deterioro_Severo
        
        # Buscar imágenes en todas las carpetas
        for split in ['train', 'valid', 'test']:
            split_path = os.path.join(dataset_path, split)
            if os.path.exists(split_path):
                for filename in os.listdir(split_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        image_path = os.path.join(split_path, filename)
                        
                        try:
                            # Cargar imagen
                            image = cv2.imread(image_path)
                            if image is None:
                                continue
                                
                            # Convertir BGR a RGB
                            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                            
                            # Redimensionar
                            image = cv2.resize(image, self.input_shape[:2])
                            
                            # Normalizar
                            image = image.astype(np.float32) / 255.0
                            
                            # Obtener etiqueta
                            label = get_label_from_filename(filename)
                            
                            images.append(image)
                            labels.append(label)
                            filenames.append(filename)
                            
                        except Exception as e:
                            print(f"Error procesando {filename}: {e}")
                            continue
        
        return np.array(images), np.array(labels), filenames
    
    def train_model(self, 
                   dataset_path: str, 
                   epochs: int = 50, 
                   batch_size: int = 32,
                   validation_split: float = 0.2,
                   use_transfer_learning: bool = True) -> keras.callbacks.History:
        """
        Entrena el modelo con el dataset
        """
        print("Cargando dataset...")
        X, y, filenames = self.load_and_preprocess_dataset(dataset_path)
        
        if len(X) == 0:
            raise ValueError("No se encontraron imágenes en el dataset")
        
        print(f"Dataset cargado: {len(X)} imágenes")
        print(f"Distribución de clases: {np.bincount(y)}")
        
        # Dividir en train/validation
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, stratify=y, random_state=42
        )
        
        # Crear modelo
        if use_transfer_learning:
            print("Creando modelo con transfer learning...")
            self.create_transfer_learning_model()
        else:
            print("Creando modelo CNN desde cero...")
            self.create_model()
        
        print(f"Modelo creado con {self.model.count_params():,} parámetros")
        
        # Callbacks
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
                'best_cdt_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Data augmentation
        datagen = keras.preprocessing.image.ImageDataGenerator(
            rotation_range=10,
            width_shift_range=0.1,
            height_shift_range=0.1,
            zoom_range=0.1,
            horizontal_flip=False,  # No voltear horizontalmente los relojes
            fill_mode='nearest'
        )
        
        # Entrenar
        print("Iniciando entrenamiento...")
        self.history = self.model.fit(
            datagen.flow(X_train, y_train, batch_size=batch_size),
            epochs=epochs,
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluar en conjunto de validación
        val_loss, val_accuracy = self.model.evaluate(X_val, y_val, verbose=0)
        print(f"Accuracy en validación: {val_accuracy:.4f}")
        
        # Predicciones para reporte de clasificación
        y_pred = self.model.predict(X_val)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        print("\\nReporte de clasificación:")
        print(classification_report(y_val, y_pred_classes, target_names=self.class_names))
        
        return self.history
    
    def evaluate_model(self, test_images: np.ndarray, test_labels: np.ndarray) -> Dict[str, Any]:
        """
        Evalúa el modelo en un conjunto de prueba
        """
        if self.model is None:
            raise ValueError("El modelo no ha sido entrenado o cargado")
        
        # Predicciones
        predictions = self.model.predict(test_images)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Métricas
        accuracy = np.mean(predicted_classes == test_labels)
        
        # Reporte de clasificación
        report = classification_report(
            test_labels, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        
        # Matriz de confusión
        cm = confusion_matrix(test_labels, predicted_classes)
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm.tolist(),
            'predictions': predictions.tolist(),
            'predicted_classes': predicted_classes.tolist()
        }
    
    def predict_single_image(self, image_path: str) -> Dict[str, Any]:
        """
        Realiza predicción en una sola imagen
        """
        if self.model is None:
            raise ValueError("El modelo no ha sido entrenado o cargado")
        
        try:
            # Cargar y preprocesar imagen
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("No se pudo cargar la imagen")
            
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, self.input_shape[:2])
            image = image.astype(np.float32) / 255.0
            
            # Expandir dimensiones para batch
            image_batch = np.expand_dims(image, axis=0)
            
            # Predicción
            prediction = self.model.predict(image_batch, verbose=0)
            predicted_class = np.argmax(prediction[0])
            confidence = float(prediction[0][predicted_class])
            
            # Probabilidades por clase
            class_probabilities = {
                self.class_names[i]: float(prediction[0][i]) 
                for i in range(len(self.class_names))
            }
            
            return {
                'predicted_class': self.class_names[predicted_class],
                'confidence': confidence,
                'class_probabilities': class_probabilities,
                'raw_prediction': prediction[0].tolist()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'predicted_class': None,
                'confidence': 0.0
            }
    
    def save_model(self, model_path: str, include_metadata: bool = True):
        """
        Guarda el modelo entrenado
        """
        if self.model is None:
            raise ValueError("No hay modelo para guardar")
        
        # Guardar modelo
        self.model.save(model_path)
        
        if include_metadata:
            # Guardar metadatos
            metadata = {
                'input_shape': self.input_shape,
                'class_names': self.class_names,
                'label_mapping': self.label_mapping,
                'model_type': 'cdt_classification'
            }
            
            metadata_path = model_path.replace('.h5', '_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        print(f"Modelo guardado en: {model_path}")
    
    def load_model(self, model_path: str):
        """
        Carga un modelo previamente entrenado
        """
        self.model = keras.models.load_model(model_path)
        
        # Cargar metadatos si existen
        metadata_path = model_path.replace('.h5', '_metadata.json')
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                self.input_shape = tuple(metadata['input_shape'])
                self.class_names = metadata['class_names']
                self.label_mapping = metadata['label_mapping']
        
        print(f"Modelo cargado desde: {model_path}")
    
    def plot_training_history(self, save_path: str = None):
        """
        Plotea la historia de entrenamiento
        """
        if self.history is None:
            raise ValueError("No hay historia de entrenamiento para plotear")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Accuracy
        ax1.plot(self.history.history['accuracy'], label='Training Accuracy')
        ax1.plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        
        # Loss
        ax2.plot(self.history.history['loss'], label='Training Loss')
        ax2.plot(self.history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Gráfico guardado en: {save_path}")
        else:
            plt.show()


def train_cdt_model(dataset_path: str, output_path: str = "cdt_model.h5") -> CDTClassificationModel:
    """
    Función principal para entrenar el modelo CDT
    """
    print("Iniciando entrenamiento del modelo CDT...")
    
    # Crear modelo
    model = CDTClassificationModel()
    
    # Entrenar
    try:
        history = model.train_model(
            dataset_path=dataset_path,
            epochs=50,
            batch_size=16,  # Reducir batch size para datasets pequeños
            use_transfer_learning=True
        )
        
        # Guardar modelo
        model.save_model(output_path)
        
        # Plotear historia
        model.plot_training_history(output_path.replace('.h5', '_training_history.png'))
        
        print("Entrenamiento completado exitosamente!")
        return model
        
    except Exception as e:
        print(f"Error durante el entrenamiento: {e}")
        raise


if __name__ == "__main__":
    # Ejemplo de uso
    dataset_path = "../dataset"
    model_path = "cdt_classification_model.h5"
    
    # Entrenar modelo
    model = train_cdt_model(dataset_path, model_path)
