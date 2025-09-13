from app import db
from app.models.auth import Usuario, Rol
from werkzeug.security import generate_password_hash

class AuthService:
    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user with username and password"""
        try:
            usuario = Usuario.query.filter_by(usua=username).first()
            
            if usuario and usuario.check_password(password):
                # Check if user's role is active
                if usuario.rol and usuario.rol.estado_rol:
                    return usuario
                else:
                    return None  # Role is inactive
            return None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None
    
    @staticmethod
    def create_user(username, password, id_rol=1):
        """Create a new user"""
        try:
            # Check if username already exists
            existing_user = Usuario.query.filter_by(usua=username).first()
            if existing_user:
                return None, "El usuario ya existe"
            
            # Check if role exists
            rol = Rol.query.get(id_rol)
            if not rol:
                return None, "El rol no existe"
            
            # Create new user
            usuario = Usuario(
                usua=username,
                id_rol=id_rol
            )
            usuario.set_password(password)
            
            db.session.add(usuario)
            db.session.commit()
            
            return usuario, "Usuario creado exitosamente"
            
        except Exception as e:
            db.session.rollback()
            return None, f"Error creating user: {str(e)}"
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            return Usuario.query.get(user_id)
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    @staticmethod
    def get_all_users():
        """Get all users with their roles"""
        try:
            return Usuario.query.join(Rol).filter(Rol.estado_rol == True).all()
        except Exception as e:
            print(f"Error getting users: {e}")
            return []
    
    @staticmethod
    def create_default_roles():
        """Create default roles if they don't exist"""
        try:
            default_roles = [
                {'nom_rol': 'Administrador', 'estado_rol': True},
                {'nom_rol': 'Neuropsicólogo', 'estado_rol': True},
                {'nom_rol': 'Paciente', 'estado_rol': True},
                {'nom_rol': 'Investigador', 'estado_rol': True}
            ]
            
            for role_data in default_roles:
                existing_role = Rol.query.filter_by(nom_rol=role_data['nom_rol']).first()
                if not existing_role:
                    role = Rol(**role_data)
                    db.session.add(role)
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating default roles: {e}")
            return False
    
    @staticmethod
    def create_default_admin():
        """Create default admin user"""
        try:
            # Ensure admin role exists
            admin_role = Rol.query.filter_by(nom_rol='Administrador').first()
            if not admin_role:
                admin_role = Rol(nom_rol='Administrador', estado_rol=True)
                db.session.add(admin_role)
                db.session.commit()
            
            # Check if admin user exists
            admin_user = Usuario.query.filter_by(usua='admin').first()
            if not admin_user:
                admin_user = Usuario(
                    usua='admin',
                    id_rol=admin_role.id_rol
                )
                admin_user.set_password('admin123')  # Default password
                db.session.add(admin_user)
                db.session.commit()
                return True, "Usuario admin creado: admin/admin123"
            
            return True, "Usuario admin ya existe"
            
        except Exception as e:
            db.session.rollback()
            return False, f"Error creating admin: {str(e)}"
