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
    """Metodología original del paper adaptada a memoria (Grises -> Otsu -> Bounding Box -> Padding 224x224)"""
    img = cv2.imread(ruta_img, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
        
    _, umbral = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
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
    """Carga el cerebro de ResNet18 entrenado en Colab globalmente en memoria del servidor."""
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
    Valida que la imagen sea un dibujo del Test del Reloj.
    Estrategia:
      1. Hough Circle Transform: un reloj SIEMPRE tiene un circulo prominente.
      2. Fondo claro: papel blanco domina la imagen.
      3. Baja saturacion: trazos en lapiz/boligrafo son monocromaticos.
      4. Densidad de bordes no excesiva: descarta texturas complejas.
    """
    img_bgr = cv2.imread(ruta_imagen)
    if img_bgr is None:
        return False, "No se pudo leer la imagen."

    h_img, w_img = img_bgr.shape[:2]
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # --- METRICAS ---
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    saturacion_media = float(img_hsv[:, :, 1].mean())
    brillo_medio = float(img_gray.mean())
    pixeles_claros = float(np.sum(img_gray > 200)) / img_gray.size
    edges = cv2.Canny(img_gray, 50, 150)
    densidad_bordes = float(np.sum(edges > 0)) / edges.size

    # Deteccion de regiones rellenas (Trazos muy gruesos o parches negros)
    # Un dibujo de reloj a lapiz/lapicero solo tiene lineas finas.
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
    img_blur = cv2.GaussianBlur(img_gray, (9, 9), 2)
    circulos = cv2.HoughCircles(
        img_blur,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=min_dim * 0.3,
        param1=60,
        param2=35,       # Umbral acumulador más relajado
        minRadius=min_r,
        maxRadius=max_r
    )
    hay_circulo = False
    mejor_circulo = None
    if circulos is not None and len(circulos[0]) >= 1:
        hay_circulo = True
        mejor_circulo = circulos[0][0]

    pct_tinta_dentro = 0.0
    if hay_circulo:
        x, y, r = mejor_circulo
        # Crear máscara del círculo con un margen de 30% para incluir números dibujados un poco por fuera
        mask = np.zeros_like(img_gray)
        cv2.circle(mask, (int(x), int(y)), int(r * 1.3), 255, -1)
        
        tinta_total = float(np.sum(img_gray < 150))
        tinta_dentro = float(np.sum((img_gray < 150) & (mask == 255)))
        
        pct_tinta_dentro = tinta_dentro / max(tinta_total, 1)

    print("\n" + "="*55)
    print(f"[IA VALIDATION] {os.path.basename(ruta_imagen)}")
    print(f"  > Densidad bordes: {densidad_bordes*100:.2f}% (Max: 12%)")
    print(f"  > Lineas rectas (Texto/QR): {num_lineas} (Max: 45)")
    print(f"  > Tinta gruesa/relleno: {pct_tinta_gruesa*100:.2f}% (Max: 0.5%)")
    print(f"  > Tinta total (Líneas vs Foto): {pct_tinta_total*100:.2f}% (Max: 15%)")
    print(f"  > Circulo detectado: {'SI' if hay_circulo else 'NO'} (Requerido)")
    if hay_circulo:
        print(f"  > Tinta en circulo: {pct_tinta_dentro*100:.1f}% (Min: 40%)")
    print("="*55 + "\n")

    # Validaciones en orden de importancia
    if not hay_circulo:
        return False, (
            "No se detectó un círculo en la imagen. "
            "La prueba del reloj requiere que el paciente dibuje un círculo claramente visible sobre papel blanco. "
            "Por favor fotografíe únicamente el dibujo del reloj."
        )

    if saturacion_media > 30:
        return False, (
            "La imagen tiene colores. El dibujo del reloj debe ser "
            "trazos en lápiz o bolígrafo sobre papel blanco."
        )

    if brillo_medio < 130:
        return False, (
            "La imagen es muy oscura. Asegúrese de tener buena iluminación "
            "y colocar el papel sobre una superficie clara."
        )

    if pixeles_claros < 0.45:
        return False, (
            "No se detecta suficiente fondo blanco. "
            "Fotografíe el dibujo con la hoja bien visible en el encuadre."
        )

    if densidad_bordes > 0.12:
        return False, (
            "La imagen tiene demasiada textura, sombras o detalles no propios de un dibujo simple. "
            "Asegúrese de subir solo el dibujo sobre una hoja blanca limpia, sin fotografiar animales, personas u otros objetos."
        )

    if pct_tinta_total > 0.15:
        return False, (
            "La imagen contiene demasiados elementos oscuros, sombras o colores sólidos. "
            "Los dibujos de relojes clínicos constan de trazos de lápiz finos, no de fotografías de objetos tridimensionales ni animales."
        )
        
    if num_lineas > 45:
        return False, (
            "La imagen tiene demasiadas líneas rectas o patrones geométricos. "
            "Parece una captura de pantalla, documento o carnet. Por favor suba únicamente una fotografía del dibujo."
        )

    if hay_circulo and pct_tinta_dentro < 0.40:
        return False, (
            "El dibujo no parece un reloj. La mayor parte de los trazos están fuera o muy lejos del círculo principal. "
            "Asegúrese de que sea únicamente la prueba del reloj."
        )

    if pct_tinta_gruesa > 0.005: # 0.5%
        return False, (
            "La imagen contiene regiones completamente pintadas de negro o trazos antinaturalmente gruesos. "
            "La prueba del reloj debe ser dibujado únicamente con líneas de bolígrafo o lápiz, sin rellenos."
        )

    return True, ""


def predecir_reloj(ruta_imagen_fisica: str) -> dict:
    """
    Funcion endpoint: Ingresa una ruta, retorna el puntaje y porcentaje de precision.
    """
    if MODELO_CDT is None:
        raise RuntimeError("La IA del Test del Reloj (CDT) no esta cargada.")

    # Pre-validacion: verificar que sea un dibujo sobre papel
    es_valida, motivo_rechazo = es_dibujo_sobre_papel(ruta_imagen_fisica)
    if not es_valida:
        return {"puntaje": 0, "confianza": 0.0, "error": True, "motivo": motivo_rechazo}

    img_procesada = procesar_imagen_cdt_inferencia(ruta_imagen_fisica)
    if img_procesada is None:
        return {"puntaje": 0, "confianza": 0.0, "error": True}

    # El modelo PyTorch necesita los 3 canales RGB aunque la imagen sea B&N
    img_color = cv2.cvtColor(img_procesada, cv2.COLOR_GRAY2RGB)
    img_pil = Image.fromarray(img_color)

    tensor_img = transformacion_inferencia(img_pil).unsqueeze(0).to(device)

    with torch.no_grad():
        salidas = MODELO_CDT(tensor_img)
        probabilidades = torch.nn.functional.softmax(salidas[0], dim=0)
        confianza_absoluta, indice_vencedor = torch.max(probabilidades, 0)

    return {
        "puntaje": int(indice_vencedor.item()),
        "confianza": float(round(confianza_absoluta.item() * 100, 2)),
        "error": False
    }

if __name__ == '__main__':
    print(f"Iniciando Módulo de Inferencia (Hardware detectado: {device})")
    print("=== TEST INDIVIDUAL (Imágenes de Testeo) ===")
    
    import glob
    import random
    
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
                print("  ❌ Error de lectura de imagen.")
                continue
                
            puntaje_ia = resultado["puntaje"]
            certeza = resultado["confianza"]
            
            print(f"  🧠 Predicción de IA: Puntaje {puntaje_ia} (Certeza: {certeza}%)")
            if str(puntaje_ia) == clase_al_azar:
                print("  ✅ ¡ACERTÓ!")
            else:
                print("  ⚠️ SE EQUIVOCÓ")
