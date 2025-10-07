"""
Rutas para gestión de códigos de acceso usando psycopg2
"""
from flask import Blueprint, request, jsonify
from app.services.codigos_acceso_service import CodigosAccesoService
import logging

logger = logging.getLogger(__name__)

codigos_acceso_bp = Blueprint('codigos_acceso', __name__)

# Crear instancia del servicio
codigos_acceso_service = CodigosAccesoService()

@codigos_acceso_bp.route('', methods=['GET'])
def get_codigos_acceso():
    """Obtener lista de códigos de acceso con paginación y filtros"""
    try:
        # Obtener parámetros de consulta
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '').strip()
        estado = request.args.get('estado', '').strip()
        tipo_evaluacion = request.args.get('tipo_evaluacion', '').strip()
        id_paciente = request.args.get('id_paciente')
        
        # Validar parámetros
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 10
        
        # Convertir id_paciente a entero si se proporciona
        if id_paciente:
            try:
                id_paciente = int(id_paciente)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'ID de paciente debe ser un número entero'
                }), 400
        
        # Limpiar filtros vacíos
        estado = estado if estado else None
        tipo_evaluacion = tipo_evaluacion if tipo_evaluacion else None
        search = search if search else None
        
        result = codigos_acceso_service.get_all(
            page=page, 
            limit=limit, 
            search=search,
            estado=estado,
            tipo_evaluacion=tipo_evaluacion,
            id_paciente=id_paciente
        )
        
        return jsonify(result), 200 if result['success'] else 400
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': 'Parámetros inválidos'
        }), 400
    except Exception as e:
        logger.error(f"Error en get_codigos_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/<int:id_codigo>', methods=['GET'])
def get_codigo_acceso(id_codigo):
    """Obtener un código de acceso específico por ID"""
    try:
        result = codigos_acceso_service.get_by_id(id_codigo)
        return jsonify(result), 200 if result['success'] else 404
        
    except Exception as e:
        logger.error(f"Error en get_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('', methods=['POST'])
def create_codigo_acceso():
    """Crear un nuevo código de acceso"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se proporcionaron datos'
            }), 400
        
        result = codigos_acceso_service.create(data)
        return jsonify(result), 201 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en create_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/<int:id_codigo>', methods=['PUT'])
def update_codigo_acceso(id_codigo):
    """Actualizar un código de acceso existente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se proporcionaron datos'
            }), 400
        
        result = codigos_acceso_service.update(id_codigo, data)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en update_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/<int:id_codigo>', methods=['DELETE'])
def delete_codigo_acceso(id_codigo):
    """Eliminar un código de acceso"""
    try:
        result = codigos_acceso_service.delete(id_codigo)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en delete_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/<int:id_codigo>/revocar', methods=['POST'])
def revocar_codigo_acceso(id_codigo):
    """Revocar un código de acceso específico"""
    try:
        result = codigos_acceso_service.revocar_codigo(id_codigo)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en revocar_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/usar', methods=['POST'])
def usar_codigo_acceso():
    """Marcar un código como usado por su valor"""
    try:
        data = request.get_json()
        
        if not data or not data.get('codigo'):
            return jsonify({
                'success': False,
                'message': 'Código es requerido'
            }), 400
        
        result = codigos_acceso_service.marcar_como_usado(data['codigo'])
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en usar_codigo_acceso: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/estadisticas', methods=['GET'])
def get_estadisticas_codigos():
    """Obtener estadísticas de códigos de acceso"""
    try:
        result = codigos_acceso_service.get_estadisticas()
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"Error en get_estadisticas_codigos: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@codigos_acceso_bp.route('/generar-codigo', methods=['POST'])
def generar_codigo_unico():
    """Generar un código único sin crear el registro"""
    try:
        data = request.get_json() or {}
        longitud = data.get('longitud', 8)
        
        # Validar longitud
        if longitud < 4 or longitud > 32:
            return jsonify({
                'success': False,
                'message': 'La longitud debe estar entre 4 y 32 caracteres'
            }), 400
        
        codigo = codigos_acceso_service.generar_codigo_unico(longitud)
        
        return jsonify({
            'success': True,
            'data': {'codigo': codigo}
        }), 200
        
    except Exception as e:
        logger.error(f"Error en generar_codigo_unico: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500


@codigos_acceso_bp.route('/validar', methods=['POST'])
def validar_codigo():
    """Validar un código de acceso para uso del paciente"""
    try:
        data = request.get_json()
        codigo = data.get('codigo', '').strip()
        
        if not codigo:
            return jsonify({
                'success': False,
                'message': 'El código es requerido'
            }), 400
        
        # Buscar el código
        result = codigos_acceso_service.get_by_codigo(codigo)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'Código no encontrado'
            }), 404
        
        # Verificar estado (emitido es el estado válido, usado/vencido/revocado no)
        if result['estado'] == 'usado':
            return jsonify({
                'success': False,
                'message': 'El código ya ha sido usado'
            }), 400
        
        if result['estado'] == 'vencido':
            return jsonify({
                'success': False,
                'message': 'El código ha vencido'
            }), 400
        
        if result['estado'] == 'revocado':
            return jsonify({
                'success': False,
                'message': 'El código ha sido revocado'
            }), 400
        
        # Verificar fecha de expiración
        from datetime import datetime
        if result['fecha_expiracion']:
            fecha_exp = result['fecha_expiracion']
            if isinstance(fecha_exp, str):
                fecha_exp = datetime.fromisoformat(fecha_exp.replace('Z', '+00:00'))
            if fecha_exp < datetime.now(fecha_exp.tzinfo):
                return jsonify({
                    'success': False,
                    'message': 'El código ha expirado'
                }), 400
        
        # Retornar información del código
        return jsonify({
            'success': True,
            'data': {
                'id_codigo': result['id_codigo'],
                'id_paciente': result['id_paciente'],
                'tipo_evaluacion': result['tipo_evaluacion']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error en validar_codigo: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500