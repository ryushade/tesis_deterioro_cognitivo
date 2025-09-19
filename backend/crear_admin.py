"""
Script para crear usuario administrador
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.auth_service_psycopg2 import auth_service_psycopg2

def crear_admin():
    print("=== CREANDO USUARIO ADMINISTRADOR ===\n")
    
    # Intentar crear usuario admin
    resultado, mensaje = auth_service_psycopg2.create_default_admin()
    
    if resultado:
        print(f"✅ {mensaje}")
    else:
        print(f"❌ Error: {mensaje}")
    
    # Verificar que se creó correctamente
    print("\nVerificando usuarios después de la creación:")
    usuarios = auth_service_psycopg2.get_all_users()
    for usuario in usuarios:
        print(f"   - Username: '{usuario['usua']}', Rol: '{usuario['nom_rol']}'")
    
    # Probar login con admin
    print("\nProbando login con admin:")
    auth_result = auth_service_psycopg2.authenticate_user('admin', 'admin123')
    if auth_result:
        print("✅ Login de admin funciona correctamente")
        print(f"   Usuario: {auth_result['usua']}, Rol: {auth_result['nom_rol']}")
    else:
        print("❌ Error en login de admin")

if __name__ == "__main__":
    crear_admin()
