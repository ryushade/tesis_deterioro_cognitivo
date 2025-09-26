"""
Servicio de predicción ROCF para integración con la aplicación web
"""

import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import json
from datetime import datetime
from pathlib import Path

class ROCFPredictionService:
    def __init__(self, model_path=None):
        self.model_path = model_path or 'best_rocf_model.h5'
        self.model = None
        self.img_size = 384
        self.class_names = {
            0: 'Cognitivamente Sano',
            1: 'Deterioro Cognitivo Leve',
            2: 'Deterioro Cognitivo Grave'
        }
        self.confidence_thresholds = {
            'alta': 0.8,
            'media': 0.6,
            'baja': 0.4
        }
        
    def load_model(self):
        """Carga el modelo entrenado"""
        try:
            if os.path.exists(self.model_path):
                self.model = keras.models.load_model(self.model_path)
                print(f"✅ Modelo ROCF cargado desde: {self.model_path}")
                return True
            else:
                print(f"❌ Modelo no encontrado: {self.model_path}")
                return False
        except Exception as e:
            print(f"❌ Error cargando modelo: {str(e)}")
            return False
    
    def preprocess_image(self, image_data):
        """
        Preprocesa imagen para predicción
        
        Args:
            image_data: Puede ser:
                - Path a archivo de imagen
                - Array de numpy
                - Bytes de imagen
        
        Returns:
            np.array: Imagen preprocesada
        """
        try:
            # Si es un path
            if isinstance(image_data, (str, Path)):
                img = cv2.imread(str(image_data), cv2.IMREAD_GRAYSCALE)
            
            # Si es bytes
            elif isinstance(image_data, bytes):
                nparr = np.frombuffer(image_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            
            # Si ya es array
            elif isinstance(image_data, np.ndarray):
                img = image_data
                if len(img.shape) == 3:
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            else:
                raise ValueError(f"Tipo de imagen no soportado: {type(image_data)}")
            
            if img is None:
                raise ValueError("No se pudo cargar la imagen")
            
            # Redimensionar
            img = cv2.resize(img, (self.img_size, self.img_size))
            
            # Normalizar
            img = img.astype(np.float32) / 255.0
            
            # Expandir dimensiones para el modelo
            img = np.expand_dims(img, axis=0)  # Batch dimension
            img = np.expand_dims(img, axis=-1)  # Channel dimension
            
            return img
            
        except Exception as e:
            raise Exception(f"Error en preprocesamiento: {str(e)}")
    
    def predict(self, image_data, return_probabilities=True):
        """
        Realiza predicción sobre una imagen
        
        Args:
            image_data: Datos de la imagen
            return_probabilities: Si retornar probabilidades detalladas
        
        Returns:
            dict: Resultado de la predicción
        """
        if self.model is None:
            if not self.load_model():
                raise Exception("No se pudo cargar el modelo")
        
        try:
            # Preprocesar imagen
            processed_img = self.preprocess_image(image_data)
            
            # Realizar predicción
            predictions = self.model.predict(processed_img, verbose=0)
            probabilities = predictions[0]
            
            # Clase predicha
            predicted_class = int(np.argmax(probabilities))
            confidence = float(probabilities[predicted_class])
            
            # Nivel de confianza
            confidence_level = self._get_confidence_level(confidence)
            
            # Preparar resultado
            result = {
                'predicted_class': predicted_class,
                'predicted_label': self.class_names[predicted_class],
                'confidence': confidence,
                'confidence_level': confidence_level,
                'timestamp': datetime.now().isoformat(),
                'model_version': getattr(self.model, 'version', '1.0')
            }
            
            if return_probabilities:
                result['probabilities'] = {
                    self.class_names[i]: float(prob) 
                    for i, prob in enumerate(probabilities)
                }
            
            # Recomendaciones clínicas
            result['clinical_recommendation'] = self._get_clinical_recommendation(
                predicted_class, confidence
            )
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en predicción: {str(e)}")
    
    def _get_confidence_level(self, confidence):
        """Determina el nivel de confianza"""
        if confidence >= self.confidence_thresholds['alta']:
            return 'alta'
        elif confidence >= self.confidence_thresholds['media']:
            return 'media'
        else:
            return 'baja'
    
    def _get_clinical_recommendation(self, predicted_class, confidence):
        """Genera recomendaciones clínicas basadas en la predicción"""
        recommendations = {
            0: {  # Cognitivamente Sano
                'alta': "Patrón de dibujo normal. Se sugiere seguimiento rutinario.",
                'media': "Patrón probablemente normal. Considerar evaluación adicional.",
                'baja': "Resultado incierto. Se recomienda evaluación neuropsicológica completa."
            },
            1: {  # Deterioro Leve
                'alta': "Indicadores de deterioro cognitivo leve. Se recomienda evaluación neuropsicológica detallada.",
                'media': "Posibles signos de deterioro leve. Seguimiento cercano recomendado.",
                'baja': "Resultado incierto. Evaluación clínica adicional necesaria."
            },
            2: {  # Deterioro Grave
                'alta': "Indicadores de deterioro cognitivo significativo. Evaluación neurológica urgente recomendada.",
                'media': "Posibles signos de deterioro grave. Consulta especializada prioritaria.",
                'baja': "Resultado incierto con posibles signos de deterioro. Evaluación inmediata recomendada."
            }
        }
        
        confidence_level = self._get_confidence_level(confidence)
        return recommendations[predicted_class][confidence_level]
    
    def batch_predict(self, image_list):
        """Predicción en lote para múltiples imágenes"""
        results = []
        for i, image_data in enumerate(image_list):
            try:
                result = self.predict(image_data)
                result['image_index'] = i
                results.append(result)
            except Exception as e:
                results.append({
                    'image_index': i,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
        
        return results
    
    def save_prediction_log(self, result, patient_id=None, image_path=None):
        """Guarda log de predicción para auditoría"""
        log_dir = Path('logs/rocf_predictions')
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_entry = {
            'patient_id': patient_id,
            'image_path': str(image_path) if image_path else None,
            'prediction_result': result,
            'timestamp': datetime.now().isoformat()
        }
        
        # Guardar en archivo diario
        date_str = datetime.now().strftime('%Y-%m-%d')
        log_file = log_dir / f'rocf_predictions_{date_str}.json'
        
        # Leer logs existentes o crear nuevo
        if log_file.exists():
            with open(log_file, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        # Guardar logs actualizados
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)

def main():
    """Función de prueba"""
    # Ejemplo de uso del servicio
    service = ROCFPredictionService()
    
    # Verificar si existe el modelo
    if not os.path.exists(service.model_path):
        print(f"⚠️  Modelo no encontrado: {service.model_path}")
        print("🔧 Ejecuta train_rocf_pipeline.py primero para entrenar el modelo")
        return
    
    # Cargar modelo
    if service.load_model():
        print("🤖 Servicio de predicción ROCF listo")
        print("\n💡 Uso del servicio:")
        print("```python")
        print("service = ROCFPredictionService()")
        print("result = service.predict('path/to/rocf_image.png')")
        print("print(result['predicted_label'])")
        print("print(result['confidence'])")
        print("```")
    else:
        print("❌ No se pudo inicializar el servicio")

if __name__ == "__main__":
    main()
