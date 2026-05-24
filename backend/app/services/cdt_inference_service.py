import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import cv2
import numpy as np
import os

# Ruta relativa al modelo final entrenado
RUTA_MODELO = os.path.join(os.path.dirname(__file__), 'modelo_cdt_resnet18_final.pth')
NUM_CLASSES = 6
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def procesar_imagen_cdt_inferencia(ruta_img: str):
    """Metodología original del paper adaptada a memoria (Grises -> CLAHE -> Blur -> Otsu -> Bounding Box -> Padding 224x224)"""
    img = cv2.imread(ruta_img, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
        
    # Ecualización Adaptativa (CLAHE) para corregir iluminación irregular y sombras
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img)
    
    # Suavizado gaussiano para eliminar ruido del papel y evitar trazos dentados
    img_blur = cv2.GaussianBlur(img_clahe, (5, 5), 0)
    
    # Binarización Otsu mejorada gracias al pre-procesamiento
    _, umbral = cv2.threshold(img_blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contornos, _ = cv2.findContours(umbral, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contornos:
        return cv2.resize(img, (224, 224)) 
        
    x_min, y_min = img.shape[1], img.shape[0]
    x_max, y_max = 0, 0
    
    for c in contornos:
        x, y, w, h = cv2.boundingRect(c)
        x_min, y_min = min(x_min, x), min(y_min, y)
        x_max, y_max = max(x_max, x + w), max(y_max, y + h)
        
    margen = 10
    x_min, y_min = max(0, x_min - margen), max(0, y_min - margen)
    x_max, y_max = min(img.shape[1], x_max + margen), min(img.shape[0], y_max + margen)
    
    img_recortada = umbral[y_min:y_max, x_min:x_max]
    h, w = img_recortada.shape
    lado_max = max(h, w)
    
    pad_h = (lado_max - h) // 2
    pad_w = (lado_max - w) // 2
    
    img_cuadrada = cv2.copyMakeBorder(img_recortada, pad_h, lado_max - h - pad_h, pad_w, lado_max - w - pad_w, cv2.BORDER_CONSTANT, value=0)
    return cv2.resize(img_cuadrada, (224, 224), interpolation=cv2.INTER_AREA)

def cargar_modelo():
    """Carga el cerebro de ResNet18 entrenado globalmente en memoria del servidor."""
    try:
        modelo = models.resnet18()
        modelo.fc = nn.Linear(modelo.fc.in_features, NUM_CLASSES)
        
        # 'map_location' es crítico por si el backend se corre en una laptop sin GPU usando weights_only para seguridad.
        estado = torch.load(RUTA_MODELO, map_location=device, weights_only=True)
        modelo.load_state_dict(estado)
        modelo.to(device)
        
        # Modo evaluación apaga características de entrenamiento como BatchNormalization.
        modelo.eval()
        print(f"[CDT IA] Modelo cargado correctamente desde: {RUTA_MODELO} | Hardware: {device}")
        return modelo
    except Exception as e:
        print(f"Error fatal cargando el modelo de relojes: {e}")
        return None

# Instancia global (El servidor FastAPI la compartirá)
MODELO_CDT = cargar_modelo()

transformacion_inferencia = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def recortar_alrededor_del_reloj(img_bgr):
    """
    Busca la esfera del reloj en la imagen completa utilizando la transformada de Hough o contornos.
    Si la detecta, recorta un recuadro centrado en el círculo con un margen de seguridad.
    """
    try:
        h_img, w_img = img_bgr.shape[:2]
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Ecualización adaptativa para contrastar el dibujo y el círculo
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        img_gray_eq = clahe.apply(img_gray)
        
        min_dim = min(h_img, w_img)
        min_r = int(min_dim * 0.12)
        max_r = int(min_dim * 0.48)
        
        img_blur_circles = cv2.GaussianBlur(img_gray_eq, (9, 9), 2)
        circulos = cv2.HoughCircles(
            img_blur_circles,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=min_dim * 0.25,
            param1=60,
            param2=35,       
            minRadius=min_r,
            maxRadius=max_r
        )
        
        hay_circulo = False
        cx, cy, r = 0, 0, 0
        
        if circulos is not None and len(circulos[0]) >= 1:
            cx, cy, r = circulos[0][0]
            hay_circulo = True
        else:
            # Fallback a contornos si Hough falla
            edges = cv2.Canny(img_gray_eq, 50, 150)
            contornos_fall, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            candidatos = []
            for c in contornos_fall:
                area = cv2.contourArea(c)
                perimetro = cv2.arcLength(c, True)
                if perimetro > 100:
                    x_b, y_b, w_b, h_b = cv2.boundingRect(c)
                    aspect_ratio = min(w_b, h_b) / max(w_b, h_b) if max(w_b, h_b) > 0 else 0
                    if w_b > min_dim * 0.15 and h_b > min_dim * 0.15:
                        if aspect_ratio > 0.50:
                            (ccx, ccy), r_enc = cv2.minEnclosingCircle(c)
                            dist_centro = np.sqrt((ccx - w_img/2)**2 + (ccy - h_img/2)**2)
                            score = area * aspect_ratio / (1.0 + 0.01 * dist_centro)
                            candidatos.append((ccx, ccy, r_enc, score))
            if candidatos:
                candidatos.sort(key=lambda item: item[3], reverse=True)
                best_c = candidatos[0]
                cx, cy, r = best_c[0], best_c[1], best_c[2]
                hay_circulo = True
                
        if hay_circulo:
            # Margen del 40% del radio
            margen = int(r * 0.40)
            x1 = max(0, int(cx - r - margen))
            y1 = max(0, int(cy - r - margen))
            x2 = min(w_img, int(cx + r + margen))
            y2 = min(h_img, int(cy + r + margen))
            
            if (x2 - x1) > 100 and (y2 - y1) > 100:
                print(f"[IA AUTOCROP] Círculo detectado en ({cx:.1f}, {cy:.1f}) R={r:.1f}. Recortando con margen.")
                return img_bgr[y1:y2, x1:x2], True
                
    except Exception as e:
        print(f"[IA AUTOCROP] Error al recortar por círculo: {e}")
        
    return img_bgr, False


def auto_recortar_hoja_blanca(img_bgr):
    """
    Detecta el contorno de la hoja de papel blanco y recorta el fondo oscuro.
    Prueba primero con Otsu sobre la imagen cruda (ideal para alto contraste con la mesa)
    y luego con ecualización CLAHE como fallback para penumbras.
    """
    try:
        h_img, w_img = img_bgr.shape[:2]
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Suavizado para reducir ruido en los bordes
        img_blur = cv2.GaussianBlur(img_gray, (5, 5), 0)
        area_total = h_img * w_img
        
        # --- ETAPA 1: Otsu Directo (Ideal para papel blanco sobre fondo oscuro) ---
        _, thresh_otsu = cv2.threshold(img_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contornos, _ = cv2.findContours(thresh_otsu, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contornos:
            c_max = max(contornos, key=cv2.contourArea)
            area_c = cv2.contourArea(c_max)
            
            # Queremos que la hoja sea representativa pero no cubra absolutamente toda la foto
            if area_total * 0.15 < area_c < area_total * 0.98:
                x, y, w, h = cv2.boundingRect(c_max)
                if w > w_img * 0.30 and h > h_img * 0.30:
                    margen = 20
                    x_new = max(0, x - margen)
                    y_new = max(0, y - margen)
                    w_new = min(w_img - x_new, w + 2 * margen)
                    h_new = min(h_img - y_new, h + 2 * margen)
                    print(f"[IA AUTOCROP] Otsu detectó papel de {w}x{h} (Original {w_img}x{h_img}). Recortando.")
                    return img_bgr[y_new:y_new+h_new, x_new:x_new+w_new], True

        # --- ETAPA 2: Fallback con CLAHE (Por si la mesa es clara o hay sombras fuertes) ---
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        img_eq = clahe.apply(img_gray)
        img_blur_eq = cv2.GaussianBlur(img_eq, (5, 5), 0)
        _, thresh_eq = cv2.threshold(img_blur_eq, 180, 255, cv2.THRESH_BINARY)
        
        contornos_eq, _ = cv2.findContours(thresh_eq, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contornos_eq:
            c_max = max(contornos_eq, key=cv2.contourArea)
            area_c = cv2.contourArea(c_max)
            
            if area_total * 0.15 < area_c < area_total * 0.98:
                x, y, w, h = cv2.boundingRect(c_max)
                if w > w_img * 0.30 and h > h_img * 0.30:
                    margen = 20
                    x_new = max(0, x - margen)
                    y_new = max(0, y - margen)
                    w_new = min(w_img - x_new, w + 2 * margen)
                    h_new = min(h_img - y_new, h + 2 * margen)
                    print(f"[IA AUTOCROP] CLAHE detectó papel de {w}x{h} (Original {w_img}x{h_img}). Recortando.")
                    return img_bgr[y_new:y_new+h_new, x_new:x_new+w_new], True
                    
    except Exception as e:
        print(f"[IA AUTOCROP] Error al auto-recortar: {e}")
        
    return img_bgr, False


def es_dibujo_sobre_papel(ruta_imagen: str) -> tuple:
    """
    Valida exhaustivamente que la imagen sea un dibujo fotografiado real.
    Aplica CLAHE y ecualización para ser tolerante a sombras del móvil e iluminación interior.
    """
    img_bgr = cv2.imread(ruta_imagen)
    if img_bgr is None:
        return False, "No se pudo leer la imagen."

    # 1. Intentamos recortar primero por círculo para no cortar los bordes del dibujo.
    # Si no se detecta, intentamos auto-recortar la hoja de papel completa como fallback.
    img_recortada, recortada = recortar_alrededor_del_reloj(img_bgr)
    if not recortada:
        print("[IA AUTOCROP] No se pudo recortar por círculo. Probando auto_recortar_hoja_blanca...")
        img_recortada, recortada = auto_recortar_hoja_blanca(img_bgr)
        
    if recortada:
        img_bgr = img_recortada
        try:
            cv2.imwrite(ruta_imagen, img_bgr)
            print(f"[IA AUTOCROP] Imagen recortada guardada: {ruta_imagen}")
        except Exception as write_err:
            print(f"[IA AUTOCROP] Error guardando recorte: {write_err}")

    h_img, w_img = img_bgr.shape[:2]
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 2. Ecualizamos con CLAHE para estandarizar el fondo a blanco y eliminar sombras del celular o mano
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_gray_eq = clahe.apply(img_gray)

    # --- METRICAS BASADAS EN IMAGEN NORMALIZADA (CLAHE) ---
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    saturacion_media = float(img_hsv[:, :, 1].mean())
    brillo_medio = float(img_gray.mean()) # Brillo físico original de la toma
    
    # En la imagen ecualizada, el papel es casi blanco puro (>210)
    pixeles_claros = float(np.sum(img_gray_eq > 210)) / img_gray_eq.size
    edges = cv2.Canny(img_gray_eq, 50, 150)
    densidad_bordes = float(np.sum(edges > 0)) / edges.size

    # --- METRICA ANTI-DIGITAL 1: Tonos Únicos ---
    tonos_unicos = len(np.unique(img_gray))

    # --- METRICA ANTI-DIGITAL 2: Micro-Textura (Ruido de Fondo) ---
    pixeles_claros_vals = img_gray[img_gray > 200]
    if len(pixeles_claros_vals) > 100:
        variabilidad_fondo = float(np.std(pixeles_claros_vals))
    else:
        variabilidad_fondo = 5.0

    # --- METRICA ANTI-DIGITAL 3: Planitud Local (Bloques Planos) ---
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

    # --- METRICA ANTI-OBJETO 1: Reflejos Especulares ---
    _, mask_brillo = cv2.threshold(img_gray, 254, 255, cv2.THRESH_BINARY)
    num_labels, _, stats, _ = cv2.connectedComponentsWithStats(mask_brillo)
    destellos = 0
    for i in range(1, num_labels):
        if 15 < stats[i, cv2.CC_STAT_AREA] < 800:
            destellos += 1

    # Detección de trazos gruesos (tinta)
    kernel_grosor = np.ones((9, 9), np.uint8)
    mask_tinta = (img_gray_eq < 100).astype(np.uint8) * 255
    tinta_gruesa = cv2.erode(mask_tinta, kernel_grosor, iterations=1)
    pct_tinta_gruesa = float(np.sum(tinta_gruesa > 0)) / img_gray_eq.size

    # Detección de total de tinta sobre la imagen ecualizada
    pct_tinta_total = float(np.sum(img_gray_eq < 130)) / img_gray_eq.size

    # Detección de líneas rectas paralelas (ej: hojas cuadriculadas/QR/texto)
    min_dim = min(h_img, w_img)
    lineas = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=45, minLineLength=min_dim*0.08, maxLineGap=5)
    num_lineas = len(lineas) if lineas is not None else 0

    # --- DETECCION DE CIRCULO (Hough Transform en imagen ecualizada) ---
    min_r = int(min_dim * 0.15)
    max_r = int(min_dim * 0.48)
    img_blur_circles = cv2.GaussianBlur(img_gray_eq, (9, 9), 2)
    circulos = cv2.HoughCircles(
        img_blur_circles,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=min_dim * 0.3,
        param1=60,
        param2=35,       
        minRadius=min_r,
        maxRadius=max_r
    )
    
    hay_circulo = False
    mejor_circulo = None
    circularidad = 0.0
    es_circularidad_perfecta = False
    
    if circulos is not None and len(circulos[0]) >= 1:
        hay_circulo = True
        mejor_circulo = circulos[0][0]
    else:
        # --- DETECCION DE CIRCULO FALLBACK (Basado en contornos circulares en la imagen de bordes) ---
        print("[IA CIRCLE] HoughCircles no detectó círculos. Iniciando fallback de contornos...")
        contornos_fall, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        candidatos = []
        for c in contornos_fall:
            area = cv2.contourArea(c)
            perimetro = cv2.arcLength(c, True)
            if perimetro > 100:
                x_b, y_b, w_b, h_b = cv2.boundingRect(c)
                aspect_ratio = min(w_b, h_b) / max(w_b, h_b) if max(w_b, h_b) > 0 else 0
                # Buscamos un contorno representativo, relativamente cuadrado y centrado
                if w_b > min_dim * 0.18 and h_b > min_dim * 0.18:
                    if aspect_ratio > 0.55:
                        (cx, cy), r_enc = cv2.minEnclosingCircle(c)
                        dist_centro = np.sqrt((cx - w_img/2)**2 + (cy - h_img/2)**2)
                        score = area * aspect_ratio / (1.0 + 0.01 * dist_centro)
                        candidatos.append((cx, cy, r_enc, c, score, aspect_ratio, area, perimetro))
        if candidatos:
            candidatos.sort(key=lambda item: item[4], reverse=True)
            best_c = candidatos[0]
            hay_circulo = True
            mejor_circulo = (best_c[0], best_c[1], best_c[2])
            print(f"[IA CIRCLE] Círculo detectado por fallback de contorno: Centro=({best_c[0]:.1f}, {best_c[1]:.1f}), Radio={best_c[2]:.1f}")
            
    if hay_circulo:
        # --- ANALISIS DE CIRCULARIDAD ---
        x, y, r = mejor_circulo
        roi_margin = 15
        y1, y2 = max(0, int(y-r-roi_margin)), min(h_img, int(y+r+roi_margin))
        x1, x2 = max(0, int(x-r-roi_margin)), min(w_img, int(x+r+roi_margin))
        roi = img_gray_eq[y1:y2, x1:x2]
        
        roi_edges = cv2.Canny(roi, 50, 150)
        cnts, _ = cv2.findContours(roi_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            c_max = max(cnts, key=cv2.contourArea)
            area = cv2.contourArea(c_max)
            perimetro = cv2.arcLength(c_max, True)
            if perimetro > 0:
                circularidad = (4 * np.pi * area) / (perimetro ** 2)
            
            x_b, y_b, w_b, h_b = cv2.boundingRect(c_max)
            aspect_ratio = min(w_b, h_b) / max(w_b, h_b) if max(w_b, h_b) > 0 else 0
            
            (cx_enc, cy_enc), r_enc = cv2.minEnclosingCircle(c_max)
            area_enc = np.pi * (r_enc ** 2)
            ratio_enclosing = area / area_enc if area_enc > 0 else 0
            
            if aspect_ratio > 0.96 and ratio_enclosing > 0.94 and area > 1000:
                es_circularidad_perfecta = True

    pct_tinta_dentro = 0.0
    if hay_circulo:
        x, y, r = mejor_circulo
        mask = np.zeros_like(img_gray_eq)
        cv2.circle(mask, (int(x), int(y)), int(r * 1.3), 255, -1)
        
        tinta_total = float(np.sum(img_gray_eq < 130))
        tinta_dentro = float(np.sum((img_gray_eq < 130) & (mask == 255)))
        pct_tinta_dentro = tinta_dentro / max(tinta_total, 1)

    print("\n" + "="*55)
    print(f"[IA VALIDATION] {os.path.basename(ruta_imagen)}")
    print(f"  > Dimensiones: {w_img}x{h_img}")
    print(f"  > Brillo medio (Físico): {brillo_medio:.1f}")
    print(f"  > Saturación media (HSV): {saturacion_media:.1f}")
    print(f"  > Bloques Planos: {pct_flat_blocks:.1f}%")
    print(f"  > Tonos Únicos: {tonos_unicos}")
    print(f"  > Variabilidad Fondo: {variabilidad_fondo:.2f}")
    print(f"  > Densidad bordes: {densidad_bordes*100:.2f}%")
    print(f"  > Lineas rectas: {num_lineas}")
    print(f"  > Tinta gruesa/relleno: {pct_tinta_gruesa*100:.2f}%")
    print(f"  > Tinta total (CLAHE): {pct_tinta_total*100:.2f}%")
    print(f"  > Reflejos detectados: {destellos}")
    print(f"  > Circulo detectado: {'SI' if hay_circulo else 'NO'} (Requerido)")
    if hay_circulo:
        print(f"  > Circularidad contorno: {circularidad:.3f}")
        print(f"  > Es circularidad perfecta (BBox): {es_circularidad_perfecta}")
        print(f"  > Tinta en circulo: {pct_tinta_dentro*100:.1f}%")
    print("="*55 + "\n")

    # --- REGLAS DE RECHAZO FLEXIBILIZADAS ---
    if min(h_img, w_img) < 120:
        return False, (
            "La resolución de la imagen es demasiado baja. Por favor, tome una fotografía real y nítida "
            "del dibujo hecho a mano con lápiz sobre papel físico (mínimo 120x120 píxeles)."
        )

    # REGLA ACTIVADA: Usando img_gray en lugar de img_gray_eq para evitar falsos positivos
    if pct_flat_blocks > 20.0:
        return False, (
            "La imagen parece ser un gráfico digital o una captura de pantalla. "
            "Por favor, tome una fotografía real del dibujo hecho a mano alzada por el paciente sobre papel físico."
        )

    if not hay_circulo:
        return False, (
            "No se pudo identificar la silueta circular del reloj. "
            "Asegúrese de que el dibujo tenga una forma circular clara y que la foto no esté muy inclinada."
        )

    # REGLA DESACTIVADA: No penalizar si el paciente dibujó un círculo muy regular o usó plantilla
    # if hay_circulo and (circularidad > 0.95 or es_circularidad_perfecta):
    #     return False, (
    #         "El contorno detectado es geométricamente perfecto..."
    #     )

    if saturacion_media > 95: # Aumentado de 80 a 95 para tolerar tonos de luz cálidos de hogares
        return False, (
            "La imagen contiene demasiados colores. El dibujo debe ser realizado en trazo simple "
            "de lápiz o lapicero azul o negro sobre papel blanco liso."
        )

    if brillo_medio < 40: # Reducido de 80 a 40 para ser altamente tolerante a penumbras
        return False, (
            "La fotografía está extremadamente oscura. "
            "Busque un espacio con mejor iluminación y evite que su teléfono cause sombra directa sobre el papel."
        )

    # REGLA REACTIVADA (Ajustada a 15%): Asegura que haya un fondo claro característico del papel
    if pixeles_claros < 0.15:
        return False, (
            "No se detecta suficiente fondo claro en la hoja de papel. "
            "Por favor, tome una foto nítida sobre papel blanco liso con buena iluminación."
        )

    # REGLA REACTIVADA (Ajustadas a 18% y 40%): Filtra imágenes con texturas densas (pelaje, paisajes) o fondos oscuros
    if densidad_bordes > 0.18 or pct_tinta_total > 0.40:
        return False, (
            "La imagen tiene demasiado ruido visual, texturas complejas o sombras muy oscuras. "
            "Asegúrese de subir un dibujo simple hecho a lápiz sobre papel limpio."
        )
        
    # REGLA DESACTIVADA: Las fotos de alta resolución a menudo detectan fragmentos rectos espurios
    # if num_lineas > 45:
    #     return False, (
    #         "Se detectaron demasiadas líneas rectas paralelas..."
    #     )

    # REGLA DESACTIVADA: Los pacientes con deterioro severo pueden dibujar solo la esfera (puntuación clínica 0 o 1). 
    # Debe ser calificado por el modelo y no rechazado por el scanner.
    # if hay_circulo and pct_tinta_dentro < 0.30:
    #     return False, (
    #         "No se detectaron trazos legibles dentro de la esfera del reloj..."
    #     )

    # REGLA DESACTIVADA: La compresión móvil y el grano pueden ser malinterpretados como destellos
    # if destellos > 8:
    #     return False, (
    #         "Se detectaron reflejos de luz intensos en la imagen..."
    #     )

    # REGLA DESACTIVADA: Sharpies o bolígrafos de gel no deben causar el rechazo de la evaluación
    # if pct_tinta_gruesa > 0.05:
    #     return False, (
    #         "La imagen contiene trazos antinaturalmente gruesos..."
    #     )

    return True, ""


def calcular_integrated_gradients(modelo, tensor_imagen, clase_destino, pasos=25):
    """
    Calcula los gradientes integrados (Integrated Gradients) para el tensor de entrada.
    Utiliza una línea base blanca (1.0 en todas partes tras normalización) que representa
    el papel en blanco del test del reloj.
    """
    # 1. Crear línea base blanca (valores de normalización de PyTorch para blanco)
    # Media: [0.485, 0.456, 0.406], Desviación: [0.229, 0.224, 0.225]
    baseline = torch.zeros_like(tensor_imagen)
    for c in range(3):
        mean = [0.485, 0.456, 0.406][c]
        std = [0.229, 0.224, 0.225][c]
        baseline[0, c, :, :] = (1.0 - mean) / std

    # Clonar entrada y asegurar gradiente
    input_img = tensor_imagen.clone().detach().requires_grad_(True)
    
    # 2. Generar las imágenes interpoladas lineales entre la línea base y la imagen real
    alphas = torch.linspace(0.0, 1.0, pasos).to(device)
    interpolated_images = []
    for alpha in alphas:
        interpolated = baseline + alpha * (input_img - baseline)
        interpolated_images.append(interpolated)
    
    # Concatenar todos los tensores para procesarlos en un batch
    batch_interpolated = torch.cat(interpolated_images, dim=0).to(device)
    batch_interpolated.requires_grad_()
    
    # 3. Pasar por el modelo
    outputs = modelo(batch_interpolated)
    score = outputs[:, clase_destino]
    
    # 4. Obtener gradientes usando torch.autograd.grad
    grads = torch.autograd.grad(outputs=score, inputs=batch_interpolated, grad_outputs=torch.ones_like(score))[0]
    
    # 5. Promediar gradientes a lo largo del eje del batch
    avg_grads = torch.mean(grads, dim=0, keepdim=True)
    
    # 6. Calcular Integrated Gradients = (input - baseline) * avg_grads
    delta = (input_img - baseline).detach().cpu()
    integrated_grad = delta * avg_grads.detach().cpu()
    
    # 7. Sumar a lo largo del canal de color y tomar valor absoluto
    attribution = torch.sum(torch.abs(integrated_grad[0]), dim=0)
    
    return attribution.numpy()


def guardar_mapa_explicacion(ruta_original, attribution_map, ruta_salida):
    """
    Normaliza la atribución, le aplica un mapa de calor y la fusiona
    con la imagen original recortada para guardarla como PNG de explicación.
    """
    try:
        # 1. Leer imagen original recortada
        img_orig = cv2.imread(ruta_original)
        if img_orig is None:
            return False
            
        h, w = img_orig.shape[:2]
        
        # 2. Redimensionar el attribution_map (224x224) al tamaño original
        attrib_resized = cv2.resize(attribution_map, (w, h), interpolation=cv2.INTER_CUBIC)
        
        # 3. Normalizar de 0 a 255
        attrib_min = attrib_resized.min()
        attrib_max = attrib_resized.max()
        if attrib_max - attrib_min > 0:
            attrib_norm = ((attrib_resized - attrib_min) / (attrib_max - attrib_min) * 255).astype(np.uint8)
        else:
            attrib_norm = np.zeros_like(attrib_resized, dtype=np.uint8)
            
        # 4. Aplicar mapa de calor
        heatmap = cv2.applyColorMap(attrib_norm, cv2.COLORMAP_JET)
        
        # 5. Fusionar con la imagen original (60% original, 40% mapa de calor)
        fusionada = cv2.addWeighted(img_orig, 0.60, heatmap, 0.40, 0)
        
        # 6. Guardar la imagen fusionada
        cv2.imwrite(ruta_salida, fusionada)
        return True
    except Exception as e:
        print(f"[XAI ERROR] Error al guardar mapa de explicabilidad: {e}")
        return False


def predecir_reloj(ruta_imagen_fisica: str) -> dict:
    """
    Funcion endpoint: Ingresa una ruta, retorna el puntaje y porcentaje de precision.
    """
    if MODELO_CDT is None:
        raise RuntimeError("La IA del Test del Reloj (CDT) no esta cargada.")

    # Pre-validacion: verificar que sea un dibujo sobre papel real
    es_valida, motivo_rechazo = es_dibujo_sobre_papel(ruta_imagen_fisica)
    if not es_valida:
        return {"puntaje": 0, "confianza": 0.0, "error": True, "motivo": motivo_rechazo}

    img_procesada = procesar_imagen_cdt_inferencia(ruta_imagen_fisica)
    if img_procesada is None:
        return {"puntaje": 0, "confianza": 0.0, "error": True, "motivo": "Fallo al pre-procesar la imagen"}

    # 4. Chequeo de Contenido Mínimo: ¿Hay algo dibujado dentro del círculo?
    # Si detectamos un círculo pero el interior está vacío, forzamos puntaje 0.
    h, w = img_procesada.shape
    # En img_procesada (binarizada), los trazos son blancos (255) y el fondo es negro (0)
    # Buscamos el círculo en la imagen original para ser precisos
    img_original = cv2.imread(ruta_imagen_fisica, cv2.IMREAD_GRAYSCALE)
    img_blur = cv2.GaussianBlur(img_original, (9, 9), 2)
    min_dim = min(img_original.shape[:2])
    circulos = cv2.HoughCircles(img_blur, cv2.HOUGH_GRADIENT, dp=1.2, minDist=min_dim*0.3, 
                                param1=60, param2=35, minRadius=int(min_dim*0.15), maxRadius=int(min_dim*0.48))
    
    if circulos is not None:
        x_c, y_c, r = circulos[0][0]
        # Crear máscara del interior
        mask_interior = np.zeros_like(img_original)
        cv2.circle(mask_interior, (int(x_c), int(y_c)), int(r * 0.95), 255, -1)
        
        # Umbral equilibrado (135) para ignorar ruido de fondo pero captar trazos reales
        trazos_coords = np.where((img_original < 135) & (mask_interior == 255))
        total_trazos = len(trazos_coords[0])
        
        # 1. ANALISIS DE SIMETRIA AVANZADO (Hemisferios y Vacíos)
        y_coords, x_coords = trazos_coords
        count_q1 = np.sum((x_coords > x_c) & (y_coords < y_c)) # NE
        count_q2 = np.sum((x_coords < x_c) & (y_coords < y_c)) # NW
        count_q3 = np.sum((x_coords < x_c) & (y_coords > y_c)) # SW
        count_q4 = np.sum((x_coords > x_c) & (y_coords > y_c)) # SE
        
        counts = np.array([count_q1, count_q2, count_q3, count_q4])
        total_ink = max(np.sum(counts), 1)
        
        # Proporciones por cuadrante
        pcts = counts / total_ink
        
        # Dominancia Hemisférica (Izquierda vs Derecha, Arriba vs Abajo)
        derecha_pct = (count_q1 + count_q4) / total_ink
        izquierda_pct = (count_q2 + count_q3) / total_ink
        arriba_pct = (count_q1 + count_q2) / total_ink
        abajo_pct = (count_q3 + count_q4) / total_ink
        
        # Criterios de Asimetría Severa (Clínicos)
        # Endurecemos para puntajes bajos: si un cuadrante tiene < 5% de tinta, es vacío.
        asimetria_severa = (max(derecha_pct, izquierda_pct, arriba_pct, abajo_pct) > 0.80) or \
                           (np.min(pcts) < 0.05)
        
        # 2. ANALISIS DE CENTRO (Manecillas)
        mask_centro = np.zeros_like(img_original)
        cv2.circle(mask_centro, (int(x_c), int(y_c)), int(r * 0.25), 255, -1)
        trazos_centro = np.sum((img_original < 135) & (mask_centro == 255))
        # Para ser manecilla, el trazo central debe ser significativo
        hay_trazos_centro = trazos_centro > (total_ink * 0.05) 
        
        # 4b. Chequeo de densidad total (Reloj vacío)
        densidad_interna = total_ink / np.sum(mask_interior == 255)
        
        if densidad_interna < 0.001:
            return {
                "puntaje": 0, "confianza": 99.0, "error": False,
                "observaciones_ia": "El reloj tiene contenido insuficiente (solo esfera o trazos mínimos)."
            }
        
        # 4c. Determinar penalizaciones
        penalizar_por_asimetria = asimetria_severa
        penalizar_por_manecillas = not hay_trazos_centro

    # El modelo PyTorch necesita los 3 canales RGB aunque la imagen sea B&N
    img_color = cv2.cvtColor(img_procesada, cv2.COLOR_GRAY2RGB)
    img_pil = Image.fromarray(img_color)

    tensor_img = transformacion_inferencia(img_pil).unsqueeze(0).to(device)

    with torch.no_grad():
        salidas = MODELO_CDT(tensor_img)
        probabilidades = torch.nn.functional.softmax(salidas[0], dim=0)
        confianza_absoluta, indice_vencedor = torch.max(probabilidades, 0)
        puntaje_final = int(indice_vencedor.item())

    # Aplicar correcciones clínicas finales (Deshabilitadas para no dañar la precisión del modelo ResNet18)
    obs_extra = ""

    # --- EXPLICABILIDAD (Integrated Gradients) ---
    ruta_explicacion = os.path.splitext(ruta_imagen_fisica)[0] + "_explicacion.png"
    url_explicacion = None
    try:
        attributions = calcular_integrated_gradients(MODELO_CDT, tensor_img, puntaje_final, pasos=12)
        exito_xai = guardar_mapa_explicacion(ruta_imagen_fisica, attributions, ruta_explicacion)
        if exito_xai:
            partes = ruta_imagen_fisica.replace('\\', '/').split('/uploads/')
            if len(partes) > 1:
                url_explicacion = "uploads/" + partes[1]
                url_explicacion = os.path.splitext(url_explicacion)[0] + "_explicacion.png"
            print(f"[XAI] Mapa de calor guardado y configurado: {url_explicacion}")
    except Exception as xai_err:
        print(f"[XAI ERROR] Error calculando Integrated Gradients: {xai_err}")

    return {
        "puntaje": puntaje_final,
        "confianza": float(round(confianza_absoluta.item() * 100, 2)),
        "error": False,
        "observaciones_ia": obs_extra if obs_extra else None,
        "url_explicacion": url_explicacion
    }

if __name__ == '__main__':
    print(f"Iniciando Módulo de Inferencia (Hardware detectado: {device})")
    print("=== TEST INDIVIDUAL (Imágenes de Testeo) ===")
    
    import glob
    import random
    
    # IMPORTANTE: Asegúrate de que esta ruta apunte a tu carpeta local de pruebas
    ruta_test_local = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\services\cdt_modelo\test"
    
    # Elegir 3 clases al azar para probar
    for _ in range(3):
        clase_al_azar = str(random.randint(0, 5))
        patron_busqueda = os.path.join(ruta_test_local, clase_al_azar, "*.tif")
        imagenes_disponibles = glob.glob(patron_busqueda)
        
        if imagenes_disponibles:
            img_prueba = random.choice(imagenes_disponibles)
            print(f"\nRevisando imagen real de Clase [{clase_al_azar}] -> Archivo: {os.path.basename(img_prueba)}")
            
            # ¡Ejecutamos la Inferencia!
            resultado = predecir_reloj(img_prueba)
            
            if resultado["error"]:
                print(f"  [X] Rechazado/Error: {resultado.get('motivo', 'Fallo en lectura')}")
                continue
                
            puntaje_ia = resultado["puntaje"]
            certeza = resultado["confianza"]
            
            print(f"  [IA] Prediccion de IA: Puntaje {puntaje_ia} (Certeza: {certeza}%)")
            if str(puntaje_ia) == clase_al_azar:
                print("  [OK] ACERTO!")
            else:
                print("  [!] SE EQUIVOCO")