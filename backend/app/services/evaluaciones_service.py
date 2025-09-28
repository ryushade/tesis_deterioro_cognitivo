"""
Servicio de evaluaciones cognitivas usando psycopg2 (sin SQLAlchemy)
"""
from typing import Optional, Dict, Any, List
from datetime import datetime

from .database_service import DatabaseService


class EvaluacionesService:
    def __init__(self):
        self.db = DatabaseService()

    def create_evaluacion_cdt(
        self,
        id_paciente: int,
        id_codigo: Optional[int] = None,
        imagen_url: Optional[str] = None,
        metodo_cdt: str = 'foto_movil',
        creado_por: Optional[int] = None,
    ) -> Optional[int]:
        """Crea una evaluación CDT inicial en estado 'pendiente' y retorna su ID."""
        query = """
            INSERT INTO evaluaciones_cognitivas (
                id_paciente,
                id_codigo,
                tipo_evaluacion,
                fecha_evaluacion,
                puntuacion_total,
                puntuacion_maxima,
                clasificacion,
                confianza,
                estado_procesamiento,
                tiempo_procesamiento,
                version_algoritmo,
                observaciones,
                imagen_url,
                metodo_cdt,
                creado_por
            ) VALUES (
                %s, %s, 'CDT', NOW(),
                %s, %s, NULL, NULL,
                'pendiente', NULL, 'basic_1.0',
                %s, %s, %s
            )
            RETURNING id_evaluacion
        """

        params = (
            id_paciente,
            id_codigo,
            0.0,  # puntuacion_total inicial
            10.0, # puntuacion_maxima por defecto
            'Evaluación creada; pendiente de análisis',
            imagen_url,
            metodo_cdt,
            creado_por,
        )

        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return row['id_evaluacion'] if row else None

    def get_evaluacion_by_id(self, id_evaluacion: int) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                id_evaluacion,
                id_paciente,
                id_codigo,
                tipo_evaluacion,
                fecha_evaluacion,
                puntuacion_total,
                puntuacion_maxima,
                clasificacion,
                confianza,
                estado_procesamiento,
                tiempo_procesamiento,
                version_algoritmo,
                observaciones,
                imagen_url,
                metodo_cdt,
                datos_especificos,
                archivos_paths,
                creado_por,
                actualizado_en
            FROM evaluaciones_cognitivas
            WHERE id_evaluacion = %s
        """

        with self.db.get_cursor() as cur:
            cur.execute(query, (id_evaluacion,))
            row = cur.fetchone()
            return dict(row) if row else None

    def get_evaluaciones_by_paciente(self, id_paciente: int) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                id_evaluacion,
                id_paciente,
                id_codigo,
                tipo_evaluacion,
                fecha_evaluacion,
                puntuacion_total,
                puntuacion_maxima,
                clasificacion,
                confianza,
                estado_procesamiento,
                tiempo_procesamiento,
                version_algoritmo,
                observaciones,
                imagen_url,
                metodo_cdt
            FROM evaluaciones_cognitivas
            WHERE id_paciente = %s AND tipo_evaluacion = 'CDT'
            ORDER BY fecha_evaluacion DESC
        """
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_paciente,))
            rows = cur.fetchall() or []
            return [dict(r) for r in rows]

    def update_evaluacion(self, id_evaluacion: int, fields: Dict[str, Any]) -> bool:
        if not fields:
            return False
        set_clauses = []
        params = []
        for k, v in fields.items():
            set_clauses.append(f"{k} = %s")
            params.append(v)
        # actualizar timestamp
        set_clauses.append("actualizado_en = NOW()")
        query = f"""
            UPDATE evaluaciones_cognitivas
            SET {', '.join(set_clauses)}
            WHERE id_evaluacion = %s
        """
        params.append(id_evaluacion)
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            return cur.rowcount > 0

    def delete_evaluacion(self, id_evaluacion: int) -> bool:
        with self.db.get_cursor() as cur:
            cur.execute(
                "DELETE FROM evaluaciones_cognitivas WHERE id_evaluacion = %s",
                (id_evaluacion,),
            )
            return cur.rowcount > 0

