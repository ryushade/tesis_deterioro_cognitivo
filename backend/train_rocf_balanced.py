"""
Entrenamiento BALANCEADO del clasificador ROCF
Incluye técnicas para manejar desbalance de clases
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
import seaborn as sns

# Imports de TensorFlow
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

# Importar nuestro clasificador
from rocf_classifier import ROCFClassifier

class ROCFBalancedTrainer:
    def __init__(self, dataset_path, labels_path, img_size=(224, 224)):
        self.dataset_path = Path(dataset_path)
        self.labels_path = labels_path
        self.img_size = img_size
        self.classifier = ROCFClassifier(img_size=img_size[0], num_classes=2)
        
    def load_and_preprocess_image(self, image_path):
        """Carga y preprocesa una imagen"""
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return None
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, self.img_size)
            img = img.astype(np.float32) / 255.0
            return img
        except Exception as e:
            print(f"Error procesando {image_path}: {e}")
            return None
    
    def create_balanced_generators(self, train_df, val_df, batch_size=32):
        """Crea generadores balanceados con data augmentation"""
        
        # Data augmentation para la clase minoritaria
        aug_generator = ImageDataGenerator(
            rotation_range=10,
            width_shift_range=0.1,
            height_shift_range=0.1,
            zoom_range=0.1,
            horizontal_flip=False,  # No flip para mantener estructura ROCF
            fill_mode='constant',
            cval=1.0  # Fondo blanco
        )
        
        def balanced_data_generator(df, batch_size, shuffle=True, augment=False):
            """Generador de datos balanceado"""
            while True:
                # Separar por clases
                class_0_df = df[df['classification'] == 0]  # Sanos
                class_1_df = df[df['classification'] == 1]  # Deterioro
                
                # Calcular cuántas muestras por clase en cada batch
                class_0_samples = batch_size // 2
                class_1_samples = batch_size - class_0_samples
                
                # Asegurar que tenemos suficientes muestras de cada clase
                if len(class_0_df) < class_0_samples:
                    class_0_samples = len(class_0_df)
                    class_1_samples = batch_size - class_0_samples
                
                if len(class_1_df) < class_1_samples:
                    class_1_samples = len(class_1_df)
                    class_0_samples = batch_size - class_1_samples
                
                if shuffle:
                    class_0_df = class_0_df.sample(frac=1).reset_index(drop=True)
                    class_1_df = class_1_df.sample(frac=1).reset_index(drop=True)
                
                # Índices para iteración
                idx_0, idx_1 = 0, 0
                
                while True:
                    batch_images = []
                    batch_labels = []
                    
                    # Agregar muestras de clase 0 (sanos)
                    for _ in range(class_0_samples):
                        if idx_0 >= len(class_0_df):
                            idx_0 = 0
                            if shuffle:
                                class_0_df = class_0_df.sample(frac=1).reset_index(drop=True)
                        
                        row = class_0_df.iloc[idx_0]
                        img_path = self.dataset_path / row['filename']
                        img = self.load_and_preprocess_image(img_path)
                        
                        if img is not None:
                            batch_images.append(img)
                            batch_labels.append(0)
                        
                        idx_0 += 1
                    
                    # Agregar muestras de clase 1 (deterioro) con augmentation
                    for _ in range(class_1_samples):
                        if idx_1 >= len(class_1_df):
                            idx_1 = 0
                            if shuffle:
                                class_1_df = class_1_df.sample(frac=1).reset_index(drop=True)
                        
                        row = class_1_df.iloc[idx_1]
                        img_path = self.dataset_path / row['filename']
                        img = self.load_and_preprocess_image(img_path)
                        
                        if img is not None:
                            # Aplicar augmentation a la clase minoritaria si está habilitado
                            if augment and np.random.random() > 0.5:
                                img = img.reshape(1, *img.shape)
                                img = aug_generator.flow(img, batch_size=1).__next__()[0]
                            
                            batch_images.append(img)
                            batch_labels.append(1)
                        
                        idx_1 += 1
                    
                    if len(batch_images) == batch_size:
                        # Mezclar el batch
                        combined = list(zip(batch_images, batch_labels))
                        if shuffle:
                            np.random.shuffle(combined)
                        batch_images, batch_labels = zip(*combined)
                        
                        yield (
                            np.array(batch_images),
                            tf.keras.utils.to_categorical(batch_labels, num_classes=2)
                        )
        
        # Crear generadores
        train_gen = balanced_data_generator(train_df, batch_size, shuffle=True, augment=True)
        val_gen = balanced_data_generator(val_df, batch_size, shuffle=False, augment=False)
        
        return train_gen, val_gen
    
    def weighted_categorical_crossentropy(self, class_weights):
        """Función de loss personalizada con pesos de clase"""
        def loss(y_true, y_pred):
            # Convertir class_weights a tensor
            weights = tf.constant([class_weights[0], class_weights[1]], dtype=tf.float32)
            
            # Calcular loss
            y_pred = tf.clip_by_value(y_pred, tf.keras.backend.epsilon(), 1 - tf.keras.backend.epsilon())
            loss = y_true * tf.math.log(y_pred)
            loss = -tf.reduce_sum(loss, axis=-1)
            
            # Aplicar pesos
            sample_weights = tf.reduce_sum(y_true * weights, axis=-1)
            weighted_loss = loss * sample_weights
            
            return tf.reduce_mean(weighted_loss)
        return loss
    def train_model(self, train_df, val_df, epochs=50, batch_size=32):
        """Entrena el modelo con técnicas de balanceado"""
        print("🚀 Iniciando entrenamiento BALANCEADO...")
        
        # Crear modelo
        model = self.classifier.create_model(input_channels=3)
        
        # Calcular pesos de clase
        y_train = train_df['classification'].values
        class_weights = compute_class_weight(
            'balanced',
            classes=np.unique(y_train),
            y=y_train
        )
        class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}
        
        print(f"📊 Pesos de clase calculados: {class_weight_dict}")
        
        # Usar loss personalizado con pesos
        weighted_loss = self.weighted_categorical_crossentropy(class_weight_dict)
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss=weighted_loss,  # Loss personalizado
            metrics=['accuracy', 'precision', 'recall']
        )
        
        print(f"📊 Modelo creado: {model.count_params():,} parámetros")
        
        # Crear generadores balanceados
        train_gen, val_gen = self.create_balanced_generators(train_df, val_df, batch_size)
        
        # Calcular pasos
        steps_per_epoch = max(len(train_df) // batch_size, 10)
        validation_steps = max(len(val_df) // batch_size, 5)
        
        # Callbacks mejorados
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=15,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=7,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                'best_rocf_model_balanced.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Entrenar con loss personalizado (ya no necesitamos class_weight)
        print(f"🔄 Entrenando por {epochs} épocas con loss balanceado...")
        history = model.fit(
            train_gen,
            steps_per_epoch=steps_per_epoch,
            epochs=epochs,
            validation_data=val_gen,
            validation_steps=validation_steps,
            callbacks=callbacks,
            verbose=1
        )
        
        print("✅ Entrenamiento completado!")
        return model, history
    
    def evaluate_model(self, model, test_df):
        """Evalúa el modelo con métricas detalladas"""
        print("📊 Evaluando modelo balanceado...")
        
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
        prediction_probs = predictions[:, 1]  # Probabilidad de deterioro
        
        # Métricas detalladas
        unique_classes = np.unique(test_labels)
        class_names = ['Sanos', 'Deterioro Cognitivo']
        target_names = [class_names[i] for i in unique_classes]
        
        print("\n📈 RESULTADOS DE EVALUACIÓN BALANCEADA:")
        print(classification_report(
            test_labels, 
            predicted_classes,
            target_names=target_names,
            labels=unique_classes
        ))
        
        # Análisis por clase
        print("\n📊 ANÁLISIS DETALLADO POR CLASE:")
        for cls in unique_classes:
            mask = test_labels == cls
            class_acc = (predicted_classes[mask] == cls).mean() if mask.sum() > 0 else 0
            count = mask.sum()
            avg_prob = prediction_probs[mask].mean() if mask.sum() > 0 else 0
            print(f"   • {class_names[cls]}:")
            print(f"     - Cantidad: {count} imágenes")
            print(f"     - Accuracy: {class_acc:.3f}")
            print(f"     - Prob. promedio deterioro: {avg_prob:.3f}")
        
        # Matriz de confusión mejorada
        cm = confusion_matrix(test_labels, predicted_classes, labels=unique_classes)
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=target_names,
                   yticklabels=target_names)
        plt.title('Matriz de Confusión - Clasificador ROCF Balanceado')
        plt.ylabel('Etiqueta Real')
        plt.xlabel('Predicción')
        
        # Agregar porcentajes
        cm_percent = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                plt.text(j + 0.5, i + 0.7, f'{cm_percent[i, j]:.1%}',
                        ha='center', va='center', fontsize=10, color='red')
        
        plt.tight_layout()
        plt.savefig('rocf_confusion_matrix_balanced.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return predictions, predicted_classes

def main():
    """Función principal de entrenamiento balanceado"""
    print("🧠 ENTRENAMIENTO ROCF BALANCEADO - 2 CLASES")
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
        print("📊 Cargando clasificaciones binarias...")
        labels_df = pd.read_csv(labels_path)
        labels_df['participant_id'] = labels_df['filename'].str.extract(r'(\d+)_ROI')[0].astype(str).str.zfill(3)
        
        print(f"   • Total de imágenes: {len(labels_df)}")
        
        # Distribución de clases
        class_dist = labels_df['classification'].value_counts().sort_index()
        print(f"   • Distribución de clases:")
        class_names = {0: 'Sanos', 1: 'Deterioro Cognitivo'}
        for cls, count in class_dist.items():
            print(f"     - {class_names[cls]}: {count} imágenes ({count/len(labels_df)*100:.1f}%)")
        
        # División por participante
        print("\n✂️  Dividiendo datos por participante...")
        unique_participants = labels_df['participant_id'].unique()
        
        participants_by_class = {}
        for cls in [0, 1]:
            class_participants = labels_df[labels_df['classification'] == cls]['participant_id'].unique()
            participants_by_class[cls] = list(class_participants)
        
        train_participants = []
        val_participants = []
        test_participants = []
        
        for cls, participants in participants_by_class.items():
            if len(participants) > 0:
                train_p, temp_p = train_test_split(participants, test_size=0.3, random_state=42)
                val_p, test_p = train_test_split(temp_p, test_size=0.5, random_state=42)
                
                train_participants.extend(train_p)
                val_participants.extend(val_p)
                test_participants.extend(test_p)
                
                print(f"   {class_names[cls]}: {len(train_p)} train, {len(val_p)} val, {len(test_p)} test")
        
        # Crear datasets
        train_df = labels_df[labels_df['participant_id'].isin(train_participants)]
        val_df = labels_df[labels_df['participant_id'].isin(val_participants)]
        test_df = labels_df[labels_df['participant_id'].isin(test_participants)]
        
        print(f"\n📈 División final:")
        print(f"   • Entrenamiento: {len(train_df)} imágenes")
        print(f"   • Validación: {len(val_df)} imágenes")
        print(f"   • Test: {len(test_df)} imágenes")
        
        # Mostrar distribución por split
        for split_name, split_df in [("Entrenamiento", train_df), ("Validación", val_df), ("Test", test_df)]:
            split_dist = split_df['classification'].value_counts().sort_index()
            print(f"   {split_name}:")
            for cls, count in split_dist.items():
                print(f"     - {class_names[cls]}: {count}")
        
        # Inicializar entrenador
        trainer = ROCFBalancedTrainer(dataset_path, labels_path)
        
        # Entrenar modelo
        model, history = trainer.train_model(
            train_df, val_df, 
            epochs=40,
            batch_size=16
        )
        
        # Evaluar modelo
        predictions, predicted_classes = trainer.evaluate_model(model, test_df)
        
        print("\n🎉 ENTRENAMIENTO BALANCEADO COMPLETADO!")
        print("📄 Archivos generados:")
        print("   • best_rocf_model_balanced.h5 - Modelo balanceado")
        print("   • rocf_confusion_matrix_balanced.png - Matriz de confusión")
        
    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
