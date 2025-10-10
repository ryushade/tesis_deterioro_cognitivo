from flask import Blueprint, request, jsonify
import logging
from app.services.jwt_service import JWTService
from app.services.evaluaciones_service import EvaluacionesService

logger = logging.getLogger(__name__)

mmse_bp = Blueprint('mmse', __name__, url_prefix='/api/mmse')
evals = EvaluacionesService()


@mmse_bp.route('/test', methods=['GET'])
def test_mmse():
    """Endpoint de prueba para verificar que el Blueprint está registrado"""
    return jsonify({'success': True, 'message': 'MMSE Blueprint funcionando correctamente'}), 200


@mmse_bp.route('/sesiones', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def crear_sesion_mmse():
    try:
        logger.info("=== CREAR SESIÓN MMSE ===")
        data = request.get_json() or {}
        logger.info(f"Data recibida: {data}")
        id_paciente = data.get('id_paciente')
        if not id_paciente:
            logger.error("id_paciente no proporcionado")
            return jsonify({'success': False, 'message': 'id_paciente es requerido'}), 400
        
        id_codigo = data.get('id_codigo')
        creado_por = getattr(request, 'current_user', {}).get('user_id')
        datos_iniciales = {'current_section': 0, 'answers': {}, 'progress': 0}
        
        # Usar el servicio existente de evaluaciones
        sesion_id = evals.create_evaluacion_mmse(
            id_paciente=int(id_paciente), 
            creado_por=creado_por, 
            datos_iniciales=datos_iniciales
        )
        
        if not sesion_id:
            return jsonify({'success': False, 'message': 'No se pudo crear la sesión'}), 400
        
        return jsonify({'success': True, 'sesion_id': sesion_id}), 201
    except Exception as e:
        logger.error(f'Error creando sesión MMSE: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def obtener_sesion_mmse(id_sesion: int):
    try:
        sesion = evals.get_mmse_by_id(id_sesion)
        if not sesion:
            return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
        
        # Calcular tiempo transcurrido y restante
        from datetime import datetime
        fecha_evaluacion = sesion.get('fecha_evaluacion')
        if fecha_evaluacion:
            if isinstance(fecha_evaluacion, str):
                fecha_evaluacion = datetime.fromisoformat(fecha_evaluacion.replace('Z', '+00:00'))
            
            tiempo_transcurrido = int((datetime.now(fecha_evaluacion.tzinfo) - fecha_evaluacion).total_seconds())
            tiempo_restante = max(0, 600 - tiempo_transcurrido)  # 10 minutos = 600 segundos
        else:
            tiempo_transcurrido = 0
            tiempo_restante = 600
        
        # Agregar información de tiempo
        data = {
            **sesion,
            'tiempo_info': {
                'iniciado_en': sesion.get('fecha_evaluacion'),
                'tiempo_transcurrido_segundos': tiempo_transcurrido,
                'tiempo_restante_segundos': tiempo_restante,
                'duracion_total_minutos': 10
            }
        }
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        logger.error(f'Error obteniendo sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/progreso', methods=['PATCH'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def actualizar_progreso_mmse(id_sesion: int):
    try:
        data = request.get_json() or {}
        datos_especificos = data.get('datos_especificos') or data.get('datos')
        if datos_especificos is None:
            return jsonify({'success': False, 'message': 'datos_especificos es requerido'}), 400
        puntuacion_total = data.get('puntuacion_total')
        estado = data.get('estado_procesamiento')
        
        ok = evals.update_mmse_progress(id_sesion, datos_especificos, puntuacion_total=puntuacion_total, estado_procesamiento=estado)
        
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error actualizando progreso MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/finalizar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def finalizar_mmse(id_sesion: int):
    try:
        data = request.get_json() or {}
        puntuacion_total = data.get('puntuacion_total')
        clasificacion = data.get('clasificacion')
        if puntuacion_total is None:
            return jsonify({'success': False, 'message': 'puntuacion_total es requerida'}), 400
        
        ok = evals.finalizar_mmse(id_sesion, float(puntuacion_total), clasificacion=clasificacion)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error finalizando MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500