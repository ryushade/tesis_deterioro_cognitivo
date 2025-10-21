"""
User service using direct database queries (PyMySQL style)
"""
from app.utils.database import db
from datetime import datetime

class UserDatabaseService:
    
    @staticmethod
    def get_all_users(page=1, limit=10):
        """Get all users with pagination"""
        offset = (page - 1) * limit
        
        # Get total count
        total_query = "SELECT COUNT(*) as total FROM users"
        total_result = db.execute_one(total_query)
        total = total_result['total'] if total_result else 0
        
        # Get users
        users_query = """
            SELECT id, name, email, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
        users = db.execute_query(users_query, (limit, offset))
        
        return {
            'users': users,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        query = "SELECT id, name, email, created_at, updated_at FROM users WHERE id = %s"
        return db.execute_one(query, (user_id,))
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        query = "SELECT id, name, email, created_at, updated_at FROM users WHERE email = %s"
        return db.execute_one(query, (email,))
    
    @staticmethod
    def create_user(name, email):
        """Create a new user"""
        # Check if email exists
        existing_user = UserDatabaseService.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already exists")
        
        query = """
            INSERT INTO users (name, email, created_at, updated_at) 
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, email, created_at, updated_at
        """
        now = datetime.utcnow()
        
        with db.get_cursor() as cursor:
            cursor.execute(query, (name, email, now, now))
            return cursor.fetchone()
    
    @staticmethod
    def update_user(user_id, name=None, email=None):
        """Update user"""
        # Check if user exists
        user = UserDatabaseService.get_user_by_id(user_id)
        if not user:
            return None
        
        # Check if email is being changed and already exists
        if email and email != user['email']:
            existing_user = UserDatabaseService.get_user_by_email(email)
            if existing_user:
                raise ValueError("Email already exists")
        
        # Build dynamic update query
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = %s")
            params.append(name)
        
        if email is not None:
            updates.append("email = %s")
            params.append(email)
        
        updates.append("updated_at = %s")
        params.append(datetime.utcnow())
        params.append(user_id)
        
        query = f"""
            UPDATE users 
            SET {', '.join(updates)} 
            WHERE id = %s
            RETURNING id, name, email, created_at, updated_at
        """
        
        with db.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()
    
    @staticmethod
    def delete_user(user_id):
        """Delete user"""
        query = "DELETE FROM users WHERE id = %s"
        rows_affected = db.execute_modify(query, (user_id,))
        return rows_affected > 0
    
    @staticmethod
    def search_users(search_term, page=1, limit=10):
        """Search users by name or email"""
        offset = (page - 1) * limit
        search_pattern = f"%{search_term}%"
        
        # Get total count
        total_query = """
            SELECT COUNT(*) as total 
            FROM users 
            WHERE name ILIKE %s OR email ILIKE %s
        """
        total_result = db.execute_one(total_query, (search_pattern, search_pattern))
        total = total_result['total'] if total_result else 0
        
        # Get users
        users_query = """
            SELECT id, name, email, created_at, updated_at 
            FROM users 
            WHERE name ILIKE %s OR email ILIKE %s
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
        users = db.execute_query(users_query, (search_pattern, search_pattern, limit, offset))
        
        return {
            'users': users,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }
    
    @staticmethod
    def get_total_active_users():
        """Obtener el total de usuarios activos"""
        try:
            # Usar la tabla usuario en lugar de users
            query = """
                SELECT COUNT(*) as total 
                FROM usuario u 
                JOIN rol r ON u.id_rol = r.id_rol 
                WHERE r.estado_rol = true
            """
            result = db.execute_one(query)
            return result['total'] if result else 0
        except Exception as e:
            print(f"Error obteniendo total de usuarios activos: {e}")
            return 0