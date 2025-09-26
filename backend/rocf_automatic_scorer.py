"""
Sistema de scoring automático para ROCF basado en criterios neuropsicológicos
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from skimage import measure, morphology
from sklearn.cluster import KMeans
import pandas as pd
import os
from pathlib import Path

class ROCFScorer:
    def __init__(self):
        self.scoring_criteria = {
            'structural_integrity': 0,    # 0-6 puntos
            'detail_accuracy': 0,         # 0-18 puntos  
            'spatial_organization': 0,    # 0-4 puntos
            'line_quality': 0,           # 0-2 puntos
            'total_score': 0             # 0-30 puntos
        }
        
    def analyze_image(self, image_path):
        """Analiza una imagen ROCF y genera puntuación automática"""
        
        # Cargar imagen
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
            
        # Invertir si es necesario (fondo blanco, dibujo negro)
        if np.mean(img) > 127:
            img = 255 - img
            
        # Aplicar umbralización adaptativa
        img_thresh = cv2.adaptiveThreshold(
            img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Análisis de características
        scores = {}
        scores['structural_integrity'] = self._analyze_structure(img_thresh)
        scores['detail_accuracy'] = self._analyze_details(img_thresh)
        scores['spatial_organization'] = self._analyze_spatial_org(img_thresh)
        scores['line_quality'] = self._analyze_line_quality(img_thresh)
        scores['total_score'] = sum(scores.values())
        
        # Clasificación basada en puntuación total
        classification = self._classify_score(scores['total_score'])
        
        return {
            'scores': scores,
            'classification': classification,
            'confidence': self._calculate_confidence(scores)
        }
    
    def _analyze_structure(self, img):
        """Analiza la integridad estructural (0-6 puntos)"""
        
        # Detectar contornos principales
        contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0
            
        # Buscar el contorno más grande (debería ser el rectángulo principal)
        main_contour = max(contours, key=cv2.contourArea)
        
        # Analizar si se parece a un rectángulo
        epsilon = 0.02 * cv2.arcLength(main_contour, True)
        approx = cv2.approxPolyDP(main_contour, epsilon, True)
        
        score = 0
        
        # Puntuación basada en características estructurales
        if len(approx) >= 4:  # Al menos 4 vértices (forma cerrada)
            score += 2
            
        # Área relativa del contorno principal
        total_area = img.shape[0] * img.shape[1]
        main_area = cv2.contourArea(main_contour)
        area_ratio = main_area / total_area
        
        if 0.1 <= area_ratio <= 0.8:  # Tamaño apropiado
            score += 2
            
        # Aspecto ratio del rectángulo delimitador
        x, y, w, h = cv2.boundingRect(main_contour)
        aspect_ratio = w / h if h > 0 else 0
        
        if 1.2 <= aspect_ratio <= 2.0:  # Proporción típica de ROCF
            score += 2
            
        return min(score, 6)
    
    def _analyze_details(self, img):
        """Analiza la precisión de los detalles (0-18 puntos)"""
        
        # Detectar componentes conectados (elementos del dibujo)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(img)
        
        # Filtrar componentes muy pequeños (ruido)
        min_area = 50
        valid_components = stats[stats[:, 4] > min_area]
        
        score = 0
        
        # Puntuación basada en número de elementos detectados
        num_elements = len(valid_components) - 1  # -1 para excluir el fondo
        
        if num_elements >= 15:  # Muchos detalles presentes
            score += 6
        elif num_elements >= 10:
            score += 4
        elif num_elements >= 5:
            score += 2
            
        # Análisis de líneas (detección de bordes)
        edges = cv2.Canny(img, 50, 150)
        line_density = np.sum(edges > 0) / (img.shape[0] * img.shape[1])
        
        if line_density > 0.05:  # Densidad alta de líneas
            score += 6
        elif line_density > 0.03:
            score += 4
        elif line_density > 0.01:
            score += 2
            
        # Análisis de esquinas (puntos de interés)
        corners = cv2.goodFeaturesToTrack(img, 100, 0.01, 10)
        if corners is not None:
            num_corners = len(corners)
            if num_corners >= 20:
                score += 6
            elif num_corners >= 10:
                score += 4
            elif num_corners >= 5:
                score += 2
                
        return min(score, 18)
    
    def _analyze_spatial_org(self, img):
        """Analiza la organización espacial (0-4 puntos)"""
        
        # Dividir imagen en cuadrantes
        h, w = img.shape
        quadrants = [
            img[0:h//2, 0:w//2],      # Superior izquierdo
            img[0:h//2, w//2:w],      # Superior derecho
            img[h//2:h, 0:w//2],      # Inferior izquierdo
            img[h//2:h, w//2:w]       # Inferior derecho
        ]
        
        # Calcular densidad de píxeles en cada cuadrante
        densities = [np.sum(q > 0) / (q.shape[0] * q.shape[1]) for q in quadrants]
        
        score = 0
        
        # Verificar distribución equilibrada
        if max(densities) - min(densities) < 0.15:  # Distribución uniforme
            score += 2
            
        # Verificar que hay contenido en todos los cuadrantes
        if all(d > 0.01 for d in densities):
            score += 2
            
        return min(score, 4)
    
    def _analyze_line_quality(self, img):
        """Analiza la calidad de las líneas (0-2 puntos)"""
        
        # Detectar líneas usando transformada de Hough
        edges = cv2.Canny(img, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, minLineLength=20, maxLineGap=10)
        
        score = 0
        
        if lines is not None:
            # Analizar continuidad de líneas
            total_length = sum(np.sqrt((x2-x1)**2 + (y2-y1)**2) for x1,y1,x2,y2 in lines[:, 0])
            avg_length = total_length / len(lines) if len(lines) > 0 else 0
            
            if avg_length > 30:  # Líneas largas y continuas
                score += 1
                
            # Analizar suavidad (menos fragmentación)
            if len(lines) < 50:  # Pocas líneas = más continuas
                score += 1
                
        return min(score, 2)
    
    def _classify_score(self, total_score):
        """
        Clasificación BINARIA basada en puntuación total
        0: Cognitivamente Sano (≥24/30 - 80% o más)
        1: Deterioro Cognitivo (<24/30 - menos de 80%)
        
        Umbral basado en literatura neuropsicológica para ROCF
        """
        if total_score >= 24:  # 80% o más de la puntuación máxima
            return 0  # Cognitivamente Sano
        else:  # Menos de 80%
            return 1  # Deterioro Cognitivo
    
    def _calculate_confidence(self, scores):
        """
        Calcula confianza de la clasificación BINARIA
        Basada en distancia del umbral y consistencia entre subdominios
        """
        total = scores['total_score']
        
        # Distancia del umbral de decisión (24/30)
        threshold = 24
        distance_from_threshold = abs(total - threshold)
        
        # Confianza basada en distancia: mayor distancia = mayor confianza
        if total >= threshold:
            # Para casos sanos: confianza aumenta con la puntuación
            confidence = 0.7 + min((total - threshold) / 6, 0.25)  # 0.7-0.95
        else:
            # Para casos con deterioro: confianza aumenta al alejarse del umbral
            confidence = 0.6 + min(distance_from_threshold / threshold, 0.3)  # 0.6-0.9
        
        # Ajuste por consistencia entre subdominios
        subdomains = [
            scores['structural_integrity'] / 6,
            scores['detail_accuracy'] / 18,
            scores['spatial_organization'] / 4,
            scores['line_quality'] / 2
        ]
        
        consistency = 1 - np.std(subdomains)  # Mayor consistencia = mayor confianza
        confidence = confidence * (0.8 + consistency * 0.2)
        
        return min(max(confidence, 0.5), 0.99)  # Limitar entre 0.5 y 0.99

def batch_analyze_rocf_dataset(dataset_path, output_path):
    """Analiza todo el dataset y genera clasificaciones"""
    
    scorer = ROCFScorer()
    results = []
    
    dataset_dir = Path(dataset_path)
    
    for img_file in dataset_dir.glob("*.png"):
        result = scorer.analyze_image(str(img_file))
        
        if result:
            results.append({
                'filename': img_file.name,
                'structural_score': result['scores']['structural_integrity'],
                'detail_score': result['scores']['detail_accuracy'], 
                'spatial_score': result['scores']['spatial_organization'],
                'line_score': result['scores']['line_quality'],
                'total_score': result['scores']['total_score'],
                'classification': result['classification'],
                'confidence': result['confidence']
            })
    
    # Guardar resultados
    df = pd.DataFrame(results)
    df.to_csv(output_path, index=False)
    
    # Estadísticas
    print(f"📊 RESULTADOS DEL ANÁLISIS AUTOMÁTICO:")
    print(f"   Total de imágenes analizadas: {len(results)}")
    print(f"   Distribución de clasificaciones:")
    
    class_names = {0: 'Sano', 1: 'Deterioro Cognitivo'}
    for class_id, count in df['classification'].value_counts().sort_index().items():
        print(f"     {class_names[class_id]}: {count} ({count/len(df)*100:.1f}%)")
    
    print(f"   Puntuación promedio: {df['total_score'].mean():.1f}/30")
    print(f"   Confianza promedio: {df['confidence'].mean():.2f}")
    
    return df

if __name__ == "__main__":
    # Ejemplo de uso
    dataset_path = "rocfd528_binary_images"
    output_path = "rocf_automatic_classification.csv"
    
    if os.path.exists(dataset_path):
        print("🤖 Iniciando análisis automático del dataset ROCF...")
        results_df = batch_analyze_rocf_dataset(dataset_path, output_path)
        print(f"💾 Resultados guardados en: {output_path}")
    else:
        print(f"❌ Dataset no encontrado: {dataset_path}")
