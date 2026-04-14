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

def predecir_reloj(ruta_imagen_fisica: str) -> dict:
    """
    Función endpoint: Ingresa una ruta, retorna el puntaje y porcentaje de precisión.
    """
    if MODELO_CDT is None:
        raise RuntimeError("La IA del Test del Reloj (CDT) no está cargada.")
        
    img_procesada = procesar_imagen_cdt_inferencia(ruta_imagen_fisica)
    if img_procesada is None:
        return {"puntaje": 0, "confianza": 0.0, "error": True}
        
    # El modelo PyTorch necesita los 3 canales de color simulados (RGB) a pesar de ser blanco y negro.
    img_color = cv2.cvtColor(img_procesada, cv2.COLOR_GRAY2RGB)
    img_pil = Image.fromarray(img_color)
    
    tensor_img = transformacion_inferencia(img_pil).unsqueeze(0).to(device)
    
    with torch.no_grad():
        salidas = MODELO_CDT(tensor_img)
        # Extraemos la curva de probabilidad para cada uno de los 6 puntajes simulando 0 a 100%
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
