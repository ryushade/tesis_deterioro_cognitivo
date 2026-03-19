import psycopg2
from psycopg2.extras import RealDictCursor

from config import settings


def get_db_connection():
    """Obtener una conexión a la base de datos PostgreSQL."""
    return psycopg2.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD
    )


def get_db_dict_connection():
    """Obtener una conexión que retorna diccionarios en lugar de tuplas."""
    return psycopg2.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        cursor_factory=RealDictCursor
    )


def init_database():
    """Crear las tablas necesarias en la base de datos."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Tabla de usuarios
    cur.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'usuario',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("Base de datos inicializada correctamente")


if __name__ == "__main__":
    init_database()
