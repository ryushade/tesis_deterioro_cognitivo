import bcrypt
from typing import Optional

from app.utils.database import get_db_connection
from app.services.jwt_service import JWTService


class AuthService:
    def __init__(self):
        self.jwt_service = JWTService()
    
    def hash_password(self, password: str) -> str:
        """Hashear una contraseña con bcrypt."""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verificar una contraseña contra su hash."""
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Obtener un usuario por su email."""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, password_hash, nombre, rol FROM usuarios WHERE email = %s",
            (email,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return None
        
        return {
            "id": row[0],
            "email": row[1],
            "password_hash": row[2],
            "nombre": row[3],
            "rol": row[4]
        }
    
    def register(self, email: str, password: str, nombre: str, rol: str = "usuario") -> dict:
        """Registrar un nuevo usuario."""
        # Verificar si el email ya existe
        existing = self.get_user_by_email(email)
        if existing:
            return {"error": "El email ya está registrado"}
        
        # Validar contraseña
        if len(password) < 6:
            return {"error": "La contraseña debe tener al menos 6 caracteres"}
        
        # Crear usuario
        password_hash = self.hash_password(password)
        
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO usuarios (email, password_hash, nombre, rol)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (email, password_hash, nombre, rol)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            user = {
                "id": user_id,
                "email": email,
                "nombre": nombre,
                "rol": rol
            }
            
            token = self.jwt_service.generate_token(user)
            
            return {
                "message": "Usuario registrado exitosamente",
                "user": user,
                "token": token
            }
        except Exception as e:
            return {"error": f"Error al registrar usuario: {str(e)}"}
    
    def login(self, email: str, password: str) -> dict:
        """Iniciar sesión."""
        user = self.get_user_by_email(email)
        
        if not user:
            return {"error": "Credenciales inválidas"}
        
        if not self.verify_password(password, user["password_hash"]):
            return {"error": "Credenciales inválidas"}
        
        # Generar token
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "nombre": user["nombre"],
            "rol": user["rol"]
        }
        
        token = self.jwt_service.generate_token(user_data)
        
        return {
            "message": "Login exitoso",
            "user": user_data,
            "token": token
        }
