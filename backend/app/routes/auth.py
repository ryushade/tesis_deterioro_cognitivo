from flask import Blueprint, request, jsonify
from app.services.auth_service_psycopg2 import auth_service_psycopg2 as auth_service
from app.services.jwt_service import JWTService
from app.services.codigos_acceso_service import CodigosAccesoService
from datetime import datetime
# from app.models.auth import Rol  # Comentado - usando psycopg2

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint with JWT"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Authenticate user
        usuario = auth_service.authenticate_user(username, password)
        
        if usuario:
            # Generate JWT token
            token = JWTService.generate_token(
                user_id=usuario['id_usuario'],
                username=usuario['usua'],
                role_id=usuario['id_rol'],
                role_name=usuario['nom_rol']
            )
            
            if token:
                return jsonify({
                    'success': True,
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'id': usuario['id_usuario'],
                        'username': usuario['usua'],
                        'role': {
                            'id': usuario['id_rol'],
                            'name': usuario['nom_rol']
                        }
                    }
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Token generation failed'
                }), 500
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials or inactive role'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login error: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint (client-side token removal)"""
    try:
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Logout error: {str(e)}'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@JWTService.token_required
def get_current_user():
    """Get current user information from JWT"""
    try:
        user_data = request.current_user
        usuario = auth_service.get_user_by_id(user_data['user_id'])
        
        if usuario:
            return jsonify({
                'success': True,
                'user': {
                    'id': usuario['id_usuario'],
                    'username': usuario['usua'],
                    'role': {
                        'id': usuario['id_rol'],
                        'name': usuario['nom_rol']
                    }
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting user: {str(e)}'
        }), 500

@auth_bp.route('/register', methods=['POST'])
@JWTService.token_required
@JWTService.admin_required
def register():
    """Register new user (admin only)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        role_id = data.get('role_id', 2)  # Default to 'Paciente' role
        
        # Create user
        usuario, message = auth_service.create_user(username, password, role_id)
        
        if usuario:
            return jsonify({
                'success': True,
                'message': message,
                'user': {
                    'id': usuario['id_usuario'],
                    'username': usuario['usua'],
                    'role': {
                        'id': usuario['id_rol'],
                        'name': 'Usuario'  # Nombre temporal, se puede obtener luego
                    }
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Registration error: {str(e)}'
        }), 500

@auth_bp.route('/roles', methods=['GET'])
@JWTService.token_required
def get_roles():
    """Get all active roles"""
    try:
        roles = auth_service.get_all_roles()
        
        return jsonify({
            'success': True,
            'roles': [{'id_rol': r['id_rol'], 'nom_rol': r['nom_rol'], 'estado_rol': r['estado_rol']} for r in roles]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting roles: {str(e)}'
        }), 500

@auth_bp.route('/verify-token', methods=['POST'])
@JWTService.token_required
def verify_token():
    """Verify if token is valid"""
    try:
        user_data = request.current_user
        return jsonify({
            'success': True,
            'message': 'Token is valid',
            'user': {
                'id': user_data['user_id'],
                'username': user_data['username'],
                'role': {
                    'id': user_data['role_id'],
                    'name': user_data['role_name']
                }
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Token verification error: {str(e)}'
        }), 500

@auth_bp.route('/patient-login', methods=['POST'])
def patient_login():
    """Patient login with access code"""
    try:
        data = request.get_json()
        
        if not data or not data.get('access_code'):
            return jsonify({
                'success': False,
                'message': 'Access code is required'
            }), 400
        
        access_code = data.get('access_code').strip()
        
        # Initialize service
        codigos_service = CodigosAccesoService()
        
        # Get the access code from database
        codigo_data = codigos_service.get_by_codigo(access_code)
        
        if not codigo_data:
            return jsonify({
                'success': False,
                'message': 'Código de acceso no encontrado'
            }), 401
        
        # Check if code is in 'emitido' state
        if codigo_data['estado'] != 'emitido':
            if codigo_data['estado'] == 'usado':
                return jsonify({
                    'success': False,
                    'message': 'Este código ya fue utilizado'
                }), 401
            elif codigo_data['estado'] == 'vencido':
                return jsonify({
                    'success': False,
                    'message': 'Este código ha vencido'
                }), 401
            elif codigo_data['estado'] == 'revocado':
                return jsonify({
                    'success': False,
                    'message': 'Este código ha sido revocado'
                }), 401
            else:
                return jsonify({
                    'success': False,
                    'message': f'Código en estado inválido: {codigo_data["estado"]}'
                }), 401
        
        # Check if code has expired
        if codigo_data.get('fecha_expiracion'):
            fecha_exp = datetime.fromisoformat(codigo_data['fecha_expiracion'].replace('Z', '+00:00'))
            if fecha_exp < datetime.now(fecha_exp.tzinfo or None):
                # Mark as expired
                codigos_service.update(codigo_data['id_codigo'], {'estado': 'vencido'})
                return jsonify({
                    'success': False,
                    'message': 'Este código ha vencido'
                }), 401
        
        # Mark code as used (this is where it should be marked!)
        mark_result = codigos_service.marcar_como_usado(access_code)
        
        if not mark_result['success']:
            return jsonify({
                'success': False,
                'message': f'Error al validar código: {mark_result["message"]}'
            }), 400
        
        # Generate a limited token for patient access
        token = JWTService.generate_token(
            user_id=codigo_data['id_paciente'],
            username=f'patient_{codigo_data["id_paciente"]}',
            role_id=3,  # Patient role
            role_name='Paciente'
        )
        
        if token:
            return jsonify({
                'success': True,
                'message': 'Patient access granted',
                'token': token,
                'user': {
                    'id': codigo_data['id_paciente'],
                    'username': f'patient_{codigo_data["id_paciente"]}',
                    'role': {
                        'id': 3,
                        'name': 'Paciente'
                    },
                    'access_type': 'patient_code'
                },
                'codigo_info': {
                    'codigo': codigo_data['codigo'],
                    'tipo_evaluacion': codigo_data['tipo_evaluacion'],
                    'nombre_paciente': codigo_data['nombre_paciente'],
                    'id_paciente': codigo_data['id_paciente']
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Token generation failed'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Patient login error: {str(e)}'
        }), 500

@auth_bp.route('/init-db', methods=['POST'])
def init_database():
    """Initialize database with default data"""
    try:
        # Create default roles
        roles_created = auth_service.create_default_roles()
        
        # Create default admin user
        admin_created, admin_message = auth_service.create_default_admin()
        
        return jsonify({
            'success': True,
            'message': f'Database initialized. {admin_message}',
            'roles_created': roles_created,
            'admin_created': admin_created
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Database initialization error: {str(e)}'
        }), 500
