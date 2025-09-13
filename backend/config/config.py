import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:password@localhost:5432/tesis_deterioro_cognitivo'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']  # Vite dev server
    
    # Pagination
    USERS_PER_PAGE = 10

class DevelopmentConfig(Config):
    DEBUG = True
    # Usar PostgreSQL también en desarrollo
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:password@localhost:5432/tesis_deterioro_cognitivo'
    # Permitir más orígenes en desarrollo
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5175']

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
