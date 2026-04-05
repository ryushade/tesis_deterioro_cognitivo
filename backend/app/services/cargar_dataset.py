import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
import os

class TestRelojDataset(Dataset):
    def __init__(self, ruta_csv, transform=None):
        """
        Constructor: Lee el CSV y guarda las transformaciones que aplicaremos.
        """
        self.dataframe = pd.read_csv(ruta_csv)
        self.transform = transform

    def __len__(self):
        """Devuelve cuántas imágenes hay en total en este dataset."""
        return len(self.dataframe)

    def __getitem__(self, idx):
        """
        La magia ocurre aquí: PyTorch llamará a esta función miles de veces por segundo
        durante el entrenamiento para pedir una imagen y su puntaje.
        """
        # 1. Obtener la ruta de la imagen y el puntaje de la fila actual
        ruta_img = self.dataframe.iloc[idx]['ruta_imagen']
        puntaje = int(self.dataframe.iloc[idx]['puntaje_reloj'])

        # 2. Cargar la imagen física
        # OJO: La convertimos a 'RGB' (3 canales) aunque sea blanco y negro. 
        # Esto es OBLIGATORIO porque modelos como ViT o ResNet exigen 3 canales de color.
        imagen = Image.open(ruta_img).convert('RGB')

        # 3. Aplicar transformaciones matemáticas (convertir a Tensor)
        if self.transform:
            imagen = self.transform(imagen)

        # 4. Convertir la etiqueta (0 a 5) a formato Tensor de PyTorch
        etiqueta = torch.tensor(puntaje, dtype=torch.long)

        return imagen, etiqueta

# ==========================================
# PRUEBA RÁPIDA PARA VER SI FUNCIONA
# ==========================================
if __name__ == "__main__":
    # Las transformaciones obligatorias para usar Redes Neuronales
    transformaciones = transforms.Compose([
        transforms.ToTensor(), # Convierte los píxeles (0-255) a matrices matemáticas (0.0 - 1.0)
        # Normalización estándar usada por los modelos pre-entrenados (como ViT)
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) 
    ])

    ruta_base = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\controllers\cdt_dataset"
    ruta_train = os.path.join(ruta_base, "dataset_cdt_entrenamiento_224.csv")

    # Instanciamos nuestra clase
    dataset_entrenamiento = TestRelojDataset(ruta_csv=ruta_train, transform=transformaciones)

    # DataLoader agrupa las imágenes en "paquetes" (batches) de 32 para acelerar el entrenamiento
    dataloader_train = DataLoader(dataset_entrenamiento, batch_size=32, shuffle=True)

    print(f"Dataset cargado exitosamente. Total de imágenes de entrenamiento: {len(dataset_entrenamiento)}")
    
    # Extraemos el primer paquete de 32 imágenes para confirmar
    imagenes, etiquetas = next(iter(dataloader_train))
    print(f"Formato del lote de imágenes (Batch, Canales, Alto, Ancho): {imagenes.shape}")
    print(f"Primeras 32 etiquetas: {etiquetas}")