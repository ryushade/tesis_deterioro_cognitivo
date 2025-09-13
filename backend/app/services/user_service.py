from app.models.user import User
from app import db

class UserService:
    @staticmethod
    def get_all_users(page=1, per_page=10):
        """Get all users with pagination"""
        return User.query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def create_user(name, email):
        """Create a new user"""
        user = User(name=name, email=email)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def update_user(user_id, **kwargs):
        """Update user"""
        user = User.query.get(user_id)
        if user:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            db.session.commit()
        return user
    
    @staticmethod
    def delete_user(user_id):
        """Delete user"""
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False
