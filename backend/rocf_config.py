# Configuración del Clasificador ROCF`nimport os

# Rutas
DATASET_PATH = "rocfd528_binary_images"
LABELS_PATH = "rocf_labeling_template.csv"
MODEL_PATH = "best_rocf_model_real.h5"
LOGS_PATH = "logs"

# ParÃ¡metros del modelo
IMAGE_SIZE = 384
NUM_CLASSES = 3
BATCH_SIZE = 32
EPOCHS = 50

# Umbrales de confianza
CONFIDENCE_HIGH = 0.8
CONFIDENCE_MEDIUM = 0.6
CONFIDENCE_LOW = 0.4

# Clases
CLASS_NAMES = {
    0: "Cognitivamente Sano",
    1: "Deterioro Cognitivo Leve", 
    2: "Deterioro Cognitivo Grave"
}



