"""
Rutas para gestión de pacientes usando psycopg2
"""
from flask import Blueprint, request, jsonify
from app.services.pacientes_service import PacientesService
import logging

logger = logging.getLogger(__name__)

pacientes_bp = Blueprint('pacientes', __name__)

# Crear instancia del servicio
pacientes_service = PacientesService()

@pacientes_bp.route('', methods=['GET'])
def get_pacientes():
    """Obtener lista de pacientes con paginación y búsqueda"""
    try:
        # Obtener parámetros de consulta
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '').strip()
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        
        # Validar parámetros
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 10
        
        result = pacientes_service.get_all(
            page=page, 
            limit=limit, 
            search=search, 
            include_inactive=include_inactive
        )
        
        return jsonify(result), 200 if result['success'] else 400
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': 'Parámetros inválidos'
        }), 400
    except Exception as e:
        logger.error(f"Error en get_pacientes: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/<int:id_paciente>', methods=['GET'])
def get_paciente(id_paciente):
    """Obtener un paciente específico por ID"""
    try:
        result = pacientes_service.get_by_id(id_paciente)
        return jsonify(result), 200 if result['success'] else 404
        
    except Exception as e:
        logger.error(f"Error en get_paciente: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('', methods=['POST'])
def create_paciente():
    """Crear un nuevo paciente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se proporcionaron datos'
            }), 400
        
        result = pacientes_service.create(data)
        return jsonify(result), 201 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en create_paciente: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/<int:id_paciente>', methods=['PUT'])
def update_paciente(id_paciente):
    """Actualizar un paciente existente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se proporcionaron datos'
            }), 400
        
        result = pacientes_service.update(id_paciente, data)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en update_paciente: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/<int:id_paciente>', methods=['DELETE'])
def delete_paciente(id_paciente):
    """Eliminar (desactivar) un paciente"""
    try:
        result = pacientes_service.delete(id_paciente)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en delete_paciente: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/<int:id_paciente>/restore', methods=['POST'])
def restore_paciente(id_paciente):
    """Restaurar (activar) un paciente"""
    try:
        result = pacientes_service.restore(id_paciente)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en restore_paciente: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/stats', methods=['GET'])
def get_pacientes_stats():
    """Obtener estadísticas de pacientes"""
    try:
        result = pacientes_service.get_stats()
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en get_pacientes_stats: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500
