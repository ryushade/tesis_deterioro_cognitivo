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

def es_dibujo_sobre_papel(ruta_imagen: str) -> tuple:
    """
    Valida exhaustivamente que la imagen sea un dibujo fotografiado real.
    """
    img_bgr = cv2.imread(ruta_imagen)
    if img_bgr is None:
        return False, "No se pudo leer la imagen."

    h_img, w_img = img_bgr.shape[:2]
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # --- METRICAS BASICAS ---
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    saturacion_media = float(img_hsv[:, :, 1].mean())
    brillo_medio = float(img_gray.mean())
    pixeles_claros = float(np.sum(img_gray > 200)) / img_gray.size
    edges = cv2.Canny(img_gray, 50, 150)
    densidad_bordes = float(np.sum(edges > 0)) / edges.size

    # --- METRICA ANTI-DIGITAL 1: Tonos Únicos ---
    tonos_unicos = len(np.unique(img_gray))

    # --- METRICA ANTI-DIGITAL 2: Micro-Textura (Ruido de Fondo) ---
    pixeles_claros_vals = img_gray[img_gray > 220]
    if len(pixeles_claros_vals) > 100:
        variabilidad_fondo = float(np.std(pixeles_claros_vals))
    else:
        variabilidad_fondo = 5.0

    # --- METRICA ANTI-OBJETO 1: Reflejos Especulares (Vidrio/Cristal) ---
    # Un reloj real tiene tapa de cristal; el papel es mate.
    # Buscamos cúmulos de píxeles casi blancos puros (>254) que indican reflejos de luz.
    # Aumentamos el umbral (254) y el área mínima (15) para evitar fallos por papel muy blanco.
    _, mask_brillo = cv2.threshold(img_gray, 254, 255, cv2.THRESH_BINARY)
    num_labels, _, stats, _ = cv2.connectedComponentsWithStats(mask_brillo)
    # Contamos "destellos" de tamaño pequeño/mediano (glare)
    destellos = 0
    for i in range(1, num_labels):
        if 15 < stats[i, cv2.CC_STAT_AREA] < 800:
            destellos += 1

    # Deteccion de regiones rellenas (Trazos muy gruesos o parches negros)
    kernel_grosor = np.ones((9, 9), np.uint8)
    mask_tinta = (img_gray < 100).astype(np.uint8) * 255
    tinta_gruesa = cv2.erode(mask_tinta, kernel_grosor, iterations=1)
    pct_tinta_gruesa = float(np.sum(tinta_gruesa > 0)) / img_gray.size

    # Detección de "excesiva tinta" indicativa de fotografías vs dibujos lineales
    pct_tinta_total = float(np.sum(img_gray < 150)) / img_gray.size

    # Deteccion de lineas rectas (para descartar carnets, QR, pantallazos con mucho texto)
    min_dim = min(h_img, w_img)
    lineas = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=40, minLineLength=min_dim*0.08, maxLineGap=5)
    num_lineas = len(lineas) if lineas is not None else 0

    # --- DETECCION DE CIRCULO (Hough Transform) ---
    min_r = int(min_dim * 0.15)
    max_r = int(min_dim * 0.48)
    img_blur_circles = cv2.GaussianBlur(img_gray, (9, 9), 2)
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
    if circulos is not None and len(circulos[0]) >= 1:
        hay_circulo = True
        mejor_circulo = circulos[0][0]
        
        # --- METRICA ANTI-OBJETO 2: Análisis de Circularidad ---
        # Los relojes reales son círculos matemáticamente perfectos.
        # Los dibujos a mano tienen imperfecciones locales apreciables.
        x, y, r = mejor_circulo
        roi_margin = 10
        y1, y2 = max(0, int(y-r-roi_margin)), min(h_img, int(y+r+roi_margin))
        x1, x2 = max(0, int(x-r-roi_margin)), min(w_img, int(x+r+roi_margin))
        roi = img_gray[y1:y2, x1:x2]
        
        # Detectar el contorno real que generó el círculo
        roi_edges = cv2.Canny(roi, 50, 150)
        cnts, _ = cv2.findContours(roi_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            c_max = max(cnts, key=cv2.contourArea)
            area = cv2.contourArea(c_max)
            perimetro = cv2.arcLength(c_max, True)
            if perimetro > 0:
                circularidad = (4 * np.pi * area) / (perimetro ** 2)

    pct_tinta_dentro = 0.0
    if hay_circulo:
        x, y, r = mejor_circulo
        # Máscara con margen del 30% para incluir números
        mask = np.zeros_like(img_gray)
        cv2.circle(mask, (int(x), int(y)), int(r * 1.3), 255, -1)
        
        # Umbral equilibrado (135) para ignorar ruido de fondo pero captar trazos reales
        tinta_total = float(np.sum(img_gray < 135))
        tinta_dentro = float(np.sum((img_gray < 135) & (mask == 255)))
        
        pct_tinta_dentro = tinta_dentro / max(tinta_total, 1)

    print("\n" + "="*55)
    print(f"[IA VALIDATION] {os.path.basename(ruta_imagen)}")
    print(f"  > Tonos Únicos: {tonos_unicos} (Min: 120)")
    print(f"  > Variabilidad Fondo: {variabilidad_fondo:.2f} (Min: 2.0)")
    print(f"  > Densidad bordes: {densidad_bordes*100:.2f}% (Max: 12%)")
    print(f"  > Lineas rectas (Texto/QR): {num_lineas} (Max: 45)")
    print(f"  > Tinta gruesa/relleno: {pct_tinta_gruesa*100:.2f}% (Max: 0.5%)")
    print(f"  > Tinta total (Líneas vs Foto): {pct_tinta_total*100:.2f}% (Max: 15%)")
    print(f"  > Reflejos detectados: {destellos} (Max: 8)")
    print(f"  > Circulo detectado: {'SI' if hay_circulo else 'NO'} (Requerido)")
    if hay_circulo:
        print(f"  > Circularidad: {circularidad:.3f} (Max Humano: 0.94)")
        print(f"  > Tinta en circulo: {pct_tinta_dentro*100:.1f}% (Min: 40%)")
    print("="*55 + "\n")

    # --- REGLAS DE RECHAZO ---
    # Rechazo independiente por textura (Variabilidad < 1.5 es digital/escaneado sin textura real)
    # Rechazo independiente por colores (Tonos < 120 es digital con degradados limitados)
    if variabilidad_fondo < 1.5 or tonos_unicos < 120:
        return False, (
            "Se detectó una imagen digital o procesada. Una fotografía real presenta "
            "variaciones de micro-textura (ruido de sensor) que no se encuentran aquí. "
            "Por favor, suba una fotografía clara del dibujo hecho a mano (evite usar apps de escaneo)."
        )

    if not hay_circulo:
        return False, (
            "No se detectó un círculo en la imagen. "
            "La prueba del reloj requiere que el paciente dibuje un círculo claramente visible sobre papel blanco."
        )

    if saturacion_media > 30:
        return False, (
            "La imagen tiene colores. El dibujo del reloj debe ser "
            "trazos en lápiz o bolígrafo sobre papel blanco."
        )

    if brillo_medio < 130:
        return False, "La imagen es muy oscura. Asegúrese de tener buena iluminación."

    if pixeles_claros < 0.45:
        return False, "No se detecta suficiente fondo blanco. Fotografíe la hoja bien visible."

    if densidad_bordes > 0.12 or pct_tinta_total > 0.15:
        return False, "La imagen tiene demasiada textura, sombras o elementos que no son trazos simples."
        
    if num_lineas > 45:
        return False, "La imagen tiene demasiadas líneas rectas. Por favor, suba la foto del reloj dibujado por el paciente."

    if hay_circulo and pct_tinta_dentro < 0.40:
        return False, "El dibujo no parece un reloj. La mayor parte de los trazos están muy lejos del círculo."

    if destellos > 8:
        return False, (
            "Se detectaron demasiados reflejos especulares. "
            "Asegúrese de tomar la foto sin flash y sobre una superficie mate."
        )

    if hay_circulo and circularidad > 0.94:
        return False, (
            "El círculo detectado es excesivamente perfecto (Industrial). "
            "Recuerde que el reloj debe ser dibujado íntegramente a mano alzada."
        )

    if pct_tinta_gruesa > 0.005: 
        return False, "La imagen contiene regiones completamente pintadas o trazos antinaturalmente gruesos."

    return True, ""


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

    # Aplicar correcciones clínicas finales (Equilibrio entre IA y Sensores)
    obs_extra = ""
    # Si el modelo dio 5 (Perfecto), confiamos en su visión global.
    # Si dio de 1 a 4, permitimos que los sensores clínicos intervengan para corregir sesgos.
    if 1 <= puntaje_final <= 4:
        # Para puntajes bajos o limítrofes, detectamos asimetría significativa (82%)
        asimetria_critica = (max(derecha_pct, izquierda_pct, arriba_pct, abajo_pct) > 0.82) or \
                            (np.min(pcts) < 0.015)

        if asimetria_critica:
            # CLINICO: Bajamos un nivel si es 4, o más si la asimetría es muy grave.
            penalizacion = 2 if puntaje_final <= 3 else 1
            puntaje_final = max(1, puntaje_final - penalizacion)
            obs_extra = " Se detectó una asimetría clínica compatible con errores de planificación visuoespacial."
        elif penalizar_por_manecillas:
            # Si no hay manecillas palpables
            puntaje_final = max(1, puntaje_final - 1)
            obs_extra = " No se detectaron manecillas claras en el centro del reloj."

    return {
        "puntaje": puntaje_final,
        "confianza": float(round(confianza_absoluta.item() * 100, 2)),
        "error": False,
        "observaciones_ia": obs_extra if obs_extra else None
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
                print(f"  ❌ Rechazado/Error: {resultado.get('motivo', 'Fallo en lectura')}")
                continue
                
            puntaje_ia = resultado["puntaje"]
            certeza = resultado["confianza"]
            
            print(f"  🧠 Predicción de IA: Puntaje {puntaje_ia} (Certeza: {certeza}%)")
            if str(puntaje_ia) == clase_al_azar:
                print("  ✅ ¡ACERTÓ!")
            else:
                print("  ⚠️ SE EQUIVOCÓ")