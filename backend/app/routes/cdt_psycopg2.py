"""
Rutas API CDT usando psycopg2 (sin SQLAlchemy)
"""
from flask import Blueprint, request, jsonify, current_app
import os
from decimal import Decimal
from datetime import datetime as _dt, timezone

from app.services.database_service import db_service
from app.services.evaluaciones_service import EvaluacionesService
from app.services.cdt_service_psycopg2 import cdt_service_psycopg2 as cdt_service


cdt_psycopg2_bp = Blueprint('cdt_psycopg2', __name__, url_prefix='/api/cdt')


def _serialize_evaluation_row(row):
    serialized = {}
    for key, value in row.items():
        if isinstance(value, Decimal):
            serialized[key] = float(value)
        elif isinstance(value, _dt):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized


@cdt_psycopg2_bp.route('/validar-codigo', methods=['POST'])
def validar_codigo():
    try:
        data = request.get_json() or {}
        codigo = (data.get('codigo') or '').strip()
        if not codigo:
            return jsonify({'success': False, 'error': 'Código es requerido'}), 400

        row = db_service.execute_one(
            """
            SELECT ca.id_codigo, ca.codigo, ca.id_paciente, pr.codigo AS tipo_evaluacion, ca.vence_at, ca.estado,
                   p.nombres, p.apellidos
            FROM codigo_acceso ca
            JOIN paciente p ON p.id_paciente = ca.id_paciente
            JOIN prueba_cognitiva pr ON pr.id_prueba = ca.id_prueba
            WHERE ca.codigo = %s
            """,
            (codigo,),
        )
        if not row:
            return jsonify({'success': False, 'error': 'Código no encontrado'}), 404

        now = _dt.utcnow()
        vence_at = row.get('vence_at')
        if row.get('estado') != 'emitido' or (vence_at and vence_at < now):
            return jsonify({'success': False, 'error': 'Código no válido o expirado'}), 410

        instrucciones = (
            "Dibuje un reloj que marque las 11:10. "
            "Incluya todos los números del 1 al 12 y las dos manecillas. "
            "Tome su tiempo y haga su mejor esfuerzo."
        )

        return jsonify({
            'success': True,
            'codigo_valido': True,
            'instrucciones': instrucciones,
            'tiempo_limite': 300,
            'paciente': {
                'id': row['id_paciente'],
                'nombre_completo': f"{row['nombres']} {row['apellidos']}"
            },
            'evaluacion': {
                'tipo': row['tipo_evaluacion'],
                'codigo_id': row['id_codigo']
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error validando código: {str(e)}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@cdt_psycopg2_bp.route('/iniciar-evaluacion', methods=['POST'])
def iniciar_evaluacion():
    try:
        data = request.get_json() or {}
        codigo = (data.get('codigo') or '').strip()
        if not codigo:
            return jsonify({'success': False, 'error': 'Código es requerido'}), 400

        row = db_service.execute_one(
            """
            SELECT ca.id_codigo, ca.id_paciente, pr.codigo AS tipo_evaluacion, ca.vence_at, ca.estado
            FROM codigo_acceso ca
            JOIN prueba_cognitiva pr ON pr.id_prueba = ca.id_prueba
            WHERE ca.codigo = %s
            """,
            (codigo,),
        )
        if not row:
            return jsonify({'success': False, 'error': 'Código no encontrado'}), 404

        now = _dt.utcnow()
        if row['estado'] != 'emitido' or (row.get('vence_at') and row['vence_at'] < now):
            return jsonify({'success': False, 'error': 'Código no válido o expirado'}), 400

        # Marcar como usado
        db_service.execute_one(
            "UPDATE codigo_acceso SET estado = 'usado', ultimo_uso_en = NOW() WHERE id_codigo = %s RETURNING id_codigo",
            (row['id_codigo'],),
        )

        # Crear evaluación pendiente
        evals = EvaluacionesService()
        eval_id = evals.create_evaluacion_cdt(
            id_paciente=int(row['id_paciente']),
            id_codigo=int(row['id_codigo']),
            imagen_url=None,
            metodo_cdt='foto_movil',
        )

        return jsonify({'success': True, 'evaluacion_id': eval_id, 'mensaje': 'Evaluación iniciada correctamente'}), 200
    except Exception as e:
        current_app.logger.error(f"Error iniciando evaluación: {str(e)}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@cdt_psycopg2_bp.route('/pacientes/<int:id_paciente>/evaluaciones', methods=['GET'])
def obtener_evaluaciones_paciente(id_paciente):
    """Listado de evaluaciones CDT para un paciente"""
    try:
        evaluations = cdt_service.get_patient_evaluations(str(id_paciente)) or []
        serialized = [_serialize_evaluation_row(item) for item in evaluations]
        return jsonify({'success': True, 'data': serialized}), 200
    except Exception as e:
        current_app.logger.error(f"Error obteniendo evaluaciones del paciente {id_paciente}: {str(e)}")
        return jsonify({'success': False, 'message': 'Error al obtener evaluaciones del paciente'}), 500


@cdt_psycopg2_bp.route('/subir-imagen', methods=['POST'])
def subir_imagen():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No se encontró archivo en la petición'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No se seleccionó ningún archivo'}), 400

        evaluacion_id = request.form.get('evaluacion_id')
        if not evaluacion_id:
            return jsonify({'success': False, 'error': 'evaluacion_id es requerido'}), 400

        evals = EvaluacionesService()
        evaluation = evals.get_evaluacion_by_id(int(evaluacion_id))
        if not evaluation:
            return jsonify({'success': False, 'error': 'Evaluación no encontrada'}), 404

        # Guardar archivo
        import time
        timestamp = int(time.time())
        filename = f"cdt_{evaluacion_id}_{timestamp}.jpg"
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'cdt')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Actualizar evaluación a procesando y luego a completada (simulada)
        evals.update_evaluacion(int(evaluacion_id), {'imagen_url': file_path, 'estado_procesamiento': 'procesando'})
        evals.update_evaluacion(int(evaluacion_id), {
            'puntuacion_total': 5.0,
            'puntuacion_maxima': 10.0,
            'clasificacion': 'Analisis simulado',
            'confianza': 0.5,
            'estado_procesamiento': 'completada',
            'tiempo_procesamiento': 1.0,
            'observaciones': 'Analizador no disponible o deshabilitado',
        })

        return jsonify({'success': True, 'evaluacion_id': int(evaluacion_id), 'mensaje': 'Imagen procesada correctamente', 'imagen_guardada': filename}), 200
    except Exception as e:
        current_app.logger.error(f"Error subiendo imagen: {str(e)}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@cdt_psycopg2_bp.route('/analyze', methods=['POST'])
def analyze_cdt():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No se encontró archivo en la petición'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No se seleccionó ningún archivo'}), 400

        # paciente_id opcional para modo demo del analizador
        paciente_id = request.form.get('paciente_id')  # puede ser None

        result = cdt_service.analyze_cdt_file(file, paciente_id)
        return jsonify(result), 200 if result.get('success') else 400
    except Exception as e:
        current_app.logger.error(f"Error en análisis CDT: {str(e)}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500
