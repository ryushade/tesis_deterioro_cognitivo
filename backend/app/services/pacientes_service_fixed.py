import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from .database_service import DatabaseService

logger = logging.getLogger(__name__)

class PacientesService:
    """Servicio para manejar operaciones CRUD de pacientes usando psycopg2"""
    
    def __init__(self):
        self.db_service = DatabaseService()
    
    def get_all(self, page=1, limit=10, search=None, include_inactive=True):
        """
        Obtener lista de pacientes con paginación y búsqueda
        """
        try:
            connection = DatabaseService.get_connection()
            cursor = connection.cursor()
            
            # Calcular offset
            offset = (page - 1) * limit
            
            # Construir consulta base
            where_conditions = []
            params = []
            
            # Nota: La tabla solo tiene las columnas básicas, no hay campo 'activo'
            
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
                    anos_escolaridad
                FROM paciente 
                {where_clause}
                ORDER BY id_paciente DESC
                LIMIT %s OFFSET %s
            """
            
            # Parámetros para la consulta principal
            main_params = params + [limit, offset]
            cursor.execute(query, main_params)
            results = cursor.fetchall()
            
            # Convertir resultados a diccionarios
            columns = [desc[0] for desc in cursor.description]
            pacientes = []
            for row in results:
                paciente = dict(zip(columns, row))
                # Convertir fecha a string para JSON
                if paciente['fecha_nacimiento']:
                    paciente['fecha_nacimiento'] = paciente['fecha_nacimiento'].isoformat()
                # Agregar campos calculados para compatibilidad con frontend
                paciente['fecha_registro'] = datetime.now().isoformat()
                paciente['fecha_actualizacion'] = datetime.now().isoformat()
                paciente['estado'] = True
                pacientes.append(paciente)
            
            # Consulta para contar total
            count_query = f"""
                SELECT COUNT(*) 
                FROM paciente 
                {where_clause}
            """
            
            cursor.execute(count_query, params)
            total = cursor.fetchone()[0]
            
            # Calcular metadatos de paginación
            total_pages = (total + limit - 1) // limit
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'success': True,
                'data': pacientes,
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
        finally:
            if connection:
                DatabaseService.close_connection(connection)
    
    def get_by_id(self, id_paciente):
        """Obtener un paciente por su ID"""
        try:
            connection = DatabaseService.get_connection()
            cursor = connection.cursor()
            
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
                    anos_escolaridad
                FROM paciente 
                WHERE id_paciente = %s
            """
            
            cursor.execute(query, (id_paciente,))
            result = cursor.fetchone()
            
            if result:
                columns = [desc[0] for desc in cursor.description]
                paciente = dict(zip(columns, result))
                
                # Convertir fecha a string para JSON
                if paciente['fecha_nacimiento']:
                    paciente['fecha_nacimiento'] = paciente['fecha_nacimiento'].isoformat()
                
                # Agregar campos calculados para compatibilidad con frontend
                paciente['fecha_registro'] = datetime.now().isoformat()
                paciente['fecha_actualizacion'] = datetime.now().isoformat()
                paciente['estado'] = True
                
                return {
                    'success': True,
                    'data': paciente
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
        finally:
            if connection:
                DatabaseService.close_connection(connection)
    
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
            
            connection = DatabaseService.get_connection()
            cursor = connection.cursor()
            
            query = """
                INSERT INTO paciente (nombres, apellidos, fecha_nacimiento, sexo, anos_escolaridad)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id_paciente
            """
            
            params = (
                paciente_data['nombres'],
                paciente_data['apellidos'],
                paciente_data['fecha_nacimiento'],
                paciente_data.get('sexo'),
                paciente_data.get('anos_escolaridad', 0)
            )
            
            cursor.execute(query, params)
            id_paciente = cursor.fetchone()[0]
            connection.commit()
            
            # Retornar el paciente creado
            nuevo_paciente = self.get_by_id(id_paciente)
            if nuevo_paciente['success']:
                return {
                    'success': True,
                    'data': nuevo_paciente['data'],
                    'message': 'Paciente creado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al recuperar paciente creado'
                }
                
        except Exception as e:
            if 'connection' in locals():
                connection.rollback()
            logger.error(f"Error creando paciente: {e}")
            return {
                'success': False,
                'message': f'Error al crear paciente: {str(e)}'
            }
        finally:
            if 'connection' in locals():
                DatabaseService.close_connection(connection)
    
    def update(self, id_paciente, paciente_data):
        """Actualizar un paciente existente"""
        try:
            # Verificar que el paciente existe
            paciente_existente = self.get_by_id(id_paciente)
            if not paciente_existente['success']:
                return paciente_existente
            
            # Validar datos si se proporcionan
            if paciente_data.get('sexo') and paciente_data['sexo'] not in ['M', 'F']:
                return {
                    'success': False,
                    'message': 'Sexo debe ser M o F'
                }
            
            connection = DatabaseService.get_connection()
            cursor = connection.cursor()
            
            # Construir consulta de actualización dinámicamente
            set_clauses = []
            params = []
            
            if 'nombres' in paciente_data:
                set_clauses.append("nombres = %s")
                params.append(paciente_data['nombres'])
            
            if 'apellidos' in paciente_data:
                set_clauses.append("apellidos = %s")
                params.append(paciente_data['apellidos'])
            
            if 'fecha_nacimiento' in paciente_data:
                set_clauses.append("fecha_nacimiento = %s")
                params.append(paciente_data['fecha_nacimiento'])
            
            if 'sexo' in paciente_data:
                set_clauses.append("sexo = %s")
                params.append(paciente_data['sexo'])
            
            if 'anos_escolaridad' in paciente_data:
                set_clauses.append("anos_escolaridad = %s")
                params.append(paciente_data['anos_escolaridad'])
            
            if not set_clauses:
                return {
                    'success': False,
                    'message': 'No hay datos para actualizar'
                }
            
            # Agregar ID al final de los parámetros
            params.append(id_paciente)
            
            query = f"""
                UPDATE paciente 
                SET {', '.join(set_clauses)}
                WHERE id_paciente = %s
                RETURNING id_paciente
            """
            
            cursor.execute(query, params)
            result = cursor.fetchone()
            
            if result:
                connection.commit()
                # Retornar el paciente actualizado
                paciente_actualizado = self.get_by_id(id_paciente)
                if paciente_actualizado['success']:
                    return {
                        'success': True,
                        'data': paciente_actualizado['data'],
                        'message': 'Paciente actualizado exitosamente'
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Error al recuperar paciente actualizado'
                    }
            else:
                return {
                    'success': False,
                    'message': 'No se pudo actualizar el paciente'
                }
                
        except Exception as e:
            if 'connection' in locals():
                connection.rollback()
            logger.error(f"Error actualizando paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al actualizar paciente: {str(e)}'
            }
        finally:
            if 'connection' in locals():
                DatabaseService.close_connection(connection)
    
    def delete(self, id_paciente):
        """Eliminar un paciente (eliminación física)"""
        try:
            # Verificar que el paciente existe
            paciente_existente = self.get_by_id(id_paciente)
            if not paciente_existente['success']:
                return paciente_existente
            
            connection = DatabaseService.get_connection()
            cursor = connection.cursor()
            
            # Como no hay campo 'activo', hacemos eliminación física
            query = "DELETE FROM paciente WHERE id_paciente = %s RETURNING id_paciente"
            
            cursor.execute(query, (id_paciente,))
            result = cursor.fetchone()
            
            if result:
                connection.commit()
                return {
                    'success': True,
                    'message': 'Paciente eliminado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'No se pudo eliminar el paciente'
                }
                
        except Exception as e:
            if 'connection' in locals():
                connection.rollback()
            logger.error(f"Error eliminando paciente {id_paciente}: {e}")
            return {
                'success': False,
                'message': f'Error al eliminar paciente: {str(e)}'
            }
        finally:
            if 'connection' in locals():
                DatabaseService.close_connection(connection)
