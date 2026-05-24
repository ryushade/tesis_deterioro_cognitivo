import sys
import os
import torch
import cv2
from PIL import Image

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app", "services"))

from app.services.cdt_inference_service import MODELO_CDT, calcular_integrated_gradients, guardar_mapa_explicacion, transformacion_inferencia, procesar_imagen_cdt_inferencia

ruta_imagen = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes\asignacion_45_42a5b290.webp"
ruta_explicacion = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes\asignacion_45_42a5b290_test_explicacion.png"

print("Cargando y procesando imagen para la red...")
img_procesada = procesar_imagen_cdt_inferencia(ruta_imagen)
if img_procesada is None:
    print("Fallo al procesar la imagen.")
    exit(1)

# Preparar tensor
img_color = cv2.cvtColor(img_procesada, cv2.COLOR_GRAY2RGB)
img_pil = Image.fromarray(img_color)
tensor_img = transformacion_inferencia(img_pil).unsqueeze(0)

# Ejecutar inferencia
print("Ejecutando inferencia...")
MODELO_CDT.eval()
with torch.no_grad():
    salidas = MODELO_CDT(tensor_img)
    probabilidades = torch.nn.functional.softmax(salidas[0], dim=0)
    confianza_absoluta, indice_vencedor = torch.max(probabilidades, 0)
    puntaje_final = int(indice_vencedor.item())

print(f"Predicción: Clase {puntaje_final} (Confianza: {confianza_absoluta.item()*100:.2f}%)")

# Ejecutar Integrated Gradients
print("Calculando Integrated Gradients...")
try:
    attributions = calcular_integrated_gradients(MODELO_CDT, tensor_img, puntaje_final, pasos=25)
    print("Integrated Gradients calculado con éxito.")
    
    # Guardar explicación
    exito = guardar_mapa_explicacion(ruta_imagen, attributions, ruta_explicacion)
    if exito and os.path.exists(ruta_explicacion):
        print(f"[OK] El archivo de explicación fue creado con éxito en: {ruta_explicacion}")
        # Limpieza
        os.remove(ruta_explicacion)
        print("Limpieza completada.")
    else:
        print("[!] Fallo al guardar la explicación.")
except Exception as e:
    print(f"[!] Error: {e}")
