"""
Modelo de Paciente actualizado según esquema de BD
"""

from app import db
from datetime import datetime, date
from sqlalchemy import text

class Paciente(db.Model):
    __tablename__ = 'paciente'
    
    id_paciente = db.Column(db.BigInteger, primary_key=True)
    nombres = db.Column(db.String(120), nullable=False)
    apellidos = db.Column(db.String(120), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    sexo = db.Column(db.CHAR(1), db.CheckConstraint("sexo IN ('M', 'F')"))
    anos_escolaridad = db.Column(db.SmallInteger)
    
    # Campos adicionales para funcionalidad completa
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    estado = db.Column(db.Boolean, default=True)  # activo/inactivo
    
    def __repr__(self):
        return f'<Paciente {self.nombres} {self.apellidos}>'
    
    @property
    def edad(self):
        """Calcular edad actual basada en fecha de nacimiento"""
        if self.fecha_nacimiento:
            today = date.today()
            return today.year - self.fecha_nacimiento.year - (
                (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )
        return None
    
    @property
    def nombre_completo(self):
        """Nombre completo del paciente"""
        return f"{self.nombres} {self.apellidos}"
    
    def to_dict(self):
        return {
            'id_paciente': self.id_paciente,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'nombre_completo': self.nombre_completo,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            'edad': self.edad,
            'sexo': self.sexo,
            'sexo_display': 'Masculino' if self.sexo == 'M' else 'Femenino' if self.sexo == 'F' else None,
            'anos_escolaridad': self.anos_escolaridad,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'estado': self.estado
        }
    
    @classmethod
    def create(cls, data):
        """Crear nuevo paciente"""
        paciente = cls(
            nombres=data.get('nombres'),
            apellidos=data.get('apellidos'),
            fecha_nacimiento=datetime.strptime(data.get('fecha_nacimiento'), '%Y-%m-%d').date(),
            sexo=data.get('sexo'),
            anos_escolaridad=data.get('anos_escolaridad')
        )
        db.session.add(paciente)
        db.session.commit()
        return paciente
    
    def update(self, data):
        """Actualizar paciente"""
        self.nombres = data.get('nombres', self.nombres)
        self.apellidos = data.get('apellidos', self.apellidos)
        if data.get('fecha_nacimiento'):
            self.fecha_nacimiento = datetime.strptime(data.get('fecha_nacimiento'), '%Y-%m-%d').date()
        self.sexo = data.get('sexo', self.sexo)
        self.anos_escolaridad = data.get('anos_escolaridad', self.anos_escolaridad)
        self.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        return self
    
    def delete(self):
        """Eliminación lógica"""
        self.estado = False
        self.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
    
    def restore(self):
        """Restaurar paciente"""
        self.estado = True
        self.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
    
    @classmethod
    def get_all(cls, include_inactive=False):
        """Obtener todos los pacientes"""
        query = cls.query
        if not include_inactive:
            query = query.filter(cls.estado == True)
        return query.order_by(cls.fecha_registro.desc()).all()
    
    @classmethod
    def get_by_id(cls, id_paciente):
        """Obtener paciente por ID"""
        return cls.query.filter(cls.id_paciente == id_paciente, cls.estado == True).first()
    
    @classmethod
    def search(cls, search_term):
        """Buscar pacientes por nombre o apellido"""
        if not search_term:
            return cls.get_all()
        
        search_pattern = f"%{search_term}%"
        return cls.query.filter(
            db.and_(
                cls.estado == True,
                db.or_(
                    cls.nombres.ilike(search_pattern),
                    cls.apellidos.ilike(search_pattern),
                    db.func.concat(cls.nombres, ' ', cls.apellidos).ilike(search_pattern)
                )
            )
        ).order_by(cls.fecha_registro.desc()).all()