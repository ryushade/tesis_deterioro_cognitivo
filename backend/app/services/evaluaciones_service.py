"""
Servicio de evaluaciones cognitivas usando psycopg2 (sin SQLAlchemy)
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

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
            # Convertir diccionarios a JSON string para campos JSONB
            if isinstance(v, dict):
                params.append(json.dumps(v))
            else:
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

    # --- MMSE helpers ---
    def create_evaluacion_mmse(
        self,
        id_paciente: int,
        creado_por: Optional[int] = None,
        datos_iniciales: Optional[Dict[str, Any]] = None,
    ) -> Optional[int]:
        """Crea una evaluación MMSE usando el esquema real de la tabla."""
        # Primero obtener el id_prueba para MMSE
        query_prueba = """
            SELECT id_prueba FROM prueba_cognitiva 
            WHERE UPPER(codigo) = 'MMSE' OR UPPER(nombre) LIKE '%MMSE%'
            LIMIT 1
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query_prueba)
            prueba_row = cur.fetchone()
            if not prueba_row:
                # Si no existe, crear la prueba MMSE
                cur.execute("""
                    INSERT INTO prueba_cognitiva (codigo, nombre, descripcion, duracion_estimada_minutos, puntaje_maximo, activo)
                    VALUES ('MMSE', 'Mini-Mental State Examination', 'Evaluación cognitiva básica', 10, 30, true)
                    RETURNING id_prueba
                """)
                prueba_row = cur.fetchone()
            
            id_prueba = prueba_row['id_prueba']
            
            # Crear la evaluación con el esquema correcto
            query = """
                INSERT INTO evaluaciones_cognitivas (
                    id_paciente,
                    id_prueba,
                    id_codigo,
                    puntuacion_total,
                    puntuacion_maxima,
                    clasificacion,
                    observaciones
                ) VALUES (
                    %s, %s, NULL,
                    %s, %s,
                    'En progreso',
                    %s
                )
                RETURNING id_evaluacion
            """
            
            # Guardar datos iniciales en observaciones como JSON
            observaciones = json.dumps({
                'estado': 'en_progreso',
                'datos_iniciales': datos_iniciales or {},
                'creado_por': creado_por,
                'tipo': 'MMSE'
            })
            
            params = (
                id_paciente,
                id_prueba,
                0.0,  # puntuacion_total inicial
                30.0,  # puntuacion_maxima
                observaciones
            )
            
            cur.execute(query, params)
            row = cur.fetchone()
            return row['id_evaluacion'] if row else None

    def get_mmse_by_id(self, id_evaluacion: int) -> Optional[Dict[str, Any]]:
        """Obtiene evaluación MMSE verificando que sea del tipo correcto."""
        query = """
            SELECT 
                ec.*,
                pc.codigo as prueba_codigo,
                pc.nombre as prueba_nombre
            FROM evaluaciones_cognitivas ec
            JOIN prueba_cognitiva pc ON ec.id_prueba = pc.id_prueba
            WHERE ec.id_evaluacion = %s 
              AND (UPPER(pc.codigo) = 'MMSE' OR UPPER(pc.nombre) LIKE '%MMSE%')
        """
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_evaluacion,))
            row = cur.fetchone()
            if not row:
                return None
            
            data = dict(row)
            # Parsear observaciones si contiene JSON
            if data.get('observaciones'):
                try:
                    obs_data = json.loads(data['observaciones'])
                    data['datos_especificos'] = obs_data.get('datos_iniciales', {})
                    data['estado_procesamiento'] = obs_data.get('estado', 'en_progreso')
                except:
                    data['datos_especificos'] = {}
                    data['estado_procesamiento'] = 'en_progreso'
            
            return data

    def update_mmse_progress(
        self,
        id_evaluacion: int,
        datos_especificos: Dict[str, Any],
        puntuacion_total: Optional[float] = None,
        estado_procesamiento: Optional[str] = None,
    ) -> bool:
        """Actualiza progreso de MMSE guardando en observaciones."""
        # Obtener observaciones actuales
        query_get = "SELECT observaciones FROM evaluaciones_cognitivas WHERE id_evaluacion = %s"
        with self.db.get_cursor() as cur:
            cur.execute(query_get, (id_evaluacion,))
            row = cur.fetchone()
            if not row:
                return False
            
            # Parsear observaciones actuales o crear nuevo objeto
            try:
                obs_data = json.loads(row['observaciones']) if row['observaciones'] else {}
            except:
                obs_data = {}
            
            # Actualizar datos
            obs_data['datos_iniciales'] = datos_especificos
            obs_data['estado'] = estado_procesamiento or obs_data.get('estado', 'en_progreso')
            obs_data['tipo'] = 'MMSE'
            
            # Actualizar en base de datos
            query_update = """
                UPDATE evaluaciones_cognitivas 
                SET observaciones = %s,
                    puntuacion_total = COALESCE(%s, puntuacion_total),
                    actualizado_en = NOW()
                WHERE id_evaluacion = %s
            """
            cur.execute(query_update, (json.dumps(obs_data), puntuacion_total, id_evaluacion))
            return cur.rowcount > 0

    def finalizar_mmse(
        self,
        id_evaluacion: int,
        puntuacion_total: float,
        clasificacion: Optional[str] = None,
    ) -> bool:
        """Finaliza evaluación MMSE con puntuación final."""
        # Obtener observaciones actuales para preservar datos
        query_get = "SELECT observaciones FROM evaluaciones_cognitivas WHERE id_evaluacion = %s"
        with self.db.get_cursor() as cur:
            cur.execute(query_get, (id_evaluacion,))
            row = cur.fetchone()
            if not row:
                return False
            
            # Parsear y actualizar observaciones
            try:
                obs_data = json.loads(row['observaciones']) if row['observaciones'] else {}
            except:
                obs_data = {}
            
            obs_data['estado'] = 'completada'
            obs_data['tipo'] = 'MMSE'
            
            # Calcular porcentaje de acierto
            porcentaje = (puntuacion_total / 30.0) * 100 if puntuacion_total else 0
            
            # Actualizar evaluación
            query_update = """
                UPDATE evaluaciones_cognitivas 
                SET puntuacion_total = %s,
                    porcentaje_acierto = %s,
                    clasificacion = %s,
                    observaciones = %s,
                    actualizado_en = NOW()
                WHERE id_evaluacion = %s
            """
            
            clasificacion_final = clasificacion or self._clasificar_mmse(puntuacion_total)
            
            cur.execute(query_update, (
                puntuacion_total,
                porcentaje,
                clasificacion_final,
                json.dumps(obs_data),
                id_evaluacion
            ))
            return cur.rowcount > 0
    
    def _clasificar_mmse(self, puntuacion: float) -> str:
        """Clasifica resultado MMSE según puntuación."""
        if puntuacion >= 27:
            return 'Normal'
        elif puntuacion >= 24:
            return 'Deterioro cognitivo leve'
        elif puntuacion >= 19:
            return 'Deterioro cognitivo moderado'
        else:
            return 'Deterioro cognitivo severo'
