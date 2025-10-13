# MMSE Asíncrono - Resumen de Implementación

## 📋 Descripción General

Se ha implementado un sistema completamente asíncrono para la prueba MMSE (Mini-Mental State Examination), permitiendo a los pacientes pausar, guardar progreso y continuar la evaluación en cualquier momento.

## ✨ Características Implementadas

### 1. **Guardado Automático de Progreso**
- ✅ El progreso se guarda automáticamente cada 2 segundos
- ✅ Se almacena la sección actual, respuestas y porcentaje de avance
- ✅ Los datos se guardan en el campo `datos_especificos` de la base de datos

### 2. **Pausar y Reanudar**
- ✅ Botón "Pausar y guardar" visible en todo momento
- ✅ Al pausar, el sistema guarda el progreso completo
- ✅ Pantalla de confirmación amigable al pausar
- ✅ Detección automática de sesiones pausadas al iniciar
- ✅ Posibilidad de reanudar exactamente donde se dejó

### 3. **Gestión de Sesiones**
- ✅ Detección de sesiones activas o pausadas al iniciar
- ✅ Selector de sesiones cuando hay múltiples sesiones pendientes
- ✅ Opción de continuar sesión existente o iniciar nueva
- ✅ Visualización del progreso de cada sesión

### 4. **Temporizador Flexible**
- ✅ Temporizador de referencia (10 minutos sugeridos)
- ✅ No bloquea la prueba cuando se acaba el tiempo
- ✅ Permite continuar a ritmo propio después del tiempo sugerido
- ✅ Indicador visual del estado del tiempo

## 🔧 Cambios Técnicos Implementados

### Backend (`backend/app/routes/mmse.py`)

#### Nuevos Endpoints:

1. **`POST /api/mmse/sesiones/{id}/pausar`**
   - Pausa una sesión activa
   - Guarda el estado como 'pausada'
   - Requiere autenticación

2. **`POST /api/mmse/sesiones/{id}/reanudar`**
   - Reanuda una sesión pausada
   - Cambia el estado a 'en_progreso'
   - Verifica que la sesión esté pausada

3. **`POST /api/mmse/sesiones/{id}/cancelar`**
   - Cancela una sesión
   - Marca el estado como 'cancelada'

4. **`GET /api/mmse/sesiones/paciente/{id_paciente}`**
   - Obtiene todas las sesiones MMSE de un paciente
   - Incluye estado, progreso y datos específicos
   - Ordenadas por fecha (más recientes primero)

### Frontend

#### Servicio MMSE (`frontend/src/services/mmseService.ts`)

**Nuevo método:**
- `getSesionesPaciente(id_paciente)`: Obtiene sesiones del paciente

#### Componente Principal (`frontend/src/pages/Evaluaciones/ComponentsEvaluaciones/Pruebas/MMSE/MMSE.tsx`)

**Nuevas funcionalidades:**

1. **Verificación de sesiones existentes:**
   ```typescript
   verificarSesionesExistentes(pacienteId)
   ```
   - Busca sesiones activas o pausadas
   - Muestra selector si encuentra sesiones

2. **Carga de sesión existente:**
   ```typescript
   cargarSesionExistente(sesion)
   ```
   - Recupera respuestas guardadas
   - Restaura sección actual
   - Reanuda automáticamente si estaba pausada

3. **Pausa de sesión:**
   ```typescript
   handlePausar()
   ```
   - Guarda progreso actual
   - Cambia estado a 'pausada'
   - Redirige a pantalla de confirmación

**Mejoras en UI:**
- Botón "Pausar y guardar" siempre visible
- Selector de sesiones con información detallada
- Temporizador con colores adaptativos
- Mensaje informativo cuando el tiempo de referencia expira

#### Nueva Página (`frontend/src/pages/Evaluaciones/ComponentsEvaluaciones/Pruebas/MMSE/MMSEPausada.tsx`)

Pantalla de confirmación que muestra:
- ✅ Confirmación de guardado exitoso
- 📋 Información sobre el estado pausado
- 🔄 Botón para continuar evaluación
- 🏠 Botón para volver al inicio
- 💡 Consejo sobre continuación

#### Rutas (`frontend/src/App.tsx`)

