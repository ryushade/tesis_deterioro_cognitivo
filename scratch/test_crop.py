import cv2
import numpy as np
import glob
import os

def detectar_y_recortar_papel(img_bgr):
    h_img, w_img = img_bgr.shape[:2]
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 1. Aplicamos un desenfoque para suavizar texturas
    img_blur = cv2.GaussianBlur(img_gray, (5, 5), 0)
    
    # 2. Binarización con umbral dinámico o estático
    # Dado que el papel suele ser claro, podemos usar un umbral de 120 (el papel físico suele tener brillo > 120)
    _, thresh = cv2.threshold(img_blur, 110, 255, cv2.THRESH_BINARY)
    
    # 3. Encontrar contornos
    contornos, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contornos:
        return img_bgr, False
        
    # Obtener el contorno más grande por área
    c_max = max(contornos, key=cv2.contourArea)
    area_c = cv2.contourArea(c_max)
    area_total = h_img * w_img
    
    # El contorno debe representar al menos el 15% de la imagen
    if area_c > area_total * 0.12:
        x, y, w, h = cv2.boundingRect(c_max)
        
        # Añadir un pequeño margen de 10 píxeles
        margen = 15
        x_new = max(0, x - margen)
        y_new = max(0, y - margen)
        w_new = min(w_img - x_new, w + 2 * margen)
        h_new = min(h_img - y_new, h + 2 * margen)
        
        img_recortada = img_bgr[y_new:y_new+h_new, x_new:x_new+w_new]
        return img_recortada, True
        
    return img_bgr, False

# Probar con algunas imágenes en backend/uploads/pacientes/relojes
relojes_path = glob.glob("backend/uploads/pacientes/relojes/*")
print(f"Encontrados {len(relojes_path)} archivos en uploads/pacientes/relojes")

for r_path in relojes_path[:10]:
    img = cv2.imread(r_path)
    if img is None:
        continue
    h, w = img.shape[:2]
    img_cropped, detectado = detectar_y_recortar_papel(img)
    hc, wc = img_cropped.shape[:2]
    print(f"Archivo: {os.path.basename(r_path)} | Original: {w}x{h} | Recortado: {wc}x{hc} | Detectado: {detectado}")
