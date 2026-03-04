from flask import Flask, request, jsonify
from flask_cors import CORS

from config import settings
from app.utils.database import get_db_connection
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService, token_required


def create_app() -> Flask:
    app = Flask(__name__)
    
    # Configuración
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["DEBUG"] = settings.DEBUG
    
    # CORS
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
    
    # Servicios
    auth_service = AuthService()
    jwt_service = JWTService()
    
    # ==================== HEALTH ====================
    
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "Backend funcionando correctamente"
        })
    
    @app.route("/health/db", methods=["GET"])
    def database_health():
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.close()
            conn.close()
            return jsonify({"status": "healthy", "database": "conectada"})
        except Exception as e:
            return jsonify({"status": "unhealthy", "error": str(e)}), 500
    
    # ==================== AUTH ====================
    
    @app.route("/api/auth/register", methods=["POST"])
    def register():
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Se requieren datos"}), 400
        
        for field in ["email", "password", "nombre"]:
            if field not in data:
                return jsonify({"error": f"Campo requerido: {field}"}), 400
        
        result = auth_service.register(
            email=data["email"],
            password=data["password"],
            nombre=data["nombre"],
            rol=data.get("rol", "usuario")
        )
        
        if result.get("error"):
            return jsonify(result), 400
        
        return jsonify(result), 201
    
    @app.route("/api/auth/login", methods=["POST"])
    def login():
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email y contraseña requeridos"}), 400
        
        result = auth_service.login(data["email"], data["password"])
        
        if result.get("error"):
            return jsonify(result), 401
        
        return jsonify(result)
    
    @app.route("/api/auth/me", methods=["GET"])
    @token_required
    def get_current_user(current_user):
        return jsonify({
            "id": current_user["id"],
            "email": current_user["email"],
            "nombre": current_user["nombre"],
            "rol": current_user["rol"]
        })
    
    return app
