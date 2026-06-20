import sys
import os

# Añadir directorio raíz del backend al path para poder importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services import cdt_inference_service

def test_validation():
    # Ruta del archivo cargado más reciente
    img_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", "pacientes", "relojes", "asignacion_164_a168525d.png"))
    if not os.path.exists(img_path):
        print(f"Error: no existe el archivo {img_path}")
        return
        
    print(f"Evaluando imagen: {img_path}")
    es_valida, motivo = cdt_inference_service.es_dibujo_sobre_papel(img_path)
    print("\n--- RESULTADO DE LA VALIDACION ---")
    print("¿Es válida?:", es_valida)
    print("Motivo de rechazo:", motivo if not es_valida else "NINGUNO")

if __name__ == "__main__":
    test_validation()
