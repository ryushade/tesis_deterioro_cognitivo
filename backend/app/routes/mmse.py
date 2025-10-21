from flask import Blueprint, request, jsonify
import logging
import json
from datetime import datetime
from app.services.jwt_service import JWTService
from app.services.evaluaciones_service import EvaluacionesService

logger = logging.getLogger(__name__)

mmse_bp = Blueprint('mmse', __name__, url_prefix='/api/mmse')
evals = EvaluacionesService()


@mmse_bp.route('/test', methods=['GET'])
def test_mmse():
    """Endpoint de prueba para verificar que el Blueprint está registrado"""
    return jsonify({'success': True, 'message': 'MMSE Blueprint funcionando correctamente'}), 200


@mmse_bp.route('/sesiones', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo'])
def crear_sesion_mmse():
    try:
        logger.info("=== CREAR SESIÓN MMSE ===")
        data = request.get_json() or {}
        logger.info(f"Data recibida: {data}")
        id_paciente = data.get('id_paciente')
        if not id_paciente:
            logger.error("id_paciente no proporcionado")
            return jsonify({'success': False, 'message': 'id_paciente es requerido'}), 400
        
        id_codigo = data.get('id_codigo')
        creado_por = getattr(request, 'current_user', {}).get('user_id')
        datos_iniciales = {'current_section': 0, 'answers': {}, 'progress': 0}
        
        # Usar el servicio existente de evaluaciones
        sesion_id = evals.create_evaluacion_mmse(
            id_paciente=int(id_paciente), 
            creado_por=creado_por, 
            datos_iniciales=datos_iniciales
        )
        
        if not sesion_id:
            return jsonify({'success': False, 'message': 'No se pudo crear la sesión'}), 400
        
        return jsonify({'success': True, 'sesion_id': sesion_id}), 201
    except Exception as e:
        logger.error(f'Error creando sesión MMSE: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def obtener_sesion_mmse(id_sesion: int):
    try:
        sesion = evals.get_mmse_by_id(id_sesion)
        if not sesion:
            return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
        
        # Calcular tiempo transcurrido y restante
        from datetime import datetime
        fecha_evaluacion = sesion.get('fecha_evaluacion')
        if fecha_evaluacion:
            if isinstance(fecha_evaluacion, str):
                fecha_evaluacion = datetime.fromisoformat(fecha_evaluacion.replace('Z', '+00:00'))
            
            tiempo_transcurrido = int((datetime.now(fecha_evaluacion.tzinfo) - fecha_evaluacion).total_seconds())
            tiempo_restante = max(0, 600 - tiempo_transcurrido)  # 10 minutos = 600 segundos
        else:
            tiempo_transcurrido = 0
            tiempo_restante = 600
        
        # Agregar información de tiempo
        data = {
            **sesion,
            'tiempo_info': {
                'iniciado_en': sesion.get('fecha_evaluacion'),
                'tiempo_transcurrido_segundos': tiempo_transcurrido,
                'tiempo_restante_segundos': tiempo_restante,
                'duracion_total_minutos': 10
            }
        }
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        logger.error(f'Error obteniendo sesión MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/progreso', methods=['PATCH'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def actualizar_progreso_mmse(id_sesion: int):
    try:
        data = request.get_json() or {}
        datos_especificos = data.get('datos_especificos') or data.get('datos')
        if datos_especificos is None:
            return jsonify({'success': False, 'message': 'datos_especificos es requerido'}), 400
        puntuacion_total = data.get('puntuacion_total')
        estado = data.get('estado_procesamiento')
        
        ok = evals.update_mmse_progress(id_sesion, datos_especificos, puntuacion_total=puntuacion_total, estado_procesamiento=estado)
        
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error actualizando progreso MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/finalizar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def finalizar_mmse(id_sesion: int):
    try:
        data = request.get_json() or {}
        puntuacion_total = data.get('puntuacion_total')
        clasificacion = data.get('clasificacion')
        if puntuacion_total is None:
            return jsonify({'success': False, 'message': 'puntuacion_total es requerida'}), 400
        
        ok = evals.finalizar_mmse(id_sesion, float(puntuacion_total), clasificacion=clasificacion)
        return jsonify({'success': ok}), (200 if ok else 400)
    except Exception as e:
        logger.error(f'Error finalizando MMSE {id_sesion}: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/pausar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def pausar_mmse(id_sesion: int):
    """Pausa una sesión MMSE guardando el progreso actual"""
    try:
        logger.info(f"=== PAUSAR SESIÓN MMSE {id_sesion} ===")
        
        from app.services.database_service import DatabaseService
        db = DatabaseService()
        
        # Obtener observaciones actuales
        with db.get_cursor() as cur:
            cur.execute("SELECT observaciones FROM evaluaciones_cognitivas WHERE id_evaluacion = %s", (id_sesion,))
            row = cur.fetchone()
            
            if not row:
                return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
            
            # Parsear y actualizar observaciones
            try:
                if isinstance(row['observaciones'], str):
                    obs_data = json.loads(row['observaciones'])
                elif isinstance(row['observaciones'], dict):
                    obs_data = row['observaciones']
                else:
                    obs_data = {}
            except:
                obs_data = {}
            
            obs_data['estado'] = 'pausada'
            obs_data['pausado_en'] = str(datetime.now())
            
            # Actualizar con estado pausada
            cur.execute("""
                UPDATE evaluaciones_cognitivas 
                SET observaciones = %s,
                    clasificacion = 'Pausada',
                    actualizado_en = NOW()
                WHERE id_evaluacion = %s
            """, (json.dumps(obs_data), id_sesion))
            
            logger.info(f"✅ Sesión {id_sesion} pausada correctamente")
            return jsonify({'success': True, 'message': 'Sesión pausada correctamente'}), 200
            
    except Exception as e:
        logger.error(f'Error pausando MMSE {id_sesion}: {e}', exc_info=True)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/reanudar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def reanudar_mmse(id_sesion: int):
    """Reanuda una sesión MMSE pausada"""
    try:
        logger.info(f"=== REANUDAR SESIÓN MMSE {id_sesion} ===")
        
        from app.services.database_service import DatabaseService
        db = DatabaseService()
        
        with db.get_cursor() as cur:
            cur.execute("SELECT observaciones, clasificacion FROM evaluaciones_cognitivas WHERE id_evaluacion = %s", (id_sesion,))
            row = cur.fetchone()
            
            if not row:
                return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
            
            # Parsear observaciones
            try:
                if isinstance(row['observaciones'], str):
                    obs_data = json.loads(row['observaciones'])
                elif isinstance(row['observaciones'], dict):
                    obs_data = row['observaciones']
                else:
                    obs_data = {}
            except:
                obs_data = {}
            
            # Verificar que esté pausada
            if obs_data.get('estado') != 'pausada' and row.get('clasificacion') != 'Pausada':
                return jsonify({'success': False, 'message': 'La sesión no está pausada'}), 400
            
            # Actualizar estado a en_progreso
            obs_data['estado'] = 'en_progreso'
            obs_data['reanudado_en'] = str(datetime.now())
            
            cur.execute("""
                UPDATE evaluaciones_cognitivas 
                SET observaciones = %s,
                    clasificacion = 'En progreso',
                    actualizado_en = NOW()
                WHERE id_evaluacion = %s
            """, (json.dumps(obs_data), id_sesion))
            
            logger.info(f"✅ Sesión {id_sesion} reanudada correctamente")
            return jsonify({'success': True, 'message': 'Sesión reanudada correctamente'}), 200
            
    except Exception as e:
        logger.error(f'Error reanudando MMSE {id_sesion}: {e}', exc_info=True)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/<int:id_sesion>/cancelar', methods=['POST'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def cancelar_mmse(id_sesion: int):
    """Cancela una sesión MMSE"""
    try:
        logger.info(f"=== CANCELAR SESIÓN MMSE {id_sesion} ===")
        
        from app.services.database_service import DatabaseService
        db = DatabaseService()
        
        with db.get_cursor() as cur:
            cur.execute("SELECT observaciones FROM evaluaciones_cognitivas WHERE id_evaluacion = %s", (id_sesion,))
            row = cur.fetchone()
            
            if not row:
                return jsonify({'success': False, 'message': 'Sesión no encontrada'}), 404
            
            # Parsear y actualizar observaciones
            try:
                if isinstance(row['observaciones'], str):
                    obs_data = json.loads(row['observaciones'])
                elif isinstance(row['observaciones'], dict):
                    obs_data = row['observaciones']
                else:
                    obs_data = {}
            except:
                obs_data = {}
            
            obs_data['estado'] = 'cancelada'
            obs_data['cancelado_en'] = str(datetime.now())
            
            cur.execute("""
                UPDATE evaluaciones_cognitivas 
                SET observaciones = %s,
                    clasificacion = 'Cancelada',
                    actualizado_en = NOW()
                WHERE id_evaluacion = %s
            """, (json.dumps(obs_data), id_sesion))
            
            logger.info(f"✅ Sesión {id_sesion} cancelada correctamente")
            return jsonify({'success': True, 'message': 'Sesión cancelada correctamente'}), 200
            
    except Exception as e:
        logger.error(f'Error cancelando MMSE {id_sesion}: {e}', exc_info=True)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@mmse_bp.route('/sesiones/paciente/<int:id_paciente>', methods=['GET'])
@JWTService.token_required
@JWTService.role_required(['Administrador', 'Neuropsicologo', 'Paciente'])
def obtener_sesiones_paciente(id_paciente: int):
    """Obtiene todas las sesiones MMSE de un paciente"""
    try:
        logger.info(f"=== OBTENER SESIONES MMSE PACIENTE {id_paciente} ===")
        
        from app.services.database_service import DatabaseService
        db = DatabaseService()
        
        # Primero verificar si existe la prueba MMSE
        with db.get_cursor() as cur:
            cur.execute("""
                SELECT id_prueba FROM prueba_cognitiva 
                WHERE UPPER(codigo) = 'MMSE' OR UPPER(nombre) LIKE '%MMSE%'
                LIMIT 1
            """)
            prueba = cur.fetchone()
            
            if not prueba:
                logger.info("No existe prueba MMSE registrada, retornando lista vacía")
                return jsonify({'success': True, 'data': []}), 200
            
            id_prueba = prueba['id_prueba']
            logger.info(f"Prueba MMSE encontrada: id_prueba={id_prueba}")
        
        # Obtener evaluaciones del paciente para esta prueba
        query = """
            SELECT 
                ec.id_evaluacion,
                ec.id_paciente,
                'MMSE' as tipo_evaluacion,
                ec.fecha_evaluacion,
                ec.puntuacion_total,
                ec.puntuacion_maxima,
                ec.clasificacion,
                ec.observaciones
            FROM evaluaciones_cognitivas ec
            WHERE ec.id_paciente = %s AND ec.id_prueba = %s
            ORDER BY ec.fecha_evaluacion DESC
        """
        
        with db.get_cursor() as cur:
            cur.execute(query, (id_paciente, id_prueba))
            rows = cur.fetchall() or []
            logger.info(f"Evaluaciones encontradas: {len(rows)}")
            sesiones = []
            
            for r in rows:
                sesion = dict(r)
                # Parsear observaciones para obtener estado y datos
                if sesion.get('observaciones'):
                    try:
                        # Verificar si observaciones ya es un dict o es un string
                        if isinstance(sesion['observaciones'], str):
                            obs_data = json.loads(sesion['observaciones'])
                        elif isinstance(sesion['observaciones'], dict):
                            obs_data = sesion['observaciones']
                        else:
                            obs_data = {}
                        
                        sesion['estado_procesamiento'] = obs_data.get('estado', 'en_progreso')
                        sesion['datos_especificos'] = obs_data.get('datos_iniciales', {})
                        logger.debug(f"Sesión {sesion['id_evaluacion']}: estado={sesion['estado_procesamiento']}")
                    except Exception as parse_error:
                        logger.warning(f'Error parseando observaciones de sesión {sesion.get("id_evaluacion")}: {parse_error}')
                        sesion['estado_procesamiento'] = 'completada' if sesion.get('clasificacion') and sesion.get('clasificacion') != 'En progreso' else 'en_progreso'
                        sesion['datos_especificos'] = {}
                else:
                    sesion['estado_procesamiento'] = 'completada' if sesion.get('clasificacion') and sesion.get('clasificacion') != 'En progreso' else 'en_progreso'
                    sesion['datos_especificos'] = {}
                
                sesiones.append(sesion)
        
        logger.info(f"Retornando {len(sesiones)} sesiones MMSE")
        return jsonify({'success': True, 'data': sesiones}), 200
    except Exception as e:
        logger.error(f'Error obteniendo sesiones del paciente {id_paciente}: {e}', exc_info=True)
        return jsonify({'success': False, 'message': f'Error interno del servidor: {str(e)}'}), 500