**Nuevas rutas agregadas:**
- `/pruebas/pausada` - Pantalla de sesión pausada
- `/evaluaciones/mmse` - Ruta alternativa para MMSE

## 🎨 Experiencia de Usuario

### Flujo Normal

1. **Inicio:**
   - El paciente inicia sesión con código de acceso
   - Se redirige automáticamente al MMSE
   - Sistema verifica sesiones pendientes

2. **Sesiones Existentes:**
   - Si hay sesiones activas/pausadas, muestra selector
   - Paciente puede continuar o iniciar nueva
   - Al seleccionar, carga progreso guardado

3. **Durante la Prueba:**
   - Progreso se guarda automáticamente
   - Botón "Pausar y guardar" disponible
   - Temporizador informativo visible
   - Auto-avance entre secciones al completar

4. **Pausar:**
   - Click en "Pausar y guardar"
   - Confirmación de guardado
   - Puede cerrar y volver después

5. **Reanudar:**
   - Ingresar nuevamente con código
   - Seleccionar sesión pausada
   - Continúa desde donde dejó

### Indicadores Visuales

**Temporizador:**
- 🔵 Azul: Tiempo normal (> 5 min)
- 🟡 Amarillo: Advertencia (2-5 min)
- 🟠 Naranja: Crítico (< 2 min)
- ⚪ Gris: "Sin límite" (tiempo agotado, puede continuar)

**Estados de Sesión:**
- 🟢 "En progreso": Sesión activa
- 🟡 "Pausada": Sesión guardada temporalmente
- ✅ "Completada": Finalizada exitosamente
- ❌ "Cancelada": Descartada por el usuario

## 📊 Estructura de Datos

### Datos Guardados en `datos_especificos`:

```json
{
  "current_section": 2,
  "answers": {
    "anio": "2025",
    "estacion": "primavera",
    "fecha": 13,
    // ... más respuestas
  },
  "progress": 33
}
```

### Estados de Sesión:

- `iniciada`: Recién creada
- `en_progreso`: Activa y en uso
- `pausada`: Guardada temporalmente
- `completada`: Finalizada exitosamente
- `cancelada`: Descartada
- `expirada`: (futuro) Tiempo máximo excedido

## 🔒 Seguridad y Validación

- ✅ Todas las rutas requieren autenticación JWT
- ✅ Validación de roles (Administrador, Neuropsicólogo, Paciente)
- ✅ Verificación de propiedad de sesión
- ✅ Validación de estados antes de transiciones
- ✅ Guardado transaccional en base de datos

## 🚀 Próximas Mejoras Sugeridas

1. **Notificaciones:**
   - Email cuando una sesión se pausa
   - Recordatorio si una sesión lleva días pausada

2. **Analytics:**
   - Tiempo promedio por sección
   - Tasa de pausas vs completados
   - Patrones de uso temporal

3. **Múltiples Dispositivos:**
   - Sincronización en tiempo real
   - Continuar en otro dispositivo

4. **Accesibilidad:**
   - Modo de alto contraste (ya preparado)
   - Tamaño de fuente ajustable (ya preparado)
   - Lectura de texto por voz (ya implementado)

## 🧪 Pruebas Recomendadas

1. **Flujo completo:**
   - Iniciar sesión → Pausar → Cerrar → Reingresar → Continuar → Finalizar

2. **Múltiples sesiones:**
   - Crear varias sesiones pausadas
   - Verificar selector
   - Continuar sesión específica

3. **Guardado automático:**
   - Completar algunas preguntas
   - Esperar 2+ segundos
   - Refrescar página
   - Verificar que se recuperó el progreso

4. **Temporizador:**
   - Dejar correr el tiempo hasta 0
   - Verificar que permite continuar
   - Comprobar indicador "Sin límite"

## 📝 Notas Importantes

- El tiempo de 10 minutos es **referencial**, no obligatorio
- Las sesiones no expiran automáticamente
- El paciente tiene control total sobre pausar/continuar
- El progreso se guarda incluso si el navegador se cierra inesperadamente (gracias al guardado automático cada 2 segundos)

## 🎯 Conclusión

El MMSE ahora es completamente asíncrono, permitiendo a los pacientes tomarse el tiempo necesario y continuar su evaluación en múltiples sesiones si así lo requieren. Esto mejora significativamente la experiencia del usuario y la flexibilidad del sistema.

