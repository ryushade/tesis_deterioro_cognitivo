# Validaciones MMSE - Resumen de Implementación

## 📋 Descripción General

Se ha implementado un sistema robusto de validaciones para el test MMSE que previene el ingreso de valores fuera de lo real y proporciona retroalimentación en tiempo real al usuario.

## ✨ Características Implementadas

### 1. **Validación en Tiempo Real**
- ✅ Validación mientras el usuario escribe
- ✅ Mensajes de error inmediatos
- ✅ Indicadores visuales (colores de borde)
- ✅ Diferenciación entre errores y advertencias

### 2. **Validaciones Específicas por Campo**

#### **Orientación en el Tiempo**

**Año:**
- Debe ser un número válido
- Rango: 1900 - 2100
- Alerta si está más de 10 años del año actual
- Mensaje: *"Verifique el año (actual: 2025)"*

**Fecha (día del mes):**
- Número entero
- Rango: 1 - 31
- Input HTML con min/max automáticos
- Mensaje: *"El día debe estar entre 1 y 31"*

**Estación, Día, Mes:**
- Selección obligatoria
- Validación automática por opciones

#### **Orientación en el Lugar**

**País, Provincia, Ciudad, Establecimiento, Piso:**
- Mínimo 2 caracteres
- Debe contener letras
- No solo números o caracteres especiales
- Mensaje específico por campo: *"Ciudad debe tener al menos 2 caracteres"*

#### **Atención y Cálculo**

**Restas de 7 en 7:**
- Número entero obligatorio
- Rango: 0 - 100
- **Advertencia** si no coincide con respuesta correcta
- Ejemplo: Si ingresa 92 en lugar de 93:
  - ✅ Permite continuar (amarillo)
  - ⚠️ Muestra: *"Nota: La respuesta correcta sería 93"*

#### **Recuerdo**

**Palabras (Casa, Mesa, Gato):**
- Mínimo 2 caracteres
- **Advertencia** si no coincide con palabra correcta
- Ejemplo: Si dice "perro" en lugar de "gato":
  - ✅ Permite continuar (amarillo)
  - ⚠️ Muestra: *"Nota: La palabra correcta sería 'gato'"*

#### **Lenguaje**

**Frase completa:**
- Mínimo 5 caracteres
- Al menos 2 palabras
- Mensaje: *"La frase debe tener al menos 2 palabras"*

**Preguntas boolean:**
- Debe seleccionar "Cumple" o "No cumple"
- Mensaje: *"Debe seleccionar una opción"*

### 3. **Indicadores Visuales**

#### Colores de Borde:
- 🔴 **Rojo**: Error crítico (campo inválido, bloquea avance)
- 🟡 **Amarillo**: Advertencia (valor sospechoso, permite avance)
- ⚪ **Normal**: Sin problemas

#### Iconos:
- 🔴 `AlertCircle` rojo: Error crítico
- 🟡 `AlertCircle` amarillo: Advertencia

## 🔧 Arquitectura Técnica

### Archivo de Validaciones: `mmseValidations.ts`

**Funciones principales:**

```typescript
// Valida cualquier respuesta según tipo y ID de pregunta
validateAnswer(questionId, value, questionType): ValidationResult

// Validaciones específicas
validateYear(value): ValidationResult
validateDayOfMonth(value): ValidationResult
validateSubtraction(questionId, value): ValidationResult
validateText(value, fieldName): ValidationResult
validateRecall(value, position): ValidationResult
validateSentence(value): ValidationResult
```

**Estructura ValidationResult:**
```typescript
interface ValidationResult {
  isValid: boolean          // true si pasa la validación
  errorMessage?: string     // Mensaje descriptivo
}
```

### Componente MMSESectionCard

**Lógica de validación:**
```typescript
// Validar en tiempo real
const validation = currentValue !== null && currentValue !== undefined && currentValue !== ''
  ? validateAnswer(q.id, currentValue, q.type)
  : { isValid: true }

// Determinar si mostrar advertencia
const showWarning = !validation.isValid || (validation.errorMessage && validation.isValid)
const errorColor = !validation.isValid ? 'text-red-600' : 'text-yellow-600'
```

**Renderizado condicional:**
```tsx
{showWarning && validation.errorMessage && (
  <div className={`flex items-center gap-1 text-xs ${errorColor}`}>
    <AlertCircle className="w-3 h-3" />
    <span>{validation.errorMessage}</span>
  </div>
)}
```

### Componentes MMSE.tsx y MMSEAdmin.tsx

**Función isValueValid actualizada:**
```typescript
const isValueValid = (questionId: string, type: Question['type'], value: Answer) => {
  const validation = validateAnswer(questionId, value, type)
  return validation.isValid
}
```

