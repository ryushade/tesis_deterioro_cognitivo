import sys
import os

# Agregar el directorio app al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import cv2
import numpy as np
import torch
from app.services.cdt_inference_service import procesar_imagen_cdt_inferencia, MODELO_CDT, transformacion_inferencia, device

# Ruta de la imagen
ruta_img = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes\asignacion_142_c20fad47.png"

# Ejecutar validación y análisis
img_original = cv2.imread(ruta_img, cv2.IMREAD_GRAYSCALE)
h_img, w_img = img_original.shape[:2]
min_dim = min(img_original.shape[:2])

# Detección de círculos
img_blur = cv2.GaussianBlur(img_original, (9, 9), 2)
circulos = cv2.HoughCircles(img_blur, cv2.HOUGH_GRADIENT, dp=1.2, minDist=min_dim*0.3, 
                            param1=60, param2=35, minRadius=int(min_dim*0.15), maxRadius=int(min_dim*0.48))

if circulos is not None:
    x_c, y_c, r = circulos[0][0]
    print(f"Círculo detectado: Centro=({x_c:.2f}, {y_c:.2f}), Radio={r:.2f}")
    
    # Crear máscara del interior
    mask_interior = np.zeros_like(img_original)
    cv2.circle(mask_interior, (int(x_c), int(y_c)), int(r * 0.95), 255, -1)
    
    # Trazos coords
    trazos_coords = np.where((img_original < 135) & (mask_interior == 255))
    total_trazos = len(trazos_coords[0])
    print(f"Total trazos dentro: {total_trazos}")
    
    y_coords, x_coords = trazos_coords
    count_q1 = np.sum((x_coords > x_c) & (y_coords < y_c)) # NE
    count_q2 = np.sum((x_coords < x_c) & (y_coords < y_c)) # NW
    count_q3 = np.sum((x_coords < x_c) & (y_coords > y_c)) # SW
    count_q4 = np.sum((x_coords > x_c) & (y_coords > y_c)) # SE
    
    counts = np.array([count_q1, count_q2, count_q3, count_q4])
    total_ink = max(np.sum(counts), 1)
    pcts = counts / total_ink
    print(f"Counts: Q1(NE)={count_q1}, Q2(NW)={count_q2}, Q3(SW)={count_q3}, Q4(SE)={count_q4}")
    print(f"Proporciones pcts: Q1={pcts[0]:.4f}, Q2={pcts[1]:.4f}, Q3={pcts[2]:.4f}, Q4={pcts[3]:.4f}")
    
    derecha_pct = (count_q1 + count_q4) / total_ink
    izquierda_pct = (count_q2 + count_q3) / total_ink
    arriba_pct = (count_q1 + count_q2) / total_ink
    abajo_pct = (count_q3 + count_q4) / total_ink
    
    print(f"Hemisferios: Derecha={derecha_pct:.4f}, Izquierda={izquierda_pct:.4f}, Arriba={arriba_pct:.4f}, Abajo={abajo_pct:.4f}")
    
    asimetria_severa = (max(derecha_pct, izquierda_pct, arriba_pct, abajo_pct) > 0.80) or (np.min(pcts) < 0.05)
    print(f"¿Asimetría severa?: {asimetria_severa} (max_hemisferio > 0.80: {max(derecha_pct, izquierda_pct, arriba_pct, abajo_pct) > 0.80}, min_pct < 0.05: {np.min(pcts) < 0.05})")

    # Manecillas
    mask_centro = np.zeros_like(img_original)
    cv2.circle(mask_centro, (int(x_c), int(y_c)), int(r * 0.25), 255, -1)
    trazos_centro = np.sum((img_original < 135) & (mask_centro == 255))
    hay_trazos_centro = trazos_centro > (total_ink * 0.05)
    print(f"Trazos centro: {trazos_centro} ({trazos_centro/total_ink*100:.2f}%) -> ¿Hay trazos centro?: {hay_trazos_centro}")
else:
    print("No se detectó círculo con Hough en la imagen original para análisis de cuadrantes.")

# Inferencia del modelo
img_procesada = procesar_imagen_cdt_inferencia(ruta_img)
if img_procesada is not None:
    img_color = cv2.cvtColor(img_procesada, cv2.COLOR_GRAY2RGB)
    from PIL import Image
    img_pil = Image.fromarray(img_color)
    tensor_img = transformacion_inferencia(img_pil).unsqueeze(0).to(device)
    
    with torch.no_grad():
        salidas = MODELO_CDT(tensor_img)
        probabilidades = torch.nn.functional.softmax(salidas[0], dim=0)
        confianza, pred = torch.max(probabilidades, 0)
        print(f"Salidas crudas logits: {salidas[0].cpu().numpy()}")
        print(f"Probabilidades: {probabilidades.cpu().numpy()}")
        print(f"Predicción IA: Clase {pred.item()} ({confianza.item()*100:.2f}%)")
