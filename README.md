# Sistema Inteligente para el Análisis de Deterioro Cognitivo

Este proyecto es una plataforma full-stack diseñada para la investigación y el diagnóstico asistido por inteligencia artificial en pacientes con posible deterioro cognitivo. Combina pruebas neuropsicológicas estandarizadas con procesamiento de señales multimodales.

## 🚀 Arquitectura del Proyecto

El sistema está dividido en dos grandes bloques: un frontend reactivo y un backend especializado en inferencia de IA.

```
tesis_deterioro_cognitivo/
├── frontend/                 # React TypeScript + Vite
│   ├── src/
│   │   ├── components/      # UI (Shadcn), Layouts y Sidebar
│   │   ├── pages/          # Gestión de Pacientes, Resultados, MMSE, CDT
│   │   ├── services/       # Integración con API y Auth Middleware
│   │   └── lib/            # Configuraciones (Lucide, Utils)
├── backend/                 # Flask API + Entorno de IA
│   ├── app/                # Lógica del servidor (API Routes, Controllers)
│   ├── db/                 # Modelos de base de datos y migraciones
│   ├── ia_audio/           # Modelos de análisis de voz
│   ├── ia_multimodal/      # Integración de señales de texto y audio
│   ├── ia_texto/           # Procesamiento de lenguaje natural
│   ├── iaeav_ia_inference/ # Capa de inferencia de modelos
│   └── main.py             # Punto de entrada del servidor
```

## 🛠️ Tecnologías Principales

### Frontend (Modern Stack)
- **React 18** con **TypeScript** y **Vite**.
- **Tailwind CSS 4** para diseño moderno y estilizado.
- **Shadcn UI** & **Radix UI** para componentes de alta calidad.
- **TanStack Query (React Query)** para gestión de estado asíncrono.
- **Lucide React** para iconografía.
- **React Hook Form** + **Zod** para validación de formularios.

### Backend & AI
- **Python (Flask)** como core del servidor.
- **PostgreSQL** mediante SQLAlchemy para persistencia de datos.
- **IA Multimodal**: Implementaciones de análisis de voz (ASR), detección de pausas y clasificación de deterioro.
- **CDT Analysis**: Procesamiento del "Clock Drawing Test" mediante visión por computador.

## 📋 Funcionalidades del Sistema

- **Gestión Clínica**: Administración completa de pacientes, datos sociodemográficos y antecedentes médicos.
- **Batería de Pruebas**:
    - **MMSE (Mini-Mental State Exam)**: Configuración y aplicación dinámica.
    - **CDT (Clock Drawing Test)**: Administración digital y validación de trazos.
    - **Pruebas de Voz**: Grabación y análisis de patrones de habla.
- **Dashboard de Especialista**: Visualización de resultados, estadísticas y seguimiento de pacientes.
- **Seguridad**: Sistema de roles (Administrador, Neuropsicólogo, Paciente) y códigos de acceso temporales para evaluaciones.

## 🔧 Configuración Rápida

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
# Se recomienda usar un entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 📄 Notas de Investigación
Este sistema forma parte de una tesis de grado para la detección temprana de patologías cognitivas.