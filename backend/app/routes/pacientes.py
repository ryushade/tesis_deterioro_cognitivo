from flask import Blueprint, request, jsonify
from app.models.evaluaciones import Paciente
from app import db
from datetime import datetime
from sqlalchemy import or_, and_
from app.services.jwt_service import JWTService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pacientes_bp = Blueprint('pacientes', __name__)

@pacientes_bp.route('/pacientes', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def get_all_pacientes():
    """Obtener todos los pacientes"""
    try:
        pacientes = Paciente.query.filter_by(estado_paciente=1).all()
        
        pacientes_list = []
        for paciente in pacientes:
            pacientes_list.append({
                'id_paciente': paciente.id_paciente,
                'nombres': paciente.nombres,
                'apellidos': paciente.apellidos,
                'cedula': paciente.cedula,
                'fecha_nacimiento': paciente.fecha_nacimiento.isoformat() if paciente.fecha_nacimiento else None,
                'edad': paciente.edad,
                'telefono': paciente.telefono,
                'direccion': paciente.direccion,
                'contacto_emergencia': paciente.contacto_emergencia,
                'telefono_emergencia': paciente.telefono_emergencia,
                'estado_cognitivo': paciente.estado_cognitivo,
                'medicamentos': paciente.medicamentos,
                'estado_paciente': paciente.estado_paciente,
                'fecha_registro': paciente.fecha_registro.isoformat() if paciente.fecha_registro else None,
                'fecha_actualizacion': paciente.fecha_actualizacion.isoformat() if paciente.fecha_actualizacion else None
            })
        
        return jsonify({
            'success': True,
            'message': f'Se encontraron {len(pacientes_list)} pacientes',
            'pacientes': pacientes_list
        }), 200
        
    except Exception as e:
        logger.error(f"Error al obtener pacientes: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al obtener pacientes'
        }), 500

