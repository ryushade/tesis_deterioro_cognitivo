"""
Servicio para gestión de pacientes usando psycopg2
"""
from app.services.database_service import db_service
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

class PacientesService:
    
    def get_all(self, page=1, limit=10, search='', include_inactive=False):
        """Obtener todos los pacientes con paginación y búsqueda"""
        try:
            offset = (page - 1) * limit
            
            # Construir consulta base
            where_conditions = []
            params = []
            
            # Nota: La tabla solo tiene las columnas básicas, no hay campo 'activo'
            # if not include_inactive:
            #     where_conditions.append("activo = %s")
            #     params.append(True)
            
            if search:
                where_conditions.append("(nombres ILIKE %s OR apellidos ILIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param])
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Consulta para obtener pacientes
            query = f"""
                SELECT 
                    id_paciente,
                    nombres,
                    apellidos,
                    CONCAT(nombres, ' ', apellidos) as nombre_completo,
                    fecha_nacimiento,
                    EXTRACT(YEAR FROM AGE(fecha_nacimiento)) as edad,
                    sexo,
                    CASE 
                        WHEN sexo = 'M' THEN 'Masculino'
                        WHEN sexo = 'F' THEN 'Femenino'
                        ELSE 'No especificado'
                    END as sexo_display,
                    anos_escolaridad,
                    CURRENT_TIMESTAMP as fecha_registro,
                    CURRENT_TIMESTAMP as fecha_actualizacion,
                    true as estado
                FROM paciente 
                {where_clause}
                ORDER BY id_paciente DESC
                LIMIT %s OFFSET %s
            """
            
            params.extend([limit, offset])
            pacientes = db_service.execute_query(query, params)
            
            # Consulta para contar total
            count_query = f"SELECT COUNT(*) as total FROM paciente {where_clause}"
            count_params = params[:-2]  # Remover limit y offset
            total_result = db_service.execute_one(count_query, count_params)
            total = total_result['total'] if total_result else 0
            
            # Calcular metadatos de paginación
            total_pages = (total + limit - 1) // limit
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'success': True,
                'data': [dict(p) for p in pacientes],
                'metadata': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                }
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo pacientes: {e}")
            return {
                'success': False,
                'message': f'Error al obtener pacientes: {str(e)}',
                'data': [],
                'metadata': {
                    'total': 0,
                    'page': page,
                    'limit': limit,
                    'total_pages': 0,
                    'has_next': False,
                    'has_prev': False
                }
            }
    
    def get_by_id(self, id_paciente):
        """Obtener un paciente por su ID"""
        try:
            query = """
                SELECT 
                    id_paciente,
                    nombres,
                    apellidos,
                    CONCAT(nombres, ' ', apellidos) as nombre_completo,
                    fecha_nacimiento,
                    EXTRACT(YEAR FROM AGE(fecha_nacimiento)) as edad,
                    sexo,
                    CASE 
                        WHEN sexo = 'M' THEN 'Masculino'
                        WHEN sexo = 'F' THEN 'Femenino'
                        ELSE 'No especificado'
                    END as sexo_display,
                    anos_escolaridad,
                    CURRENT_TIMESTAMP as fecha_registro,
                    CURRENT_TIMESTAMP as fecha_actualizacion,
                    true as estado
                FROM paciente 
                WHERE id_paciente = %s
            """
            
            paciente = db_service.execute_one(query, (id_paciente,))
            
            if paciente:
                return {
                    'success': True,
                    'data': dict(paciente),
                    'message': 'Paciente encontrado'
                }
            else:
                return {
                    'success': False,
                    'message': 'Paciente no encontrado'
                }
                
        except Exception as e:
            logger.error(f"Error obteniendo paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al obtener paciente: {str(e)}'
            }
    
    def create(self, paciente_data):
        """Crear un nuevo paciente"""
        try:
            # Validar datos requeridos
            if not paciente_data.get('nombres') or not paciente_data.get('apellidos'):
                return {
                    'success': False,
                    'message': 'Nombres y apellidos son requeridos'
                }
            
            if not paciente_data.get('fecha_nacimiento'):
                return {
                    'success': False,
                    'message': 'Fecha de nacimiento es requerida'
                }
            
            # Validar sexo si se proporciona
            if paciente_data.get('sexo') and paciente_data['sexo'] not in ['M', 'F']:
                return {
                    'success': False,
                    'message': 'Sexo debe ser M o F'
                }
            
            query = """
                INSERT INTO paciente (nombres, apellidos, fecha_nacimiento, sexo, anos_escolaridad, fecha_creacion, activo)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id_paciente, nombres, apellidos, fecha_nacimiento, sexo, anos_escolaridad, fecha_creacion
            """
            
            now = datetime.now()
            params = (
                paciente_data['nombres'],
                paciente_data['apellidos'],
                paciente_data['fecha_nacimiento'],
                paciente_data.get('sexo'),
                paciente_data.get('anos_escolaridad'),
                now,
                True
            )
            
            result = db_service.execute_one(query, params)
            
            if result:
                return {
                    'success': True,
                    'data': dict(result),
                    'message': 'Paciente creado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al crear paciente'
                }
                
        except Exception as e:
            logger.error(f"Error creando paciente: {e}")
            return {
                'success': False,
                'message': f'Error al crear paciente: {str(e)}'
            }
    
    def update(self, id_paciente, paciente_data):
        """Actualizar un paciente existente"""
        try:
            # Verificar que el paciente existe
            existing = self.get_by_id(id_paciente)
            if not existing['success']:
                return existing
            
            # Construir consulta de actualización dinámicamente
            fields = []
            params = []
            
            if 'nombres' in paciente_data:
                fields.append("nombres = %s")
                params.append(paciente_data['nombres'])
            
            if 'apellidos' in paciente_data:
                fields.append("apellidos = %s")
                params.append(paciente_data['apellidos'])
            
            if 'fecha_nacimiento' in paciente_data:
                fields.append("fecha_nacimiento = %s")
                params.append(paciente_data['fecha_nacimiento'])
            
            if 'sexo' in paciente_data:
                if paciente_data['sexo'] and paciente_data['sexo'] not in ['M', 'F']:
                    return {
                        'success': False,
                        'message': 'Sexo debe ser M o F'
                    }
                fields.append("sexo = %s")
                params.append(paciente_data['sexo'])
            
            if 'anos_escolaridad' in paciente_data:
                fields.append("anos_escolaridad = %s")
                params.append(paciente_data['anos_escolaridad'])
            
            if not fields:
                return {
                    'success': False,
                    'message': 'No hay campos para actualizar'
                }
            
            # Agregar fecha de actualización
            fields.append("fecha_actualizacion = %s")
            params.append(datetime.now())
            
            # Agregar ID del paciente para el WHERE
            params.append(id_paciente)
            
            query = f"""
                UPDATE paciente 
                SET {', '.join(fields)}
                WHERE id_paciente = %s
                RETURNING id_paciente, nombres, apellidos, fecha_nacimiento, sexo, anos_escolaridad, fecha_actualizacion
            """
            
            result = db_service.execute_one(query, params)
            
            if result:
                return {
                    'success': True,
                    'data': dict(result),
                    'message': 'Paciente actualizado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al actualizar paciente'
                }
                
        except Exception as e:
            logger.error(f"Error actualizando paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al actualizar paciente: {str(e)}'
            }
    
    def delete(self, id_paciente):
        """Eliminar (desactivar) un paciente"""
        try:
            # Verificar que el paciente existe y está activo
            existing = self.get_by_id(id_paciente)
            if not existing['success']:
                return existing
            
            if not existing['data']['estado']:
                return {
                    'success': False,
                    'message': 'El paciente ya está inactivo'
                }
            
            query = """
                UPDATE paciente 
                SET activo = %s, fecha_actualizacion = %s
                WHERE id_paciente = %s
                RETURNING id_paciente, nombres, apellidos
            """
            
            result = db_service.execute_one(query, (False, datetime.now(), id_paciente))
            
            if result:
                return {
                    'success': True,
                    'data': dict(result),
                    'message': 'Paciente desactivado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al desactivar paciente'
                }
                
        except Exception as e:
            logger.error(f"Error eliminando paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al eliminar paciente: {str(e)}'
            }
    
    def restore(self, id_paciente):
        """Restaurar (activar) un paciente"""
        try:
            # Verificar que el paciente existe
            existing = self.get_by_id(id_paciente)
            if not existing['success']:
                return existing
            
            if existing['data']['estado']:
                return {
                    'success': False,
                    'message': 'El paciente ya está activo'
                }
            
            query = """
                UPDATE paciente 
                SET activo = %s, fecha_actualizacion = %s
                WHERE id_paciente = %s
                RETURNING id_paciente, nombres, apellidos
            """
            
            result = db_service.execute_one(query, (True, datetime.now(), id_paciente))
            
            if result:
                return {
                    'success': True,
                    'data': dict(result),
                    'message': 'Paciente restaurado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al restaurar paciente'
                }
                
        except Exception as e:
            logger.error(f"Error restaurando paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al restaurar paciente: {str(e)}'
            }
    
    def get_stats(self):
        """Obtener estadísticas de pacientes"""
        try:
            query = """
                SELECT 
                    COUNT(*) FILTER (WHERE activo = true) as total_activos,
                    COUNT(*) FILTER (WHERE activo = false) as total_inactivos,
                    COUNT(*) as total_general,
                    COUNT(*) FILTER (WHERE sexo = 'M' AND activo = true) as masculino,
                    COUNT(*) FILTER (WHERE sexo = 'F' AND activo = true) as femenino
                FROM paciente
            """
            
            result = db_service.execute_one(query)
            
            if result:
                return {
                    'success': True,
                    'data': {
                        'total_activos': result['total_activos'],
                        'total_inactivos': result['total_inactivos'],
                        'total_general': result['total_general'],
                        'por_sexo': {
                            'masculino': result['masculino'],
                            'femenino': result['femenino']
                        }
                    },
                    'message': 'Estadísticas obtenidas exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al obtener estadísticas'
                }
                
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {
                'success': False,
                'message': f'Error al obtener estadísticas: {str(e)}'
            }

# Instancia global del servicio
pacientes_service = PacientesService()
