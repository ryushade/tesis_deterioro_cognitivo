"""
Modelos SQLAlchemy para el sistema de evaluaciones cognitivas
Basado en el esquema de BD propuesto con BIGSERIAL y estructura mejorada
"""
from app import db
# from app.models.paciente import Paciente  # Comentado - usando psycopg2 ahora
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import text, CheckConstraint

# Nota: El modelo Paciente ahora usa psycopg2 directo, no SQLAlchemy


class CodigoAcceso(db.Model):
    """Modelo para códigos de acceso temporal a evaluaciones"""
    __tablename__ = 'codigo_acceso'
    
    id_codigo = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    codigo = db.Column(db.String(32), nullable=False, unique=True)
    id_paciente = db.Column(db.BigInteger, db.ForeignKey('paciente.id_paciente', onupdate='CASCADE', ondelete='RESTRICT'), nullable=False)
    tipo_evaluacion = db.Column(db.String(20), nullable=False, server_default='CDT')
    vence_at = db.Column(db.DateTime(timezone=True), nullable=False)
    estado = db.Column(db.String(12), nullable=False, default='emitido')
    creado_en = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    ultimo_uso_en = db.Column(db.DateTime(timezone=True))
    
    # Constraints
    __table_args__ = (
        CheckConstraint("tipo_evaluacion IN ('CDT','MMSE','MOCA','ACE')", name='ck_tipo_evaluacion'),
        CheckConstraint("estado IN ('emitido','usado','vencido','revocado')", name='ck_estado_codigo'),
        db.UniqueConstraint('id_codigo', 'id_paciente', name='uq_codigo_paciente'),
    )
    
    # Relaciones
    # paciente = db.relationship('Paciente', back_populates='codigos_acceso')  # Comentado - usando psycopg2
    evaluaciones = db.relationship('EvaluacionCognitiva', back_populates='codigo_acceso')
    
    def __repr__(self):
        return f'<CodigoAcceso {self.codigo} - {self.tipo_evaluacion}>'
    
    @property
    def esta_vencido(self):
        ahora = datetime.now(timezone.utc)
        if self.vence_at.tzinfo is None:
            # Si vence_at no tiene timezone, asumir UTC
            vence_utc = self.vence_at.replace(tzinfo=timezone.utc)
        else:
            vence_utc = self.vence_at
        return ahora > vence_utc
    
    @property
    def esta_disponible(self):
        return self.estado == 'emitido' and not self.esta_vencido