**Validación de secciones:**
```typescript
const validateStep = (stepIndex: number) => {
  const sec = sections[stepIndex]
  const invalidMap: Record<string, boolean> = {}
  for (const q of sec.questions) {
    const v = answers[q.id]
    if (!isValueValid(q.id, q.type, v)) {
      invalidMap[q.id] = true
    }
  }
  return { valid: Object.keys(invalidMap).length === 0, invalidMap }
}
```

## 📊 Tabla de Validaciones Completa

| Campo | Tipo | Validación | Rango/Requisito | Tipo Mensaje |
|-------|------|------------|-----------------|--------------|
| Año | text | Numérico + rango | 1900-2100, ±10 años actual | Error/Advertencia |
| Estación | select | Opción obligatoria | Lista predefinida | Error |
| Fecha | number | Entero + rango | 1-31 | Error |
| Día semana | select | Opción obligatoria | Lista predefinida | Error |
| Mes | select | Opción obligatoria | Lista predefinida | Error |
| País | text | Texto con letras | ≥2 caracteres, con letras | Error |
| Provincia | text | Texto con letras | ≥2 caracteres, con letras | Error |
| Ciudad | text | Texto con letras | ≥2 caracteres, con letras | Error |
| Establecimiento | text | Texto con letras | ≥2 caracteres, con letras | Error |
| Piso | text | Texto con letras | ≥2 caracteres, con letras | Error |
| Registro (3) | boolean | Selección obligatoria | Cumple/No cumple | Error |
| 100-7 | number | Entero + rango + sugerencia | 0-100, sugiere 93 | Error/Advertencia |
| 93-7 | number | Entero + rango + sugerencia | 0-100, sugiere 86 | Error/Advertencia |
| 86-7 | number | Entero + rango + sugerencia | 0-100, sugiere 79 | Error/Advertencia |
| 79-7 | number | Entero + rango + sugerencia | 0-100, sugiere 72 | Error/Advertencia |
| 72-7 | number | Entero + rango + sugerencia | 0-100, sugiere 65 | Error/Advertencia |
| Recuerdo 1 | text | Texto + sugerencia | ≥2 caracteres, sugiere "casa" | Error/Advertencia |
| Recuerdo 2 | text | Texto + sugerencia | ≥2 caracteres, sugiere "mesa" | Error/Advertencia |
| Recuerdo 3 | text | Texto + sugerencia | ≥2 caracteres, sugiere "gato" | Error/Advertencia |
| Lenguaje (6) | boolean | Selección obligatoria | Cumple/No cumple | Error |
| Frase | text | Texto estructurado | ≥5 caracteres, ≥2 palabras | Error |

## 🎨 Experiencia de Usuario

### Flujo de Validación

1. **Usuario ingresa valor:**
   - Sistema valida en tiempo real
   - Muestra borde rojo/amarillo si hay problema
   - Despliega mensaje descriptivo

2. **Tipos de mensajes:**
   
   **Error (Rojo 🔴):**
   - "El año es requerido"
   - "El día debe estar entre 1 y 31"
   - "Ciudad debe tener al menos 2 caracteres"
   - "La frase debe tener al menos 2 palabras"
   
   **Advertencia (Amarillo 🟡):**
   - "Verifique el año (actual: 2025)"
   - "Nota: La respuesta correcta sería 93"
   - "Nota: La palabra correcta sería 'casa'"

3. **Intento de avanzar:**
   - Si hay errores críticos: **bloquea** y marca campos
   - Si solo hay advertencias: **permite** avanzar
   - En MMSE paciente: auto-avance solo si todo válido
   - En MMSE admin: validación manual en cada sección

## 🔒 Seguridad de Datos

### Prevención de Datos Incorrectos

✅ **No permite:**
- Años imposibles (ej: año 3000)
- Días fuera de rango (ej: día 35)
- Campos vacíos o solo espacios
- Textos sin letras (ej: "123" como país)
- Frases de una sola palabra

✅ **Permite con advertencia:**
- Respuestas de resta incorrectas (puede ser error cognitivo real)
- Palabras de recuerdo incorrectas (puede ser sustitución)
- Años con más de 10 años de diferencia (ej: paciente confundido)

### Diferencia Crítica

**Error vs Advertencia:**
- **Error**: Dato técnicamente inválido (fuera de rango, tipo incorrecto)
- **Advertencia**: Dato válido pero sospechoso (puede indicar deterioro cognitivo)

Esto es importante porque en un test cognitivo, **una respuesta incorrecta puede ser dato valioso**, no un error a bloquear.

