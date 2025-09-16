"""
Servicio principal para el análisis del Clock Drawing Test (CDT)
Maneja la lógica de negocio y coordinación entre componentes
"""

import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from app.utils.database import db
# Importaciones comentadas para usar nuevo esquema
# from app.models.cdt import CDTEvaluation, CDTCriterio, CDTTemplate
from app.models.evaluaciones import EvaluacionCognitiva, CriterioEvaluacion, Paciente

try:
    from app.services.cdt_analyzer import CDTAnalyzer
    ANALYZER_AVAILABLE = True
except ImportError:
    ANALYZER_AVAILABLE = False
    print("Warning: CDT Analyzer no disponible. Instalar dependencias de ML/CV.")


class CDTService:
    """
    Servicio principal para el manejo del Clock Drawing Test
    """
    
    def __init__(self):
        self.upload_folder = os.path.join(os.getcwd(), 'uploads', 'cdt')
        self.analyzer = None
        
        # Crear directorio de uploads si no existe
        os.makedirs(self.upload_folder, exist_ok=True)
        
        # Inicializar analizador si está disponible
        if ANALYZER_AVAILABLE:
            try:
                self.analyzer = CDTAnalyzer()
            except Exception as e:
                print(f"Error inicializando CDT Analyzer: {e}")
                self.analyzer = None
        
        # Configuración de archivos permitidos
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}
    
    def is_allowed_file(self, filename: str) -> bool:
        """Verifica si el archivo tiene una extensión permitida"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_uploaded_file(self, file: FileStorage) -> Optional[str]:
        """
        Guarda un archivo subido y retorna la ruta
        
        Args:
            file: Archivo subido
            
        Returns:
            Ruta del archivo guardado o None si hay error
        """
        try:
            if not file or not file.filename:
                return None
            
            if not self.is_allowed_file(file.filename):
                return None
            
            # Generar nombre único para el archivo
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(self.upload_folder, unique_filename)
            
            # Guardar archivo
            file.save(file_path)
            
            return file_path
            
        except Exception as e:
            print(f"Error guardando archivo: {e}")
            return None
    
    def analyze_cdt_file(self, file: FileStorage, paciente_id: str) -> Dict[str, Any]:
        """
        Analiza un archivo CDT subido
        
        Args:
            file: Archivo de imagen CDT
            paciente_id: ID del paciente
            
        Returns:
            Resultado del análisis
        """
        try:
            # Verificar que el paciente existe
            from app.models.evaluaciones import Paciente
            paciente = Paciente.query.get(paciente_id)
            if not paciente:
                return {
                    'success': False,
                    'error': 'Paciente no encontrado'
                }
        except ImportError:
            # Si no se puede importar el modelo, continuar sin validación
            pass
            
            # Guardar archivo
            file_path = self.save_uploaded_file(file)
            if not file_path:
                return {
                    'success': False,
                    'error': 'Error guardando archivo o formato no válido'
                }
            
            # Realizar análisis
            if self.analyzer:
                analysis_result = self.analyzer.analyze_cdt_image(file_path, paciente_id)
            else:
                # Análisis básico sin ML si no está disponible el analizador
                analysis_result = self._basic_analysis(file_path, paciente_id, file.filename)
            
            # Guardar resultado en base de datos
            if analysis_result.get('success', False):
                evaluation = self._save_evaluation_to_db(analysis_result, file.filename)
                if evaluation:
                    analysis_result['evaluation_id'] = str(evaluation.id)
                    analysis_result['created_at'] = evaluation.created_at.isoformat()
            
            return analysis_result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error en análisis: {str(e)}'
            }
    
    def _basic_analysis(self, file_path: str, paciente_id: str, original_filename: str) -> Dict[str, Any]:
        """
        Análisis básico cuando no está disponible el analizador ML
        """
        try:
            # Verificar que el archivo existe y es accesible
            if not os.path.exists(file_path):
                raise FileNotFoundError("Archivo no encontrado")
            
            file_size = os.path.getsize(file_path)
            
            # Análisis básico sin ML
            result = {
                'success': True,
                'imagen_path': file_path,
                'paciente_id': paciente_id,
                'puntuacion_total': 5.0,  # Puntuación neutra
                'puntuacion_normalizada': 0.5,
                'criterios': {
                    'contorno_reloj': 1.0,
                    'numeros_presentes': 1.0,
                    'numeros_posicion': 1.0,
                    'manecillas_presentes': 1.0,
                    'manecillas_tiempo': 1.0
                },
                'deteccion': {
                    'confianza': 0.5,
                    'bounding_box': {'x': 0, 'y': 0, 'width': 100, 'height': 100}
                },
                'clasificacion_deterioro': 'Pendiente_Analisis',
                'probabilidad_deterioro': 0.5,
                'caracteristicas_extraidas': {
                    'file_size': file_size,
                    'analysis_type': 'basic'
                },
                'observaciones_ia': 'Análisis básico realizado. Se requiere modelo de ML para análisis completo.',
                'errores_detectados': ['analisis_basico'],
                'modelo_version': 'basic_1.0',
                'tiempo_procesamiento': 0.1
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error en análisis básico: {str(e)}',
                'imagen_path': file_path,
                'tiempo_procesamiento': 0.0
            }
    
    def _save_evaluation_to_db(self, analysis_result: Dict[str, Any], original_filename: str) -> Optional[CDTEvaluation]:
        """
        Guarda el resultado del análisis en la base de datos
        """
        try:
            criterios = analysis_result.get('criterios', {})
            deteccion = analysis_result.get('deteccion', {})
            bbox = deteccion.get('bounding_box', {})
            
            evaluation = CDTEvaluation(
                paciente_id=analysis_result['paciente_id'],
                imagen_path=analysis_result['imagen_path'],
                imagen_original_name=original_filename,
                puntuacion_total=analysis_result.get('puntuacion_total'),
                puntuacion_normalizada=analysis_result.get('puntuacion_normalizada'),
                
                # Criterios CDT
                contorno_reloj=criterios.get('contorno_reloj'),
                numeros_presentes=criterios.get('numeros_presentes'),
                numeros_posicion=criterios.get('numeros_posicion'),
                manecillas_presentes=criterios.get('manecillas_presentes'),
                manecillas_tiempo=criterios.get('manecillas_tiempo'),
                
                # Detección
                deteccion_confianza=deteccion.get('confianza'),
                bounding_box_x=bbox.get('x'),
                bounding_box_y=bbox.get('y'),
                bounding_box_width=bbox.get('width'),
                bounding_box_height=bbox.get('height'),
                
                # Características y clasificación
                caracteristicas_extraidas=analysis_result.get('caracteristicas_extraidas'),
                clasificacion_deterioro=analysis_result.get('clasificacion_deterioro'),
                probabilidad_deterioro=analysis_result.get('probabilidad_deterioro'),
                
                # Observaciones
                observaciones_ia=analysis_result.get('observaciones_ia'),
                errores_detectados=analysis_result.get('errores_detectados'),
                
                # Metadatos
                modelo_version=analysis_result.get('modelo_version'),
                tiempo_procesamiento=analysis_result.get('tiempo_procesamiento')
            )
            
            db.session.add(evaluation)
            db.session.commit()
            
            return evaluation
            
        except Exception as e:
            print(f"Error guardando evaluación en DB: {e}")
            db.session.rollback()
            return None
    
    def get_patient_evaluations(self, paciente_id: str) -> List[Dict[str, Any]]:
        """
        Obtiene todas las evaluaciones CDT de un paciente
        """
        try:
            evaluations = CDTEvaluation.query.filter_by(paciente_id=paciente_id).order_by(
                CDTEvaluation.created_at.desc()
            ).all()
            
            return [evaluation.to_dict() for evaluation in evaluations]
            
        except Exception as e:
            print(f"Error obteniendo evaluaciones del paciente: {e}")
            return []
    
    def get_evaluation_by_id(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene una evaluación específica por ID
        """
        try:
            evaluation = CDTEvaluation.query.get(evaluation_id)
            return evaluation.to_dict() if evaluation else None
            
        except Exception as e:
            print(f"Error obteniendo evaluación: {e}")
            return None
    
    def delete_evaluation(self, evaluation_id: str) -> bool:
        """
        Elimina una evaluación CDT
        """
        try:
            evaluation = CDTEvaluation.query.get(evaluation_id)
            if not evaluation:
                return False
            
            # Eliminar archivo de imagen si existe
            if evaluation.imagen_path and os.path.exists(evaluation.imagen_path):
                try:
                    os.remove(evaluation.imagen_path)
                except:
                    pass  # Continuar aunque no se pueda eliminar el archivo
            
            db.session.delete(evaluation)
            db.session.commit()
            
            return True
            
        except Exception as e:
            print(f"Error eliminando evaluación: {e}")
            db.session.rollback()
            return False
    
    def get_evaluation_statistics(self, paciente_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene estadísticas de las evaluaciones CDT
        """
        try:
            query = CDTEvaluation.query
            
            if paciente_id:
                query = query.filter_by(paciente_id=paciente_id)
            
            evaluations = query.all()
            
            if not evaluations:
                return {
                    'total_evaluations': 0,
                    'average_score': 0,
                    'score_distribution': {},
                    'deterioration_classification': {}
                }
            
            # Calcular estadísticas
            scores = [e.puntuacion_total for e in evaluations if e.puntuacion_total is not None]
            classifications = [e.clasificacion_deterioro for e in evaluations if e.clasificacion_deterioro]
            
            stats = {
                'total_evaluations': len(evaluations),
                'average_score': sum(scores) / len(scores) if scores else 0,
                'min_score': min(scores) if scores else 0,
                'max_score': max(scores) if scores else 0,
                'score_distribution': self._calculate_score_distribution(scores),
                'deterioration_classification': self._calculate_classification_distribution(classifications)
            }
            
            return stats
            
        except Exception as e:
            print(f"Error calculando estadísticas: {e}")
            return {}
    
    def _calculate_score_distribution(self, scores: List[float]) -> Dict[str, int]:
        """Calcula distribución de puntuaciones"""
        distribution = {
            '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0
        }
        
        for score in scores:
            if score < 2:
                distribution['0-2'] += 1
            elif score < 4:
                distribution['2-4'] += 1
            elif score < 6:
                distribution['4-6'] += 1
            elif score < 8:
                distribution['6-8'] += 1
            else:
                distribution['8-10'] += 1
        
        return distribution
    
    def _calculate_classification_distribution(self, classifications: List[str]) -> Dict[str, int]:
        """Calcula distribución de clasificaciones"""
        distribution = {}
        for classification in classifications:
            distribution[classification] = distribution.get(classification, 0) + 1
        return distribution
    
    def analyze_dataset_images(self, dataset_path: str = None) -> Dict[str, Any]:
        """
        Analiza las imágenes del dataset para entrenamiento/validación
        """
        if not dataset_path:
            dataset_path = os.path.join(os.getcwd(), 'dataset')
        
        results = {
            'success': False,
            'analyzed_images': 0,
            'failed_images': 0,
            'results': []
        }
        
        try:
            if not self.analyzer:
                return {
                    'success': False,
                    'error': 'Analizador no disponible'
                }
            
            # Buscar imágenes en el dataset
            for root, dirs, files in os.walk(dataset_path):
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                        file_path = os.path.join(root, file)
                        
                        try:
                            # Analizar imagen
                            result = self.analyzer.analyze_cdt_image(file_path)
                            results['results'].append({
                                'file_path': file_path,
                                'filename': file,
                                'analysis': result
                            })
                            
                            if result.get('success', False):
                                results['analyzed_images'] += 1
                            else:
                                results['failed_images'] += 1
                                
                        except Exception as e:
                            results['failed_images'] += 1
                            results['results'].append({
                                'file_path': file_path,
                                'filename': file,
                                'error': str(e)
                            })
            
            results['success'] = True
            return results
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error analizando dataset: {str(e)}'
            }


# Instancia global del servicio
cdt_service = CDTService()
