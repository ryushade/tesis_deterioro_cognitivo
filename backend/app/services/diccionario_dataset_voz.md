# Diccionario de Datos: Dataset de Voz Clínico

Este documento describe la estructura y el contenido de los archivos extraídos del `voz_dataset`. Este dataset se compone de audios (.wav) y sus respectivas etiquetas de segmentación en tiempo (.txt).

## 1. Estructura de Archivos (Mapeo)
Los datos están emparejados mediante una relación 1 a 1 basada en el **Identificador del Paciente**.
* **Audio Origial:** `[ID_PACIENTE].wav` (ubicado dentro de `audio_patients.zip`)
* **Archivo de Anotaciones:** `[ID_PACIENTE].txt` (ubicado dentro de `labels_patients.zip`)

**Ejemplo de identificador:** `iaeav-inv01-003`

## 2. Archivo de Anotaciones (.txt)
Los archivos de texto **NO** contienen transcripciones completas ni una simple variable objetivo (Y). En su lugar, contienen una **tabla de diarización y segmentación temporal** de la prueba. 

Los datos están separados por tabulaciones (`\t`) y constan de 3 columnas:

| Columna 1 | Columna 2 | Columna 3 |
| :--- | :--- | :--- |
| **Tiempo de Inicio** (segundos) | **Tiempo de Fin** (segundos) | **Etiqueta** (Tipo de segmento) |
| `10.012693` | `44.677999` | `T1` |

## 3. Glosario de Etiquetas (Columna 3)

| Etiqueta | Significado Probable en el Contexto Clínico | Acción recomendada en Pre-procesamiento |
| :--- | :--- | :--- |
| **`MED`** | **Médico / Neuropsicólogo:** Segmento de tiempo en el que habla el profesional de la salud. | **Ignorar / Descartar.** (No contiene indicadores de la patología del paciente). |
| **`PAC`** | **Paciente:** Segmento de tiempo en el que habla el paciente. | **Extraer.** (Es la señal acústica principal para la extracción de características (MFCC, Jitter, etc). |
| **`T1`, `T2`, ... , `TN`** | **Tareas (Tasks):** Denotan el inicio y fin de una prueba o tarea cognitiva específica dentro de la evaluación (Ej. Nombrar animales, descripción laminar). Envuelven tanto intervenciones del MED como del PAC. | Filtrar según el diseño del experimento. Puedes procesar audios analizando cómo habla el paciente en la Tarea 1 vs Tarea 2. |
| **`SOL`** | **Solapamiento / Silencio (Overlap/Silence):** Indica ruido ambiental, silencios prolongados o solapamiento donde ambos hablan al mismo tiempo. | **Descartar.** Puede introducir ruido en el entrenamiento del modelo predictivo. |

## 4. Ejemplo Real Interpretado

**Fragmento original extraído de `iaeav-inv01-003.txt`**:
```tsv
10.012693	44.677999	T1
10.012693	15.845330	MED
18.081174	44.677999	PAC
...
```

**Interpretación:**
* Del segundo `10.0` al `44.6`, se lleva a cabo la **Tarea 1 (T1)**.
* Dentro de esa tarea, el médico habla desde el inicio (`10.0`) hasta el segundo `15.8` dando las instrucciones.
* Aproximadamente 2.2 segundos después de que el médico deja de hablar, el paciente responde desde el segundo `18.0` hasta que finaliza la tarea en el `44.6`.

## 5. Próximos pasos para el Backend
Para entrenar tu modelo predicitivo, se debe programar un script en Python que procese estos archivos `.txt` y utilice herramientas de manipulación de señales (ej. Librosa o PyDub) para extraer características (features) únicamente de los intervalos de tiempo etiquetados como **`PAC`**. 
