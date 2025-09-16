# Sistema de Análisis CDT (Clock Drawing Test) con IA

Este sistema utiliza visión por computadora e inteligencia artificial para analizar y puntuar automáticamente el Clock Drawing Test (CDT), una herramienta clínica importante para evaluar el deterioro cognitivo.

## Características Principales

- **Análisis automático de imágenes CDT** usando visión por computadora
- **Puntuación según criterios clínicos estándar** (contorno, números, manecillas, etc.)
- **Clasificación del nivel de deterioro cognitivo** (Normal, Leve, Moderado, Severo)
- **API REST completa** para integración con aplicaciones web
- **Modelo de deep learning entrenable** con transfer learning
- **Base de datos** para almacenar resultados y seguimiento

## Criterios de Evaluación CDT

El sistema evalúa 5 criterios principales (0-2 puntos cada uno):

1. **Contorno del reloj** - Presencia y calidad del círculo principal
2. **Números presentes** - Presencia de números 1-12
3. **Posición de números** - Ubicación correcta alrededor del reloj
4. **Manecillas presentes** - Presencia de ambas manecillas
5. **Tiempo correcto** - Precisión en la representación del tiempo

**Puntuación total**: 0-10 puntos

## Instalación

### 1. Instalar dependencias

```bash
# Activar entorno virtual
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Instalar dependencias de ML/CV
pip install -r requirements.txt
```

### 2. Configurar base de datos

```bash
# Inicializar base de datos
python init_db.py

# Ejecutar migraciones si es necesario
flask db upgrade
```

## Uso del Sistema

### 1. Iniciar el backend

```bash
cd backend
python run.py
```

### 2. Endpoints de la API

#### Analizar imagen CDT
```http
POST /api/cdt/analyze
Content-Type: multipart/form-data

file: [archivo_imagen.jpg]
paciente_id: [uuid_del_paciente]
```

#### Obtener evaluaciones de un paciente
```http
GET /api/cdt/patient/{patient_id}/evaluations
```

#### Obtener detalles de una evaluación
```http
GET /api/cdt/evaluation/{evaluation_id}
```

#### Obtener imagen de una evaluación
```http
GET /api/cdt/evaluation/{evaluation_id}/image
```

#### Estadísticas generales
```http
GET /api/cdt/statistics?paciente_id={optional}
```

#### Información del sistema
```http
GET /api/cdt/info
```

### 3. Entrenamiento del Modelo

#### Opción A: Desde la API
```http
POST /api/cdt/train-model
Content-Type: application/json

{
  "dataset_path": "ruta/al/dataset",
  "epochs": 50,
  "batch_size": 16,
  "use_transfer_learning": true
}
```

#### Opción B: Script independiente
```bash
# Entrenar modelo con configuración por defecto
python train_cdt_model.py

# Entrenar con parámetros personalizados
python train_cdt_model.py --dataset ../dataset --epochs 100 --batch-size 32

# Probar modelo entrenado con una imagen
python train_cdt_model.py test
```

#### Estado del modelo
```http
GET /api/cdt/model/status
```

#### Cargar modelo entrenado
```http
POST /api/cdt/model/load
Content-Type: application/json

{
  "model_path": "ruta/al/modelo.h5"
}
```

## Estructura del Dataset

Para entrenar el modelo, organiza tu dataset así:

```
dataset/
├── train/
│   ├── imagen1.jpg
│   ├── imagen2.jpg
│   └── ...
├── valid/
│   ├── imagen1.jpg
│   ├── imagen2.jpg
│   └── ...
└── test/
    ├── imagen1.jpg
    ├── imagen2.jpg
    └── ...
```

### Etiquetado Automático

El sistema incluye etiquetado automático basado en el nombre del archivo:
- **R1, R2, R3**: Normal
- **R4, R5, R6**: Deterioro Leve
- **R7, R8, R9**: Deterioro Moderado
- **R10, R11, R12**: Deterioro Severo

## Ejemplo de Uso en Python

```python
import requests

# Analizar una imagen CDT
with open('reloj.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/cdt/analyze',
        files={'file': f},
        data={'paciente_id': 'uuid-del-paciente'}
    )

result = response.json()
if result['success']:
    print(f"Puntuación total: {result['puntuacion_total']}/10")
    print(f"Clasificación: {result['clasificacion_deterioro']}")
    print(f"Observaciones: {result['observaciones_ia']}")
```

## Respuesta de Análisis

```json
{
  "success": true,
  "evaluation_id": "uuid-de-evaluacion",
  "puntuacion_total": 7.5,
  "puntuacion_normalizada": 0.75,
  "criterios": {
    "contorno_reloj": 2.0,
    "numeros_presentes": 1.5,
    "numeros_posicion": 1.0,
    "manecillas_presentes": 2.0,
    "manecillas_tiempo": 1.0
  },
  "clasificacion_deterioro": "Deterioro_Leve",
  "probabilidad_deterioro": 0.8,
  "observaciones_ia": "El reloj presenta características generalmente dentro de los parámetros normales.",
  "tiempo_procesamiento": 0.45
}
```

## Tecnologías Utilizadas

- **TensorFlow/Keras** - Deep learning y clasificación
- **OpenCV** - Procesamiento de imágenes
- **scikit-image** - Análisis de características
- **Flask** - API REST
- **SQLAlchemy** - ORM y base de datos
- **NumPy/Pandas** - Procesamiento de datos

## Consideraciones Clínicas

Este sistema está diseñado como herramienta de apoyo diagnóstico. Los resultados deben ser siempre interpretados por profesionales médicos calificados. El CDT es una herramienta de screening que debe complementarse con otras evaluaciones neuropsicológicas.

## Precisión del Modelo

- **Análisis de visión por computadora**: Detección de formas geométricas, texto y líneas
- **Evaluación automática**: Basada en criterios clínicos establecidos
- **Clasificación de deterioro**: Usando modelos de deep learning entrenados

## Limitaciones

- Requiere imágenes de buena calidad y resolución
- El modelo necesita entrenamiento con datos etiquetados por expertos
- Los resultados son aproximaciones y requieren validación clínica
- El rendimiento depende de la calidad del dataset de entrenamiento

## Futuras Mejoras

- [ ] Detección más precisa de números y manecillas
- [ ] Análisis de características más sofisticadas (simetría, proporción)
- [ ] Integración con sistemas de historia clínica
- [ ] Análisis longitudinal y seguimiento de progresión
- [ ] Interfaz web para visualización de resultados
