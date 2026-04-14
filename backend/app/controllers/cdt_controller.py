import db.database as db
import os
import json
import uuid
from datetime import datetime

# Directorio local donde se guardan las imágenes
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'pacientes', 'relojes')


def _asegurar_directorio():
    """Crea el directorio de uploads si no existe."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def guardar_imagen(file_bytes: bytes, extension: str, id_asignacion: int) -> str:
    """
    Guarda la imagen en disco y retorna la ruta relativa (que se almacena en BD).
    Formato: uploads/pacientes/relojes/asignacion_{id}_{uuid}.{ext}
    """
    _asegurar_directorio()
    nombre_archivo = f"asignacion_{id_asignacion}_{uuid.uuid4().hex[:8]}.{extension}"
    ruta_completa = os.path.join(UPLOAD_DIR, nombre_archivo)
    with open(ruta_completa, 'wb') as f:
        f.write(file_bytes)
    # Retorna la ruta relativa al proyecto (compatible con servidor de archivos estáticos)
    return f"uploads/pacientes/relojes/{nombre_archivo}"


def _crear_tablas_si_no_existen(cursor):
    """Crea las tablas evaluacion_cognitiva y analisis_visual si no existen."""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluacion_cognitiva (
            id_evaluacion SERIAL PRIMARY KEY,
            id_asignacion INTEGER NOT NULL,
            fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'completada',
            CONSTRAINT fk_ec_asignacion FOREIGN KEY (id_asignacion)
                REFERENCES asignacion_prueba(id_asignacion)
                ON UPDATE CASCADE ON DELETE CASCADE
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analisis_visual (
            id_analisis SERIAL PRIMARY KEY,
            id_evaluacion INTEGER NOT NULL,
            tipo_dibujo VARCHAR(100) DEFAULT 'Test del Reloj',
            url_imagen TEXT,
            puntaje_ia INTEGER,
            clasificacion_ia VARCHAR(50),
            detalles_ia_jsonb JSONB,
            fecha_analisis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_av_evaluacion FOREIGN KEY (id_evaluacion)
                REFERENCES evaluacion_cognitiva(id_evaluacion)
                ON UPDATE CASCADE ON DELETE CASCADE
        );
    """)


def procesar_evaluacion_cdt(id_asignacion: int, url_imagen: str, resultado_ia: dict) -> dict:
    """
    Realiza la secuencia completa de inserción en BD:
      Paso A: INSERT en evaluacion_cognitiva
      Paso C: INSERT en analisis_visual con resultados de la IA
    Retorna el id_evaluacion generado.
    """
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Asegurar que las tablas existen
            _crear_tablas_si_no_existen(cursor)

            # Paso A: Registrar la evaluación principal
            cursor.execute("""
                INSERT INTO evaluacion_cognitiva (id_asignacion, estado)
                VALUES (%s, 'completada')
                RETURNING id_evaluacion
            """, (id_asignacion,))
            row = cursor.fetchone()
            id_evaluacion = row['id_evaluacion'] if isinstance(row, dict) else row[0]

            # Paso C: Insertar resultados del análisis visual
            detalles_json = json.dumps(resultado_ia.get('detalles', {}))
            cursor.execute("""
                INSERT INTO analisis_visual
                    (id_evaluacion, tipo_dibujo, url_imagen, puntaje_ia, clasificacion_ia, detalles_ia_jsonb)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                id_evaluacion,
                'Test del Reloj',
                url_imagen,
                resultado_ia.get('puntuacion', 0),
                resultado_ia.get('clasificacion', 'Sin clasificar'),
                detalles_json
            ))

            # Marcar el código de acceso como completado (estado_codigo = 2)
            cursor.execute("""
                UPDATE codigo_acceso
                SET estado_codigo = 2
                WHERE id_asignacion = %s
            """, (id_asignacion,))

            conexion.commit()
            return {'success': True, 'id_evaluacion': id_evaluacion}

    except Exception as e:
        print("Error en procesar_evaluacion_cdt:", e)
        if conexion:
            conexion.rollback()
        return {'success': False, 'error': str(e)}
    finally:
        if conexion:
            conexion.close()
