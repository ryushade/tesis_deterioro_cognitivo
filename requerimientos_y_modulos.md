# Requerimientos Funcionales y Módulos del Sistema

Este documento detalla los requerimientos funcionales y la estructura modular del sistema de detección de deterioro cognitivo.

## Módulos del Sistema

El sistema está compuesto por **8 módulos principales** que integran tanto el frontend como el backend:

1.  **Módulo de Autenticación y Seguridad**:
    *   Gestión de sesiones mediante JWT.
    *   Control de acceso basado en roles (Neuropsicólogos, Administradores).
    *   Protección de rutas y validación de tokens.

2.  **Módulo de Gestión de Usuarios y Pacientes**:
    *   Registro y administración de Neuropsicólogos.
    *   Gestión de expedientes de Pacientes (CRUD).
    *   Asignación de evaluaciones a pacientes.

3.  **Módulo MMSE (Mini-Mental State Examination)**:
    *   Evaluación interactiva por categorías (Orientación, Memoria, Atención, etc.).
    *   Cálculo automatizado de puntajes según las respuestas.
    *   Visualización de resultados desglosados.

4.  **Módulo CDT (Clock Drawing Test - Test del Reloj)**:
    *   Carga de imágenes de dibujos realizados por pacientes.
    *   Procesamiento e inferencia mediante modelos de IA (ResNet18) para evaluar la precisión del dibujo.
    *   Puntuación automática del test.

5.  **Módulo SVF (Fluidez Verbal Semántica)**:
    *   Registro de pruebas de fluidez verbal.
    *   Análisis de respuestas y comparación con bases de datos de referencia.

6.  **Módulo de Análisis de Voz (IA)**:
    *   Captura o carga de audios de las pruebas.
    *   Extracción de características acústicas.
    *   Inferencia mediante modelos de Machine Learning para identificar patrones de deterioro cognitivo en la voz.

7.  **Módulo de Resultados e Informes**:
    *   Dashboard centralizado de resultados.
    *   Gráficos comparativos (Radar Charts) para visualización de capacidades cognitivas.
    *   Generación de informes detallados por paciente en formato visual o PDF.

8.  **Módulo de Códigos de Acceso**:
    *   Generación y validación de códigos temporales para la realización de pruebas.

---

## Requerimientos Funcionales (RF)

### Gestión de Usuarios y Acceso
*   **RF-01**: El sistema debe permitir el inicio de sesión seguro para neuropsicólogos.
*   **RF-02**: El sistema debe permitir el registro, edición y consulta de la información clínica básica de los pacientes.
*   **RF-03**: El sistema debe gestionar permisos de acceso para asegurar que solo personal autorizado vea datos sensibles.

### Evaluación Cognitiva
*   **RF-04**: El sistema debe permitir realizar el test MMSE de forma digital, guiando al evaluador a través de las diferentes secciones.
*   **RF-05**: El sistema debe permitir la carga de fotografías del Test del Reloj (CDT) y devolver una evaluación basada en IA.
*   **RF-06**: El sistema debe permitir la grabación y análisis de pruebas de voz para detectar biomarcadores de deterioro.
*   **RF-07**: El sistema debe calcular automáticamente el puntaje total y por categoría de cada prueba realizada.

### Análisis y Reportes
*   **RF-08**: El sistema debe generar una visualización gráfica (ej. radar chart) que compare el desempeño del paciente en las diferentes áreas cognitivas.
*   **RF-09**: El sistema debe almacenar un histórico de evaluaciones por paciente para permitir el seguimiento de su evolución.
*   **RF-10**: El sistema debe permitir exportar o visualizar informes consolidados de los resultados obtenidos en las distintas pruebas aplicadas.

### Integración de IA
*   **RF-11**: El backend debe exponer endpoints de inferencia para los modelos de procesamiento de imágenes (CDT) y audio (Voz).
*   **RF-12**: Los modelos de IA deben ser capaces de procesar los datos de entrada y retornar una probabilidad o puntaje de acierto en tiempo real o diferido.
