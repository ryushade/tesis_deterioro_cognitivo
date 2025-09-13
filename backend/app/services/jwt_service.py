import jwt
from datetime import datetime, timedelta
from flask import current_app
from functools import wraps
from flask import request, jsonify

class JWTService:
    @staticmethod
    def generate_token(user_id, username, role_id=None, role_name=None):
        """Generate JWT token for user"""
        try:
            payload = {
                'user_id': user_id,
                'username': username,
                'role_id': role_id,
                'role_name': role_name,
                'exp': datetime.utcnow() + timedelta(hours=24),  # Token expires in 24 hours
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(
                payload,
                current_app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            
            return token
        except Exception as e:
            print(f"Error generating token: {e}")
            return None
    
    @staticmethod
    def decode_token(token):
        """Decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def token_required(f):
        """Decorator for routes that require authentication"""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Check for token in Authorization header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]  # Bearer TOKEN
                except IndexError:
                    return jsonify({
                        'success': False,
                        'message': 'Token format invalid'
                    }), 401
            
            if not token:
                return jsonify({
                    'success': False,
                    'message': 'Token is missing'
                }), 401
            
            try:
                data = JWTService.decode_token(token)
                if data is None:
                    return jsonify({
                        'success': False,
                        'message': 'Token is invalid or expired'
                    }), 401
                
                # Add user data to request context
                request.current_user = data
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': 'Token validation failed'
                }), 401
            
            return f(*args, **kwargs)
        
        return decorated
    
    @staticmethod
    def admin_required(f):
        """Decorator for routes that require admin role"""
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({
                    'success': False,
                    'message': 'Authentication required'
                }), 401
            
            if request.current_user.get('role_name') != 'Administrador':
                return jsonify({
                    'success': False,
                    'message': 'Admin privileges required'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    @staticmethod
    def neuropsicologo_required(f):
        """Decorator for routes that require neuropsicólogo role"""
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({
                    'success': False,
                    'message': 'Authentication required'
                }), 401
            
            allowed_roles = ['Administrador', 'Neuropsicólogo']
            if request.current_user.get('role_name') not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': 'Neuropsicólogo privileges required'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    @staticmethod
    def role_required(allowed_roles):
        """Decorator for routes that require specific roles"""
        def decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                if not hasattr(request, 'current_user'):
                    return jsonify({
                        'success': False,
                        'message': 'Authentication required'
                    }), 401
                
                user_role = request.current_user.get('role_name')
                if user_role not in allowed_roles:
                    return jsonify({
                        'success': False,
                        'message': f'Required roles: {", ".join(allowed_roles)}'
                    }), 403
                
                return f(*args, **kwargs)
            
            return decorated
        return decorator
    
    @staticmethod
    def patient_access_allowed(f):
        """Decorator for routes that allow patient access"""
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({
                    'success': False,
                    'message': 'Authentication required'
                }), 401
            
            # Allow all authenticated users including patients
            return f(*args, **kwargs)
        
        return decorated
