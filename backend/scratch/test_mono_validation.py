import sys
import os

# Add parent and services directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app", "services"))

from app.services.cdt_inference_service import es_dibujo_sobre_papel

ruta_imagen = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes\asignacion_139_f9bfa3cc.webp"

es_valida, motivo = es_dibujo_sobre_papel(ruta_imagen)
print(f"Es dibujo sobre papel: {es_valida}")
print(f"Motivo rechazo: {motivo}")
