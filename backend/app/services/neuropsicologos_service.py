import logging
from typing import Optional
from .database_service import DatabaseService

logger = logging.getLogger(__name__)


class NeuropsicologosService:
    """Servicio para listar neuropsicólogos usando psycopg2.

    Nota: En ausencia de una tabla específica de neuropsicólogos, se obtiene
    desde la tabla `usuario` filtrando por rol `Neuropsicólogo`.
    Si tu esquema incluye una tabla dedicada (p. ej. `neuropsicologo`),
    podemos ajustar los SELECT y JOIN según corresponda.
    """

    def __init__(self):
        self.db = DatabaseService()

    def get_role_id_by_name(self, role_name: str) -> Optional[int]:
        try:
            query = "SELECT id_rol FROM rol WHERE nom_rol = %s LIMIT 1"
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (role_name,))
                row = cursor.fetchone()
                return row["id_rol"] if row else None
        except Exception as e:
            logger.error(f"Error obteniendo id_rol por nombre {role_name}: {e}")
            return None

    def get_all(self, page: int = 1, limit: int = 5, search: Optional[str] = None, include_inactive: bool = True, role_id: Optional[int] = None):
        try:
            offset = (page - 1) * limit

            # Determinar role_id a usar (Neuropsicólogo por defecto)
            effective_role_id = role_id
            if effective_role_id is None:
                # Intentar obtener por nombre; fallback a 3 si no existe
                rid = self.get_role_id_by_name('Neuropsicólogo')
                effective_role_id = rid if rid is not None else 3

            # Condiciones
            where = ["u.id_rol = %s"]
            params = [effective_role_id]

            if not include_inactive:
                where.append("r.estado_rol = true")

            if search:
                where.append("(u.usua ILIKE %s)")
                params.append(f"%{search}%")

            where_clause = f"WHERE {' AND '.join(where)}" if where else ""

            # Consulta principal: mapeo mínimo para frontend
            query = f"""
                SELECT 
                    -- Campos esperados por el frontend
                    u.id_usuario AS id_neuropsicologo,
                    u.usua::text AS nombres,
                    ''::text AS apellidos,
                    u.usua AS username,
                    ''::text AS email,
                    COALESCE(r.estado_rol, true) AS estado,
                    NOW()::timestamp AS fecha_registro,

                    -- Campos reales de la tabla usuario y rol (para gestión)
                    u.id_usuario AS id_usuario,
                    u.id_rol AS id_rol,
                    u.usua AS usua,
                    r.nom_rol AS rol_nombre,
                    r.estado_rol AS estado_rol
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                {where_clause}
                ORDER BY u.usua ASC
                LIMIT %s OFFSET %s
            """

            main_params = params + [limit, offset]

            count_query = f"""
                SELECT COUNT(*) AS count
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                {where_clause}
            """

            with self.db.get_cursor() as cursor:
                cursor.execute(query, main_params)
                rows = cursor.fetchall() or []
                data = [dict(r) for r in rows]

                cursor.execute(count_query, params)
                total = cursor.fetchone()["count"] if cursor.rowcount != 0 else 0

                total_pages = (total + limit - 1) // limit

                return {
                    "success": True,
                    "data": data,
                    "metadata": {
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "total_pages": total_pages,
                        "has_next": page < total_pages,
                        "has_prev": page > 1,
                    },
                }
        except Exception as e:
            logger.error(f"Error obteniendo neuropsicólogos: {e}")
            return {
                "success": False,
                "message": f"Error al obtener neuropsicólogos: {str(e)}",
                "data": [],
                "metadata": {
                    "total": 0,
                    "page": page,
                    "limit": limit,
                    "total_pages": 0,
                    "has_next": False,
                    "has_prev": False,
                },
            }
    
    def get_total_neuropsicologos(self):
        """Obtener el total de neuropsicólogos activos"""
        try:
            # Obtener el ID del rol de Neuropsicólogo
            role_id = self.get_role_id_by_name('Neuropsicólogo')
            if not role_id:
                role_id = 3  # Fallback
            
            query = """
                SELECT COUNT(*) as total 
                FROM usuario u 
                JOIN rol r ON u.id_rol = r.id_rol 
                WHERE u.id_rol = %s AND r.estado_rol = true
            """
            with self.db.get_cursor() as cursor:
                cursor.execute(query, (role_id,))
                result = cursor.fetchone()
                return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error obteniendo total de neuropsicólogos: {e}")
            return 0