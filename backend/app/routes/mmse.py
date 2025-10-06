from flask import Blueprint, request, jsonify
import logging
from app.services.jwt_service import JWTService
from app.services.evaluaciones_service import EvaluacionesService

logger = logging.getLogger(__name__)

mmse_bp = Blueprint('mmse', __name__, url_prefix='/api/mmse')
evals = EvaluacionesService()


@mmse_bp.route('/sesiones', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def crear_sesion_mmse():
    try:
        data = request.get_json() or {}
        id_paciente = data.get('id_paciente')
        if not id_paciente:
            return jsonify({'success': False, 'message': 'id_paciente es requerido'}), 400
        creado_por = getattr(request, 'current_user', {}).get('user_id')
        datos_iniciales = data.get('datos') or {'current_section': 0, 'answers': {}, 'progress': 0}
        sesion_id = evals.create_evaluacion_mmse(int(id_paciente), creado_por=creado_por, datos_iniciales=datos_iniciales)
        if not sesion_id:
            return jsonify({'success': False, 'message': 'No se pudo crear la sesión'}), 400
        return jsonify({'success': True, 'sesion_id': sesion_id}), 201
    except Exception as e:
        logger.error(f'Error creando sesión MMSE: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def obtener_sesion_mmse(id_sesion: int):
    try:
        sesion = evals.get_mmse_by_id(id_sesion)
        if not sesion:
            return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
        return jsonify({'success': True, 'data': sesion}), 200
    except Exception as e:
        logger.error(f'Error obteniendo sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/progreso', methods=['PATCH'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def actualizar_progreso_mmse(id_sesion: int):
    try:
        data = request.get_json() or {}
        datos = data.get('datos_especificos') or data.get('datos')
        if datos is None:
            return jsonify({'success': False, 'message': 'datos_especificos es requerido'}), 400
        puntuacion_total = data.get('puntuacion_total')
        estado = data.get('estado_procesamiento')
        ok = evals.update_mmse_progress(id_sesion, datos, puntuacion_total=puntuacion_total, estado_procesamiento=estado)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error actualizando progreso MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/finalizar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
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

