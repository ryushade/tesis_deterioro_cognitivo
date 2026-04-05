import pandas as pd
import os
import shutil
from tqdm import tqdm
from sklearn.model_selection import GroupShuffleSplit

# 1. Configurar las rutas
ruta_dataset = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\controllers\cdt_dataset"
ruta_csv_maestro = os.path.join(ruta_dataset, "dataset_cdt_entrenamiento_224.csv")
ruta_destino_modelo = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\services\cdt_modelo"

print("Cargando el dataset estructurado...")
if not os.path.exists(ruta_csv_maestro):
    print(f"ERROR: No se encuentra el CSV maestro en {ruta_csv_maestro}")
    print("Por favor asegúrate de haber ejecutado preprocess_images.py primero.")
    exit(1)

df = pd.read_csv(ruta_csv_maestro)

# 2. Partición Inteligente (Train/Test) evitando Data Leakage
# El 80% de los PACIENTES (spid) irá a Train, y el 20% a Test.
# Esto asegura que las rondas futuras del mismo paciente no contaminen las pruebas.
gss = GroupShuffleSplit(n_splits=1, train_size=0.8, random_state=42)

# Generamos los índices para Train y Test agrupando por 'spid'
train_idx, test_idx = next(gss.split(df, groups=df['spid']))

df_train = df.iloc[train_idx].copy()
df_test = df.iloc[test_idx].copy()

print(f"\n--- Resumen del Split ---")
print(f"Total imágenes disponibles: {len(df)}")
print(f"-> Set de Entrenamiento (Train): {len(df_train)} imágenes")
print(f"-> Set de Prueba (Test): {len(df_test)} imágenes")

splits = {
    "train": df_train,
    "test": df_test
}

print("\nIniciando la distribución física de imágenes...")

for nombre_carpeta, df_split in splits.items():
    print(f"\nDistribuyendo las imágenes para '{nombre_carpeta.upper()}'...")
    
    # Recorremos el CSV particionado fila por fila
    for index, row in tqdm(df_split.iterrows(), total=df_split.shape[0]):
        ruta_origen_img = row['ruta_imagen']
        puntaje = str(int(row['puntaje_reloj'])) 
        
        # 3. Construir la ruta de la subcarpeta (ej: .../cdt_modelo/train/4/)
        carpeta_clase = os.path.join(ruta_destino_modelo, nombre_carpeta, puntaje)
        
        # Crear la carpeta de clase si no existe
        if not os.path.exists(carpeta_clase):
            os.makedirs(carpeta_clase)
            
        # 4. Construir la ruta final y COPIAR la imagen
        nombre_archivo = os.path.basename(ruta_origen_img)
        ruta_destino_img = os.path.join(carpeta_clase, nombre_archivo)
        
        # Opcional: si la imagen de procesadas_224 no se encuentra por algún motivo, la saltamos
        if os.path.exists(ruta_origen_img):
            shutil.copy2(ruta_origen_img, ruta_destino_img)
        else:
            print(f"Error: La imagen no existe {ruta_origen_img}")

# Opcional: Guardamos los CSVs partidos para que sepas qué fue a donde
df_train.to_csv(os.path.join(ruta_destino_modelo, "train_dataset.csv"), index=False)
df_test.to_csv(os.path.join(ruta_destino_modelo, "test_dataset.csv"), index=False)

print("\n" + "="*50)
print("¡DISTRIBUCIÓN COMPLETADA EXITOSAMENTE!")
print(f"Carpetas estructuradas en: {ruta_destino_modelo}")
print("Puedes comenzar a entrenar el modelo.")
print("="*50)