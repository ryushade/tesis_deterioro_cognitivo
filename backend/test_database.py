#!/usr/bin/env python3

"""
Ejemplo de uso de la base de datos estilo PyMySQL
Este script muestra cómo interactuar con la base de datos de manera directa
"""

import sys
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.utils.database import db
from app.services.user_database_service import UserDatabaseService

def test_database_connection():
    """Test database connection"""
    print("🔗 Probando conexión a la base de datos...")
    try:
        # Test simple query
        result = db.execute_one("SELECT 1 as test")
        print(f"✅ Conexión exitosa: {result}")
        return True
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def show_all_users():
    """Show all users in database"""
    print("\n👥 Usuarios en la base de datos:")
    try:
        result = UserDatabaseService.get_all_users()
        if result['users']:
            for user in result['users']:
                print(f"  ID: {user['id']}, Nombre: {user['name']}, Email: {user['email']}")
        else:
            print("  No hay usuarios en la base de datos")
    except Exception as e:
        print(f"❌ Error: {e}")

def create_sample_user():
    """Create a sample user"""
    print("\n➕ Creando usuario de prueba...")
    try:
        user = UserDatabaseService.create_user(
            name="Usuario Prueba",
            email=f"prueba_{hash(str(__file__))}@example.com"
        )
        print(f"✅ Usuario creado: {user['name']} ({user['email']})")
        return user['id']
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_direct_queries():
    """Test direct database queries"""
    print("\n🔍 Probando consultas directas:")
    
    try:
        # Count users
        count_result = db.execute_one("SELECT COUNT(*) as total FROM users")
        print(f"  Total de usuarios: {count_result['total']}")
        
        # Get recent users
        recent_users = db.execute_query(
            "SELECT name, email FROM users ORDER BY created_at DESC LIMIT 3"
        )
        print("  Usuarios recientes:")
        for user in recent_users:
            print(f"    - {user['name']} ({user['email']})")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main function"""
    print("🚀 Ejemplo de uso de base de datos - Estilo PyMySQL")
    print("=" * 50)
    
    # Test connection
    if not test_database_connection():
        print("❌ No se pudo conectar a la base de datos. Verifica la configuración.")
        return
    
    # Show existing users
    show_all_users()
    
    # Create sample user
    user_id = create_sample_user()
    
    # Show users again
    show_all_users()
    
    # Test direct queries
    test_direct_queries()
    
    # Clean up (delete test user)
    if user_id:
        print(f"\n🗑️ Eliminando usuario de prueba (ID: {user_id})...")
        try:
            UserDatabaseService.delete_user(user_id)
            print("✅ Usuario eliminado")
        except Exception as e:
            print(f"❌ Error eliminando usuario: {e}")
    
    print("\n✅ Ejemplo completado!")

if __name__ == "__main__":
    main()
