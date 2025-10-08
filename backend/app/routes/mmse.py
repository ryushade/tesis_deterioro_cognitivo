from flask import Blueprint, request, jsonify
import logging
from app.services.jwt_service import JWTService
from app.services.evaluaciones_service import EvaluacionesService
from app.services.mmse_service import MMSEService

logger = logging.getLogger(__name__)

mmse_bp = Blueprint('mmse', __name__, url_prefix='/api/mmse')
evals = EvaluacionesService()
mmse_service = MMSEService()


@mmse_bp.route('/test', methods=['GET'])
def test_mmse():
    """Endpoint de prueba para verificar que el Blueprint está registrado"""
    return jsonify({'success': True, 'message': 'MMSE Blueprint funcionando correctamente'}), 200


@mmse_bp.route('/sesiones', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def crear_sesion_mmse():
    try:
        logger.info("=== CREAR SESIÓN MMSE ===")
        data = request.get_json() or {}
        logger.info(f"Data recibida: {data}")
        id_paciente = data.get('id_paciente')
        if not id_paciente:
            logger.error("id_paciente no proporcionado")
            return jsonify({'success': False, 'message': 'id_paciente es requerido'}), 400
        
        # Obtener el ID de la prueba MMSE
        id_prueba = mmse_service.db.execute_query(
            "SELECT id_prueba FROM prueba_cognitiva WHERE nombre = 'MMSE' LIMIT 1"
        )
        if not id_prueba:
            return jsonify({'success': False, 'message': 'Prueba MMSE no encontrada'}), 404
        
        id_prueba_mmse = id_prueba[0]['id_prueba']
        id_codigo = data.get('id_codigo')
        
        # Verificar si ya existe una sesión activa
        sesion_activa = mmse_service.verificar_sesion_activa(int(id_paciente), id_prueba_mmse)
        if sesion_activa:
            return jsonify({
                'success': True, 
                'sesion_id': sesion_activa,
                'message': 'Ya existe una sesión activa'
            }), 200
        
        # Crear nueva sesión
        sesion_id = mmse_service.crear_sesion(
            id_paciente=int(id_paciente),
            id_prueba=id_prueba_mmse,
            id_codigo=id_codigo
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
        sesion = mmse_service.obtener_sesion(id_sesion)
        if not sesion:
            return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
        
        # Agregar información de tiempo
        data = {
            **sesion,
            'tiempo_info': {
                'iniciado_en': sesion['iniciado_en'].isoformat() if sesion.get('iniciado_en') else None,
                'tiempo_transcurrido_segundos': sesion.get('tiempo_transcurrido_segundos', 0),
                'tiempo_restante_segundos': sesion.get('tiempo_restante_segundos', 0),
                'duracion_total_minutos': sesion.get('duracion_estimada_minutos', 10)
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
        progreso = data.get('progreso', 0)
        estado = data.get('estado')
        
        ok = mmse_service.actualizar_progreso(id_sesion, progreso, estado)
        
        # Verificar si el tiempo se ha agotado
        sesion = mmse_service.obtener_sesion(id_sesion)
        if sesion and sesion.get('tiempo_restante_segundos', 0) <= 0:
            mmse_service.marcar_expirada(id_sesion)
            return jsonify({
                'success': True,
                'tiempo_agotado': True,
                'message': 'Tiempo agotado'
            }), 200
        
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
        datos_finales = data.get('datos_especificos', {})
        
        if puntuacion_total is None:
            return jsonify({'success': False, 'message': 'puntuacion_total es requerida'}), 400
        
        # Obtener la sesión
        sesion = mmse_service.obtener_sesion(id_sesion)
        if not sesion:
            return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
        
        # Crear la evaluación final en evaluaciones_cognitivas
        creado_por = getattr(request, 'current_user', {}).get('user_id')
        id_evaluacion = evals.create_evaluacion_mmse(
            id_paciente=sesion['id_paciente'],
            creado_por=creado_por,
            datos_iniciales=datos_finales
        )
        
        if not id_evaluacion:
            return jsonify({'success': False, 'message': 'No se pudo crear la evaluación final'}), 400
        
        # Actualizar la evaluación con los resultados finales
        evals.finalizar_mmse(id_evaluacion, float(puntuacion_total), clasificacion=clasificacion)
        
        # Completar la sesión y vincular la evaluación
        ok = mmse_service.completar_sesion(id_sesion, id_evaluacion)
        
        return jsonify({
            'success': ok,
            'id_evaluacion': id_evaluacion
        }), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error finalizando MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/pausar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def pausar_sesion_mmse(id_sesion: int):
    try:
        ok = mmse_service.pausar_sesion(id_sesion)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error pausando sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/reanudar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def reanudar_sesion_mmse(id_sesion: int):
    try:
        ok = mmse_service.reanudar_sesion(id_sesion)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error reanudando sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/cancelar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo', 'Paciente'])
def cancelar_sesion_mmse(id_sesion: int):
    try:
        ok = mmse_service.cancelar_sesion(id_sesion)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error cancelando sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/pacientes/<int:id_paciente>/sesiones', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def obtener_sesiones_paciente(id_paciente: int):
    try:
        sesiones = mmse_service.obtener_sesiones_paciente(id_paciente)
        return jsonify({'success': True, 'data': sesiones}), 200
    except Exception as e:
        logger.error(f'Error obteniendo sesiones del paciente {id_paciente}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500

