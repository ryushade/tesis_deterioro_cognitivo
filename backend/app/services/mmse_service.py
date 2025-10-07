"""
Servicio para manejar sesiones MMSE usando la tabla evaluacion_sesion
"""
from typing import Optional, Dict, Any
from datetime import datetime
from .database_service import DatabaseService


class MMSEService:
    def __init__(self):
        self.db = DatabaseService()

    def crear_sesion(
        self,
        id_paciente: int,
        id_prueba: int,
        id_codigo: Optional[int] = None,
        datos_iniciales: Optional[Dict[str, Any]] = None
    ) -> Optional[int]:
        """
        Crea una nueva sesión MMSE en la tabla evaluacion_sesion.
        Retorna el id_sesion si se crea exitosamente.
        """
        query = """
            INSERT INTO evaluacion_sesion (
                id_paciente,
                id_prueba,
                id_codigo,
                estado,
                progreso,
                iniciado_en,
                actualizado_en
            ) VALUES (
                %s, %s, %s, 'iniciada', 0, NOW(), NOW()
            )
            RETURNING id_sesion
        """
        
        params = (id_paciente, id_prueba, id_codigo)
        
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return row['id_sesion'] if row else None

    def obtener_sesion(self, id_sesion: int) -> Optional[Dict[str, Any]]:
        """
        Obtiene una sesión por su ID con el tiempo transcurrido calculado.
        """
        query = """
            SELECT 
                es.id_sesion,
                es.id_paciente,
                es.id_prueba,
                es.id_codigo,
                es.estado,
                es.progreso,
                es.forma,
                es.imagen_url,
                es.iniciado_en,
                es.actualizado_en,
                es.id_evaluacion_final,
                pc.nombre as nombre_prueba,
                pc.duracion_estimada_minutos,
                EXTRACT(EPOCH FROM (NOW() - es.iniciado_en))::INTEGER as tiempo_transcurrido_segundos,
                CASE 
                    WHEN pc.duracion_estimada_minutos > 0 THEN
                        GREATEST(0, (pc.duracion_estimada_minutos * 60) - EXTRACT(EPOCH FROM (NOW() - es.iniciado_en))::INTEGER)
                    ELSE 0
                END as tiempo_restante_segundos
            FROM evaluacion_sesion es
            INNER JOIN prueba_cognitiva pc ON es.id_prueba = pc.id_prueba
            WHERE es.id_sesion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_sesion,))
            row = cur.fetchone()
            return dict(row) if row else None

    def actualizar_progreso(
        self,
        id_sesion: int,
        progreso: int,
        estado: Optional[str] = None
    ) -> bool:
        """
        Actualiza el progreso de la sesión.
        """
        if estado:
            query = """
                UPDATE evaluacion_sesion
                SET progreso = %s,
                    estado = %s,
                    actualizado_en = NOW()
                WHERE id_sesion = %s
            """
            params = (progreso, estado, id_sesion)
        else:
            query = """
                UPDATE evaluacion_sesion
                SET progreso = %s,
                    estado = 'en_progreso',
                    actualizado_en = NOW()
                WHERE id_sesion = %s
            """
            params = (progreso, id_sesion)
        
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            return cur.rowcount > 0

    def completar_sesion(
        self,
        id_sesion: int,
        id_evaluacion_final: int
    ) -> bool:
        """
        Marca la sesión como completada y asocia la evaluación final.
        """
        query = """
            UPDATE evaluacion_sesion
            SET estado = 'completada',
                progreso = 100,
                id_evaluacion_final = %s,
                actualizado_en = NOW()
            WHERE id_sesion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_evaluacion_final, id_sesion))
            return cur.rowcount > 0

    def cancelar_sesion(self, id_sesion: int) -> bool:
        """
        Marca la sesión como cancelada.
        """
        query = """
            UPDATE evaluacion_sesion
            SET estado = 'cancelada',
                actualizado_en = NOW()
            WHERE id_sesion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_sesion,))
            return cur.rowcount > 0

    def pausar_sesion(self, id_sesion: int) -> bool:
        """
        Marca la sesión como pausada.
        """
        query = """
            UPDATE evaluacion_sesion
            SET estado = 'pausada',
                actualizado_en = NOW()
            WHERE id_sesion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_sesion,))
            return cur.rowcount > 0

    def reanudar_sesion(self, id_sesion: int) -> bool:
        """
        Reanuda una sesión pausada.
        """
        query = """
            UPDATE evaluacion_sesion
            SET estado = 'en_progreso',
                actualizado_en = NOW()
            WHERE id_sesion = %s AND estado = 'pausada'
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_sesion,))
            return cur.rowcount > 0

    def marcar_expirada(self, id_sesion: int) -> bool:
        """
        Marca la sesión como expirada (cuando se acaba el tiempo).
        """
        query = """
            UPDATE evaluacion_sesion
            SET estado = 'expirada',
                actualizado_en = NOW()
            WHERE id_sesion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_sesion,))
            return cur.rowcount > 0

    def obtener_sesiones_paciente(self, id_paciente: int) -> list:
        """
        Obtiene todas las sesiones de un paciente.
        """
        query = """
            SELECT 
                es.id_sesion,
                es.id_paciente,
                es.id_prueba,
                es.estado,
                es.progreso,
                es.iniciado_en,
                es.actualizado_en,
                pc.nombre as nombre_prueba
            FROM evaluacion_sesion es
            INNER JOIN prueba_cognitiva pc ON es.id_prueba = pc.id_prueba
            WHERE es.id_paciente = %s
            ORDER BY es.iniciado_en DESC
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_paciente,))
            rows = cur.fetchall() or []
            return [dict(r) for r in rows]

    def verificar_sesion_activa(self, id_paciente: int, id_prueba: int) -> Optional[int]:
        """
        Verifica si existe una sesión activa para un paciente y prueba.
        Retorna el id_sesion si existe.
        """
        query = """
            SELECT id_sesion
            FROM evaluacion_sesion
            WHERE id_paciente = %s 
              AND id_prueba = %s
              AND estado IN ('iniciada', 'en_progreso', 'pausada')
            LIMIT 1
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_paciente, id_prueba))
            row = cur.fetchone()
            return row['id_sesion'] if row else None

