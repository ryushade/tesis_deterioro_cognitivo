/**
 * Validaciones para el test MMSE
 */

export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

/**
 * Valida el año ingresado
 */
export function validateYear(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, errorMessage: 'El año es requerido' }
  }

  const year = parseInt(value)
  const currentYear = new Date().getFullYear()

  if (isNaN(year)) {
    return { isValid: false, errorMessage: 'Debe ser un año válido' }
  }

  if (year < 1900 || year > 2100) {
    return { isValid: false, errorMessage: 'Año debe estar entre 1900 y 2100' }
  }

  // Advertencia si está muy lejos del año actual (más de 10 años)
  if (Math.abs(year - currentYear) > 10) {
    return { isValid: false, errorMessage: `Verifique el año (actual: ${currentYear})` }
  }

  return { isValid: true }
}

/**
 * Valida el día del mes
 */
export function validateDayOfMonth(value: number | null): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, errorMessage: 'La fecha es requerida' }
  }

  if (!Number.isInteger(value)) {
    return { isValid: false, errorMessage: 'Debe ser un número entero' }
  }

  if (value < 1 || value > 31) {
    return { isValid: false, errorMessage: 'El día debe estar entre 1 y 31' }
  }

  return { isValid: true }
}

/**
 * Valida las respuestas de resta de 7 en 7
 */
export function validateSubtraction(questionId: string, value: number | null): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, errorMessage: 'La respuesta es requerida' }
  }

  if (!Number.isInteger(value)) {
    return { isValid: false, errorMessage: 'Debe ser un número entero' }
  }

  // Rango razonable para restas de 100
  if (value < 0 || value > 100) {
    return { isValid: false, errorMessage: 'El valor debe estar entre 0 y 100' }
  }

  // Validar respuestas correctas (opcional, solo advertencia)
  const correctAnswers: Record<string, number> = {
    '100-93': 93,
    '93-86': 86,
    '86-79': 79,
    '79-72': 72,
    '72-65': 65
  }

  const correctValue = correctAnswers[questionId]
  if (correctValue && value !== correctValue) {
    // Solo es una advertencia, pero permitimos el valor
    return { 
      isValid: true, 
      errorMessage: `Nota: La respuesta correcta sería ${correctValue}` 
    }
  }

  return { isValid: true }
}

/**
 * Valida campos de texto
 */
export function validateText(value: string, fieldName: string = 'Campo'): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, errorMessage: `${fieldName} es requerido` }
  }

  if (value.trim().length < 2) {
    return { isValid: false, errorMessage: `${fieldName} debe tener al menos 2 caracteres` }
  }

  // Validar que no sean solo números o caracteres especiales
  if (!/[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(value)) {
    return { isValid: false, errorMessage: `${fieldName} debe contener letras` }
  }

  return { isValid: true }
}

/**
 * Valida las palabras de recuerdo
 */
export function validateRecall(value: string, position: number): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, errorMessage: 'La palabra es requerida' }
  }

  const word = value.trim().toLowerCase()

  // Palabras correctas del test
  const correctWords = ['casa', 'mesa', 'gato']
  const correctWord = correctWords[position - 1]

  if (word.length < 2) {
    return { isValid: false, errorMessage: 'La palabra debe tener al menos 2 caracteres' }
  }

  // Verificar si es la palabra correcta (solo advertencia)
  if (word !== correctWord) {
    return { 
      isValid: true, 
      errorMessage: `Nota: La palabra correcta sería "${correctWord}"` 
    }
  }

  return { isValid: true }
}

/**
 * Valida una frase completa
 */
export function validateSentence(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, errorMessage: 'La frase es requerida' }
  }

  const trimmed = value.trim()

  if (trimmed.length < 5) {
    return { isValid: false, errorMessage: 'La frase debe tener al menos 5 caracteres' }
  }

  // Verificar que tenga al menos 2 palabras
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  if (words.length < 2) {
    return { isValid: false, errorMessage: 'La frase debe tener al menos 2 palabras' }
  }

  return { isValid: true }
}

/**
 * Valida según el tipo de pregunta y su ID
 */
export function validateAnswer(
  questionId: string, 
  value: string | number | boolean | null, 
  questionType: string
): ValidationResult {
  // Boolean siempre es válido si tiene un valor
  if (questionType === 'boolean') {
    if (value === null || value === undefined) {
      return { isValid: false, errorMessage: 'Debe seleccionar una opción' }
    }
    return { isValid: true }
  }

  // Select siempre es válido si tiene un valor
  if (questionType === 'select') {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, errorMessage: 'Debe seleccionar una opción' }
    }
    return { isValid: true }
  }

  // Validaciones específicas por ID de pregunta
  switch (questionId) {
    case 'anio':
      return validateYear(value as string)
    
    case 'fecha':
      return validateDayOfMonth(value as number)
    
    case '100-93':
    case '93-86':
    case '86-79':
    case '79-72':
    case '72-65':
      return validateSubtraction(questionId, value as number)
    
    case 'recuerdo1':
      return validateRecall(value as string, 1)
    
    case 'recuerdo2':
      return validateRecall(value as string, 2)
    
    case 'recuerdo3':
      return validateRecall(value as string, 3)
    
    case 'frase':
      return validateSentence(value as string)
    
    case 'pais':
      return validateText(value as string, 'País')
    
    case 'provincia':
      return validateText(value as string, 'Provincia/Estado')
    
    case 'ciudad':
      return validateText(value as string, 'Ciudad')
    
    case 'establecimiento':
      return validateText(value as string, 'Establecimiento')
    
    case 'piso':
      return validateText(value as string, 'Piso/Sala')
    
    default:
      // Validación genérica para texto
      if (questionType === 'text') {
        return validateText(value as string)
      }
      if (questionType === 'number') {
        if (value === null || value === undefined) {
          return { isValid: false, errorMessage: 'El valor es requerido' }
        }
        return { isValid: true }
      }
      return { isValid: true }
  }
}

/**
 * Valida una respuesta usando configuración dinámica del backend
 */
export async function validateAnswerWithDynamicConfig(
  questionId: string, 
  value: string | number | boolean | null, 
  questionType: string,
  contexto?: string
): Promise<ValidationResult> {
  // Primero hacer validación básica
  const basicValidation = validateAnswer(questionId, value, questionType)
  if (!basicValidation.isValid) {
    return basicValidation
  }

  // Para preguntas de orientación en el lugar, usar configuración dinámica
  const dynamicQuestions = ['pais', 'provincia', 'ciudad', 'establecimiento', 'piso']
  
  if (dynamicQuestions.includes(questionId) && typeof value === 'string' && value.trim()) {
    try {
      // Importar el servicio dinámicamente para evitar dependencias circulares
      const { mmseConfigService } = await import('@/services/mmseConfigService')
      
      const result = await mmseConfigService.validateAnswer({
        pregunta_id: questionId,
        respuesta: value,
        contexto: contexto
      })
      
      const validationData = result.data
      
      return {
        isValid: validationData.is_valid,
        errorMessage: validationData.message || undefined
      }
      
    } catch (error) {
      console.warn('Error validando con configuración dinámica:', error)
      // Fallback a validación básica si hay error
      return basicValidation
    }
  }

  return basicValidation
}

