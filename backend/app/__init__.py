from flask import Flask
from flask_cors import CORS
from config.config import config_by_name
import os

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Enable CORS with explicit headers and methods for preflight support
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config['CORS_ORIGINS'],
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            }
        },
    )
    
    # Register blueprints
    from app.routes.users_db import users_db_bp
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.pacientes import pacientes_bp
    from app.routes.codigos_acceso import codigos_acceso_bp
    from app.routes.prueba_cognitiva import prueba_cognitiva_bp
    from app.routes.cdt_psycopg2 import cdt_psycopg2_bp
    from app.routes.neuropsicologos import neuropsicologos_bp
    from app.routes.mmse import mmse_bp
    from app.routes.mmse_config import mmse_config_bp
    from app.routes.users_psycopg2 import users_psycopg2_bp
    from app.routes.dashboard import dashboard_bp
    
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(users_db_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(pacientes_bp, url_prefix='/api/pacientes')
    app.register_blueprint(codigos_acceso_bp, url_prefix='/api/codigos-acceso')
    app.register_blueprint(prueba_cognitiva_bp, url_prefix='/api/pruebas-cognitivas')
    app.register_blueprint(cdt_psycopg2_bp)
    app.register_blueprint(neuropsicologos_bp, url_prefix='/api/neuropsicologos')
    app.register_blueprint(mmse_bp)
    app.register_blueprint(mmse_config_bp)
    app.register_blueprint(users_psycopg2_bp, url_prefix='/api/users')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    return app

