"""Script para inicializar la base de datos."""
from app.utils.database import init_database

if __name__ == "__main__":
    print("Inicializando base de datos...")
    init_database()
