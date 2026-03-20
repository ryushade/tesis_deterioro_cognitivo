import os
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor


load_dotenv()


def obtener_conexion():
    # Retorna una sola conexión usando las variables de entorno si existen, 
    # o los valores por defecto locales si no existen.
    # Siempre con RealDictCursor para mantener la consistencia en el tipo de dato devuelto.
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "deterioro_cognitivo"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "060902"),
        cursor_factory=RealDictCursor   
    )
