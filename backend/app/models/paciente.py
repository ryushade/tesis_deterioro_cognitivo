"""
MODELO ANTERIOR - COMENTADO PARA EVITAR CONFLICTOS
Nuevo modelo en evaluaciones.py
"""

# from app import db
# from datetime import datetime

# class Paciente(db.Model):
#     __tablename__ = 'pacientes'
    
#     id_paciente = db.Column(db.Integer, primary_key=True)
#     nombres = db.Column(db.String(100), nullable=False)
#     apellidos = db.Column(db.String(100), nullable=False)
#     cedula = db.Column(db.String(20), unique=True, nullable=False)
#     fecha_nacimiento = db.Column(db.Date, nullable=False)
#     edad = db.Column(db.Integer)
#     telefono = db.Column(db.String(15), nullable=False)
#     direccion = db.Column(db.Text)
#     contacto_emergencia = db.Column(db.String(100), nullable=False)
#     telefono_emergencia = db.Column(db.String(15), nullable=False)
#     estado_cognitivo = db.Column(db.String(50), default='No evaluado')
#     medicamentos = db.Column(db.Text)
#     estado_paciente = db.Column(db.Integer, default=1)  # 1=activo, 0=inactivo
#     fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
#     fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     def __repr__(self):
#         return f'<Paciente {self.nombres} {self.apellidos}>'
    
#     def to_dict(self):
#         return {
#             'id_paciente': self.id_paciente,
#             'nombres': self.nombres,
#             'apellidos': self.apellidos,
#             'cedula': self.cedula,
#             'fecha_nacimiento': self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
#             'edad': self.edad,
#             'telefono': self.telefono,
#             'direccion': self.direccion,
#             'contacto_emergencia': self.contacto_emergencia,
#             'telefono_emergencia': self.telefono_emergencia,
#             'estado_cognitivo': self.estado_cognitivo,
#             'medicamentos': self.medicamentos,
#             'estado_paciente': self.estado_paciente,
#             'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
#             'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
#         }
