"""
Rutas API para el Clock Drawing Test (CDT)
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.exceptions import RequestEntityTooLarge
import os
import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any

from app.services.cdt_service_v2 import cdt_service_v2 as cdt_service
from app.models.evaluaciones import CodigoAcceso, EvaluacionCognitiva, crear_evaluacion_cdt
# from app.models.evaluaciones import Paciente  # Comentado - usando psycopg2 ahora
from app.utils.database import db
from app import db as sqlalchemy_db

# Crear blueprint para rutas CDT
cdt_bp = Blueprint('cdt', __name__, url_prefix='/api/cdt')


@cdt_bp.route('/validar-codigo', methods=['POST'])
def validar_codigo():
    """
    Valida un código de acceso CDT y devuelve las instrucciones si es válido
    
    JSON esperado:
    {
        "codigo": "CDT-20250916-ABC123"
    }
    """
    try:
        data = request.get_json()
        if not data or 'codigo' not in data:
            return jsonify({
                'success': False,
                'error': 'Código es requerido'
            }), 400
        
        codigo = data['codigo'].strip()
        if not codigo:
            return jsonify({
                'success': False,
                'error': 'Código no puede estar vacío'
            }), 400
        
        # Buscar código en la base de datos
        codigo_acceso = CodigoAcceso.query.filter_by(codigo=codigo).first()
        
        if not codigo_acceso:
            return jsonify({
                'success': False,
                'error': 'Código no encontrado'
            }), 404
        
        # Verificar que el código esté disponible
        if not codigo_acceso.esta_disponible:
            if codigo_acceso.esta_vencido:
                return jsonify({
                    'success': False,
                    'error': 'El código ha expirado'
                }), 410
            else:
                return jsonify({
                    'success': False,
                    'error': 'El código ya ha sido utilizado'
                }), 410
        
        # Obtener información del paciente
        paciente = codigo_acceso.paciente
        if not paciente:
            return jsonify({
                'success': False,
                'error': 'Paciente no encontrado'
            }), 404
        
        # Preparar respuesta con instrucciones CDT
        instrucciones = (
            "Dibuje un reloj que marque las 11:10. "
            "Incluya todos los números del 1 al 12 y las dos manecillas. "
            "Tome su tiempo y haga su mejor esfuerzo."
        )
        
        return jsonify({
            'success': True,
            'codigo_valido': True,
            'instrucciones': instrucciones,
            'tiempo_limite': 300,  # 5 minutos en segundos
            'paciente': {
                'id': paciente.id_paciente,
                'nombre_completo': paciente.nombre_completo,
                'edad': paciente.edad
            },
            'evaluacion': {
                'tipo': codigo_acceso.tipo_evaluacion,
                'codigo_id': codigo_acceso.id_codigo
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error validando código: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/iniciar-evaluacion', methods=['POST'])
def iniciar_evaluacion():
    """
    Inicia una nueva evaluación CDT y marca el código como usado
    
    JSON esperado:
    {
        "codigo": "CDT-20250916-ABC123"
    }
    """
    try:
        data = request.get_json()
        if not data or 'codigo' not in data:
            return jsonify({
                'success': False,
                'error': 'Código es requerido'
            }), 400
        
        codigo = data['codigo'].strip()
        
        # Buscar código en la base de datos
        codigo_acceso = CodigoAcceso.query.filter_by(codigo=codigo).first()
        
        if not codigo_acceso or not codigo_acceso.esta_disponible:
            return jsonify({
                'success': False,
                'error': 'Código no válido o expirado'
            }), 400
        
        # Marcar código como usado
        codigo_acceso.estado = 'usado'
        codigo_acceso.ultimo_uso_en = datetime.now(timezone.utc)
        
        # Crear nueva evaluación en estado pendiente
        evaluacion = crear_evaluacion_cdt(
            id_paciente=codigo_acceso.id_paciente,
            imagen_url=None,  # Se actualizará cuando se suba la imagen
            metodo_cdt='foto_movil',
            id_codigo=codigo_acceso.id_codigo
        )
        
        sqlalchemy_db.session.commit()
        
        return jsonify({
            'success': True,
            'evaluacion_id': evaluacion.id_evaluacion,
            'mensaje': 'Evaluación iniciada correctamente'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error iniciando evaluación: {str(e)}")
        sqlalchemy_db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/subir-imagen', methods=['POST'])
def subir_imagen():
    """
    Sube la imagen del dibujo CDT y actualiza la evaluación
    
    Form data esperada:
    - file: Archivo de imagen (required)
    - evaluacion_id: ID de la evaluación (required)
    """
    try:
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se encontró archivo en la petición'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Verificar evaluacion_id
        evaluacion_id = request.form.get('evaluacion_id')
        if not evaluacion_id:
            return jsonify({
                'success': False,
                'error': 'evaluacion_id es requerido'
            }), 400
        
        # Buscar evaluación
        evaluacion = EvaluacionCognitiva.query.get(evaluacion_id)
        if not evaluacion:
            return jsonify({
                'success': False,
                'error': 'Evaluación no encontrada'
            }), 404
        
        # Verificar que la evaluación esté en estado pendiente
        if evaluacion.estado_procesamiento != 'pendiente':
            return jsonify({
                'success': False,
                'error': 'La evaluación ya ha sido procesada'
            }), 400
        
        # Guardar archivo
        import time
        timestamp = int(time.time())
        filename = f"cdt_{evaluacion_id}_{timestamp}.jpg"
        
        # Crear directorio si no existe
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'cdt')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Actualizar evaluación con la ruta de la imagen
        evaluacion.imagen_url = file_path
        evaluacion.estado_procesamiento = 'procesando'
        
        sqlalchemy_db.session.commit()
        
        # Procesar imagen con análisis real de CDT
        try:
            from app.services.cdt_analyzer import CDTAnalyzer
            
            # Inicializar analizador
            analyzer = CDTAnalyzer()
            
            # Analizar imagen (especificando 11:10 como hora objetivo)
            analysis_result = analyzer.analyze_cdt_image(file_path, paciente_id=str(evaluacion.paciente_id))
            
            if analysis_result.get('success', False):
                # Usar resultados del análisis real
                evaluacion.puntuacion_total = analysis_result['puntuacion_total']
                evaluacion.confianza = analysis_result['deteccion']['confianza']
                evaluacion.tiempo_procesamiento = analysis_result['tiempo_procesamiento']
                evaluacion.estado_procesamiento = 'completada'
                
                # Clasificación basada en puntuación real
                if evaluacion.puntuacion_total >= 8.0:
                    evaluacion.clasificacion = 'Normal'
                elif evaluacion.puntuacion_total >= 6.0:
                    evaluacion.clasificacion = 'Leve alteración'
                elif evaluacion.puntuacion_total >= 4.0:
                    evaluacion.clasificacion = 'Alteración moderada'
                else:
                    evaluacion.clasificacion = 'Alteración severa'
                
                # Generar observaciones detalladas
                observaciones = []
                criterios = analysis_result.get('criterios', {})
                
                # Verificación específica de hora 11:10
                time_analysis = analysis_result.get('caracteristicas_extraidas', {}).get('time_analysis', {})
                if time_analysis.get('verification_critical'):
                    if criterios.get('manecillas_tiempo', 0) >= 1.8:
                        observaciones.append("✓ HORA CORRECTA: Manecillas apuntan correctamente a 11:10")
                    elif criterios.get('manecillas_tiempo', 0) >= 1.0:
                        observaciones.append("⚠ HORA PARCIAL: Una manecilla apunta aproximadamente a 11:10")
                    else:
                        observaciones.append("✗ HORA INCORRECTA: Las manecillas NO marcan 11:10")
                
                # Añadir otras observaciones del análisis IA
                if analysis_result.get('observaciones_ia'):
                    observaciones.extend(analysis_result['observaciones_ia'])
                
                evaluacion.observaciones = '. '.join(observaciones)
                
                # Información adicional de análisis
                evaluacion.detalles_puntuacion = json.dumps({
                    'criterios_detallados': criterios,
                    'analisis_tiempo': time_analysis,
                    'errores_detectados': analysis_result.get('errores_detectados', []),
                    'modelo_version': analysis_result.get('modelo_version', '1.0.0')
                })
                
            else:
                # Si falla el análisis, usar valores por defecto con observación del error
                current_app.logger.warning(f"Análisis CDT falló: {analysis_result.get('error', 'Error desconocido')}")
                evaluacion.puntuacion_total = 0.0
                evaluacion.clasificacion = 'Error en análisis'
                evaluacion.confianza = 0.0
                evaluacion.tiempo_procesamiento = 1.0
                evaluacion.estado_procesamiento = 'fallida'
                evaluacion.observaciones = f"Error en análisis automático: {analysis_result.get('error', 'No se pudo procesar la imagen')}"
            
        except ImportError:
            # Si no está disponible el analizador, usar valores simulados con advertencia
            current_app.logger.warning("Analizador CDT no disponible, usando valores simulados")
            evaluacion.puntuacion_total = 5.0  # Puntuación neutra para indicar análisis simulado
            evaluacion.clasificacion = 'Análisis simulado'
            evaluacion.confianza = 0.5
            evaluacion.tiempo_procesamiento = 1.0
            evaluacion.estado_procesamiento = 'completada'
            evaluacion.observaciones = 'ANÁLISIS SIMULADO: Para análisis real, instalar dependencias de visión computacional (opencv-python, scikit-image, tensorflow)'
        
        except Exception as proc_error:
            current_app.logger.error(f"Error procesando imagen: {str(proc_error)}")
            evaluacion.puntuacion_total = 0.0
            evaluacion.clasificacion = 'Error en procesamiento'
            evaluacion.confianza = 0.0
            evaluacion.tiempo_procesamiento = 1.0
            evaluacion.estado_procesamiento = 'fallida'
            evaluacion.observaciones = f'Error en procesamiento: {str(proc_error)}'
        
        return jsonify({
            'success': True,
            'evaluacion_id': evaluacion.id_evaluacion,
            'mensaje': 'Imagen procesada correctamente',
            'imagen_guardada': filename,
            'evaluacion': {
                'id_evaluacion': evaluacion.id_evaluacion,
                'puntuacion_total': float(evaluacion.puntuacion_total),
                'puntuacion_maxima': float(evaluacion.puntuacion_maxima),
                'porcentaje_acierto': evaluacion.porcentaje_acierto,
                'clasificacion': evaluacion.clasificacion,
                'confianza': float(evaluacion.confianza) if evaluacion.confianza else None,
                'estado_procesamiento': evaluacion.estado_procesamiento,
                'tiempo_procesamiento': float(evaluacion.tiempo_procesamiento) if evaluacion.tiempo_procesamiento else None,
                'observaciones': evaluacion.observaciones,
                'fecha_evaluacion': evaluacion.fecha_evaluacion.isoformat() if evaluacion.fecha_evaluacion else None
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error subiendo imagen: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/analyze', methods=['POST'])
def analyze_cdt():
    """
    Analiza una imagen CDT subida por el usuario
    
    Form data esperada:
    - file: Archivo de imagen (required)
    - paciente_id: ID del paciente (required)
    """
    try:
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se encontró archivo en la petición'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Verificar paciente_id
        paciente_id = request.form.get('paciente_id')
        if not paciente_id:
            return jsonify({
                'success': False,
                'error': 'paciente_id es requerido'
            }), 400
        
        # Validar que el paciente existe
        try:
            uuid.UUID(paciente_id)  # Validar formato UUID
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'paciente_id debe ser un UUID válido'
            }), 400
        
        # Comentado temporalmente - migrando a psycopg2
        # paciente = Paciente.query.get(paciente_id)
        # if not paciente:
        #     return jsonify({
        #         'success': False,
        #         'error': 'Paciente no encontrado'
        #     }), 404
        
        # Verificar tamaño del archivo
        if file.content_length and file.content_length > 10 * 1024 * 1024:  # 10MB
            return jsonify({
                'success': False,
                'error': 'El archivo es demasiado grande (máximo 10MB)'
            }), 413
        
        # Realizar análisis
        result = cdt_service.analyze_cdt_file(file, paciente_id)
        
        if result.get('success', False):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except RequestEntityTooLarge:
        return jsonify({
            'success': False,
            'error': 'El archivo es demasiado grande'
        }), 413
        
    except Exception as e:
        current_app.logger.error(f"Error en análisis CDT: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/patient/<patient_id>/evaluations', methods=['GET'])
def get_patient_evaluations(patient_id: str):
    """
    Obtiene todas las evaluaciones CDT de un paciente específico
    """
    try:
        # Validar UUID
        try:
            uuid.UUID(patient_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'ID de paciente inválido'
            }), 400
        
        # Comentado temporalmente - migrando a psycopg2
        # paciente = Paciente.query.get(patient_id)
        # if not paciente:
        #     return jsonify({
        #         'success': False,
        #         'error': 'Paciente no encontrado'
        #     }), 404
        
        # Obtener evaluaciones
        evaluations = cdt_service.get_patient_evaluations(patient_id)
        
        return jsonify({
            'success': True,
            'paciente_id': patient_id,
            'total_evaluations': len(evaluations),
            'evaluations': evaluations
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo evaluaciones: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/evaluation/<evaluation_id>', methods=['GET'])
def get_evaluation_detail(evaluation_id: str):
    """
    Obtiene detalles de una evaluación específica
    """
    try:
        # Validar UUID
        try:
            uuid.UUID(evaluation_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'ID de evaluación inválido'
            }), 400
        
        # Obtener evaluación
        evaluation = cdt_service.get_evaluation_by_id(evaluation_id)
        
        if not evaluation:
            return jsonify({
                'success': False,
                'error': 'Evaluación no encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo evaluación: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/evaluation/<evaluation_id>', methods=['DELETE'])
def delete_evaluation(evaluation_id: str):
    """
    Elimina una evaluación CDT
    """
    try:
        # Validar UUID
        try:
            uuid.UUID(evaluation_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'ID de evaluación inválido'
            }), 400
        
        # Eliminar evaluación
        success = cdt_service.delete_evaluation(evaluation_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Evaluación eliminada correctamente'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Evaluación no encontrada'
            }), 404
            
    except Exception as e:
        current_app.logger.error(f"Error eliminando evaluación: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/evaluation/<evaluation_id>/image', methods=['GET'])
def get_evaluation_image(evaluation_id: str):
    """
    Obtiene la imagen de una evaluación CDT
    """
    try:
        # Validar UUID
        try:
            uuid.UUID(evaluation_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'ID de evaluación inválido'
            }), 400
        
        # Obtener evaluación
        evaluation = cdt_service.get_evaluation_by_id(evaluation_id)
        
        if not evaluation:
            return jsonify({
                'success': False,
                'error': 'Evaluación no encontrada'
            }), 404
        
        # Verificar que existe el archivo de imagen
        image_path = evaluation.get('imagen_path')
        if not image_path or not os.path.exists(image_path):
            return jsonify({
                'success': False,
                'error': 'Imagen no encontrada'
            }), 404
        
        # Enviar archivo
        return send_file(
            image_path,
            as_attachment=False,
            download_name=evaluation.get('imagen_original_name', 'cdt_image.jpg')
        )
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo imagen: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """
    Obtiene estadísticas generales de las evaluaciones CDT
    """
    try:
        # Parámetro opcional para filtrar por paciente
        paciente_id = request.args.get('paciente_id')
        
        if paciente_id:
            # Validar UUID si se proporciona
            try:
                uuid.UUID(paciente_id)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'ID de paciente inválido'
                }), 400
        
        # Obtener estadísticas
        stats = cdt_service.get_evaluation_statistics(paciente_id)
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'filtered_by_patient': paciente_id is not None,
            'paciente_id': paciente_id
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/train-model', methods=['POST'])
def train_model():
    """
    Entrena el modelo de clasificación CDT
    
    JSON esperado:
    {
        "dataset_path": "ruta/al/dataset",  // opcional
        "epochs": 50,  // opcional
        "batch_size": 16,  // opcional
        "use_transfer_learning": true  // opcional
    }
    """
    try:
        from app.services.cdt_model import CDTClassificationModel
        
        data = request.get_json() or {}
        
        # Parámetros de entrenamiento
        dataset_path = data.get('dataset_path', os.path.join(os.getcwd(), 'dataset'))
        epochs = data.get('epochs', 30)  # Reducir épocas por defecto
        batch_size = data.get('batch_size', 16)
        use_transfer_learning = data.get('use_transfer_learning', True)
        validation_split = data.get('validation_split', 0.2)
        
        # Verificar que existe el dataset
        if not os.path.exists(dataset_path):
            return jsonify({
                'success': False,
                'error': f'Dataset no encontrado en: {dataset_path}'
            }), 400
        
        # Verificar estructura del dataset
        required_folders = ['train', 'valid', 'test']
        missing_folders = []
        for folder in required_folders:
            folder_path = os.path.join(dataset_path, folder)
            if not os.path.exists(folder_path):
                missing_folders.append(folder)
        
        if missing_folders:
            return jsonify({
                'success': False,
                'error': f'Faltan carpetas en el dataset: {missing_folders}',
                'dataset_structure_required': {
                    'dataset/': ['train/', 'valid/', 'test/']
                }
            }), 400
        
        # Crear modelo y entrenar
        model = CDTClassificationModel()
        
        print(f"Iniciando entrenamiento con {epochs} épocas...")
        
        # Esto debería ejecutarse en un hilo separado en producción
        history = model.train_model(
            dataset_path=dataset_path,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            use_transfer_learning=use_transfer_learning
        )
        
        # Guardar modelo
        model_path = os.path.join(os.getcwd(), 'models', 'cdt_model.h5')
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        model.save_model(model_path)
        
        # Estadísticas finales
        final_accuracy = history.history['val_accuracy'][-1] if 'val_accuracy' in history.history else 0
        final_loss = history.history['val_loss'][-1] if 'val_loss' in history.history else 0
        
        return jsonify({
            'success': True,
            'message': 'Modelo entrenado exitosamente',
            'model_path': model_path,
            'training_stats': {
                'epochs_completed': len(history.history.get('loss', [])),
                'final_validation_accuracy': float(final_accuracy),
                'final_validation_loss': float(final_loss),
                'parameters': int(model.model.count_params()) if model.model else 0
            },
            'training_config': {
                'epochs': epochs,
                'batch_size': batch_size,
                'use_transfer_learning': use_transfer_learning,
                'validation_split': validation_split
            }
        }), 200
        
    except ImportError:
        return jsonify({
            'success': False,
            'error': 'Dependencias de ML no disponibles. Instalar TensorFlow y otras librerías.'
        }), 503
        
    except Exception as e:
        current_app.logger.error(f"Error entrenando modelo: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error durante el entrenamiento: {str(e)}'
        }), 500


@cdt_bp.route('/model/status', methods=['GET'])
def get_model_status():
    """
    Obtiene el estado del modelo de clasificación
    """
    try:
        model_path = os.path.join(os.getcwd(), 'models', 'cdt_model.h5')
        metadata_path = model_path.replace('.h5', '_metadata.json')
        
        status = {
            'model_exists': os.path.exists(model_path),
            'model_path': model_path if os.path.exists(model_path) else None,
            'model_size_mb': 0,
            'metadata_exists': os.path.exists(metadata_path),
            'last_modified': None,
            'analyzer_using_model': False
        }
        
        if status['model_exists']:
            # Información del archivo
            stat = os.stat(model_path)
            status['model_size_mb'] = round(stat.st_size / (1024 * 1024), 2)
            status['last_modified'] = stat.st_mtime
            
            # Verificar si el analizador lo está usando
            status['analyzer_using_model'] = cdt_service.analyzer and cdt_service.analyzer.model is not None
        
        # Información de metadatos
        if status['metadata_exists']:
            try:
                import json
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    status['metadata'] = metadata
            except:
                status['metadata'] = None
        
        return jsonify({
            'success': True,
            'model_status': status
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estado del modelo: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/model/load', methods=['POST'])
def load_model():
    """
    Carga el modelo entrenado en el analizador CDT
    """
    try:
        data = request.get_json() or {}
        model_path = data.get('model_path', os.path.join(os.getcwd(), 'models', 'cdt_model.h5'))
        
        if not os.path.exists(model_path):
            return jsonify({
                'success': False,
                'error': f'Modelo no encontrado en: {model_path}'
            }), 404
        
        # Cargar modelo en el analizador
        if cdt_service.analyzer:
            cdt_service.analyzer.load_model(model_path)
            return jsonify({
                'success': True,
                'message': 'Modelo cargado exitosamente en el analizador',
                'model_path': model_path
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Analizador CDT no disponible'
            }), 503
            
    except Exception as e:
        current_app.logger.error(f"Error cargando modelo: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error cargando modelo: {str(e)}'
        }), 500


@cdt_bp.route('/analyze-dataset', methods=['POST'])
def analyze_dataset():
    """
    Analiza todas las imágenes del dataset (para desarrollo/testing)
    """
    try:
        # Obtener ruta del dataset (opcional)
        data = request.get_json() or {}
        dataset_path = data.get('dataset_path')
        
        # Realizar análisis del dataset
        result = cdt_service.analyze_dataset_images(dataset_path)
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        current_app.logger.error(f"Error analizando dataset: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/info', methods=['GET'])
def get_cdt_info():
    """
    Obtiene información general sobre el sistema CDT
    """
    try:
        from app.services.cdt_service import ANALYZER_AVAILABLE
        
        info = {
            'analyzer_available': ANALYZER_AVAILABLE,
            'supported_formats': list(cdt_service.allowed_extensions),
            'max_file_size_mb': 10,
            'version': '1.0.0',
            'criterios_evaluacion': [
                {
                    'nombre': 'Contorno del reloj',
                    'descripcion': 'Presencia y calidad del círculo principal',
                    'puntuacion_maxima': 2
                },
                {
                    'nombre': 'Números presentes',
                    'descripcion': 'Presencia de números 1-12',
                    'puntuacion_maxima': 2
                },
                {
                    'nombre': 'Posición de números',
                    'descripcion': 'Ubicación correcta de los números',
                    'puntuacion_maxima': 2
                },
                {
                    'nombre': 'Manecillas presentes',
                    'descripcion': 'Presencia de ambas manecillas',
                    'puntuacion_maxima': 2
                },
                {
                    'nombre': 'Tiempo correcto',
                    'descripcion': 'Precisión en la representación del tiempo',
                    'puntuacion_maxima': 2
                }
            ],
            'clasificaciones_deterioro': [
                'Normal',
                'Deterioro_Leve',
                'Deterioro_Moderado',
                'Deterioro_Severo'
            ]
        }
        
        return jsonify({
            'success': True,
            'info': info
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo información CDT: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@cdt_bp.route('/demo-analyze', methods=['POST'])
def demo_analyze():
    """
    Endpoint específico para demo - analiza imagen CDT sin requerir evaluación previa
    
    Form data esperada:
    - file: Archivo de imagen (required)
    - paciente_id: ID opcional del paciente (para demo)
    """
    try:
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se encontró archivo en la petición'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Validar tipo de archivo
        allowed_extensions = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({
                'success': False,
                'error': 'Tipo de archivo no permitido. Use PNG, JPG, JPEG, BMP o GIF'
            }), 400
        
        # Validar tamaño (máximo 10MB)
        if hasattr(file, 'content_length') and file.content_length > 10 * 1024 * 1024:
            return jsonify({
                'success': False,
                'error': 'Archivo demasiado grande (máximo 10MB)'
            }), 400
        
        # Leer imagen directamente en memoria
        import cv2
        import numpy as np
        from io import BytesIO
        
        # Convertir archivo a imagen OpenCV
        file_bytes = file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({
                'success': False,
                'error': 'No se pudo procesar la imagen'
            }), 400
        
        # Analizar con CDT analyzer directamente
        from app.services.cdt_analyzer import CDTAnalyzer
        analyzer = CDTAnalyzer()
        resultado = analyzer.analyze_cdt(image)
        
        # Agregar información adicional para el demo
        resultado['demo'] = True
        resultado['archivo_original'] = file.filename
        resultado['timestamp'] = datetime.now(timezone.utc).isoformat()
        
        return jsonify(resultado), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en demo-analyze: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error procesando imagen: {str(e)}'
        }), 500


@cdt_bp.errorhandler(413)
def too_large(e):
    """Maneja errores de archivo demasiado grande"""
    return jsonify({
        'success': False,
        'error': 'El archivo es demasiado grande (máximo 10MB)'
    }), 413


@cdt_bp.errorhandler(400)
def bad_request(e):
    """Maneja errores de petición incorrecta"""
    return jsonify({
        'success': False,
        'error': 'Petición incorrecta'
    }), 400


@cdt_bp.errorhandler(500)
def internal_error(e):
    """Maneja errores internos del servidor"""
    current_app.logger.error(f"Error interno: {str(e)}")
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500