class EvaluacionCognitiva(db.Model):
    """Modelo principal para evaluaciones cognitivas (CDT, MMSE, etc.)"""
    __tablename__ = 'evaluaciones_cognitivas'
    
    id_evaluacion = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    id_paciente = db.Column(db.BigInteger, db.ForeignKey('paciente.id_paciente', onupdate='CASCADE', ondelete='RESTRICT'), nullable=False)
    id_codigo = db.Column(db.BigInteger, db.ForeignKey('codigo_acceso.id_codigo', onupdate='CASCADE', ondelete='SET NULL'))
    
    tipo_evaluacion = db.Column(db.String(20), nullable=False)
    fecha_evaluacion = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Puntuación
    puntuacion_total = db.Column(db.Numeric(5,2), nullable=False)
    puntuacion_maxima = db.Column(db.Numeric(5,2), nullable=False)
    # porcentaje_acierto se calcula automáticamente en la BD
    
    # Clasificación y confianza
    clasificacion = db.Column(db.String(50))
    confianza = db.Column(db.Numeric(5,2))
    
    # Estado y procesamiento
    estado_procesamiento = db.Column(db.String(12), nullable=False, default='pendiente')
    tiempo_procesamiento = db.Column(db.Numeric(8,3))
    version_algoritmo = db.Column(db.String(20))
    observaciones = db.Column(db.Text)
    
    # Específicos para CDT
    imagen_url = db.Column(db.Text)
    metodo_cdt = db.Column(db.Text)
    
    # Datos estructurados
    datos_especificos = db.Column(JSONB)
    archivos_paths = db.Column(JSONB)
    
    # Auditoría
    creado_por = db.Column(db.Integer)  # FK a usuario si existe
    actualizado_en = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Constraints
    __table_args__ = (
        CheckConstraint("tipo_evaluacion IN ('CDT','MMSE','MOCA','ACE')", name='ck_tipo_evaluacion_eval'),
        CheckConstraint("puntuacion_total >= 0 AND puntuacion_maxima > 0 AND puntuacion_total <= puntuacion_maxima", name='ck_eval_scores'),
        CheckConstraint("estado_procesamiento IN ('pendiente','procesando','completada','fallida')", name='ck_estado_procesamiento'),
        CheckConstraint("(tipo_evaluacion <> 'CDT') OR (imagen_url IS NOT NULL AND metodo_cdt IS NOT NULL)", name='ck_eval_cdt_campos'),
    )
    
    # Relaciones
    # paciente = db.relationship('Paciente', back_populates='evaluaciones')  # Comentado - usando psycopg2
    codigo_acceso = db.relationship('CodigoAcceso', back_populates='evaluaciones')
    criterios = db.relationship('CriterioEvaluacion', back_populates='evaluacion', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<EvaluacionCognitiva {self.tipo_evaluacion} - {self.puntuacion_total}/{self.puntuacion_maxima}>'
    
    @property
    def porcentaje_acierto(self):
        """Calcular porcentaje ya que no podemos usar GENERATED en SQLAlchemy facilmente"""
        if self.puntuacion_maxima and self.puntuacion_maxima > 0:
            return float(self.puntuacion_total / self.puntuacion_maxima * 100)
        return 0.0
    
    def to_dict(self):
        """Convertir a diccionario para API responses"""
        return {
            'id_evaluacion': self.id_evaluacion,
            'id_paciente': self.id_paciente,
            'tipo_evaluacion': self.tipo_evaluacion,
            'fecha_evaluacion': self.fecha_evaluacion.isoformat() if self.fecha_evaluacion else None,
            'puntuacion_total': float(self.puntuacion_total) if self.puntuacion_total else None,
            'puntuacion_maxima': float(self.puntuacion_maxima) if self.puntuacion_maxima else None,
            'porcentaje_acierto': self.porcentaje_acierto,
            'clasificacion': self.clasificacion,
            'confianza': float(self.confianza) if self.confianza else None,
            'estado_procesamiento': self.estado_procesamiento,
            'tiempo_procesamiento': float(self.tiempo_procesamiento) if self.tiempo_procesamiento else None,
            'observaciones': self.observaciones,
            'datos_especificos': self.datos_especificos,
            'archivos_paths': self.archivos_paths,
        }


class CriterioEvaluacion(db.Model):
    """Modelo para criterios específicos de cada evaluación"""
    __tablename__ = 'criterios_evaluacion'
    
    id_criterio = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    id_evaluacion = db.Column(db.BigInteger, db.ForeignKey('evaluaciones_cognitivas.id_evaluacion', ondelete='CASCADE'), nullable=False)
    
    dominio_cognitivo = db.Column(db.String(50), nullable=False)
    subcriterio = db.Column(db.String(100), nullable=False)
    
    puntuacion_obtenida = db.Column(db.Numeric(4,2), nullable=False)
    puntuacion_maxima = db.Column(db.Numeric(4,2), nullable=False)
    
    respuesta_paciente = db.Column(db.Text)
    tiempo_respuesta = db.Column(db.Numeric(6,2))
    observaciones_criterio = db.Column(db.Text)
    datos_vision = db.Column(JSONB)
    orden_aplicacion = db.Column(db.Integer)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("puntuacion_obtenida >= 0 AND puntuacion_maxima > 0 AND puntuacion_obtenida <= puntuacion_maxima", name='ck_criterio_scores'),
    )
    
    # Relaciones
    evaluacion = db.relationship('EvaluacionCognitiva', back_populates='criterios')
    
    def __repr__(self):
        return f'<CriterioEvaluacion {self.dominio_cognitivo} - {self.subcriterio}: {self.puntuacion_obtenida}/{self.puntuacion_maxima}>'
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id_criterio': self.id_criterio,
            'dominio_cognitivo': self.dominio_cognitivo,
            'subcriterio': self.subcriterio,
            'puntuacion_obtenida': float(self.puntuacion_obtenida),
            'puntuacion_maxima': float(self.puntuacion_maxima),
            'respuesta_paciente': self.respuesta_paciente,
            'tiempo_respuesta': float(self.tiempo_respuesta) if self.tiempo_respuesta else None,
            'observaciones_criterio': self.observaciones_criterio,
            'datos_vision': self.datos_vision,
            'orden_aplicacion': self.orden_aplicacion,
        }


