import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import secrets
import string
from .database_service import DatabaseService

logger = logging.getLogger(__name__)

class CodigosAccesoService:
    """Servicio para manejar operaciones CRUD de códigos de acceso usando psycopg2"""
    
    def __init__(self):
        self.db_service = DatabaseService()
        
        # Constantes para validación
        self.ESTADOS_VALIDOS = ['emitido', 'usado', 'vencido', 'revocado']
        self.TIPOS_EVALUACION_VALIDOS = ['CDT', 'MMSE', 'MOCA', 'ACE']
    
    def generar_codigo_unico(self, longitud=8):
        """Generar un código único alfanumérico"""
        caracteres = string.ascii_uppercase + string.digits
        codigo = ''.join(secrets.choice(caracteres) for _ in range(longitud))
        
        # Verificar que el código no existe
        query = "SELECT COUNT(*) as count FROM codigo_acceso WHERE codigo = %s"
        with self.db_service.get_cursor() as cursor:
            cursor.execute(query, (codigo,))
            result = cursor.fetchone()
            if result['count'] > 0:
                # Si existe, generar uno nuevo recursivamente
                return self.generar_codigo_unico(longitud)
        
        return codigo
    
    def get_all(self, page=1, limit=10, search=None, estado=None, tipo_evaluacion=None, id_paciente=None):
        """
        Obtener lista de códigos de acceso con paginación y filtros
        """
        try:
            # Calcular offset
            offset = (page - 1) * limit
            
            # Construir consulta base
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(ca.codigo ILIKE %s OR p.nombres ILIKE %s OR p.apellidos ILIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param, search_param])
            
            if estado:
                where_conditions.append("ca.estado = %s")
                params.append(estado)
            
            if tipo_evaluacion:
                # Filtrar por código de prueba (CDT/MMSE/MOCA/ACE)
                where_conditions.append("pr.codigo = %s")
                params.append(tipo_evaluacion)
            
            if id_paciente:
                where_conditions.append("ca.id_paciente = %s")
                params.append(id_paciente)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Consulta para obtener códigos de acceso
            query = f"""
                SELECT 
                    ca.id_codigo,
                    ca.codigo,
                    ca.id_paciente,
                    CONCAT(p.nombres, ' ', p.apellidos) as nombre_paciente,
                    p.nombres,
                    p.apellidos,
                    pr.codigo AS tipo_evaluacion,
                    ca.vence_at,
                    ca.estado,
                    ca.creado_en,
                    ca.ultimo_uso_en,
                    CASE 
                        WHEN ca.vence_at < NOW() AND ca.estado = 'emitido' THEN true
                        ELSE false
                    END as esta_vencido,
                    EXTRACT(EPOCH FROM (ca.vence_at - NOW()))/3600 as horas_restantes
                FROM codigo_acceso ca
                JOIN paciente p ON ca.id_paciente = p.id_paciente
                JOIN prueba_cognitiva pr ON ca.id_prueba = pr.id_prueba
                {where_clause}
                ORDER BY ca.creado_en DESC
                LIMIT %s OFFSET %s
            """
            
            # Parámetros para la consulta principal
            main_params = params + [limit, offset]
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, main_params)
                results = cursor.fetchall()
                
                # Convertir resultados a diccionarios
                codigos = []
                for row in results:
                    codigo = dict(row)
                    
                    # Convertir fechas a string para JSON
                    if codigo['vence_at']:
                        codigo['vence_at'] = codigo['vence_at'].isoformat()
                    if codigo['creado_en']:
                        codigo['creado_en'] = codigo['creado_en'].isoformat()
                    if codigo['ultimo_uso_en']:
                        codigo['ultimo_uso_en'] = codigo['ultimo_uso_en'].isoformat()
                    
                    # Formatear horas restantes
                    if codigo['horas_restantes'] is not None:
                        codigo['horas_restantes'] = float(codigo['horas_restantes'])
                    
                    codigos.append(codigo)
                
                # Consulta para contar total
                count_query = f"""
                    SELECT COUNT(*) as count
                    FROM codigo_acceso ca
                    JOIN paciente p ON ca.id_paciente = p.id_paciente
                    JOIN prueba_cognitiva pr ON ca.id_prueba = pr.id_prueba
                    {where_clause}
                """
                
                cursor.execute(count_query, params)
                count_result = cursor.fetchone()
                total = count_result['count']
                
                # Calcular metadatos de paginación
                total_pages = (total + limit - 1) // limit
                has_next = page < total_pages
                has_prev = page > 1
                
                return {
                    'success': True,
                    'data': codigos,
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
            logger.error(f"Error obteniendo códigos de acceso: {e}")
            return {
                'success': False,
                'message': f'Error al obtener códigos de acceso: {str(e)}',
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
    
    def get_by_id(self, id_codigo):
        """Obtener un código de acceso por su ID"""
        try:
            query = """
                SELECT 
                    ca.id_codigo,
                    ca.codigo,
                    ca.id_paciente,
                    CONCAT(p.nombres, ' ', p.apellidos) as nombre_paciente,
                    p.nombres,
                    p.apellidos,
                    pr.codigo AS tipo_evaluacion,
                    ca.vence_at,
                    ca.estado,
                    ca.creado_en,
                    ca.ultimo_uso_en,
                    CASE 
                        WHEN ca.vence_at < NOW() AND ca.estado = 'emitido' THEN true
                        ELSE false
                    END as esta_vencido,
                    EXTRACT(EPOCH FROM (ca.vence_at - NOW()))/3600 as horas_restantes
                FROM codigo_acceso ca
                JOIN paciente p ON ca.id_paciente = p.id_paciente
                JOIN prueba_cognitiva pr ON ca.id_prueba = pr.id_prueba
                WHERE ca.id_codigo = %s
            """
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, (id_codigo,))
                result = cursor.fetchone()
                
                if result:
                    codigo = dict(result)
                    
                    # Convertir fechas a string para JSON
                    if codigo['vence_at']:
                        codigo['vence_at'] = codigo['vence_at'].isoformat()
                    if codigo['creado_en']:
                        codigo['creado_en'] = codigo['creado_en'].isoformat()
                    if codigo['ultimo_uso_en']:
                        codigo['ultimo_uso_en'] = codigo['ultimo_uso_en'].isoformat()
                    
                    # Formatear horas restantes
                    if codigo['horas_restantes'] is not None:
                        codigo['horas_restantes'] = float(codigo['horas_restantes'])
                    
                    return {
                        'success': True,
                        'data': codigo
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Código de acceso no encontrado'
                    }
                
        except Exception as e:
            logger.error(f"Error obteniendo código de acceso {id_codigo}: {e}")
            return {
                'success': False,
                'message': f'Error al obtener código de acceso: {str(e)}'
            }
    
    def get_by_codigo(self, codigo_str):
        """Obtener un código de acceso por su código (string)"""
        try:
            query = """
                SELECT 
                    ca.id_codigo,
                    ca.codigo,
                    ca.id_paciente,
                    ca.id_prueba,
                    CONCAT(p.nombres, ' ', p.apellidos) as nombre_paciente,
                    pr.codigo AS tipo_evaluacion,
                    pr.nombre AS nombre_prueba,
                    ca.vence_at as fecha_expiracion,
                    ca.estado,
                    ca.creado_en,
                    ca.ultimo_uso_en
                FROM codigo_acceso ca
                JOIN paciente p ON ca.id_paciente = p.id_paciente
                JOIN prueba_cognitiva pr ON ca.id_prueba = pr.id_prueba
                WHERE ca.codigo = %s
            """
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, (codigo_str,))
                result = cursor.fetchone()
                
                if result:
                    codigo = dict(result)
                    
                    # Convertir fechas a string para JSON
                    if codigo.get('fecha_expiracion'):
                        codigo['fecha_expiracion'] = codigo['fecha_expiracion'].isoformat()
                    if codigo.get('creado_en'):
                        codigo['creado_en'] = codigo['creado_en'].isoformat()
                    if codigo.get('ultimo_uso_en'):
                        codigo['ultimo_uso_en'] = codigo['ultimo_uso_en'].isoformat()
                    
                    # Actualizar estado si está vencido
                    if codigo.get('fecha_expiracion'):
                        from datetime import datetime
                        fecha_exp = datetime.fromisoformat(codigo['fecha_expiracion'].replace('Z', '+00:00'))
                        if fecha_exp < datetime.now(fecha_exp.tzinfo) and codigo['estado'] == 'emitido':
                            codigo['estado'] = 'vencido'
                    
                    return codigo
                
                return None
        except Exception as e:
            logger.error(f"Error al obtener código de acceso por código: {e}")
            return None
    
    def create(self, codigo_data):
        """Crear un nuevo código de acceso"""
        try:
            # Validar datos requeridos
            if not codigo_data.get('id_paciente'):
                return {
                    'success': False,
                    'message': 'ID del paciente es requerido'
                }
            
            if not codigo_data.get('tipo_evaluacion'):
                return {
                    'success': False,
                    'message': 'Tipo de evaluación es requerido'
                }
            
            # Mapear tipo_evaluacion (código) a id_prueba activo
            with self.db_service.get_cursor() as cursor:
                cursor.execute("SELECT id_prueba FROM prueba_cognitiva WHERE UPPER(codigo) = UPPER(%s) AND activo = true", (codigo_data['tipo_evaluacion'],))
                _pr = cursor.fetchone()
                if not _pr:
                    return {
                        'success': False,
                        'message': 'Tipo de evaluación inválido: prueba no encontrada'
                    }
                id_prueba = _pr['id_prueba']

            # Validar que el paciente existe
            paciente_query = "SELECT COUNT(*) as count FROM paciente WHERE id_paciente = %s"
            with self.db_service.get_cursor() as cursor:
                cursor.execute(paciente_query, (codigo_data['id_paciente'],))
                result = cursor.fetchone()
                if result['count'] == 0:
                    return {
                        'success': False,
                        'message': 'El paciente especificado no existe'
                    }
            
            # Generar código único si no se proporciona
            codigo = codigo_data.get('codigo') or self.generar_codigo_unico()
            
            # Calcular fecha de vencimiento (por defecto 7 días)
            dias_vencimiento = codigo_data.get('dias_vencimiento', 7)
            vence_at = codigo_data.get('vence_at')
            if not vence_at:
                vence_at = datetime.now() + timedelta(days=dias_vencimiento)
            elif isinstance(vence_at, str):
                vence_at = datetime.fromisoformat(vence_at.replace('Z', '+00:00'))
            
            query = """
                INSERT INTO codigo_acceso (codigo, id_paciente, id_prueba, vence_at, estado)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id_codigo
            """
            
            params = (
                codigo,
                codigo_data['id_paciente'],
                id_prueba,
                vence_at,
                codigo_data.get('estado', 'emitido')
            )
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
                id_codigo = result['id_codigo']
            
            # Retornar el código creado
            nuevo_codigo = self.get_by_id(id_codigo)
            if nuevo_codigo['success']:
                return {
                    'success': True,
                    'data': nuevo_codigo['data'],
                    'message': 'Código de acceso creado exitosamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al recuperar código creado'
                }
                
        except Exception as e:
            logger.error(f"Error creando código de acceso: {e}")
            return {
                'success': False,
                'message': f'Error al crear código de acceso: {str(e)}'
            }
    
    def update(self, id_codigo, codigo_data):
        """Actualizar un código de acceso existente"""
        try:
            # Verificar que el código existe
            codigo_existente = self.get_by_id(id_codigo)
            if not codigo_existente['success']:
                return codigo_existente
            
            # Validar datos si se proporcionan (tipo_evaluacion se valida contra tabla prueba_cognitiva)
            
            if codigo_data.get('estado') and codigo_data['estado'] not in self.ESTADOS_VALIDOS:
                return {
                    'success': False,
                    'message': f'Estado debe ser uno de: {", ".join(self.ESTADOS_VALIDOS)}'
                }
            
            # Construir consulta de actualización dinámicamente
            set_clauses = []
            params = []
            
            if 'tipo_evaluacion' in codigo_data:
                # Mapear nuevo tipo a id_prueba
                with self.db_service.get_cursor() as cursor:
                    cursor.execute("SELECT id_prueba FROM prueba_cognitiva WHERE UPPER(codigo) = UPPER(%s) AND activo = true", (codigo_data['tipo_evaluacion'],))
                    _pr2 = cursor.fetchone()
                    if not _pr2:
                        return {
                            'success': False,
                            'message': 'Tipo de evaluación inválido: prueba no encontrada'
                        }
                    nuevo_id_prueba = _pr2['id_prueba']
                set_clauses.append("id_prueba = %s")
                params.append(nuevo_id_prueba)
            
            if 'vence_at' in codigo_data:
                set_clauses.append("vence_at = %s")
                vence_at = codigo_data['vence_at']
                if isinstance(vence_at, str):
                    vence_at = datetime.fromisoformat(vence_at.replace('Z', '+00:00'))
                params.append(vence_at)
            
            if 'estado' in codigo_data:
                set_clauses.append("estado = %s")
                params.append(codigo_data['estado'])
                
                # Si se marca como usado, actualizar ultimo_uso_en
                if codigo_data['estado'] == 'usado':
                    set_clauses.append("ultimo_uso_en = %s")
                    params.append(datetime.now())
            
            if not set_clauses:
                return {
                    'success': False,
                    'message': 'No hay datos para actualizar'
                }
            
            # Agregar ID al final de los parámetros
            params.append(id_codigo)
            
            query = f"""
                UPDATE codigo_acceso 
                SET {', '.join(set_clauses)}
                WHERE id_codigo = %s
                RETURNING id_codigo
            """
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
                
                if result:
                    # Retornar el código actualizado
                    codigo_actualizado = self.get_by_id(id_codigo)
                    if codigo_actualizado['success']:
                        return {
                            'success': True,
                            'data': codigo_actualizado['data'],
                            'message': 'Código de acceso actualizado exitosamente'
                        }
                    else:
                        return {
                            'success': False,
                            'message': 'Error al recuperar código actualizado'
                        }
                else:
                    return {
                        'success': False,
                        'message': 'No se pudo actualizar el código de acceso'
                    }
                
        except Exception as e:
            logger.error(f"Error actualizando código de acceso {id_codigo}: {e}")
            return {
                'success': False,
                'message': f'Error al actualizar código de acceso: {str(e)}'
            }
    
    def delete(self, id_codigo):
        """Eliminar un código de acceso"""
        try:
            # Verificar que el código existe
            codigo_existente = self.get_by_id(id_codigo)
            if not codigo_existente['success']:
                return codigo_existente
            
            query = "DELETE FROM codigo_acceso WHERE id_codigo = %s RETURNING id_codigo"
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, (id_codigo,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        'success': True,
                        'message': 'Código de acceso eliminado exitosamente'
                    }
                else:
                    return {
                        'success': False,
                        'message': 'No se pudo eliminar el código de acceso'
                    }
                
        except Exception as e:
            logger.error(f"Error eliminando código de acceso {id_codigo}: {e}")
            return {
                'success': False,
                'message': f'Error al eliminar código de acceso: {str(e)}'
            }
    
    def revocar_codigo(self, id_codigo):
        """Revocar un código de acceso específico"""
        return self.update(id_codigo, {'estado': 'revocado'})
    
    def marcar_como_usado(self, codigo):
        """Marcar un código como usado por su valor de código"""
        try:
            query = """
                UPDATE codigo_acceso 
                SET estado = 'usado', ultimo_uso_en = %s
                WHERE codigo = %s AND estado = 'emitido'
                RETURNING id_codigo
            """
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query, (datetime.now(), codigo))
                result = cursor.fetchone()
                
                if result:
                    return {
                        'success': True,
                        'message': 'Código marcado como usado exitosamente'
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Código no encontrado o ya fue usado'
                    }
                
        except Exception as e:
            logger.error(f"Error marcando código como usado {codigo}: {e}")
            return {
                'success': False,
                'message': f'Error al marcar código como usado: {str(e)}'
            }
    
    def get_estadisticas(self):
        """Obtener estadísticas de códigos de acceso"""
        try:
            query = """
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN ca.estado = 'emitido' THEN 1 END) as emitidos,
                    COUNT(CASE WHEN ca.estado = 'usado' THEN 1 END) as usados,
                    COUNT(CASE WHEN ca.estado = 'vencido' THEN 1 END) as vencidos,
                    COUNT(CASE WHEN ca.estado = 'revocado' THEN 1 END) as revocados,
                    COUNT(CASE WHEN ca.vence_at < NOW() AND ca.estado = 'emitido' THEN 1 END) as vencidos_pendientes,
                    COUNT(CASE WHEN pr.codigo = 'CDT' THEN 1 END) as cdt,
                    COUNT(CASE WHEN pr.codigo = 'MMSE' THEN 1 END) as mmse,
                    COUNT(CASE WHEN pr.codigo = 'MOCA' THEN 1 END) as moca,
                    COUNT(CASE WHEN pr.codigo = 'ACE' THEN 1 END) as ace
                FROM codigo_acceso ca
                JOIN prueba_cognitiva pr ON ca.id_prueba = pr.id_prueba
            """
            
            with self.db_service.get_cursor() as cursor:
                cursor.execute(query)
                result = cursor.fetchone()
                
                if result:
                    return {
                        'success': True,
                        'data': dict(result)
                    }
                else:
                    return {
                        'success': False,
                        'message': 'No se pudieron obtener las estadísticas'
                    }
                
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {
                'success': False,
                'message': f'Error al obtener estadísticas: {str(e)}'
            }
