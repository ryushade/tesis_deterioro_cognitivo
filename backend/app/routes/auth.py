from flask import Blueprint, request, jsonify
from app.services.auth_service_psycopg2 import auth_service_psycopg2 as auth_service
from app.services.jwt_service import JWTService
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
        
        access_code = data.get('access_code')
        
        # TODO: Implement patient authentication by access code
        # For now, we'll implement a simple validation
        # In a real system, you would:
        # 1. Check if the access code exists in a patient_access_codes table
        # 2. Verify if it's still valid (not expired)
        # 3. Get the associated patient information
        # 4. Generate a token with limited permissions
        
        # Temporary implementation - accept any 8-character code
        if len(access_code) == 8 and access_code.isalnum():
            # Generate a limited token for patient access
            token = JWTService.generate_token(
                user_id=9999,  # Special patient user ID
                username=f'patient_{access_code}',
                role_id=3,  # Patient role (you may need to create this role)
                role_name='Paciente'
            )
            
            if token:
                return jsonify({
                    'success': True,
                    'message': 'Patient access granted',
                    'token': token,
                    'user': {
                        'id': 9999,
                        'username': f'patient_{access_code}',
                        'role': {
                            'id': 3,
                            'name': 'Paciente'
                        },
                        'access_type': 'patient_code'
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
                'message': 'Código de acceso inválido. Debe tener 8 caracteres alfanuméricos.'
            }), 401
            
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