# Funciones de utilidad
def generar_codigo_acceso(prefijo='CDT', longitud=8):
    """Generar código de acceso único"""
    import random
    import string
    
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=longitud))
    fecha = datetime.now().strftime('%Y%m%d')
    return f"{prefijo}-{fecha}-{suffix}"


def crear_evaluacion_cdt(id_paciente, imagen_url=None, metodo_cdt='foto_movil', id_codigo=None):
    """
    Crear una nueva evaluación CDT
    """
    # Si no se proporciona imagen_url, usar placeholder para cumplir con la restricción
    if imagen_url is None:
        imagen_url = 'pendiente_subida'
    
    evaluacion = EvaluacionCognitiva(
        id_paciente=id_paciente,
        id_codigo=id_codigo,
        tipo_evaluacion='CDT',
        puntuacion_total=0.0,  # Se actualizará después del procesamiento
        puntuacion_maxima=10.0,
        imagen_url=imagen_url,
        metodo_cdt=metodo_cdt,
        estado_procesamiento='pendiente',
        version_algoritmo='v1.0-opencv-resnet50'
    )
    
    db.session.add(evaluacion)
    db.session.commit()
    return evaluacion


def actualizar_resultados_cdt(id_evaluacion, puntuacion_total, clasificacion, confianza, 
                             tiempo_procesamiento, criterios_data, observaciones=None, 
                             datos_especificos=None, archivos_paths=None):
    """
    Actualizar evaluación CDT con resultados del análisis
    """
    evaluacion = EvaluacionCognitiva.query.get(id_evaluacion)
    if not evaluacion:
        raise ValueError(f"Evaluación {id_evaluacion} no encontrada")
    
    # Actualizar evaluación principal
    evaluacion.puntuacion_total = puntuacion_total
    evaluacion.clasificacion = clasificacion
    evaluacion.confianza = confianza
    evaluacion.tiempo_procesamiento = tiempo_procesamiento
    evaluacion.estado_procesamiento = 'completada'
    evaluacion.observaciones = observaciones
    evaluacion.datos_especificos = datos_especificos
    evaluacion.archivos_paths = archivos_paths
    evaluacion.actualizado_en = datetime.utcnow()
    
    # Crear criterios específicos
    for criterio_data in criterios_data:
        criterio = CriterioEvaluacion(
            id_evaluacion=id_evaluacion,
            dominio_cognitivo=criterio_data.get('dominio_cognitivo'),
            subcriterio=criterio_data.get('subcriterio'),
            puntuacion_obtenida=criterio_data.get('puntuacion_obtenida'),
            puntuacion_maxima=criterio_data.get('puntuacion_maxima'),
            observaciones_criterio=criterio_data.get('observaciones'),
            datos_vision=criterio_data.get('datos_vision'),
            orden_aplicacion=criterio_data.get('orden_aplicacion')
        )
        db.session.add(criterio)
    
    db.session.commit()
    return evaluacion
