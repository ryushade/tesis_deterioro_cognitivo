"""
Servicio para gestión de pruebas cognitivas (catálogo) usando psycopg2
Tabla: public.prueba_cognitiva
"""
from typing import Any, Dict, List, Optional
import logging
from decimal import Decimal

from .database_service import DatabaseService

logger = logging.getLogger(__name__)


class PruebaCognitivaService:
  def __init__(self) -> None:
    self.db = DatabaseService()

  def _row_to_dict(self, row: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(row)
    # Convertir Decimal a float para compatibilidad con JSON/TS
    if d.get('puntaje_maximo') is not None and isinstance(d['puntaje_maximo'], Decimal):
      d['puntaje_maximo'] = float(d['puntaje_maximo'])
    # Fechas a isoformat si vienen como datetime
    for k in ('creado_en', 'actualizado_en'):
      v = d.get(k)
      if hasattr(v, 'isoformat'):
        d[k] = v.isoformat()
    return d

  def get_all(
    self,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    modo_aplicacion: Optional[str] = None,
    activo: Optional[bool] = None,
  ) -> Dict[str, Any]:
    try:
      offset = (page - 1) * limit
      where: List[str] = []
      params: List[Any] = []

      if search:
        where.append("(codigo ILIKE %s OR nombre ILIKE %s)")
        s = f"%{search}%"
        params.extend([s, s])

      if modo_aplicacion:
        ma = modo_aplicacion.lower()
        if ma not in ('papel', 'digital'):
          return {
            'success': False,
            'message': "modo_aplicacion debe ser 'papel' o 'digital'"
          }
        where.append("modo_aplicacion = %s")
        params.append(ma)

      if activo is not None:
        where.append("activo = %s")
        params.append(activo)

      where_clause = f"WHERE {' AND '.join(where)}" if where else ""

      query = f"""
        SELECT
          id_prueba,
          codigo,
          nombre,
          puntaje_maximo,
          modo_aplicacion,
          activo,
          creado_en,
          actualizado_en
        FROM prueba_cognitiva
        {where_clause}
        ORDER BY actualizado_en DESC
        LIMIT %s OFFSET %s
      """
      main_params = params + [limit, offset]

      with self.db.get_cursor() as cur:
        cur.execute(query, main_params)
        rows = cur.fetchall() or []
        data = [self._row_to_dict(r) for r in rows]

        count_query = f"SELECT COUNT(*) AS count FROM prueba_cognitiva {where_clause}"
        cur.execute(count_query, params)
        total = cur.fetchone()['count']

        total_pages = (total + limit - 1) // limit if limit else 1

        return {
          'success': True,
          'data': data,
          'metadata': {
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1,
          }
        }
    except Exception as e:
      logger.error(f"Error get_all pruebas cognitivas: {e}")
      return {
        'success': False,
        'message': f'Error al obtener pruebas cognitivas: {str(e)}',
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

  def get_by_id(self, id_prueba: int) -> Dict[str, Any]:
    try:
      query = """
        SELECT id_prueba, codigo, nombre, puntaje_maximo, modo_aplicacion, activo, creado_en, actualizado_en
        FROM prueba_cognitiva
        WHERE id_prueba = %s
      """
      with self.db.get_cursor() as cur:
        cur.execute(query, (id_prueba,))
        row = cur.fetchone()
        if not row:
          return {'success': False, 'message': 'Prueba no encontrada'}
        return {'success': True, 'data': self._row_to_dict(row)}
    except Exception as e:
      logger.error(f"Error get_by_id prueba {id_prueba}: {e}")
      return {'success': False, 'message': f'Error al obtener prueba: {str(e)}'}

  def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
    try:
      # Validaciones básicas
      codigo = (data.get('codigo') or '').strip()
      nombre = (data.get('nombre') or '').strip()
      puntaje_maximo = data.get('puntaje_maximo')
      modo_aplicacion = (data.get('modo_aplicacion') or 'papel').lower()
      activo = data.get('activo', True)

      if not codigo or not nombre:
        return {'success': False, 'message': 'codigo y nombre son requeridos'}
      if modo_aplicacion not in ('papel', 'digital'):
        return {'success': False, 'message': "modo_aplicacion debe ser 'papel' o 'digital'"}

      with self.db.get_cursor() as cur:
        # Verificar unicidad de codigo
        cur.execute("SELECT 1 FROM prueba_cognitiva WHERE codigo = %s", (codigo,))
        if cur.fetchone():
          return {'success': False, 'message': 'El código ya existe'}

        query = """
          INSERT INTO prueba_cognitiva (
            codigo, nombre, puntaje_maximo, modo_aplicacion, activo
          ) VALUES (%s, %s, %s, %s, %s)
          RETURNING id_prueba
        """
        cur.execute(query, (codigo, nombre, puntaje_maximo, modo_aplicacion, activo))
        new_id = cur.fetchone()['id_prueba']

        # Devolver registro creado
        return self.get_by_id(new_id)
    except Exception as e:
      logger.error(f"Error creando prueba cognitiva: {e}")
      return {'success': False, 'message': f'Error al crear prueba: {str(e)}'}

  def update(self, id_prueba: int, data: Dict[str, Any]) -> Dict[str, Any]:
    try:
      # Verificar existencia
      exists = self.get_by_id(id_prueba)
      if not exists.get('success'):
        return exists

      allowed_fields = ['codigo', 'nombre', 'puntaje_maximo', 'modo_aplicacion', 'activo']
      set_clauses: List[str] = []
      params: List[Any] = []

      # Validaciones previas
      if 'modo_aplicacion' in data:
        ma = (data['modo_aplicacion'] or '').lower()
        if ma not in ('papel', 'digital'):
          return {'success': False, 'message': "modo_aplicacion debe ser 'papel' o 'digital'"}

      if 'codigo' in data:
        nuevo_codigo = (data['codigo'] or '').strip()
        if not nuevo_codigo:
          return {'success': False, 'message': 'codigo no puede estar vacío'}
        # Validar unicidad si cambia
        with self.db.get_cursor(commit=False) as cur:
          cur.execute("SELECT 1 FROM prueba_cognitiva WHERE codigo = %s AND id_prueba <> %s", (nuevo_codigo, id_prueba))
          if cur.fetchone():
            return {'success': False, 'message': 'El código ya está en uso'}

      for k in allowed_fields:
        if k in data:
          set_clauses.append(f"{k} = %s")
          params.append(data[k])

      if not set_clauses:
        return {'success': False, 'message': 'No hay datos para actualizar'}

      set_clauses.append("actualizado_en = NOW()")
      params.append(id_prueba)

      query = f"""
        UPDATE prueba_cognitiva
        SET {', '.join(set_clauses)}
        WHERE id_prueba = %s
        RETURNING id_prueba
      """

      with self.db.get_cursor() as cur:
        cur.execute(query, params)
        if not cur.fetchone():
          return {'success': False, 'message': 'No se pudo actualizar la prueba'}
        return self.get_by_id(id_prueba)

    except Exception as e:
      logger.error(f"Error actualizando prueba {id_prueba}: {e}")
      return {'success': False, 'message': f'Error al actualizar prueba: {str(e)}'}

  def delete(self, id_prueba: int) -> Dict[str, Any]:
    """Desactivar (activo=false) la prueba."""
    try:
      with self.db.get_cursor() as cur:
        cur.execute(
          "UPDATE prueba_cognitiva SET activo = false, actualizado_en = NOW() WHERE id_prueba = %s RETURNING id_prueba",
          (id_prueba,)
        )
        if not cur.fetchone():
          return {'success': False, 'message': 'Prueba no encontrada'}
      return {'success': True, 'message': 'Prueba desactivada'}
    except Exception as e:
      logger.error(f"Error desactivando prueba {id_prueba}: {e}")
      return {'success': False, 'message': f'Error al desactivar prueba: {str(e)}'}

  def restore(self, id_prueba: int) -> Dict[str, Any]:
    """Reactivar (activo=true) la prueba."""
    try:
      with self.db.get_cursor() as cur:
        cur.execute(
          "UPDATE prueba_cognitiva SET activo = true, actualizado_en = NOW() WHERE id_prueba = %s RETURNING id_prueba",
          (id_prueba,)
        )
        if not cur.fetchone():
          return {'success': False, 'message': 'Prueba no encontrada'}
      return {'success': True, 'message': 'Prueba reactivada'}
    except Exception as e:
      logger.error(f"Error reactivando prueba {id_prueba}: {e}")
      return {'success': False, 'message': f'Error al reactivar prueba: {str(e)}'}

