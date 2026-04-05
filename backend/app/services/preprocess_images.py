import cv2
import numpy as np
import pandas as pd
import os
from tqdm import tqdm  # Para ver la barra de progreso

# 1. Configuración de rutas
ruta_base = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\controllers\cdt_dataset"
ruta_csv_maestro = os.path.join(ruta_base, "dataset_cdt_maestro.csv")

# Carpeta donde se guardarán las imágenes ya procesadas y limpias
carpeta_salida_img = os.path.join(ruta_base, "imagenes_procesadas_224")
if not os.path.exists(carpeta_salida_img):
    os.makedirs(carpeta_salida_img)

print("Cargando Dataset Maestro...")
df = pd.read_csv(ruta_csv_maestro)

# 2. Función Central de Metodología de Preprocesamiento
def procesar_imagen_cdt(ruta_img):
    """
    Aplica la metodología del paper: Grises -> Binarización -> Bounding Box -> Padding -> Resize 224
    """
    # 2.1 Leer en escala de grises
    img = cv2.imread(ruta_img, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
    
    # 2.2 Binarización de Otsu (Fondo negro, trazo blanco)
    # THRESH_BINARY_INV hace que el papel blanco sea 0 (negro) y la tinta oscura sea 255 (blanco)
    _, umbral = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # 2.3 Encontrar contornos para detectar dónde está el dibujo
    contornos, _ = cv2.findContours(umbral, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contornos:
        # Si la hoja estaba totalmente en blanco (error de escaneo)
        return cv2.resize(img, (224, 224)) 

    # 2.4 Calcular el "Bounding Box" gigante que encierre TODOS los trazos
    x_min, y_min = img.shape[1], img.shape[0]
    x_max, y_max = 0, 0
    
    for c in contornos:
        x, y, w, h = cv2.boundingRect(c)
        x_min, y_min = min(x_min, x), min(y_min, y)
        x_max, y_max = max(x_max, x + w), max(y_max, y + h)
        
    # Añadir un pequeño margen (padding) de seguridad de 10 píxeles para no cortar bordes
    margen = 10
    x_min = max(0, x_min - margen)
    y_min = max(0, y_min - margen)
    x_max = min(img.shape[1], x_max + margen)
    y_max = min(img.shape[0], y_max + margen)

    # 2.5 Recortar la imagen aislando solo el dibujo
    img_recortada = umbral[y_min:y_max, x_min:x_max]
    
    # 2.6 Hacer la imagen CUADRADA agregando bordes negros (Padding)
    # Esto evita deformar la figura circular del reloj al hacer el resize
    h, w = img_recortada.shape
    lado_max = max(h, w)
    
    pad_h = (lado_max - h) // 2
    pad_w = (lado_max - w) // 2
    
    # Creamos un lienzo negro cuadrado y pegamos el reloj en el centro
    img_cuadrada = cv2.copyMakeBorder(img_recortada, pad_h, lado_max - h - pad_h, pad_w, lado_max - w - pad_w, cv2.BORDER_CONSTANT, value=0)
    
    # 2.7 Redimensionamiento final para la Red Neuronal
    img_final = cv2.resize(img_cuadrada, (224, 224), interpolation=cv2.INTER_AREA)
    
    return img_final

# 3. Procesamiento Masivo
nuevas_rutas = []
indices_validos = []

print(f"Procesando {len(df)} imágenes. Esto tomará varios minutos...\n")

# Usamos tqdm para tener una barra de progreso visual en la terminal
for index, row in tqdm(df.iterrows(), total=df.shape[0], desc="Limpiando imágenes"):
    ruta_original = row['ruta_imagen']
    spid = row['spid']
    ronda = row['ronda']
    
    # Generar un nombre único (ej: 100012_R1.tif) por si un paciente se repite en varias rondas
    nombre_nuevo = f"{int(spid)}_R{ronda}_clean.tif"
    ruta_nueva = os.path.join(carpeta_salida_img, nombre_nuevo)
    
    # Procesar la imagen
    img_limpia = procesar_imagen_cdt(ruta_original)
    
    if img_limpia is not None:
        # Guardar la imagen procesada en el disco duro
        cv2.imwrite(ruta_nueva, img_limpia)
        # Reemplazamos las barras invertidas para estándar web/python
        nuevas_rutas.append(ruta_nueva.replace('\\', '/')) 
        indices_validos.append(index)
    else:
        # Si la imagen original estaba corrupta y no se pudo leer
        print(f"\nError leyendo: {ruta_original}")

# 4. Actualizar el Dataset Maestro
# Nos quedamos solo con los registros de imágenes que sobrevivieron al procesado
df_final = df.loc[indices_validos].copy()
df_final['ruta_imagen'] = nuevas_rutas # Actualizamos a la ruta de la imagen LIMPIA

ruta_csv_entrenamiento = os.path.join(ruta_base, "dataset_cdt_entrenamiento_224.csv")
df_final.to_csv(ruta_csv_entrenamiento, index=False)

print("\n" + "="*50)
print("¡PREPROCESAMIENTO VISUAL COMPLETADO!")
print(f"Imágenes limpiadas y redimensionadas guardadas en: {carpeta_salida_img}")
print(f"Nuevo CSV listo para PyTorch: {ruta_csv_entrenamiento}")
print("="*50)
