# Configuración MMSE - Instrucciones de Instalación

## 🚨 Error Actual: "Unexpected token '<', "<!doctype "... is not valid JSON"

Este error indica que el backend está devolviendo HTML en lugar de JSON, lo que significa que las rutas no están funcionando correctamente.

## 📋 Pasos para Solucionar

### 1. **Ejecutar Script SQL**
```bash
# Conectar a PostgreSQL y ejecutar:
psql -d tu_base_de_datos -f backend/database/mmse_configuracion.sql
```

### 2. **Verificar que el Backend Esté Ejecutándose**
```bash
cd backend
python run.py
```

### 3. **Probar las Rutas**
```bash
# Ejecutar el script de prueba
python backend/scripts/test_mmse_config.py
```

### 4. **Verificar en el Navegador**
- Ir a `/mmse-configuracion`
- Usar el botón "Probar Backend"
- Verificar que no haya errores en la consola

## 🔧 Archivos Creados

### Backend:
- ✅ `backend/database/mmse_configuracion.sql` - Script de base de datos
- ✅ `backend/app/services/mmse_config_service.py` - Servicio de configuración
- ✅ `backend/app/routes/mmse_config.py` - Rutas de API
- ✅ `backend/app/__init__.py` - Rutas registradas

### Frontend:
- ✅ `frontend/src/services/mmseConfigService.ts` - Servicio frontend
- ✅ `frontend/src/pages/Admin/MMSEConfiguracion/` - Componentes
- ✅ `frontend/src/App.tsx` - Ruta agregada al router

## 🎯 Endpoints Disponibles

- `GET /api/mmse/configuracion/respuestas` - Listar configuraciones
- `POST /api/mmse/configuracion/respuestas` - Crear configuración
- `PUT /api/mmse/configuracion/respuestas/{id}` - Actualizar configuración
- `DELETE /api/mmse/configuracion/respuestas/{id}` - Eliminar configuración
- `GET /api/mmse/configuracion/contextos` - Listar contextos
- `GET /api/mmse/configuracion/preguntas` - Listar preguntas

## 🐛 Solución de Problemas

### Error: "Table 'mmse_prueba_cognitiva_configuracion' doesn't exist"
```sql
-- Ejecutar el script SQL completo
\i backend/database/mmse_configuracion.sql
```

### Error: "ModuleNotFoundError: No module named 'mmse_config'"
```bash
# Reiniciar el backend
cd backend
python run.py
```

### Error: "404 Not Found"
- Verificar que las rutas estén registradas en `app/__init__.py`
- Reiniciar el servidor backend

### Error: "401 Unauthorized"
- Verificar que tengas un token válido en localStorage
- Hacer login nuevamente

## 🔄 Cambiar a Versión Completa

Una vez que el backend esté funcionando:

1. Cambiar en `frontend/src/pages/Admin/MMSEConfiguracion/index.ts`:
```typescript
// Cambiar de:
export { default } from './MMSEConfiguracionPageDemo'

// A:
export { default } from './MMSEConfiguracionPage'
```

2. Recargar la página

## ✅ Verificación Final

El sistema estará funcionando cuando:
- ✅ El botón "Probar Backend" muestre "Backend funcionando correctamente"
- ✅ No haya errores en la consola del navegador
- ✅ Se puedan ver las configuraciones en la tabla
- ✅ Se puedan crear/editar/eliminar configuraciones
