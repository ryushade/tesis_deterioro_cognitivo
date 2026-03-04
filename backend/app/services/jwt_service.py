import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

from config import settings


class JWTService:
    def __init__(self):
        self.secret = settings.JWT_SECRET
        self.expiration_hours = settings.JWT_EXPIRATION_HOURS
    
    def generate_token(self, user: dict) -> str:
        """Generar un token JWT para el usuario."""
        payload = {
            "user_id": user["id"],
            "email": user["email"],
            "rol": user["rol"],
            "exp": datetime.utcnow() + timedelta(hours=self.expiration_hours),
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")
    
    def decode_token(self, token: str) -> dict | None:
        """Decodificar y validar un token JWT."""
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None


# Instancia global
_jwt_service = JWTService()


def token_required(f):
    """Decorador para proteger rutas que requieren autenticación."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Buscar token en header Authorization
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Token requerido"}), 401
        
        payload = _jwt_service.decode_token(token)
        if not payload:
            return jsonify({"error": "Token inválido o expirado"}), 401
        
        # Obtener usuario de la base de datos
        from app.utils.database import get_db_connection
        
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT id, email, nombre, rol FROM usuarios WHERE id = %s",
                (payload["user_id"],)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            
            if not row:
                return jsonify({"error": "Usuario no encontrado"}), 401
            
            current_user = {
                "id": row[0],
                "email": row[1],
                "nombre": row[2],
                "rol": row[3]
            }
        except Exception as e:
            return jsonify({"error": f"Error de autenticación: {str(e)}"}), 500
        
        return f(current_user, *args, **kwargs)
    
    return decorated
