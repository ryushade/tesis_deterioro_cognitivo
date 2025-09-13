# Tesis Deterioro Cognitivo

Proyecto full-stack para análisis de deterioro cognitivo con React TypeScript y Flask.

## Estructura del Proyecto

```
tesis_deterioro_cognitivo/
├── frontend/                 # React TypeScript Application
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── common/     # Componentes comunes
│   │   │   └── ui/         # Componentes de UI
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios de API
│   │   ├── store/          # Estado global (Redux/Zustand)
│   │   ├── types/          # Definiciones de TypeScript
│   │   ├── utils/          # Utilidades
│   │   └── styles/         # Estilos globales
│   ├── public/
│   └── package.json
├── backend/                 # Flask API
│   ├── app/
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades
│   │   └── __init__.py
│   ├── migrations/         # Migraciones de base de datos
│   ├── config/            # Configuración
│   ├── requirements.txt
│   └── run.py
└── docker-compose.yml      # Configuración de Docker para PostgreSQL
```

## Tecnologías

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios para peticiones HTTP
- Material-UI o Tailwind CSS
- React Hook Form
- React Query

### Backend
- Python 3.9+
- Flask
- SQLAlchemy
- Flask-Migrate
- Flask-CORS
- psycopg2 (PostgreSQL adapter)

### Base de Datos
- PostgreSQL 13+

## Configuración del Entorno

### Prerrequisitos
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+ (o Docker)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd tesis_deterioro_cognitivo
   ```

2. **Configurar Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Configurar Backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   python run.py
   ```

4. **Configurar Base de Datos**
   ```bash
   # Con Docker
   docker-compose up -d
   
   # O configurar PostgreSQL localmente
   # Crear base de datos: tesis_deterioro_cognitivo
   ```

## Scripts Disponibles

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Linter
- `npm run type-check` - Verificación de tipos

### Backend
- `python run.py` - Servidor de desarrollo
- `flask db init` - Inicializar migraciones
- `flask db migrate` - Crear migración
- `flask db upgrade` - Aplicar migraciones

## API Endpoints

```
GET    /api/health          # Health check
GET    /api/users           # Obtener usuarios
POST   /api/users           # Crear usuario
GET    /api/users/:id       # Obtener usuario por ID
PUT    /api/users/:id       # Actualizar usuario
DELETE /api/users/:id       # Eliminar usuario
```

## Variables de Entorno

### Backend (.env)
```
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/tesis_deterioro_cognitivo
SECRET_KEY=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.
