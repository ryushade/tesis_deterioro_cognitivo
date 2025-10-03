"""
Servicio CDT basado en psycopg2 (sin SQLAlchemy)
"""
import os
import uuid
from typing import Dict, Any, Optional, List
import numpy as np
try:
    import cv2  # type: ignore
    _CV2_AVAILABLE = True
except Exception:
    _CV2_AVAILABLE = False

from werkzeug.datastructures import FileStorage

from .database_service import DatabaseService
from .evaluaciones_service import EvaluacionesService


try:
    from app.services.cdt_analyzer import CDTAnalyzer  # opcional
    ANALYZER_AVAILABLE = True
except Exception:
    ANALYZER_AVAILABLE = False
    CDTAnalyzer = None  # type: ignore


class CDTServicePsycopg2:
    def __init__(self) -> None:
        self.db = DatabaseService()
        self.evals = EvaluacionesService()
        self.allowed_extensions = {"png", "jpg", "jpeg", "bmp", "tiff"}
        self.upload_folder = os.path.join(os.getcwd(), "uploads", "cdt")
        os.makedirs(self.upload_folder, exist_ok=True)
        self.analyzer = CDTAnalyzer() if ANALYZER_AVAILABLE else None

    def is_allowed_file(self, filename: str) -> bool:
        return "." in filename and filename.rsplit(".", 1)[1].lower() in self.allowed_extensions

    def save_uploaded_file(self, file: FileStorage) -> Optional[str]:
        if not file or not file.filename or not self.is_allowed_file(file.filename):
            return None
        ext = file.filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        path = os.path.join(self.upload_folder, unique_filename)
        file.save(path)
        return path

    def analyze_cdt_file(self, file: FileStorage, paciente_id: Optional[str]) -> Dict[str, Any]:
        path = self.save_uploaded_file(file)
        if not path:
            return {"success": False, "error": "Archivo no permitido o no recibido"}

        # Rechazar imágenes que no parezcan relojes para evitar análisis inválidos
        if _CV2_AVAILABLE:
            try:
                if not self._is_clock_like(path):
                    return {"success": False, "error": "La imagen no parece un reloj (no se detectó contorno circular)"}
            except Exception:
                # Si el chequeo rápido falla, continuamos para no bloquear, pero idealmente loggear
                pass

        # Resultado por defecto (si no hay analizador)
        result: Dict[str, Any] = {
            "success": True,
            "imagen_path": path,
            "paciente_id": paciente_id,
            "puntuacion_total": 5.0,
            "puntuacion_normalizada": 0.5,
            "criterios": {
                "contorno_reloj": 1.0,
                "numeros_presentes": 1.0,
                "numeros_posicion": 1.0,
                "manecillas_presentes": 1.0,
                "manecillas_tiempo": 1.0,
            },
            "deteccion": {"confianza": 0.5, "bounding_box": {"x": 0, "y": 0, "width": 100, "height": 100}},
            "clasificacion_deterioro": "Pendiente_Analisis",
            "probabilidad_deterioro": 0.5,
            "caracteristicas_extraidas": {"analysis_type": "basic"},
            "observaciones_ia": "Análisis básico. Modelo no cargado",
            "errores_detectados": ["analisis_basico"],
            "modelo_version": "basic_1.0",
            "tiempo_procesamiento": 0.1,
        }

        if self.analyzer:
            try:
                analysis = self.analyzer.analyze_cdt_image(path, paciente_id=str(paciente_id))
                if analysis and analysis.get("success"):
                    result.update(analysis)
            except Exception:
                # Mantener resultado básico en caso de error
                pass

        # Persistir evaluación solo si paciente_id válido y existe
        try:
            pid: Optional[int] = None
            if paciente_id is not None:
                try:
                    pid = int(paciente_id)
                except Exception:
                    pid = None
            if pid and pid > 0:
                exists = False
                with self.db.get_cursor() as cur:
                    cur.execute("SELECT 1 FROM paciente WHERE id_paciente = %s", (pid,))
                    exists = cur.fetchone() is not None
                if exists:
                    eval_id = self.evals.create_evaluacion_cdt(id_paciente=pid, imagen_url=path)
                    if eval_id:
                        # Actualizar con resultados del análisis
                        self.evals.update_evaluacion(
                            eval_id,
                            {
                                "puntuacion_total": result.get("puntuacion_total", 0.0),
                                "clasificacion": result.get("clasificacion_deterioro"),
                                "confianza": result.get("deteccion", {}).get("confianza"),
                                "estado_procesamiento": "completada",
                                "tiempo_procesamiento": result.get("tiempo_procesamiento"),
                                "observaciones": result.get("observaciones_ia"),
                            },
                        )
                        result["evaluation_id"] = eval_id
                else:
                    result["warning"] = "Paciente no encontrado; análisis no persistido"
            else:
                result["warning"] = "paciente_id no provisto; análisis no persistido"
        except Exception:
            # Si falla la persistencia, devolver igualmente el resultado del análisis
            result["warning"] = "Error al persistir; análisis no almacenado"

        return result

    def _is_clock_like(self, image_path: str) -> bool:
        """Chequeo rápido: detecta presencia de un contorno circular dominante.
        Evita procesar imágenes no relacionadas (perros, paisajes, etc.).
        """
        img = cv2.imread(image_path)
        if img is None:
            return False
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 5)
        # HoughCircles parámetros conservadores; ajustables según muestras
        rows = gray.shape[0]
        circles = cv2.HoughCircles(
            gray,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=max(40, rows // 8),
            param1=100,
            param2=30,
            minRadius=max(20, rows // 12),
            maxRadius=rows // 2,
        )
        return circles is not None and len(circles[0]) > 0

    def get_patient_evaluations(self, paciente_id: str) -> List[Dict[str, Any]]:
        return self.evals.get_evaluaciones_by_paciente(int(paciente_id))

    def get_evaluation_by_id(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        return self.evals.get_evaluacion_by_id(int(evaluation_id))

    def delete_evaluation(self, evaluation_id: str) -> bool:
        data = self.evals.get_evaluacion_by_id(int(evaluation_id))
        if not data:
            return False
        # Borrar archivo si existe
        path = data.get("imagen_url")
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass
        return self.evals.delete_evaluacion(int(evaluation_id))

    def get_evaluation_statistics(self, paciente_id: Optional[str] = None) -> Dict[str, Any]:
        where = ["tipo_evaluacion = 'CDT'"]
        params: List[Any] = []
        if paciente_id:
            where.append("id_paciente = %s")
            params.append(int(paciente_id))
        query = f"""
            SELECT 
                COUNT(*) AS total,
                COALESCE(AVG(puntuacion_total), 0) AS avg_score,
                COALESCE(MIN(puntuacion_total), 0) AS min_score,
                COALESCE(MAX(puntuacion_total), 0) AS max_score
            FROM evaluaciones_cognitivas
            WHERE {' AND '.join(where)}
        """
        with self.db.get_cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone() or {}
        return {
            "total_evaluations": int(row.get("total", 0)),
            "average_score": float(row.get("avg_score", 0) or 0),
            "min_score": float(row.get("min_score", 0) or 0),
            "max_score": float(row.get("max_score", 0) or 0),
        }


# Instancia global
cdt_service_psycopg2 = CDTServicePsycopg2()
