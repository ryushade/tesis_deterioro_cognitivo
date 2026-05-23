import cv2
import numpy as np
import os

ruta_imagen = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes\asignacion_139_f9bfa3cc.webp"

img_bgr = cv2.imread(ruta_imagen)
if img_bgr is None:
    print("No se pudo cargar la imagen del mono.")
    exit(1)

h_img, w_img = img_bgr.shape[:2]
img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

# Ecualizamos con CLAHE
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
img_gray_eq = clahe.apply(img_gray)

# Saturation and Brightness
img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
saturacion_media = float(img_hsv[:, :, 1].mean())
brillo_medio = float(img_gray.mean())

# Pixeles claros (fondo)
pixeles_claros = float(np.sum(img_gray_eq > 210)) / img_gray_eq.size

# Edges
edges = cv2.Canny(img_gray_eq, 50, 150)
densidad_bordes = float(np.sum(edges > 0)) / edges.size

# Tonos únicos
tonos_unicos = len(np.unique(img_gray))

# Variabilidad fondo
pixeles_claros_vals = img_gray[img_gray > 200]
if len(pixeles_claros_vals) > 100:
    variabilidad_fondo = float(np.std(pixeles_claros_vals))
else:
    variabilidad_fondo = 5.0

# Bloques planos
flat_blocks = 0
total_bg_blocks = 0
block_size = 8
for r in range(0, h_img - block_size, block_size):
    for c in range(0, w_img - block_size, block_size):
        block = img_gray[r:r+block_size, c:c+block_size]
        if block.mean() > 220:
            total_bg_blocks += 1
            if block.std() < 0.1:
                flat_blocks += 1
pct_flat_blocks = (flat_blocks / total_bg_blocks * 100) if total_bg_blocks > 0 else 0.0

# Tinta total
pct_tinta_total = float(np.sum(img_gray_eq < 130)) / img_gray_eq.size

print("=== METRICAS DEL MONO ===")
print(f"Dimensiones: {w_img}x{h_img}")
print(f"Saturacion media: {saturacion_media:.2f}")
print(f"Brillo medio: {brillo_medio:.2f}")
print(f"Pixeles claros (CLAHE > 210): {pixeles_claros*100:.2f}%")
print(f"Densidad bordes: {densidad_bordes*100:.2f}%")
print(f"Tonos unicos: {tonos_unicos}")
print(f"Variabilidad fondo: {variabilidad_fondo:.2f}")
print(f"Bloques planos: {pct_flat_blocks:.2f}%")
print(f"Tinta total: {pct_tinta_total*100:.2f}%")
