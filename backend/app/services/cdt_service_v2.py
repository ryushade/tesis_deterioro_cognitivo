"""
Servicio CDT adaptado para usar el nuevo esquema de evaluaciones cognitivas
"""
import os
import uuid
import json
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

def convertir_numpy_tipos(obj):
    """Convierte tipos numpy a tipos Python estándar"""
    if isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convertir_numpy_tipos(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convertir_numpy_tipos(v) for v in obj]
    else:
        return obj

from app import db
from app.models.evaluaciones import (
    CodigoAcceso, EvaluacionCognitiva, CriterioEvaluacion,
    crear_evaluacion_cdt, actualizar_resultados_cdt, generar_codigo_acceso
)
# from app.models.evaluaciones import Paciente  # Comentado - usando psycopg2
from app.services.cdt_analyzer import CDTAnalyzer


class CDTServiceV2:
    """
    Servicio CDT usando el nuevo esquema de base de datos
    """
    
    def __init__(self):
        self.analyzer = CDTAnalyzer()
        self.upload_folder = 'uploads/cdt'
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}
        
        # Crear directorio de uploads si no existe
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def _allowed_file(self, filename: str) -> bool:
        """Verificar si el archivo tiene una extensión permitida"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def _save_uploaded_file(self, file: FileStorage) -> str:
        """Guardar archivo subido y retornar la ruta"""
        if not file or not self._allowed_file(file.filename):
            raise ValueError("Archivo no válido")
        
        # Generar nombre único
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{timestamp}_{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Guardar archivo
        filepath = os.path.join(self.upload_folder, unique_filename)
        file.save(filepath)
        
        return filepath
    
    def crear_codigo_acceso(self, id_paciente: int, dias_validez: int = 7, 
                           tipo_evaluacion: str = 'CDT') -> Dict[str, Any]:
        """
        Crear código de acceso para un paciente
        """
        # Comentado temporalmente - migrando a psycopg2
        # paciente = Paciente.query.get(id_paciente)
        # if not paciente:
        #     raise ValueError(f"Paciente {id_paciente} no encontrado")
        
        # Generar código único
        codigo = generar_codigo_acceso(prefijo=tipo_evaluacion)
        
        # Calcular fecha de vencimiento
        from datetime import timedelta, timezone
        vence_at = datetime.now(timezone.utc) + timedelta(days=dias_validez)
        
        # Crear código en BD
        codigo_acceso = CodigoAcceso(
            codigo=codigo,
            id_paciente=id_paciente,
            tipo_evaluacion=tipo_evaluacion,
            vence_at=vence_at
        )
        
        db.session.add(codigo_acceso)
        db.session.commit()
        
        return {
            'id_codigo': codigo_acceso.id_codigo,
            'codigo': codigo_acceso.codigo,
            'paciente': f"Paciente ID: {id_paciente}",  # Temporal - usar servicio psycopg2
            'tipo_evaluacion': tipo_evaluacion,
            'vence_at': vence_at.isoformat(),
            'estado': codigo_acceso.estado
        }
    
    def validar_codigo_acceso(self, codigo: str) -> Dict[str, Any]:
        """
        Validar código de acceso y retornar información
        """
        codigo_acceso = CodigoAcceso.query.filter_by(codigo=codigo).first()
        
        if not codigo_acceso:
            raise ValueError("Código no encontrado")
        
        if not codigo_acceso.esta_disponible:
            estado_detalle = "vencido" if codigo_acceso.esta_vencido else codigo_acceso.estado
            raise ValueError(f"Código no disponible: {estado_detalle}")
        
        return {
            'id_codigo': codigo_acceso.id_codigo,
            'id_paciente': codigo_acceso.id_paciente,
            'paciente': codigo_acceso.paciente.nombre_completo,
            'tipo_evaluacion': codigo_acceso.tipo_evaluacion,
            'vence_at': codigo_acceso.vence_at.isoformat()
        }
    
    def iniciar_evaluacion_cdt(self, codigo: str, archivo_imagen: FileStorage, 
                              metodo_cdt: str = 'foto_movil') -> Dict[str, Any]:
        """
        Iniciar una evaluación CDT usando código de acceso
        """
        # Validar código
        info_codigo = self.validar_codigo_acceso(codigo)
        
        # Guardar imagen
        imagen_path = self._save_uploaded_file(archivo_imagen)
        
        # Crear evaluación
        evaluacion = crear_evaluacion_cdt(
            id_paciente=info_codigo['id_paciente'],
            imagen_url=imagen_path,
            metodo_cdt=metodo_cdt,
            id_codigo=info_codigo['id_codigo']
        )
        
        # Marcar código como usado
        codigo_acceso = CodigoAcceso.query.get(info_codigo['id_codigo'])
        codigo_acceso.estado = 'usado'
        from datetime import timezone
        codigo_acceso.ultimo_uso_en = datetime.now(timezone.utc)
        db.session.commit()
        
        return {
            'id_evaluacion': evaluacion.id_evaluacion,
            'estado': 'iniciada',
            'imagen_guardada': True,
            'paciente': info_codigo['paciente']
        }
    
    def procesar_evaluacion_cdt(self, id_evaluacion: int) -> Dict[str, Any]:
        """
        Procesar evaluación CDT con análisis de visión por computadora
        """
        # Obtener evaluación
        evaluacion = EvaluacionCognitiva.query.get(id_evaluacion)
        if not evaluacion:
            raise ValueError(f"Evaluación {id_evaluacion} no encontrada")
        
        if evaluacion.tipo_evaluacion != 'CDT':
            raise ValueError("Esta evaluación no es de tipo CDT")
        
        if evaluacion.estado_procesamiento != 'pendiente':
            raise ValueError(f"Evaluación en estado: {evaluacion.estado_procesamiento}")
        
        try:
            # Actualizar estado a procesando
            evaluacion.estado_procesamiento = 'procesando'
            db.session.commit()
            
            # Ejecutar análisis
            inicio_tiempo = datetime.now()
            resultado = self.analyzer.analyze_cdt_image(evaluacion.imagen_url)
            tiempo_procesamiento = (datetime.now() - inicio_tiempo).total_seconds()
            
            # Limpiar tipos numpy del resultado
            resultado_limpio = convertir_numpy_tipos(resultado)
            
            # Extraer valores seguros
            confianza_valor = float(resultado_limpio['deteccion']['confianza'])
            puntuacion_total = float(resultado_limpio['puntuacion_total'])
            tiempo_procesamiento = float(resultado_limpio.get('tiempo_procesamiento', 0))
            
            # Preparar datos de criterios
            criterios_data = [
                {
                    'dominio_cognitivo': 'Función Ejecutiva',
                    'subcriterio': 'Contorno del Reloj',
                    'puntuacion_obtenida': resultado_limpio['criterios']['contorno_reloj'],
                    'puntuacion_maxima': 2.0,
                    'observaciones': 'Evaluación automática del contorno circular',
                    'datos_vision': {
                        'circulos_detectados': len(resultado_limpio['caracteristicas_extraidas'].get('circles_detected', [])),
                        'metodo_deteccion': 'HoughCircles + contornos'
                    },
                    'orden_aplicacion': 1
                },
                {
                    'dominio_cognitivo': 'Memoria Semántica',
                    'subcriterio': 'Números Presentes',
                    'puntuacion_obtenida': resultado_limpio['criterios']['numeros_presentes'],
                    'puntuacion_maxima': 2.0,
                    'observaciones': 'Detección de dígitos 1-12',
                    'datos_vision': {
                        'regiones_texto': len(resultado_limpio['caracteristicas_extraidas'].get('text_regions', [])),
                        'metodo_deteccion': 'OCR + análisis espacial'
                    },
                    'orden_aplicacion': 2
                },
                {
                    'dominio_cognitivo': 'Orientación Espacial',
                    'subcriterio': 'Posición de Números',
                    'puntuacion_obtenida': resultado_limpio['criterios']['numeros_posicion'],
                    'puntuacion_maxima': 2.0,
                    'observaciones': 'Evaluación de posicionamiento radial',
                    'datos_vision': {
                        'posiciones_evaluadas': 12,
                        'metodo_deteccion': 'análisis geométrico'
                    },
                    'orden_aplicacion': 3
                },
                {
                    'dominio_cognitivo': 'Función Ejecutiva',
                    'subcriterio': 'Manecillas Presentes',
                    'puntuacion_obtenida': resultado_limpio['criterios']['manecillas_presentes'],
                    'puntuacion_maxima': 2.0,
                    'observaciones': 'Detección de líneas radiales',
                    'datos_vision': {
                        'lineas_detectadas': len(resultado_limpio['caracteristicas_extraidas'].get('lines_detected', [])),
                        'metodo_deteccion': 'HoughLines + filtrado'
                    },
                    'orden_aplicacion': 4
                },
                {
                    'dominio_cognitivo': 'Función Ejecutiva',
                    'subcriterio': 'Tiempo Correcto',
                    'puntuacion_obtenida': resultado_limpio['criterios']['manecillas_tiempo'],
                    'puntuacion_maxima': 2.0,
                    'observaciones': 'Evaluación de hora 10:10',
                    'datos_vision': {
                        'hora_detectada': None,
                        'hora_objetivo': '10:10',
                        'metodo_deteccion': 'análisis angular'
                    },
                    'orden_aplicacion': 5
                }
            ]
            
            # Datos específicos del análisis
            datos_especificos = {
                'analisis_visual': resultado_limpio['criterios'],
                'metricas_tecnicas': resultado_limpio['caracteristicas_extraidas'],
                'errores_identificados': resultado_limpio.get('errores_detectados', []),
                'algoritmo_usado': 'OpenCV 4.12 + análisis geométrico',
                'version_modelo': resultado_limpio.get('modelo_version', 'v1.0'),
                'deteccion_info': resultado_limpio.get('deteccion', {})
            }
            
            # Rutas de archivos (se pueden agregar imágenes procesadas)
            archivos_paths = {
                'imagen_original': evaluacion.imagen_url,
                'timestamp_analisis': datetime.now().isoformat()
            }
            
            # Actualizar evaluación con resultados
            actualizar_resultados_cdt(
                id_evaluacion=id_evaluacion,
                puntuacion_total=puntuacion_total,
                clasificacion=resultado_limpio['clasificacion_deterioro'],
                confianza=confianza_valor,
                tiempo_procesamiento=tiempo_procesamiento,
                criterios_data=criterios_data,
                observaciones=resultado_limpio.get('observaciones_ia'),
                datos_especificos=datos_especificos,
                archivos_paths=archivos_paths
            )
            
            return {
                'id_evaluacion': id_evaluacion,
                'estado': 'completada',
                'puntuacion_total': puntuacion_total,
                'puntuacion_maxima': 10.0,
                'porcentaje_acierto': (puntuacion_total / 10.0) * 100,
                'clasificacion': resultado_limpio['clasificacion_deterioro'],
                'confianza': confianza_valor,
                'tiempo_procesamiento': tiempo_procesamiento,
                'criterios_evaluados': len(criterios_data),
                'observaciones': resultado_limpio.get('observaciones_ia')
            }
            
        except Exception as e:
            # Marcar como fallida en caso de error
            evaluacion.estado_procesamiento = 'fallida'
            evaluacion.observaciones = f"Error durante procesamiento: {str(e)}"
            from datetime import timezone
            evaluacion.actualizado_en = datetime.now(timezone.utc)
            db.session.commit()
            raise e
    
    def obtener_evaluacion(self, id_evaluacion: int) -> Dict[str, Any]:
        """
        Obtener detalles completos de una evaluación
        """
        evaluacion = EvaluacionCognitiva.query.get(id_evaluacion)
        if not evaluacion:
            raise ValueError(f"Evaluación {id_evaluacion} no encontrada")
        
        # Obtener criterios
        criterios = [criterio.to_dict() for criterio in evaluacion.criterios]
        
        resultado = evaluacion.to_dict()
        resultado['criterios'] = criterios
        resultado['paciente'] = {
            'nombre_completo': evaluacion.paciente.nombre_completo,
            'edad': evaluacion.paciente.edad,
            'sexo': evaluacion.paciente.sexo
        }
        
        return resultado
    
    def obtener_evaluaciones_paciente(self, id_paciente: int, 
                                    tipo_evaluacion: str = None) -> list:
        """
        Obtener historial de evaluaciones de un paciente
        """
        query = EvaluacionCognitiva.query.filter_by(id_paciente=id_paciente)
        
        if tipo_evaluacion:
            query = query.filter_by(tipo_evaluacion=tipo_evaluacion)
        
        evaluaciones = query.order_by(EvaluacionCognitiva.fecha_evaluacion.desc()).all()
        
        return [eval.to_dict() for eval in evaluaciones]
    
    def obtener_estadisticas(self) -> Dict[str, Any]:
        """
        Obtener estadísticas generales del sistema CDT
        """
        # Estadísticas básicas
        total_evaluaciones = EvaluacionCognitiva.query.filter_by(tipo_evaluacion='CDT').count()
        evaluaciones_completadas = EvaluacionCognitiva.query.filter_by(
            tipo_evaluacion='CDT', 
            estado_procesamiento='completada'
        ).count()
        
        # Distribución por clasificación
        from sqlalchemy import func
        clasificaciones = db.session.query(
            EvaluacionCognitiva.clasificacion,
            func.count(EvaluacionCognitiva.id_evaluacion).label('cantidad')
        ).filter_by(
            tipo_evaluacion='CDT',
            estado_procesamiento='completada'
        ).group_by(EvaluacionCognitiva.clasificacion).all()
        
        # Promedio de puntuación
        avg_puntuacion = db.session.query(
            func.avg(EvaluacionCognitiva.puntuacion_total)
        ).filter_by(
            tipo_evaluacion='CDT',
            estado_procesamiento='completada'
        ).scalar()
        
        return {
            'total_evaluaciones': total_evaluaciones,
            'evaluaciones_completadas': evaluaciones_completadas,
            'tasa_completado': (evaluaciones_completadas / total_evaluaciones * 100) if total_evaluaciones > 0 else 0,
            'promedio_puntuacion': float(avg_puntuacion) if avg_puntuacion else 0,
            'distribucion_clasificaciones': {
                claif[0]: claif[1] for claif in clasificaciones
            }
        }


# Instancia global del servicio
cdt_service_v2 = CDTServiceV2()
