"""
Servicio de autenticación usando psycopg2 para conexiones directas a PostgreSQL
"""
from app.services.database_service import db_service
from werkzeug.security import generate_password_hash, check_password_hash
import logging

logger = logging.getLogger(__name__)

class AuthServicePsycopg2:
    
    def authenticate_user(self, username, password):
        """Autenticar usuario con username y password"""
        try:
            query = """
                SELECT 
                    u.id_usuario,
                    u.usua,
                    u.contra,
                    u.id_rol,
                    r.nom_rol,
                    r.estado_rol
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.usua = %s AND r.estado_rol = true
            """
            
            usuario = db_service.execute_one(query, (username,))
            
            if usuario and self._check_password(password, usuario['contra']):
                return {
                    'id_usuario': usuario['id_usuario'],
                    'usua': usuario['usua'],
                    'id_rol': usuario['id_rol'],
                    'nom_rol': usuario['nom_rol'],
                    'estado_rol': usuario['estado_rol']
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    def _check_password(self, password, hashed_password):
        """Verificar password contra hash o texto plano (para datos existentes)"""
        # Primero intentar comparación directa para passwords en texto plano existentes
        if hashed_password == password:
            return True
        
        # Luego intentar verificación de hash para passwords nuevos
        try:
            return check_password_hash(hashed_password, password)
        except:
            return False
    
    def create_user(self, username, password, id_rol=1):
        """Crear un nuevo usuario"""
        try:
            # Verificar si el usuario ya existe
            existing_query = "SELECT id_usuario FROM usuario WHERE usua = %s"
            existing_user = db_service.execute_one(existing_query, (username,))
            
            if existing_user:
                return None, "El usuario ya existe"
            
            # Verificar si el rol existe
            role_query = "SELECT id_rol FROM rol WHERE id_rol = %s AND estado_rol = true"
            role = db_service.execute_one(role_query, (id_rol,))
            
            if not role:
                return None, "El rol no existe o está inactivo"
            
            # Crear nuevo usuario
            hashed_password = generate_password_hash(password)
            insert_query = """
                INSERT INTO usuario (usua, contra, id_rol)
                VALUES (%s, %s, %s)
                RETURNING id_usuario, usua, id_rol
            """
            
            nuevo_usuario = db_service.execute_one(insert_query, (username, hashed_password, id_rol))
            
            if nuevo_usuario:
                return dict(nuevo_usuario), "Usuario creado exitosamente"
            else:
                return None, "Error al crear usuario"
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None, f"Error creating user: {str(e)}"
    
    def get_user_by_id(self, user_id):
        """Obtener usuario por ID"""
        try:
            query = """
                SELECT 
                    u.id_usuario,
                    u.usua,
                    u.id_rol,
                    r.nom_rol,
                    r.estado_rol
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = %s AND r.estado_rol = true
            """
            
            usuario = db_service.execute_one(query, (user_id,))
            return dict(usuario) if usuario else None
            
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    def get_all_users(self):
        """Obtener todos los usuarios con sus roles"""
        try:
            query = """
                SELECT 
                    u.id_usuario,
                    u.usua,
                    u.id_rol,
                    r.nom_rol,
                    r.estado_rol
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE r.estado_rol = true
                ORDER BY u.usua
            """
            
            usuarios = db_service.execute_query(query)
            return [dict(u) for u in usuarios] if usuarios else []
            
        except Exception as e:
            logger.error(f"Error getting users: {e}")
            return []
    
    def get_all_roles(self):
        """Obtener todos los roles activos"""
        try:
            query = """
                SELECT id_rol, nom_rol, estado_rol
                FROM rol
                WHERE estado_rol = true
                ORDER BY nom_rol
            """
            
            roles = db_service.execute_query(query)
            return [dict(r) for r in roles] if roles else []
            
        except Exception as e:
            logger.error(f"Error getting roles: {e}")
            return []
    
    def create_default_roles(self):
        """Crear roles por defecto si no existen"""
        try:
            default_roles = [
                {'nom_rol': 'Administrador', 'estado_rol': True},
                {'nom_rol': 'Neuropsicólogo', 'estado_rol': True},
                {'nom_rol': 'Paciente', 'estado_rol': True},
                {'nom_rol': 'Investigador', 'estado_rol': True}
            ]
            
            for role_data in default_roles:
                # Verificar si el rol ya existe
                check_query = "SELECT id_rol FROM rol WHERE nom_rol = %s"
                existing_role = db_service.execute_one(check_query, (role_data['nom_rol'],))
                
                if not existing_role:
                    insert_query = """
                        INSERT INTO rol (nom_rol, estado_rol)
                        VALUES (%s, %s)
                        RETURNING id_rol, nom_rol
                    """
                    new_role = db_service.execute_one(insert_query, (role_data['nom_rol'], role_data['estado_rol']))
                    logger.info(f"Rol creado: {new_role['nom_rol']} (ID: {new_role['id_rol']})")
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating default roles: {e}")
            return False
    
    def create_default_admin(self):
        """Crear usuario admin por defecto"""
        try:
            # Asegurar que el rol de administrador existe
            admin_role_query = "SELECT id_rol FROM rol WHERE nom_rol = 'Administrador' AND estado_rol = true"
            admin_role = db_service.execute_one(admin_role_query)
            
            if not admin_role:
                # Crear rol de administrador
                create_role_query = """
                    INSERT INTO rol (nom_rol, estado_rol)
                    VALUES ('Administrador', true)
                    RETURNING id_rol
                """
                admin_role = db_service.execute_one(create_role_query)
                logger.info(f"Rol Administrador creado con ID: {admin_role['id_rol']}")
            
            # Verificar si el usuario admin ya existe
            admin_user_query = "SELECT id_usuario FROM usuario WHERE usua = 'admin'"
            admin_user = db_service.execute_one(admin_user_query)
            
            if not admin_user:
                # Crear usuario admin
                hashed_password = generate_password_hash('admin123')
                create_admin_query = """
                    INSERT INTO usuario (usua, contra, id_rol)
                    VALUES ('admin', %s, %s)
                    RETURNING id_usuario, usua
                """
                new_admin = db_service.execute_one(create_admin_query, (hashed_password, admin_role['id_rol']))
                logger.info(f"Usuario admin creado con ID: {new_admin['id_usuario']}")
                return True, "Usuario admin creado: admin/admin123"
            
            return True, "Usuario admin ya existe"
            
        except Exception as e:
            logger.error(f"Error creating admin: {e}")
            return False, f"Error creating admin: {str(e)}"

# Instancia global del servicio
auth_service_psycopg2 = AuthServicePsycopg2()
