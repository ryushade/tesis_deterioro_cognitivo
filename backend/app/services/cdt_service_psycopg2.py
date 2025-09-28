"""
Servicio CDT basado en psycopg2 (sin SQLAlchemy)
"""
import os
import uuid
from typing import Dict, Any, Optional, List

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

    def analyze_cdt_file(self, file: FileStorage, paciente_id: str) -> Dict[str, Any]:
        path = self.save_uploaded_file(file)
        if not path:
            return {"success": False, "error": "Archivo no permitido o no recibido"}

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

        # Persistir evaluación
        eval_id = self.evals.create_evaluacion_cdt(id_paciente=int(paciente_id), imagen_url=path)
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

        return result

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

