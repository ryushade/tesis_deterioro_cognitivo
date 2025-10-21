"""
Rutas para configuración de respuestas correctas del MMSE
"""
from flask import Blueprint, request, jsonify
from app.services.mmse_config_service import MMSEConfigService
from app.services.jwt_service import JWTService
import logging

logger = logging.getLogger(__name__)

mmse_config_bp = Blueprint('mmse_config', __name__, url_prefix='/api/mmse/configuracion')
config_service = MMSEConfigService()


@mmse_config_bp.route('/respuestas', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo'])
def get_configuraciones():
    """
    Obtiene todas las configuraciones de respuestas correctas
    Query params:
    - pregunta_id: Filtrar por pregunta específica
    - contexto: Filtrar por contexto específico
    """
    try:
        pregunta_id = request.args.get('pregunta_id')
        contexto = request.args.get('contexto')
        
        configuraciones = config_service.get_configuraciones(pregunta_id, contexto)
        
        return jsonify({
            'success': True, 
            'data': configuraciones,
            'count': len(configuraciones)
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo configuraciones: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/respuestas/<int:id>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo'])
def get_configuracion(id: int):
    """
    Obtiene una configuración específica por ID
    """
    try:
        configuracion = config_service.get_configuracion_by_id(id)
        
        if not configuracion:
            return jsonify({'success': False, 'message': 'Configuración no encontrada'}), 404
        
        return jsonify({'success': True, 'data': configuracion}), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo configuración {id}: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/respuestas', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador'])
def create_configuracion():
    """
    Crea una nueva configuración de respuesta correcta
    Body:
    {
        "pregunta_id": "establecimiento",
        "respuesta_correcta": "Hospital General",
        "contexto": "hospital_general",
        "tipo_validacion": "exacta",
        "tolerancia_errores": 0,
        "puntuacion": 1.00,
        "es_activa": true,
        "orden": 1
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        # Validaciones básicas
        required_fields = ['pregunta_id', 'respuesta_correcta']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'success': False, 'message': f'Campo requerido: {field}'}), 400
        
        # Validar tipo_validacion
        if 'tipo_validacion' in data and data['tipo_validacion'] not in ['exacta', 'parcial', 'fuzzy']:
            return jsonify({'success': False, 'message': 'tipo_validacion debe ser: exacta, parcial o fuzzy'}), 400
        
        # Validar tolerancia_errores
        if 'tolerancia_errores' in data:
            try:
                tolerancia = int(data['tolerancia_errores'])
                if tolerancia < 0 or tolerancia > 3:
                    return jsonify({'success': False, 'message': 'tolerancia_errores debe estar entre 0 y 3'}), 400
            except (ValueError, TypeError):
                return jsonify({'success': False, 'message': 'tolerancia_errores debe ser un número entero'}), 400
        
        # Validar puntuacion
        if 'puntuacion' in data:
            try:
                puntuacion = float(data['puntuacion'])
                if puntuacion < 0.0 or puntuacion > 1.0:
                    return jsonify({'success': False, 'message': 'puntuacion debe estar entre 0.0 y 1.0'}), 400
            except (ValueError, TypeError):
                return jsonify({'success': False, 'message': 'puntuacion debe ser un número'}), 400
        
        configuracion_id = config_service.create_configuracion(data)
        
        if configuracion_id:
            return jsonify({
                'success': True, 
                'data': {'id_configuracion': configuracion_id},
                'message': 'Configuración creada exitosamente'
            }), 201
        else:
            return jsonify({'success': False, 'message': 'Error creando configuración'}), 400
            
    except Exception as e:
        logger.error(f"Error creando configuración: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/respuestas/<int:id>', methods=['PUT'])
@JWTService.token_required
@JWTService.role_required(['Administrador'])
def update_configuracion(id: int):
    """
    Actualiza una configuración existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        # Validaciones básicas
        if 'pregunta_id' in data and not data['pregunta_id']:
            return jsonify({'success': False, 'message': 'pregunta_id no puede estar vacío'}), 400
        
        if 'respuesta_correcta' in data and not data['respuesta_correcta']:
            return jsonify({'success': False, 'message': 'respuesta_correcta no puede estar vacío'}), 400
        
        # Validar tipo_validacion
        if 'tipo_validacion' in data and data['tipo_validacion'] not in ['exacta', 'parcial', 'fuzzy']:
            return jsonify({'success': False, 'message': 'tipo_validacion debe ser: exacta, parcial o fuzzy'}), 400
        
        # Validar tolerancia_errores
        if 'tolerancia_errores' in data:
            try:
                tolerancia = int(data['tolerancia_errores'])
                if tolerancia < 0 or tolerancia > 3:
                    return jsonify({'success': False, 'message': 'tolerancia_errores debe estar entre 0 y 3'}), 400
            except (ValueError, TypeError):
                return jsonify({'success': False, 'message': 'tolerancia_errores debe ser un número entero'}), 400
        
        # Validar puntuacion
        if 'puntuacion' in data:
            try:
                puntuacion = float(data['puntuacion'])
                if puntuacion < 0.0 or puntuacion > 1.0:
                    return jsonify({'success': False, 'message': 'puntuacion debe estar entre 0.0 y 1.0'}), 400
            except (ValueError, TypeError):
                return jsonify({'success': False, 'message': 'puntuacion debe ser un número'}), 400
        
        success = config_service.update_configuracion(id, data)
        
        if success:
            return jsonify({'success': True, 'message': 'Configuración actualizada exitosamente'}), 200
        else:
            return jsonify({'success': False, 'message': 'Error actualizando configuración'}), 400
            
    except Exception as e:
        logger.error(f"Error actualizando configuración {id}: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/respuestas/<int:id>', methods=['DELETE'])
@JWTService.token_required
@JWTService.role_required(['Administrador'])
def delete_configuracion(id: int):
    """
    Elimina una configuración
    """
    try:
        success = config_service.delete_configuracion(id)
        
        if success:
            return jsonify({'success': True, 'message': 'Configuración eliminada exitosamente'}), 200
        else:
            return jsonify({'success': False, 'message': 'Error eliminando configuración'}), 400
            
    except Exception as e:
        logger.error(f"Error eliminando configuración {id}: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/validacion/<pregunta_id>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def get_configuracion_validation(pregunta_id: str):
    """
    Obtiene configuración para validación en tiempo real
    Query params:
    - contexto: Contexto específico para filtrar configuraciones
    """
    try:
        contexto = request.args.get('contexto')
        configuraciones = config_service.get_configuracion_for_validation(pregunta_id, contexto)
        
        return jsonify({
            'success': True, 
            'data': configuraciones,
            'pregunta_id': pregunta_id,
            'contexto': contexto
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo configuración de validación para {pregunta_id}: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/validar-respuesta', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def validate_answer():
    """
    Valida una respuesta del usuario contra las configuraciones
    Body:
    {
        "pregunta_id": "establecimiento",
        "respuesta": "Hospital",
        "contexto": "hospital_general"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        required_fields = ['pregunta_id', 'respuesta']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Campo requerido: {field}'}), 400
        
        resultado = config_service.validate_answer_with_config(
            data['pregunta_id'],
            data['respuesta'],
            data.get('contexto')
        )
        
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
        
    except Exception as e:
        logger.error(f"Error validando respuesta: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/contextos', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo'])
def get_contextos():
    """
    Obtiene lista de contextos disponibles
    """
    try:
        contextos = config_service.get_contextos_disponibles()
        return jsonify({'success': True, 'data': contextos}), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo contextos: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@mmse_config_bp.route('/preguntas', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo'])
def get_preguntas():
    """
    Obtiene lista de preguntas disponibles
    """
    try:
        preguntas = config_service.get_preguntas_disponibles()
        return jsonify({'success': True, 'data': preguntas}), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo preguntas: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
