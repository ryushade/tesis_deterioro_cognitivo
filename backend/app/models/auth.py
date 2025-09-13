from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Rol(db.Model):
    __tablename__ = 'rol'
    
    id_rol = db.Column(db.Integer, primary_key=True)
    nom_rol = db.Column(db.String(250), nullable=False, unique=True)
    estado_rol = db.Column(db.Boolean, nullable=False, default=True)
    
    # Relationship
    usuarios = db.relationship('Usuario', backref='rol', lazy=True)
    
    def __repr__(self):
        return f'<Rol {self.nom_rol}>'
    
    def to_dict(self):
        return {
            'id_rol': self.id_rol,
            'nom_rol': self.nom_rol,
            'estado_rol': self.estado_rol
        }

class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    id_usuario = db.Column(db.Integer, primary_key=True)
    id_rol = db.Column(db.Integer, db.ForeignKey('rol.id_rol'), nullable=False)
    usua = db.Column(db.String(30), nullable=False, unique=True)
    contra = db.Column(db.String(250), nullable=False)
    
    def __repr__(self):
        return f'<Usuario {self.usua}>'
    
    def set_password(self, password):
        """Hash and set password"""
        self.contra = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash or plain text (for existing data)"""
        # First try direct comparison for existing plain text passwords
        if self.contra == password:
            return True
        # Then try hash comparison for new passwords
        try:
            return check_password_hash(self.contra, password)
        except:
            return False
    
    def to_dict(self, include_password=False):
        data = {
            'id_usuario': self.id_usuario,
            'id_rol': self.id_rol,
            'usua': self.usua,
            'rol': self.rol.to_dict() if self.rol else None
        }
        if include_password:
            data['contra'] = self.contra
        return data
