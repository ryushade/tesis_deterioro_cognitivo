"""
Servicio para gestión de configuración de respuestas correctas del MMSE
Tabla: public.mmse_prueba_cognitiva_configuracion
"""
from typing import List, Dict, Any, Optional
from decimal import Decimal
import logging

from .database_service import DatabaseService

logger = logging.getLogger(__name__)


class MMSEConfigService:
    def __init__(self):
        self.db = DatabaseService()

    def get_configuraciones(
        self, 
        pregunta_id: Optional[str] = None, 
        contexto: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene todas las configuraciones de respuestas correctas
        """
        query = """
            SELECT 
                mpc.*,
                pc.nombre as nombre_prueba,
                pc.codigo as codigo_prueba
            FROM mmse_prueba_cognitiva_configuracion mpc
            INNER JOIN prueba_cognitiva pc ON mpc.id_prueba = pc.id_prueba
            WHERE pc.codigo = 'MMSE'
            AND mpc.es_activa = true
        """
        params = []
        
        if pregunta_id:
            query += " AND mpc.pregunta_id = %s"
            params.append(pregunta_id)
        
        if contexto:
            query += " AND mpc.contexto = %s"
            params.append(contexto)
            
        query += " ORDER BY mpc.pregunta_id, mpc.contexto, mpc.orden"
        
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall() or []
            return [dict(row) for row in rows]

    def get_configuracion_by_id(self, id_configuracion: int) -> Optional[Dict[str, Any]]:
        """
        Obtiene una configuración específica por ID
        """
        query = """
            SELECT 
                mpc.*,
                pc.nombre as nombre_prueba,
                pc.codigo as codigo_prueba
            FROM mmse_prueba_cognitiva_configuracion mpc
            INNER JOIN prueba_cognitiva pc ON mpc.id_prueba = pc.id_prueba
            WHERE mpc.id_configuracion = %s
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query, (id_configuracion,))
            row = cur.fetchone()
            return dict(row) if row else None

    def create_configuracion(self, data: Dict[str, Any]) -> Optional[int]:
        """
        Crea una nueva configuración de respuesta correcta
        """
        try:
            # Obtener id_prueba para MMSE
            id_prueba = self._get_mmse_prueba_id()
            if not id_prueba:
                logger.error("No se encontró la prueba MMSE")
                return None
                
            query = """
                INSERT INTO mmse_prueba_cognitiva_configuracion 
                (id_prueba, pregunta_id, respuesta_correcta, contexto, tipo_validacion, 
                 tolerancia_errores, puntuacion, es_activa, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_configuracion
            """
            
            params = (
                id_prueba,
                data['pregunta_id'],
                data['respuesta_correcta'],
                data.get('contexto'),
                data.get('tipo_validacion', 'exacta'),
                data.get('tolerancia_errores', 0),
                data.get('puntuacion', 1.00),
                data.get('es_activa', True),
                data.get('orden', 1)
            )
            
            with self.db.get_cursor() as cur:
                cur.execute(query, params)
                row = cur.fetchone()
                logger.info(f"Configuración creada: {row['id_configuracion']}")
                return row['id_configuracion'] if row else None
                
        except Exception as e:
            logger.error(f"Error creando configuración: {e}")
            return None

    def update_configuracion(self, id_configuracion: int, data: Dict[str, Any]) -> bool:
        """
        Actualiza una configuración existente
        """
        try:
            query = """
                UPDATE mmse_prueba_cognitiva_configuracion 
                SET pregunta_id = %s,
                    respuesta_correcta = %s,
                    contexto = %s,
                    tipo_validacion = %s,
                    tolerancia_errores = %s,
                    puntuacion = %s,
                    es_activa = %s,
                    orden = %s,
                    actualizado_en = NOW()
                WHERE id_configuracion = %s
            """
            
            params = (
                data['pregunta_id'],
                data['respuesta_correcta'],
                data.get('contexto'),
                data.get('tipo_validacion', 'exacta'),
                data.get('tolerancia_errores', 0),
                data.get('puntuacion', 1.00),
                data.get('es_activa', True),
                data.get('orden', 1),
                id_configuracion
            )
            
            with self.db.get_cursor() as cur:
                cur.execute(query, params)
                success = cur.rowcount > 0
                if success:
                    logger.info(f"Configuración {id_configuracion} actualizada")
                return success
                
        except Exception as e:
            logger.error(f"Error actualizando configuración {id_configuracion}: {e}")
            return False

    def delete_configuracion(self, id_configuracion: int) -> bool:
        """
        Elimina una configuración
        """
        try:
            query = "DELETE FROM mmse_prueba_cognitiva_configuracion WHERE id_configuracion = %s"
            
            with self.db.get_cursor() as cur:
                cur.execute(query, (id_configuracion,))
                success = cur.rowcount > 0
                if success:
                    logger.info(f"Configuración {id_configuracion} eliminada")
                return success
                
        except Exception as e:
            logger.error(f"Error eliminando configuración {id_configuracion}: {e}")
            return False

    def get_configuracion_for_validation(
        self, 
        pregunta_id: str, 
        contexto: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene configuraciones para validación en tiempo real
        """
        query = """
            SELECT respuesta_correcta, tipo_validacion, tolerancia_errores, puntuacion, contexto
            FROM mmse_prueba_cognitiva_configuracion mpc
            INNER JOIN prueba_cognitiva pc ON mpc.id_prueba = pc.id_prueba
            WHERE pc.codigo = 'MMSE'
            AND mpc.pregunta_id = %s
            AND mpc.es_activa = true
        """
        params = [pregunta_id]
        
        if contexto:
            query += " AND (mpc.contexto = %s OR mpc.contexto IS NULL)"
            params.append(contexto)
        else:
            query += " AND mpc.contexto IS NULL"
            
        query += " ORDER BY mpc.orden, mpc.puntuacion DESC"
        
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall() or []
            return [dict(row) for row in rows]

    def get_contextos_disponibles(self) -> List[str]:
        """
        Obtiene lista de contextos disponibles
        """
        query = """
            SELECT DISTINCT contexto
            FROM mmse_prueba_cognitiva_configuracion mpc
            INNER JOIN prueba_cognitiva pc ON mpc.id_prueba = pc.id_prueba
            WHERE pc.codigo = 'MMSE'
            AND mpc.contexto IS NOT NULL
            AND mpc.es_activa = true
            ORDER BY contexto
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall() or []
            return [row['contexto'] for row in rows]

    def get_preguntas_disponibles(self) -> List[str]:
        """
        Obtiene lista de preguntas disponibles
        """
        query = """
            SELECT DISTINCT pregunta_id
            FROM mmse_prueba_cognitiva_configuracion mpc
            INNER JOIN prueba_cognitiva pc ON mpc.id_prueba = pc.id_prueba
            WHERE pc.codigo = 'MMSE'
            AND mpc.es_activa = true
            ORDER BY pregunta_id
        """
        
        with self.db.get_cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall() or []
            return [row['pregunta_id'] for row in rows]

    def _get_mmse_prueba_id(self) -> Optional[int]:
        """
        Obtiene el ID de la prueba MMSE
        """
        query = "SELECT id_prueba FROM prueba_cognitiva WHERE codigo = 'MMSE' LIMIT 1"
        
        with self.db.get_cursor() as cur:
            cur.execute(query)
            row = cur.fetchone()
            return row['id_prueba'] if row else None

    def validate_answer_with_config(
        self, 
        pregunta_id: str, 
        user_answer: str, 
        contexto: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Valida una respuesta del usuario contra las configuraciones
        """
        configuraciones = self.get_configuracion_for_validation(pregunta_id, contexto)
        
        if not configuraciones:
            return {
                'is_valid': True,
                'score': 0.0,
                'message': 'Sin configuración específica',
                'suggestions': []
            }

        user_answer_lower = user_answer.lower().strip()
        
        # Buscar coincidencias
        for config in configuraciones:
            correct_answer = config['respuesta_correcta'].lower().strip()
            tipo_validacion = config['tipo_validacion']
            tolerancia = config['tolerancia_errores']
            puntuacion = float(config['puntuacion'])
            
            if tipo_validacion == 'exacta':
                if user_answer_lower == correct_answer:
                    return {
                        'is_valid': True,
                        'score': puntuacion,
                        'message': f'✅ Respuesta correcta: {config["respuesta_correcta"]}',
                        'suggestions': []
                    }
            
            elif tipo_validacion == 'parcial':
                if user_answer_lower in correct_answer or correct_answer in user_answer_lower:
                    return {
                        'is_valid': True,
                        'score': puntuacion,
                        'message': f'✅ Respuesta aceptada (similar a: {config["respuesta_correcta"]})',
                        'suggestions': []
                    }
            
            elif tipo_validacion == 'fuzzy':
                distance = self._levenshtein_distance(user_answer_lower, correct_answer)
                if distance <= tolerancia:
                    return {
                        'is_valid': True,
                        'score': puntuacion,
                        'message': f'⚠️ Respuesta aceptada (¿quiso decir: {config["respuesta_correcta"]}?)',
                        'suggestions': []
                    }

        # Si no hay coincidencia, sugerir opciones
        suggestions = [config['respuesta_correcta'] for config in configuraciones[:3]]
        return {
            'is_valid': True,
            'score': 0.0,
            'message': f'💡 Opciones sugeridas: {", ".join(suggestions)}',
            'suggestions': suggestions
        }

    def _levenshtein_distance(self, str1: str, str2: str) -> int:
        """
        Calcula la distancia de Levenshtein entre dos strings
        """
        if len(str1) < len(str2):
            return self._levenshtein_distance(str2, str1)

        if len(str2) == 0:
            return len(str1)

        previous_row = list(range(len(str2) + 1))
        for i, c1 in enumerate(str1):
            current_row = [i + 1]
            for j, c2 in enumerate(str2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]