@pacientes_bp.route('/pacientes/<int:paciente_id>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def get_paciente_by_id(paciente_id):
    """Obtener un paciente por ID"""
    try:
        paciente = Paciente.query.get(paciente_id)
        
        if not paciente:
            return jsonify({
                'success': False,
                'message': 'Paciente no encontrado'
            }), 404
        
        paciente_data = {
            'id_paciente': paciente.id_paciente,
            'nombres': paciente.nombres,
            'apellidos': paciente.apellidos,
            'cedula': paciente.cedula,
            'fecha_nacimiento': paciente.fecha_nacimiento.isoformat() if paciente.fecha_nacimiento else None,
            'edad': paciente.edad,
            'telefono': paciente.telefono,
            'direccion': paciente.direccion,
            'contacto_emergencia': paciente.contacto_emergencia,
            'telefono_emergencia': paciente.telefono_emergencia,
            'estado_cognitivo': paciente.estado_cognitivo,
            'medicamentos': paciente.medicamentos,
            'estado_paciente': paciente.estado_paciente,
            'fecha_registro': paciente.fecha_registro.isoformat() if paciente.fecha_registro else None,
            'fecha_actualizacion': paciente.fecha_actualizacion.isoformat() if paciente.fecha_actualizacion else None
        }
        
        return jsonify({
            'success': True,
            'message': 'Paciente encontrado',
            'data': paciente_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error al obtener paciente {paciente_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/pacientes', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def create_paciente():
    """Crear un nuevo paciente"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['nombres', 'apellidos', 'cedula', 'fecha_nacimiento', 'telefono', 'contacto_emergencia', 'telefono_emergencia']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'El campo {field} es requerido'
                }), 400
        
        # Verificar que no exista un paciente con la misma cédula
        existing_paciente = Paciente.query.filter_by(cedula=data['cedula']).first()
        if existing_paciente:
            return jsonify({
                'success': False,
                'message': 'Ya existe un paciente con esta cédula'
            }), 400
        
        # Calcular edad
        from datetime import datetime
        fecha_nacimiento = datetime.fromisoformat(data['fecha_nacimiento'].replace('Z', '+00:00')) if 'Z' in data['fecha_nacimiento'] else datetime.fromisoformat(data['fecha_nacimiento'])
        today = datetime.now()
        edad = today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
        
        # Validar que sea mayor de 65 años
        if edad < 65:
            return jsonify({
                'success': False,
                'message': 'El paciente debe ser mayor de 65 años para ingresar al programa'
            }), 400
        
        # Crear nuevo paciente
        nuevo_paciente = Paciente(
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            cedula=data['cedula'],
            fecha_nacimiento=fecha_nacimiento.date(),
            edad=edad,
            telefono=data['telefono'],
            direccion=data.get('direccion', ''),
            contacto_emergencia=data['contacto_emergencia'],
            telefono_emergencia=data['telefono_emergencia'],
            estado_cognitivo=data.get('estado_cognitivo', 'No evaluado'),
            medicamentos=data.get('medicamentos', ''),
            estado_paciente=data.get('estado_paciente', 1),
            fecha_registro=datetime.now()
        )
        
        db.session.add(nuevo_paciente)
        db.session.commit()
        
        paciente_data = {
            'id_paciente': nuevo_paciente.id_paciente,
            'nombres': nuevo_paciente.nombres,
            'apellidos': nuevo_paciente.apellidos,
            'cedula': nuevo_paciente.cedula,
            'fecha_nacimiento': nuevo_paciente.fecha_nacimiento.isoformat(),
            'edad': nuevo_paciente.edad,
            'telefono': nuevo_paciente.telefono,
            'direccion': nuevo_paciente.direccion,
            'contacto_emergencia': nuevo_paciente.contacto_emergencia,
            'telefono_emergencia': nuevo_paciente.telefono_emergencia,
            'estado_cognitivo': nuevo_paciente.estado_cognitivo,
            'medicamentos': nuevo_paciente.medicamentos,
            'estado_paciente': nuevo_paciente.estado_paciente,
            'fecha_registro': nuevo_paciente.fecha_registro.isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Paciente registrado exitosamente',
            'data': paciente_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al crear paciente: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al crear paciente'
        }), 500

@pacientes_bp.route('/pacientes/<int:paciente_id>', methods=['PUT'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def update_paciente(paciente_id):
    """Actualizar un paciente existente"""
    try:
        paciente = Paciente.query.get(paciente_id)
        
        if not paciente:
            return jsonify({
                'success': False,
                'message': 'Paciente no encontrado'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'nombres' in data:
            paciente.nombres = data['nombres']
        if 'apellidos' in data:
            paciente.apellidos = data['apellidos']
        if 'cedula' in data:
            # Verificar que no exista otro paciente con la misma cédula
            existing_paciente = Paciente.query.filter_by(cedula=data['cedula']).filter(Paciente.id_paciente != paciente_id).first()
            if existing_paciente:
                return jsonify({
                    'success': False,
                    'message': 'Ya existe otro paciente con esta cédula'
                }), 400
            paciente.cedula = data['cedula']
        
        if 'fecha_nacimiento' in data:
            fecha_nacimiento = datetime.fromisoformat(data['fecha_nacimiento'].replace('Z', '+00:00')) if 'Z' in data['fecha_nacimiento'] else datetime.fromisoformat(data['fecha_nacimiento'])
            today = datetime.now()
            edad = today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
            
            if edad < 65:
                return jsonify({
                    'success': False,
                    'message': 'El paciente debe ser mayor de 65 años'
                }), 400
            
            paciente.fecha_nacimiento = fecha_nacimiento.date()
            paciente.edad = edad
        
        if 'telefono' in data:
            paciente.telefono = data['telefono']
        if 'direccion' in data:
            paciente.direccion = data['direccion']
        if 'contacto_emergencia' in data:
            paciente.contacto_emergencia = data['contacto_emergencia']
        if 'telefono_emergencia' in data:
            paciente.telefono_emergencia = data['telefono_emergencia']
        if 'estado_cognitivo' in data:
            paciente.estado_cognitivo = data['estado_cognitivo']
        if 'medicamentos' in data:
            paciente.medicamentos = data['medicamentos']
        if 'estado_paciente' in data:
            paciente.estado_paciente = data['estado_paciente']
        
        paciente.fecha_actualizacion = datetime.now()
        
        db.session.commit()
        
        paciente_data = {
            'id_paciente': paciente.id_paciente,
            'nombres': paciente.nombres,
            'apellidos': paciente.apellidos,
            'cedula': paciente.cedula,
            'fecha_nacimiento': paciente.fecha_nacimiento.isoformat(),
            'edad': paciente.edad,
            'telefono': paciente.telefono,
            'direccion': paciente.direccion,
            'contacto_emergencia': paciente.contacto_emergencia,
            'telefono_emergencia': paciente.telefono_emergencia,
            'estado_cognitivo': paciente.estado_cognitivo,
            'medicamentos': paciente.medicamentos,
            'estado_paciente': paciente.estado_paciente,
            'fecha_registro': paciente.fecha_registro.isoformat() if paciente.fecha_registro else None,
            'fecha_actualizacion': paciente.fecha_actualizacion.isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Paciente actualizado exitosamente',
            'data': paciente_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al actualizar paciente {paciente_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al actualizar paciente'
        }), 500

@pacientes_bp.route('/pacientes/<int:paciente_id>', methods=['DELETE'])
@JWTService.token_required
@JWTService.admin_required
def delete_paciente(paciente_id):
    """Eliminar (desactivar) un paciente"""
    try:
        paciente = Paciente.query.get(paciente_id)
        
        if not paciente:
            return jsonify({
                'success': False,
                'message': 'Paciente no encontrado'
            }), 404
        
        # En lugar de eliminar, marcar como inactivo
        paciente.estado_paciente = 0
        paciente.fecha_actualizacion = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Paciente eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al eliminar paciente {paciente_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al eliminar paciente'
        }), 500

@pacientes_bp.route('/pacientes/search', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicólogo'])
def search_pacientes():
    """Buscar pacientes por término"""
    try:
        search_term = request.args.get('q', '')
        
        if not search_term:
            return jsonify({
                'success': False,
                'message': 'Parámetro de búsqueda requerido'
            }), 400
        
        # Buscar en nombres, apellidos, cédula
        pacientes = Paciente.query.filter(
            and_(
                Paciente.estado_paciente == 1,
                or_(
                    Paciente.nombres.ilike(f'%{search_term}%'),
                    Paciente.apellidos.ilike(f'%{search_term}%'),
                    Paciente.cedula.ilike(f'%{search_term}%'),
                    Paciente.telefono.ilike(f'%{search_term}%')
                )
            )
        ).all()
        
        pacientes_list = []
        for paciente in pacientes:
            pacientes_list.append({
                'id_paciente': paciente.id_paciente,
                'nombres': paciente.nombres,
                'apellidos': paciente.apellidos,
                'cedula': paciente.cedula,
                'fecha_nacimiento': paciente.fecha_nacimiento.isoformat() if paciente.fecha_nacimiento else None,
                'edad': paciente.edad,
                'telefono': paciente.telefono,
                'direccion': paciente.direccion,
                'contacto_emergencia': paciente.contacto_emergencia,
                'telefono_emergencia': paciente.telefono_emergencia,
                'estado_cognitivo': paciente.estado_cognitivo,
                'medicamentos': paciente.medicamentos,
                'estado_paciente': paciente.estado_paciente,
                'fecha_registro': paciente.fecha_registro.isoformat() if paciente.fecha_registro else None
            })
        
        return jsonify({
            'success': True,
            'message': f'Se encontraron {len(pacientes_list)} pacientes',
            'pacientes': pacientes_list
        }), 200
        
    except Exception as e:
        logger.error(f"Error al buscar pacientes: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al buscar pacientes'
        }), 500

@pacientes_bp.route('/pacientes/estado-cognitivo/<estado>', methods=['GET'])
def get_pacientes_by_estado_cognitivo(estado):
    """Obtener pacientes por estado cognitivo"""
    try:
        pacientes = Paciente.query.filter_by(
            estado_cognitivo=estado,
            estado_paciente=1
        ).all()
        
        pacientes_list = []
        for paciente in pacientes:
            pacientes_list.append({
                'id_paciente': paciente.id_paciente,
                'nombres': paciente.nombres,
                'apellidos': paciente.apellidos,
                'cedula': paciente.cedula,
                'fecha_nacimiento': paciente.fecha_nacimiento.isoformat() if paciente.fecha_nacimiento else None,
                'edad': paciente.edad,
                'telefono': paciente.telefono,
                'direccion': paciente.direccion,
                'contacto_emergencia': paciente.contacto_emergencia,
                'telefono_emergencia': paciente.telefono_emergencia,
                'estado_cognitivo': paciente.estado_cognitivo,
                'medicamentos': paciente.medicamentos,
                'estado_paciente': paciente.estado_paciente,
                'fecha_registro': paciente.fecha_registro.isoformat() if paciente.fecha_registro else None
            })
        
        return jsonify({
            'success': True,
            'message': f'Se encontraron {len(pacientes_list)} pacientes con estado cognitivo: {estado}',
            'pacientes': pacientes_list
        }), 200
        
    except Exception as e:
        logger.error(f"Error al obtener pacientes por estado cognitivo: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@pacientes_bp.route('/pacientes/estadisticas', methods=['GET'])
def get_estadisticas_pacientes():
    """Obtener estadísticas de pacientes"""
    try:
        total_pacientes = Paciente.query.filter_by(estado_paciente=1).count()
        pacientes_activos = Paciente.query.filter_by(estado_paciente=1).count()
        pacientes_inactivos = Paciente.query.filter_by(estado_paciente=0).count()
        
        # Estadísticas por estado cognitivo
        estados_cognitivos = db.session.query(
            Paciente.estado_cognitivo,
            db.func.count(Paciente.id_paciente)
        ).filter_by(estado_paciente=1).group_by(Paciente.estado_cognitivo).all()
        
        estadisticas_cognitivas = {}
        for estado, count in estados_cognitivos:
            estadisticas_cognitivas[estado] = count
        
        return jsonify({
            'success': True,
            'data': {
                'total_pacientes': total_pacientes,
                'pacientes_activos': pacientes_activos,
                'pacientes_inactivos': pacientes_inactivos,
                'estados_cognitivos': estadisticas_cognitivas
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error al obtener estadísticas: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor al obtener estadísticas'
        }), 500

@pacientes_bp.route('/pacientes/<int:paciente_id>/estado', methods=['PATCH'])
def toggle_estado_paciente(paciente_id):
    """Activar/Desactivar paciente"""
    try:
        paciente = Paciente.query.get(paciente_id)
        
        if not paciente:
            return jsonify({
                'success': False,
                'message': 'Paciente no encontrado'
            }), 404
        
        data = request.get_json()
        nuevo_estado = data.get('estado_paciente')
        
        if nuevo_estado not in [0, 1]:
            return jsonify({
                'success': False,
                'message': 'Estado inválido. Debe ser 0 (inactivo) o 1 (activo)'
            }), 400
        
        paciente.estado_paciente = nuevo_estado
        paciente.fecha_actualizacion = datetime.now()
        
        db.session.commit()
        
        paciente_data = {
            'id_paciente': paciente.id_paciente,
            'nombres': paciente.nombres,
            'apellidos': paciente.apellidos,
            'estado_paciente': paciente.estado_paciente,
            'fecha_actualizacion': paciente.fecha_actualizacion.isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': f'Paciente {"activado" if nuevo_estado == 1 else "desactivado"} exitosamente',
            'data': paciente_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al cambiar estado del paciente {paciente_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500
