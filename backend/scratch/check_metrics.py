import cv2
import numpy as np
import os
import glob

ruta_dir = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes"
webp_files = glob.glob(os.path.join(ruta_dir, "*.webp"))
png_files = glob.glob(os.path.join(ruta_dir, "*.png"))
jpg_files = glob.glob(os.path.join(ruta_dir, "*.jpg"))
all_files = webp_files + png_files + jpg_files

print(f"Encontrados {len(all_files)} archivos de imagen en total.")

for img_path in all_files[:15]: # Check first 15
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        continue
        
    h_img, w_img = img_bgr.shape[:2]
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_gray_eq = clahe.apply(img_gray)
    
    # HSV
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    saturacion_media = float(img_hsv[:, :, 1].mean())
    brillo_medio = float(img_gray.mean())
    
    # Pixeles claros
    pixeles_claros = float(np.sum(img_gray_eq > 210)) / img_gray_eq.size
    
    # Edges
    edges = cv2.Canny(img_gray_eq, 50, 150)
    densidad_bordes = float(np.sum(edges > 0)) / edges.size
    
    # Tinta total
    pct_tinta_total = float(np.sum(img_gray_eq < 130)) / img_gray_eq.size
    
    print(f"File: {os.path.basename(img_path):35s} | Sat: {saturacion_media:5.1f} | Bright: {brillo_medio:5.1f} | LightPx: {pixeles_claros*100:5.1f}% | EdgeDens: {densidad_bordes*100:5.1f}% | InkTot: {pct_tinta_total*100:5.1f}%")
