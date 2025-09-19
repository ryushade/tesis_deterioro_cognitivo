"""
Script temporal para verificar roles y usuarios en la base de datos
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.auth_service_psycopg2 import auth_service_psycopg2

def verificar_roles_usuarios():
    print("=== VERIFICACIÓN DE ROLES Y USUARIOS ===\n")
    
    # Obtener todos los roles
    print("1. ROLES EN LA BASE DE DATOS:")
    roles = auth_service_psycopg2.get_all_roles()
    for rol in roles:
        print(f"   - ID: {rol['id_rol']}, Nombre: '{rol['nom_rol']}', Activo: {rol['estado_rol']}")
    
    print(f"\nTotal de roles activos: {len(roles)}")
    
    # Obtener todos los usuarios
    print("\n2. USUARIOS EN LA BASE DE DATOS:")
    usuarios = auth_service_psycopg2.get_all_users()
    for usuario in usuarios:
        print(f"   - ID: {usuario['id_usuario']}, Username: '{usuario['usua']}', Rol: '{usuario['nom_rol']}' (ID: {usuario['id_rol']})")
    
    print(f"\nTotal de usuarios: {len(usuarios)}")
    
    # Probar autenticación con usuarios comunes
    print("\n3. PRUEBAS DE AUTENTICACIÓN:")
    usuarios_prueba = ['admin', 'neuropsico', 'test', 'doctor', 'medico']
    passwords_prueba = ['admin123', 'admin', '123', 'password', 'test']
    
    for username in usuarios_prueba:
        for password in passwords_prueba:
            resultado = auth_service_psycopg2.authenticate_user(username, password)
            if resultado:
                print(f"   ✅ Login exitoso: {username}/{password}")
                print(f"      Usuario: {resultado['usua']}, Rol: {resultado['nom_rol']}")
                break
        else:
            print(f"   ❌ No se pudo autenticar: {username}")

if __name__ == "__main__":
    verificar_roles_usuarios()
