import cv2
import numpy as np
import tensorflow as tf
from PIL import Image, ImageDraw, ImageFont
import pandas as pd
import os
import json
import time
from typing import Dict, List, Tuple, Optional, Any
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from scipy import ndimage
from skimage import feature, measure, segmentation
import math


class CDTAnalyzer:
    """
    Analizador del Clock Drawing Test usando visión por computadora e IA
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        self.version = "2.0.0"  # Actualizada con modelo entrenado
        self.class_names = ['Deterioro_Leve', 'Deterioro_Moderado', 'Deterioro_Severo']
        
        # Cargar modelo entrenado automáticamente
        if model_path is None:
            # Buscar modelo entrenado en el directorio actual
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(os.path.dirname(current_dir))
            model_path = os.path.join(backend_dir, 'best_cdt_model.h5')
            
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            print(f"Modelo no encontrado en: {model_path}")
            print("Funcionando solo con análisis de visión por computadora")
        
        # Configuración de criterios CDT estándar
        self.criterios_cdt = {
            'contorno_reloj': {'peso': 0.2, 'max_score': 2.0},
            'numeros_presentes': {'peso': 0.2, 'max_score': 2.0},
            'numeros_posicion': {'peso': 0.2, 'max_score': 2.0},
            'manecillas_presentes': {'peso': 0.2, 'max_score': 2.0},
            'manecillas_tiempo': {'peso': 0.2, 'max_score': 2.0}
        }
        
    def load_model(self, model_path: str):
        """Carga modelo de TensorFlow/Keras"""
        try:
            self.model = tf.keras.models.load_model(model_path)
            print(f"Modelo cargado desde: {model_path}")
        except Exception as e:
            print(f"Error al cargar modelo: {e}")
            self.model = None
    
    def analyze_cdt_image(self, image_path: str, paciente_id: str = None) -> Dict[str, Any]:
        """
        Análisis completo de una imagen CDT
        
        Args:
            image_path: Ruta de la imagen a analizar
            paciente_id: ID del paciente (opcional)
            
        Returns:
            Diccionario con resultados del análisis
        """
        start_time = time.time()
        
        try:
            # Cargar y preprocesar imagen
            image = self.load_and_preprocess_image(image_path)
            if image is None:
                raise ValueError("No se pudo cargar la imagen")
            
            # Detectar región del reloj
            clock_region, bbox = self.detect_clock_region(image)
            
            # Extraer características
            features = self.extract_features(clock_region)
            
            # Evaluar criterios CDT
            cdt_scores = self.evaluate_cdt_criteria(clock_region, features)
            
            # Calcular puntuación total
            total_score = self.calculate_total_score(cdt_scores)
            
            # Clasificar nivel de deterioro
            deterioro_classification = self.classify_cognitive_deterioration(total_score, features)
            
            # Generar observaciones automáticas
            observaciones = self.generate_observations(cdt_scores, features)
            
            processing_time = time.time() - start_time
            
            result = {
                'success': True,
                'imagen_path': image_path,
                'paciente_id': paciente_id,
                'puntuacion_total': total_score,
                'puntuacion_normalizada': total_score / 10.0,
                'criterios': cdt_scores,
                'deteccion': {
                    'confianza': bbox.get('confidence', 0.8) if bbox else 0.0,
                    'bounding_box': bbox
                },
                'clasificacion_deterioro': deterioro_classification['clase'],
                'probabilidad_deterioro': deterioro_classification['probabilidad'],
                'caracteristicas_extraidas': features,
                'observaciones_ia': observaciones,
                'errores_detectados': self.detect_errors(clock_region, features),
                'modelo_version': self.version,
                'tiempo_procesamiento': processing_time
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'imagen_path': image_path,
                'tiempo_procesamiento': time.time() - start_time
            }
    
    def analyze_cdt(self, image: np.ndarray, paciente_id: str = None) -> Dict[str, Any]:
        """
        Análisis completo de una imagen CDT desde OpenCV array
        
        Args:
            image: Imagen de OpenCV (numpy array)
            paciente_id: ID del paciente (opcional)
            
        Returns:
            Diccionario con resultados del análisis
        """
        start_time = time.time()
        
        try:
            # Preprocesar imagen (ya está cargada)
            processed_image = self.preprocess_opencv_image(image)
            if processed_image is None:
                raise ValueError("No se pudo procesar la imagen")
            
            # Detectar región del reloj
            clock_region, bbox = self.detect_clock_region(processed_image)
            
            # Extraer características
            features = self.extract_features(clock_region)
            
            # Evaluar criterios CDT
            cdt_scores = self.evaluate_cdt_criteria(clock_region, features)
            
            # Calcular puntuación total con visión por computadora
            cv_total_score = self.calculate_total_score(cdt_scores)
            
            # Intentar clasificación con modelo entrenado
            model_classification = None
            final_score = cv_total_score
            
            if self.model is not None:
                try:
                    # Preprocesar imagen para el modelo
                    model_input = self.preprocess_image_for_model(clock_region)
                    if model_input is not None:
                        # Hacer predicción con el modelo
                        predictions = self.model.predict(model_input, verbose=0)
                        predicted_class_idx = np.argmax(predictions[0])
                        confidence = float(predictions[0][predicted_class_idx])
                        
                        model_classification = {
                            'clase': self.class_names[predicted_class_idx],
                            'probabilidad': confidence,
                            'metodo': 'modelo_entrenado',
                            'predicciones_todas': [float(p) for p in predictions[0]]
                        }
                        
                        # Ajustar puntuación basada en la clasificación del modelo
                        # Mapear clases a puntuaciones
                        class_to_score = {
                            'Deterioro_Leve': 7.5,      # Puntuación alta
                            'Deterioro_Moderado': 5.0,   # Puntuación media
                            'Deterioro_Severo': 2.5      # Puntuación baja
                        }
                        
                        model_score = class_to_score.get(model_classification['clase'], cv_total_score)
                        
                        # Combinar puntuación de CV y modelo (promedio ponderado)
                        # Dar más peso al modelo si tiene alta confianza
                        weight_model = min(0.8, confidence)  # Máximo 80% al modelo
                        weight_cv = 1.0 - weight_model
                        
                        final_score = (model_score * weight_model) + (cv_total_score * weight_cv)
                        final_score = min(10.0, max(0.0, final_score))
                        
                except Exception as e:
                    print(f"Error usando modelo entrenado: {e}")
                    model_classification = None
            
            # Clasificar nivel de deterioro (usar modelo si disponible, sino CV)
            if model_classification:
                deterioro_classification = model_classification
            else:
                deterioro_classification = self.classify_cognitive_deterioration(final_score, features)
            
            # Generar observaciones automáticas
            observaciones = self.generate_observations(cdt_scores, features)
            
            processing_time = time.time() - start_time
            
            result = {
                'success': True,
                'paciente_id': paciente_id,
                'puntuacion_total': final_score,
                'puntuacion_cv': cv_total_score,  # Puntuación solo de visión por computadora
                'tiempo_precision': cdt_scores.get('manecillas_tiempo', 0),
                'numeros_presentes': cdt_scores.get('numeros_presentes', 0),
                'calidad_dibujo': cdt_scores.get('contorno_reloj', 0),
                'detalles_tiempo': features.get('time_analysis', {}),
                'puntuacion_normalizada': final_score / 10.0,
                'criterios': cdt_scores,
                'deteccion': {
                    'confianza': bbox.get('confidence', 0.8) if bbox else 0.0,
                    'bounding_box': bbox
                },
                'clasificacion_deterioro': deterioro_classification['clase'],
                'probabilidad_deterioro': deterioro_classification['probabilidad'],
                'metodo_clasificacion': deterioro_classification.get('metodo', 'vision_por_computadora'),
                'modelo_disponible': self.model is not None,
                'caracteristicas_extraidas': features,
                'observaciones_ia': observaciones,
                'errores_detectados': self.detect_errors(clock_region, features),
                'modelo_version': self.version,
                'tiempo_procesamiento': processing_time
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'tiempo_procesamiento': time.time() - start_time
            }
    
    def preprocess_opencv_image(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Preprocesa una imagen que ya está en formato OpenCV"""
        try:
            # Si la imagen está en BGR, convertir a RGB
            if len(image.shape) == 3 and image.shape[2] == 3:
                # Asumir que viene en BGR (formato típico de OpenCV)
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Redimensionar si es muy grande (mantener aspect ratio)
            height, width = image.shape[:2]
            if max(height, width) > 1024:
                scale = 1024 / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
            return image
            
        except Exception as e:
            print(f"Error preprocesando imagen OpenCV: {e}")
            return None
    
    def load_and_preprocess_image(self, image_path: str) -> Optional[np.ndarray]:
        """Carga y preprocesa la imagen"""
        try:
            # Cargar imagen
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            # Convertir a RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Redimensionar si es muy grande (mantener aspect ratio)
            height, width = image.shape[:2]
            if max(height, width) > 1024:
                scale = 1024 / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
            return image
            
        except Exception as e:
            print(f"Error cargando imagen: {e}")
            return None
    
    def detect_clock_region(self, image: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """Detecta la región del reloj en la imagen"""
        try:
            # Convertir a escala de grises
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Aplicar filtro gaussiano
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Detectar bordes
            edges = cv2.Canny(blurred, 50, 150)
            
            # Encontrar contornos
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Buscar contorno más circular (posible reloj)
            best_contour = None
            best_score = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area < 1000:  # Muy pequeño
                    continue
                
                # Calcular circularidad
                perimeter = cv2.arcLength(contour, True)
                if perimeter == 0:
                    continue
                
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                # Penalizar si está muy cerca del borde
                x, y, w, h = cv2.boundingRect(contour)
                border_penalty = 1.0
                if x < 10 or y < 10 or x + w > image.shape[1] - 10 or y + h > image.shape[0] - 10:
                    border_penalty = 0.5
                
                score = circularity * border_penalty * np.sqrt(area)
                
                if score > best_score and circularity > 0.3:
                    best_score = score
                    best_contour = contour
            
            if best_contour is not None:
                # Obtener bounding box
                x, y, w, h = cv2.boundingRect(best_contour)
                
                # Expandir un poco la región
                margin = int(min(w, h) * 0.1)
                x = max(0, x - margin)
                y = max(0, y - margin)
                w = min(image.shape[1] - x, w + 2 * margin)
                h = min(image.shape[0] - y, h + 2 * margin)
                
                # Extraer región
                clock_region = image[y:y+h, x:x+w]
                
                bbox = {
                    'x': x, 'y': y, 'width': w, 'height': h,
                    'confidence': min(best_score / 1000, 1.0)
                }
                
                return clock_region, bbox
            else:
                # Si no se encuentra contorno, usar imagen completa
                return image, {'x': 0, 'y': 0, 'width': image.shape[1], 'height': image.shape[0], 'confidence': 0.3}
                
        except Exception as e:
            print(f"Error detectando región del reloj: {e}")
            return image, {'x': 0, 'y': 0, 'width': image.shape[1], 'height': image.shape[0], 'confidence': 0.1}
    
    def extract_features(self, image: np.ndarray) -> Dict[str, Any]:
        """Extrae características de la imagen del reloj"""
        features = {}
        
        try:
            # Convertir a escala de grises
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Características básicas
            features['image_shape'] = image.shape
            features['mean_intensity'] = float(np.mean(gray))
            features['std_intensity'] = float(np.std(gray))
            
            # Detectar círculos (Hough Transform) - parámetros más sensibles
            circles = cv2.HoughCircles(
                gray, cv2.HOUGH_GRADIENT, 1, 30,
                param1=30, param2=20, minRadius=20, maxRadius=500  # Parámetros más permisivos
            )
            
            features['circles_detected'] = []
            if circles is not None:
                circles = np.round(circles[0, :]).astype("int")
                for (x, y, r) in circles:
                    features['circles_detected'].append({
                        'x': int(x), 'y': int(y), 'radius': int(r)
                    })
            
            # Detectar líneas (posibles manecillas) - threshold más bajo para mayor sensibilidad
            edges = cv2.Canny(gray, 30, 100)  # Umbrales más bajos para detectar líneas más tenues
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=30)  # Threshold mucho más bajo
            
            features['lines_detected'] = []
            if lines is not None:
                for line in lines[:10]:  # Limitar a 10 líneas principales
                    rho, theta = line[0]  # lines es un array 3D
                    # Calcular longitud aproximada de la línea
                    length = abs(rho) if abs(rho) > 0 else 100
                    features['lines_detected'].append({
                        'rho': float(rho), 
                        'theta': float(theta),
                        'length': float(length)
                    })
            
            # Detectar texto/números usando contornos
            features['text_regions'] = self.detect_text_regions(gray)
            
            # Características de textura
            features['texture_features'] = self.extract_texture_features(gray)
            
            # Análisis de simetría
            features['symmetry_score'] = self.calculate_symmetry_score(gray)
            
            # Densidad de trazos
            features['stroke_density'] = self.calculate_stroke_density(edges)
            
        except Exception as e:
            print(f"Error extrayendo características: {e}")
            features['error'] = str(e)
        
        return features
    
    def detect_text_regions(self, gray_image: np.ndarray) -> List[Dict]:
        """Detecta regiones que podrían contener números"""
        text_regions = []
        
        try:
            # Binarizar imagen
            _, binary = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Encontrar contornos
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if 10 < area < 5000:  # Rango más amplio para detectar números pequeños y grandes
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = w / float(h)
                    
                    # Filtros más permisivos para posibles números
                    if 0.1 < aspect_ratio < 5.0 and w > 3 and h > 5:  # Más permisivo
                        text_regions.append({
                            'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h),
                            'area': float(area), 'aspect_ratio': float(aspect_ratio)
                        })
            
        except Exception as e:
            print(f"Error detectando regiones de texto: {e}")
        
        return text_regions
    
    def extract_texture_features(self, gray_image: np.ndarray) -> Dict[str, float]:
        """Extrae características de textura usando LBP y otros descriptores"""
        texture_features = {}
        
        try:
            # Local Binary Pattern
            lbp = feature.local_binary_pattern(gray_image, 24, 3, method='uniform')
            texture_features['lbp_mean'] = float(np.mean(lbp))
            texture_features['lbp_std'] = float(np.std(lbp))
            
            # Matriz de co-ocurrencia de niveles de gris
            glcm = feature.graycomatrix(gray_image, [1], [0], levels=256, symmetric=True, normed=True)
            texture_features['glcm_contrast'] = float(feature.graycoprops(glcm, 'contrast')[0, 0])
            texture_features['glcm_dissimilarity'] = float(feature.graycoprops(glcm, 'dissimilarity')[0, 0])
            texture_features['glcm_homogeneity'] = float(feature.graycoprops(glcm, 'homogeneity')[0, 0])
            texture_features['glcm_energy'] = float(feature.graycoprops(glcm, 'energy')[0, 0])
            
        except Exception as e:
            print(f"Error extrayendo características de textura: {e}")
            texture_features['error'] = str(e)
        
        return texture_features
    
    def calculate_symmetry_score(self, gray_image: np.ndarray) -> float:
        """Calcula puntuación de simetría de la imagen"""
        try:
            height, width = gray_image.shape
            
            # Simetría horizontal
            left_half = gray_image[:, :width//2]
            right_half = gray_image[:, width//2:]
            right_half_flipped = np.fliplr(right_half)
            
            # Ajustar tamaños si es necesario
            min_width = min(left_half.shape[1], right_half_flipped.shape[1])
            left_half = left_half[:, :min_width]
            right_half_flipped = right_half_flipped[:, :min_width]
            
            # Calcular correlación
            correlation = np.corrcoef(left_half.flatten(), right_half_flipped.flatten())[0, 1]
            
            return float(max(0, correlation)) if not np.isnan(correlation) else 0.0
            
        except Exception as e:
            print(f"Error calculando simetría: {e}")
            return 0.0
    
    def calculate_stroke_density(self, edges: np.ndarray) -> float:
        """Calcula densidad de trazos en la imagen"""
        try:
            total_pixels = edges.shape[0] * edges.shape[1]
            edge_pixels = np.sum(edges > 0)
            return float(edge_pixels / total_pixels)
        except:
            return 0.0
    
    def evaluate_cdt_criteria(self, image: np.ndarray, features: Dict) -> Dict[str, float]:
        """Evalúa los criterios específicos del CDT"""
        scores = {}
        
        try:
            # 1. Contorno del reloj (0-2 puntos)
            scores['contorno_reloj'] = self.evaluate_clock_contour(features)
            
            # 2. Números presentes (0-2 puntos)
            scores['numeros_presentes'] = self.evaluate_numbers_presence(features)
            
            # 3. Posición de números (0-2 puntos)
            scores['numeros_posicion'] = self.evaluate_numbers_position(features)
            
            # 4. Manecillas presentes (0-2 puntos)
            scores['manecillas_presentes'] = self.evaluate_hands_presence(features)
            
            # 5. Tiempo correcto en manecillas (0-2 puntos) - VERIFICACIÓN CRÍTICA DE 11:10
            scores['manecillas_tiempo'] = self.evaluate_time_accuracy(features, target_time="11:10")
            
        except Exception as e:
            print(f"Error evaluando criterios CDT: {e}")
            # Valores por defecto en caso de error
            for criterio in self.criterios_cdt.keys():
                scores[criterio] = 0.0
        
        return scores
    
    def evaluate_clock_contour(self, features: Dict) -> float:
        """Evalúa la calidad del contorno del reloj"""
        try:
            circles = features.get('circles_detected', [])
            
            if not circles:
                return 0.0  # No se detectó círculo
            
            # Buscar el círculo más grande (probablemente el contorno principal)
            largest_circle = max(circles, key=lambda c: c['radius'])
            radius = largest_circle['radius']
            
            # Evaluar basado en el tamaño y posición del círculo
            if radius < 20:
                return 0.5  # Círculo muy pequeño
            elif radius < 50:
                return 1.0  # Círculo pequeño pero aceptable
            elif radius < 150:
                return 2.0  # Círculo de buen tamaño
            else:
                return 1.5  # Círculo muy grande
                
        except Exception as e:
            print(f"Error evaluando contorno: {e}")
            return 0.0
    
    def evaluate_numbers_presence(self, features: Dict) -> float:
        """Evalúa la presencia de números"""
        try:
            text_regions = features.get('text_regions', [])
            
            # Estimar número de elementos detectados que podrían ser números
            num_candidates = len([r for r in text_regions if 100 < r['area'] < 1000])
            
            if num_candidates >= 10:
                return 2.0  # Probablemente todos los números presentes
            elif num_candidates >= 6:
                return 1.5  # Mayoría de números presentes
            elif num_candidates >= 3:
                return 1.0  # Algunos números presentes
            elif num_candidates >= 1:
                return 0.5  # Pocos números
            else:
                return 0.0  # Sin números detectados
                
        except Exception as e:
            print(f"Error evaluando presencia de números: {e}")
            return 0.0
    
    def evaluate_numbers_position(self, features: Dict) -> float:
        """Evalúa la posición correcta de los números"""
        try:
            text_regions = features.get('text_regions', [])
            circles = features.get('circles_detected', [])
            
            if not circles or not text_regions:
                return 0.0
            
            # Usar el círculo más grande como referencia
            main_circle = max(circles, key=lambda c: c['radius'])
            cx, cy, radius = main_circle['x'], main_circle['y'], main_circle['radius']
            
            # Verificar distribución de números alrededor del círculo
            correctly_positioned = 0
            
            for region in text_regions:
                region_x = region['x'] + region['width'] // 2
                region_y = region['y'] + region['height'] // 2
                
                # Calcular distancia al centro
                distance = np.sqrt((region_x - cx)**2 + (region_y - cy)**2)
                
                # Verificar si está aproximadamente en el perímetro
                if 0.6 * radius < distance < 1.4 * radius:
                    correctly_positioned += 1
            
            # Puntuación basada en números bien posicionados
            if correctly_positioned >= 8:
                return 2.0
            elif correctly_positioned >= 5:
                return 1.5
            elif correctly_positioned >= 3:
                return 1.0
            elif correctly_positioned >= 1:
                return 0.5
            else:
                return 0.0
                
        except Exception as e:
            print(f"Error evaluando posición de números: {e}")
            return 0.0
    
    def evaluate_hands_presence(self, features: Dict) -> float:
        """Evalúa la presencia de manecillas"""
        try:
            lines = features.get('lines_detected', [])
            
            if not lines:
                return 0.0
            
            # Filtrar líneas que podrían ser manecillas (no demasiado horizontales/verticales)
            potential_hands = []
            for line in lines:
                theta = line['theta']
                # Evitar líneas perfectamente horizontales o verticales
                if 0.2 < theta < np.pi - 0.2:
                    potential_hands.append(line)
            
            num_hands = len(potential_hands)
            
            if num_hands >= 2:
                return 2.0  # Ambas manecillas presentes
            elif num_hands == 1:
                return 1.0  # Una manecilla presente
            else:
                return 0.0  # Sin manecillas detectadas
                
        except Exception as e:
            print(f"Error evaluando presencia de manecillas: {e}")
            return 0.0
    
    def evaluate_time_accuracy(self, features: Dict, target_time: str = "11:10") -> float:
        """
        Evalúa si las manecillas apuntan a la hora correcta solicitada
        CRITERIO CRÍTICO: Verificación específica de 11:10
        """
        try:
            lines = features.get('lines_detected', [])
            circles = features.get('circles_detected', [])
            
            if not lines or not circles:
                return 0.0
            
            # Parsear hora objetivo
            target_hour, target_minute = map(int, target_time.split(':'))
            
            # Calcular ángulos esperados para la hora objetivo
            # En un reloj: 0° = 12 en punto, 90° = 3 en punto, etc.
            # Manecilla de minutos: cada minuto = 6 grados desde las 12
            minute_angle_expected = (target_minute * 6) % 360
            
            # Manecilla de horas: cada hora = 30 grados + ajuste por minutos
            hour_angle_expected = ((target_hour % 12) * 30 + (target_minute * 0.5)) % 360
            
            if not lines or len(lines) < 2:
                return 0.0
            
            # Tomar las dos líneas más prominentes como manecillas
            sorted_lines = sorted(lines, key=lambda x: x.get('length', 0), reverse=True)
            hand_lines = sorted_lines[:2]
            
            # Convertir ángulos de líneas detectadas a grados
            detected_angles = []
            for line in hand_lines:
                theta_rad = line['theta']
                # Convertir theta a ángulo de reloj (0° = 12 en punto, sentido horario)
                # theta en HoughLines va de 0 a π, donde 0 es horizontal
                angle_deg = math.degrees(theta_rad)
                # Ajustar para que 0° sea las 12 en punto
                clock_angle = (90 - angle_deg) % 360
                detected_angles.append(clock_angle)
            
            # Calcular diferencias mínimas con ángulos esperados
            best_match_score = 0.0
            best_evaluation = {}
            
            # Probar ambas asignaciones posibles (línea1=hora,línea2=minuto y viceversa)
            for i in range(2):
                if i == 0:
                    # Asignación 1: primera línea = hora, segunda = minuto
                    hour_angle_detected = detected_angles[0]
                    minute_angle_detected = detected_angles[1] if len(detected_angles) > 1 else detected_angles[0]
                else:
                    # Asignación 2: primera línea = minuto, segunda = hora
                    hour_angle_detected = detected_angles[1] if len(detected_angles) > 1 else detected_angles[0]
                    minute_angle_detected = detected_angles[0]
                
                # Calcular diferencias (considerando la naturaleza circular de los ángulos)
                def angle_difference(a1, a2):
                    diff = abs(a1 - a2)
                    return min(diff, 360 - diff)
                
                hour_diff = angle_difference(hour_angle_detected, hour_angle_expected)
                minute_diff = angle_difference(minute_angle_detected, minute_angle_expected)
                
                # Para 11:10 específicamente, los ángulos esperados son:
                # Hora: 335° (entre 11 y 12, 10 minutos después de las 11)
                # Minuto: 60° (en el 2, señalando los 10 minutos)
                # Tolerancias más generosas para detección inicial
                hour_tolerance = 35.0    # ±35 grados para manecilla de hora
                minute_tolerance = 35.0  # ±35 grados para manecilla de minuto
                
                hour_correct = hour_diff <= hour_tolerance
                minute_correct = minute_diff <= minute_tolerance
                
                # Calcular puntuación para esta asignación
                score = 0.0
                if hour_correct and minute_correct:
                    # Ambas manecillas correctas: puntuación completa
                    score = 2.0
                    # Bonus por mayor precisión (más estricto)
                    if hour_diff <= 15 and minute_diff <= 15:
                        score = 2.0
                    elif hour_diff <= 20 and minute_diff <= 20:
                        score = 1.8
                    else:
                        score = 1.5
                elif hour_correct or minute_correct:
                    # Una manecilla correcta: puntuación parcial
                    if hour_correct and hour_diff <= 15:
                        score = 1.2
                    elif minute_correct and minute_diff <= 15:
                        score = 1.2
                    else:
                        score = 1.0
                else:
                    # Ninguna manecilla correcta pero hay manecillas: puntuación mínima
                    score = 0.2
                
                # Guardar detalles de esta evaluación
                evaluation_details = {
                    'assignment': f"hora={hour_angle_detected:.1f}°, minuto={minute_angle_detected:.1f}°",
                    'hour_diff': hour_diff,
                    'minute_diff': minute_diff,
                    'hour_correct': hour_correct,
                    'minute_correct': minute_correct,
                    'score': score
                }
                
                if score > best_match_score:
                    best_match_score = score
                    best_evaluation = evaluation_details
            
            # Guardar información de depuración en features
            features['time_analysis'] = {
                'target_time': target_time,
                'hour_angle_expected': hour_angle_expected,
                'minute_angle_expected': minute_angle_expected,
                'detected_angles': detected_angles,
                'best_score': best_match_score,
                'best_evaluation': best_evaluation,
                'verification_critical': True  # Marcar como verificación crítica
            }
            
            return min(2.0, max(0.0, best_match_score))
                
        except Exception as e:
            print(f"Error evaluando precisión del tiempo: {e}")
            # En caso de error, dar puntuación básica si hay líneas
            if features.get('lines_detected') and len(features['lines_detected']) >= 2:
                return 0.5
            return 0.0
    
    def calculate_total_score(self, cdt_scores: Dict[str, float]) -> float:
        """Calcula la puntuación total del CDT"""
        total = 0.0
        
        for criterio, score in cdt_scores.items():
            if criterio in self.criterios_cdt:
                peso = self.criterios_cdt[criterio]['peso']
                max_score = self.criterios_cdt[criterio]['max_score']
                total += (score / max_score) * peso * 10  # Escala a 10 puntos
        
        return min(10.0, max(0.0, total))
    
    def classify_cognitive_deterioration(self, total_score: float, features: Dict) -> Dict[str, Any]:
        """Clasifica el nivel de deterioro cognitivo basado en la puntuación y modelo"""
        
        # Si tenemos modelo entrenado, usarlo para clasificación más precisa
        if self.model is not None:
            try:
                # Usar el modelo para clasificación
                model_prediction = self.predict_with_model(features)
                if model_prediction:
                    return model_prediction
            except Exception as e:
                print(f"Error usando modelo para clasificación: {e}")
                # Continuar con método tradicional
        
        # Clasificación basada en literatura clínica del CDT (método de respaldo)
        if total_score >= 8.0:
            clase = "Normal"
            probabilidad = 0.9
        elif total_score >= 6.0:
            clase = "Deterioro_Leve"
            probabilidad = 0.8
        elif total_score >= 4.0:
            clase = "Deterioro_Moderado"
            probabilidad = 0.7
        else:
            clase = "Deterioro_Severo"
            probabilidad = 0.6
        
        # Ajustar probabilidad basada en características adicionales
        stroke_density = features.get('stroke_density', 0)
        symmetry = features.get('symmetry_score', 0)
        
        if stroke_density < 0.01:  # Muy pocos trazos
            probabilidad = max(0.5, probabilidad - 0.2)
        
        if symmetry < 0.3:  # Poca simetría
            probabilidad = max(0.5, probabilidad - 0.1)
        
        return {
            'clase': clase,
            'probabilidad': min(1.0, probabilidad),
            'metodo': 'vision_por_computadora'
        }
    
    def predict_with_model(self, features: Dict) -> Optional[Dict[str, Any]]:
        """Usa el modelo entrenado para hacer predicción"""
        try:
            if self.model is None:
                return None
            
            # Nota: Este método necesitaría la imagen preprocesada para el modelo
            # Por ahora, retornar None para que use el método tradicional
            # TODO: Implementar preprocesamiento de imagen para el modelo
            return None
            
        except Exception as e:
            print(f"Error en predicción con modelo: {e}")
            return None
    
    def preprocess_image_for_model(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Preprocesa imagen para el modelo entrenado"""
        try:
            if self.model is None:
                return None
            
            # Redimensionar a tamaño esperado por el modelo (típicamente 224x224)
            img_resized = cv2.resize(image, (224, 224))
            
            # Normalizar píxeles
            img_normalized = img_resized.astype(np.float32) / 255.0
            
            # Expandir dimensiones para batch
            img_batch = np.expand_dims(img_normalized, axis=0)
            
            return img_batch
            
        except Exception as e:
            print(f"Error preprocesando imagen para modelo: {e}")
            return None
    
    def generate_observations(self, cdt_scores: Dict[str, float], features: Dict) -> str:
        """Genera observaciones automáticas del análisis"""
        observations = []
        
        # Analizar cada criterio
        if cdt_scores.get('contorno_reloj', 0) < 1.0:
            observations.append("El contorno del reloj presenta irregularidades o está ausente.")
        
        if cdt_scores.get('numeros_presentes', 0) < 1.5:
            observations.append("Faltan números o hay dificultades en su representación.")
        
        if cdt_scores.get('numeros_posicion', 0) < 1.0:
            observations.append("Los números no están correctamente posicionados alrededor del reloj.")
        
        if cdt_scores.get('manecillas_presentes', 0) < 1.0:
            observations.append("Las manecillas del reloj están ausentes o son difíciles de identificar.")
        
        if cdt_scores.get('manecillas_tiempo', 0) < 1.0:
            observations.append("La representación del tiempo en las manecillas es incorrecta.")
        
        # Observaciones adicionales basadas en características
        circles = features.get('circles_detected', [])
        if not circles:
            observations.append("No se detectó un contorno circular claro.")
        
        text_regions = features.get('text_regions', [])
        if len(text_regions) < 3:
            observations.append("Pocos elementos numéricos identificados.")
        
        if not observations:
            observations.append("El dibujo presenta características generalmente dentro de los parámetros normales.")
        
        return " ".join(observations)
    
    def detect_errors(self, image: np.ndarray, features: Dict) -> List[str]:
        """Detecta errores específicos en el CDT"""
        errors = []
        
        try:
            circles = features.get('circles_detected', [])
            text_regions = features.get('text_regions', [])
            lines = features.get('lines_detected', [])
            
            # Error: Sin círculo principal
            if not circles:
                errors.append("ausencia_contorno_circular")
            
            # Error: Muy pocos números
            if len(text_regions) < 3:
                errors.append("numeros_insuficientes")
            
            # Error: Sin manecillas
            if len(lines) < 2:
                errors.append("manecillas_ausentes")
            
            # Error: Baja densidad de trazos (posible temblor o dificultad motora)
            stroke_density = features.get('stroke_density', 0)
            if stroke_density < 0.005:
                errors.append("trazos_insuficientes")
            
            # Error: Muy alta densidad (posible repetición compulsiva)
            if stroke_density > 0.1:
                errors.append("trazos_excesivos")
            
            # Error: Asimetría severa
            symmetry = features.get('symmetry_score', 0)
            if symmetry < 0.2:
                errors.append("asimetria_severa")
            
        except Exception as e:
            errors.append(f"error_analisis: {str(e)}")
        
        return errors


def create_cdt_analyzer() -> CDTAnalyzer:
    """Factory function para crear una instancia del analizador CDT"""
    return CDTAnalyzer()
