import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import os
import time
from tqdm import tqdm

# 1. Configuración Hardware y Rutas
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Dispositivo de entrenamiento: {device}")

# Ajustamos la ruta base específicamente para cómo extrae Colab los archivos ZIP comprimidos desde Windows
ruta_base = '/content/cdt_modelo_descomprimido/cdt_modelo'
ruta_train = os.path.join(ruta_base, "train")
ruta_test = os.path.join(ruta_base, "test")

# Hiperparámetros
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
NUM_CLASSES = 6 # Puntajes del Test del Reloj (0, 1, 2, 3, 4, 5)

# 2. Transformaciones (Preprocesamiento en Tiempo Real para la Red)
transform_train = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    # Como las imágenes ya están procesadas a 224x224 (bounding box + padding),
    # no hacemos RandomCrop ni Resize duro, para no cortar información neurológica vital.
])

transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 3. Carga Automática de Carpetas Estructuradas
# ImageFolder toma mágicamente el "nombre de la subcarpeta" (0, 1, 2...) como etiqueta
dataset_train = datasets.ImageFolder(root=ruta_train, transform=transform_train)
dataset_test = datasets.ImageFolder(root=ruta_test, transform=transform_test)

train_loader = torch.utils.data.DataLoader(dataset_train, batch_size=BATCH_SIZE, shuffle=True)
test_loader = torch.utils.data.DataLoader(dataset_test, batch_size=BATCH_SIZE, shuffle=False)

print(f"Total imágenes Train: {len(dataset_train)}")
print(f"Total imágenes Test: {len(dataset_test)}")
print(f"Clases detectadas automáticamente: {dataset_train.classes}")

# 4. Red Neuronal: Transfer Learning (Usamos ResNet18)
modelo = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

# Congelamos algunas capas si no quieres destruír todo el conocimiento de la ResNet (opcional)
# for param in modelo.parameters():
#     param.requires_grad = False

# Cambiamos la última capa para que entregue 6 probabilidades (nuestros 6 puntajes)
num_ftrs = modelo.fc.in_features
modelo.fc = nn.Linear(num_ftrs, NUM_CLASSES)
modelo = modelo.to(device)

# 5. Función de Error y Optimizador
criterio = nn.CrossEntropyLoss()
optimizador = optim.Adam(modelo.parameters(), lr=LEARNING_RATE)

# 6. Bucle de Entrenamiento (Training Loop)
if __name__ == '__main__':
    tiempo_inicio = time.time()
    
    print("\n" + "="*50)
    print("¡INICIANDO RUTINA DE ENTRENAMIENTO!")
    print("="*50)
    
    for epoch in range(NUM_EPOCHS):
        modelo.train()
        perdida_acumulada = 0.0
        correctos_train = 0
        
        # --- FASE DE ENTRENAMIENTO ---
        barra_progreso = tqdm(train_loader, desc=f"Entrenando Época {epoch+1}/{NUM_EPOCHS}")
        for imagenes, etiquetas in barra_progreso:
            imagenes, etiquetas = imagenes.to(device), etiquetas.to(device)
            
            # Forward pass
            salidas = modelo(imagenes)
            perdida = criterio(salidas, etiquetas)
            
            # Backward pass y optimización
            optimizador.zero_grad()
            perdida.backward()
            optimizador.step()
            
            perdida_acumulada += perdida.item() * imagenes.size(0)
            _, predicciones = torch.max(salidas, 1)
            correctos_train += torch.sum(predicciones == etiquetas.data)
            
            # Actualizar barra visual
            barra_progreso.set_postfix({'loss': f"{perdida.item():.4f}"})
            
        acc_train = correctos_train.double() / len(dataset_train)
        
        # --- FASE DE EVALUACIÓN (TEST) ---
        modelo.eval()
        correctos_test = 0
        with torch.no_grad():
            for imagenes, etiquetas in test_loader:
                imagenes, etiquetas = imagenes.to(device), etiquetas.to(device)
                salidas = modelo(imagenes)
                _, predicciones = torch.max(salidas, 1)
                correctos_test += torch.sum(predicciones == etiquetas.data)
                
        acc_test = correctos_test.double() / len(dataset_test)
        
        print(f"Época [{epoch+1}/{NUM_EPOCHS}] -> "
              f"Perdida Train: {perdida_acumulada/len(dataset_train):.4f} | "
              f"Precisión Train: {acc_train:.4f} | "
              f"Precisión Test: {acc_test:.4f}")

    tiempo_total = time.time() - tiempo_inicio
    print("\n" + "="*50)
    print(f"¡ENTRENAMIENTO COMPLETADO en {tiempo_total//60:.0f} mins y {tiempo_total%60:.0f} segs!")
    
    # 7. Guardar el Cerebro del Modelo Resultante
    ruta_pesos = os.path.join(ruta_base, "modelo_resnet18_cdt.pth")
    torch.save(modelo.state_dict(), ruta_pesos)
    print(f"Pesos de Inteligencia Artificial exportados a: {ruta_pesos}")
    print("="*50)