## 💡 Casos de Uso

### Caso 1: Paciente confundido con el año
**Input:** "2015"  
**Validación:** ⚠️ Advertencia amarilla  
**Mensaje:** "Verifique el año (actual: 2025)"  
**Acción:** Permite continuar (puede ser deterioro cognitivo)

### Caso 2: Error de tipeo en fecha
**Input:** "45" (día del mes)  
**Validación:** 🔴 Error crítico  
**Mensaje:** "El día debe estar entre 1 y 31"  
**Acción:** Bloquea avance hasta corregir

### Caso 3: Resta incorrecta
**Input:** "92" (debería ser 93)  
**Validación:** ⚠️ Advertencia amarilla  
**Mensaje:** "Nota: La respuesta correcta sería 93"  
**Acción:** Permite continuar y registra la respuesta

### Caso 4: Palabra de recuerdo sustituida
**Input:** "perro" (debería ser "gato")  
**Validación:** ⚠️ Advertencia amarilla  
**Mensaje:** "Nota: La palabra correcta sería 'gato'"  
**Acción:** Permite continuar (sustitución semántica común)

### Caso 5: Campo de texto vacío
**Input:** "" o "   " (espacios)  
**Validación:** 🔴 Error crítico  
**Mensaje:** "País es requerido"  
**Acción:** Bloquea avance hasta completar

## 🧪 Testing Recomendado

### Tests de Validación

**Orientación:**
- [ ] Año válido (2025) → ✅ Pasa
- [ ] Año futuro lejano (2040) → ⚠️ Advertencia
- [ ] Año imposible (3000) → 🔴 Error
- [ ] Fecha 1-31 → ✅ Pasa
- [ ] Fecha 32 → 🔴 Error
- [ ] Texto vacío en país → 🔴 Error

**Atención:**
- [ ] Resta correcta (93) → ✅ Pasa
- [ ] Resta incorrecta (92) → ⚠️ Advertencia
- [ ] Valor fuera de rango (150) → 🔴 Error

**Recuerdo:**
- [ ] Palabra correcta ("casa") → ✅ Pasa
- [ ] Palabra similar ("hogar") → ⚠️ Advertencia
- [ ] Campo vacío → 🔴 Error

**Lenguaje:**
- [ ] Frase válida ("El cielo es azul") → ✅ Pasa
- [ ] Una palabra ("Hola") → 🔴 Error
- [ ] Muy corta ("Hi") → 🔴 Error

## 📈 Métricas y Análisis

Con estas validaciones, el sistema puede:

1. **Calidad de datos**: Garantizar datos técnicamente válidos
2. **Análisis clínico**: Registrar respuestas incorrectas como datos
3. **Usabilidad**: Ayudar al usuario sin ser intrusivo
4. **Auditoría**: Diferenciar errores de tipeo vs deterioro cognitivo

## 🎯 Beneficios

### Para el Neuropsicólogo:
- ✅ Datos confiables y consistentes
- ✅ Menos errores de captura
- ✅ Advertencias sobre valores sospechosos
- ✅ Flexibilidad para registrar respuestas incorrectas

### Para el Paciente:
- ✅ Retroalimentación clara e inmediata
- ✅ No se frustra por bloqueos innecesarios
- ✅ Guía sutil sin presión

### Para el Sistema:
- ✅ Integridad de datos
- ✅ Menos datos a limpiar
- ✅ Análisis más precisos
- ✅ Menos errores en reportes

## 🚀 Próximas Mejoras Sugeridas

1. **Validación de contexto:**
   - Validar fecha completa (día válido para el mes/año)
   - Detectar incoherencias entre campos

2. **Sugerencias inteligentes:**
   - Autocompletar nombres de países/ciudades
   - Sugerir palabras similares en recuerdo

3. **Análisis de patrones:**
   - Detectar secuencias de errores sospechosas
   - Alertar si muchas respuestas están incorrectas

4. **Validaciones adaptativas:**
   - Ajustar severidad según historial del paciente
   - Comparar con evaluaciones previas

## ✅ Conclusión

El sistema de validaciones implementado encuentra el balance perfecto entre:
- **Rigurosidad técnica** (previene datos inválidos)
- **Flexibilidad clínica** (permite registrar deterioro cognitivo)
- **Experiencia de usuario** (guía sin frustrar)

Las validaciones diferencian entre:
- ❌ **Errores técnicos** (que deben corregirse)
- ⚠️ **Respuestas incorrectas** (que deben registrarse como dato clínico)

Esto hace que el MMSE sea tanto robusto técnicamente como clínicamente útil.

