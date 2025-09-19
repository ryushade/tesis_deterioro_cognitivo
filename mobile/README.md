# 📱 CDT Mobile App

Aplicación móvil para evaluaciones CDT (Clock Drawing Test) usando React Native y Expo.

## 🚀 Características

- **Validación de código**: Entrada y validación de códigos de acceso
- **Cronómetro**: Timer automático durante el dibujo del reloj
- **Captura de imagen**: Cámara integrada con preview y confirmación
- **Procesamiento**: Monitoreo en tiempo real del análisis de la imagen
- **Resultados detallados**: Puntuación, interpretación y recomendaciones
- **Compartir**: Función para compartir resultados

## 📱 Flujo de la App

1. **Código de Acceso** - El usuario ingresa el código proporcionado
2. **Preparación** - Instrucciones e inicio de la evaluación
3. **Cronómetro** - Timer visual mientras el paciente dibuja
4. **Captura** - Foto del dibujo con previsualización
5. **Procesamiento** - Subida y análisis automático con IA
6. **Resultados** - Puntuación, interpretación y opciones de compartir

## 🛠️ Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Expo CLI
- Dispositivo móvil con Expo Go (para testing)

### Instalación

1. **Instalar dependencias**:
   ```bash
   cd mobile
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npx expo start
   ```

3. **Probar en dispositivo**:
   - Instala Expo Go en tu teléfono
   - Escanea el código QR desde la terminal
   - ¡La app se cargará automáticamente!

## 📁 Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/            # Pantallas principales
│   │   ├── CodigoScreen.tsx      # Entrada de código
│   │   ├── PreparacionScreen.tsx # Instrucciones
│   │   ├── DibujoScreen.tsx      # Cronómetro
│   │   ├── CamaraScreen.tsx      # Captura de imagen
│   │   ├── PreviewScreen.tsx     # Confirmación de foto
│   │   ├── ProcesandoScreen.tsx  # Estado de procesamiento
│   │   └── ResultadosScreen.tsx  # Resultados finales
│   ├── services/           # Servicios API
│   │   └── api.ts               # Comunicación con backend
│   ├── store/              # Estado global (Redux)
│   │   ├── index.ts             # Configuración del store
│   │   └── cdtSlice.ts          # Estado de la evaluación CDT
│   └── types/              # Definiciones TypeScript
│       └── index.ts             # Interfaces y tipos
├── App.tsx                 # Componente principal
├── app.json               # Configuración de Expo
├── package.json           # Dependencias
└── tsconfig.json          # Configuración TypeScript
```

## 🔧 Tecnologías

- **React Native** - Framework móvil multiplataforma
- **Expo** - Plataforma de desarrollo y deployment
- **TypeScript** - Tipado estático
- **Redux Toolkit** - Gestión de estado global
- **React Navigation** - Navegación entre pantallas
- **Expo Camera** - Acceso a cámara nativa
- **Expo Image Picker** - Selección de imágenes
- **Axios** - Cliente HTTP para API

## 🎨 UI/UX

- **Diseño intuitivo** con navegación clara
- **Colores suaves** para reducir ansiedad
- **Feedback visual** en cada paso
- **Accesibilidad** con textos descriptivos
- **Responsive** para diferentes tamaños de pantalla

## 🔗 Comunicación con Backend

La app se conecta al backend Flask para:

- Validar códigos de acceso
- Crear evaluaciones CDT
- Subir imágenes para análisis
- Consultar resultados procesados

### Endpoints utilizados:

- `POST /api/cdt/validar-codigo` - Validación de códigos
- `POST /api/cdt/iniciar-evaluacion` - Crear nueva evaluación
- `POST /api/cdt/subir-imagen` - Subir imagen del dibujo
- `GET /api/cdt/evaluacion/{id}` - Consultar estado y resultados

## 📱 Testing

### En dispositivo físico:

1. Instala **Expo Go** desde App Store/Play Store
2. Ejecuta `npx expo start`
3. Escanea el código QR
4. La app se carga automáticamente

### En simulador:

- **iOS**: Requiere Xcode en macOS
- **Android**: Requiere Android Studio

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
cd mobile
npm install

# 2. Iniciar servidor
npx expo start

# 3. Abrir Expo Go en tu teléfono y escanear QR
```

**¡Tu app móvil CDT está lista! 🎉**

---

**Desarrollado con ❤️ para mejorar evaluaciones cognitivas**
