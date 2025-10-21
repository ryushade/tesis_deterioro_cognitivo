import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Timer as TimerIcon, Lock } from 'lucide-react'
import MMSESectionCard from './ComponentsMMSE/MMSESectionCard'
import MMSEProgress from './ComponentsMMSE/MMSEProgress'
import { mmseService } from '@/services/mmseService'
import { validateAnswer } from './mmseValidations'

type Answer = string | number | boolean | null

type Question = {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'image'
  options?: { value: string; label: string; score?: number; emoji?: string }[]
  maxScore: number
}

type Section = {
  key: string
  title: string
  description?: string
  questions: Question[]
}

const sections: Section[] = [
  {
    key: 'orientacion_tiempo',
    title: 'Orientación en el tiempo',
    description: 'Indique el año, estación, fecha, día y mes actuales.',
    questions: [
      { id: 'anio', label: 'Año', type: 'text', maxScore: 1 },
      {
        id: 'estacion',
        label: 'Estación',
        type: 'select',
        maxScore: 1,
        options: [
          { value: 'primavera', label: 'Primavera' },
          { value: 'verano', label: 'Verano' },
          { value: 'otoño', label: 'Otoño' },
          { value: 'invierno', label: 'Invierno' },
        ],
      },
      { id: 'fecha', label: 'Fecha (día del mes)', type: 'number', maxScore: 1 },
      {
        id: 'dia',
        label: 'Día de la semana',
        type: 'select',
        maxScore: 1,
        options: [
          { value: 'lunes', label: 'Lunes' },
          { value: 'martes', label: 'Martes' },
          { value: 'miercoles', label: 'Miércoles' },
          { value: 'jueves', label: 'Jueves' },
          { value: 'viernes', label: 'Viernes' },
          { value: 'sabado', label: 'Sábado' },
          { value: 'domingo', label: 'Domingo' },
        ],
      },
      {
        id: 'mes',
        label: 'Mes',
        type: 'select',
        maxScore: 1,
        options: [
          { value: 'enero', label: 'Enero' },
          { value: 'febrero', label: 'Febrero' },
          { value: 'marzo', label: 'Marzo' },
          { value: 'abril', label: 'Abril' },
          { value: 'mayo', label: 'Mayo' },
          { value: 'junio', label: 'Junio' },
          { value: 'julio', label: 'Julio' },
          { value: 'agosto', label: 'Agosto' },
          { value: 'septiembre', label: 'Septiembre' },
          { value: 'octubre', label: 'Octubre' },
          { value: 'noviembre', label: 'Noviembre' },
          { value: 'diciembre', label: 'Diciembre' },
        ],
      },
    ],
  },
  {
    key: 'orientacion_lugar',
    title: 'Orientación en el lugar',
    description: 'Indique país, provincia/estado, ciudad, establecimiento y piso/sala.',
    questions: [
      { id: 'pais', label: 'País', type: 'text', maxScore: 1 },
      { id: 'provincia', label: 'Provincia/Estado', type: 'text', maxScore: 1 },
      { id: 'ciudad', label: 'Ciudad', type: 'text', maxScore: 1 },
      { id: 'establecimiento', label: 'Establecimiento/Lugar', type: 'text', maxScore: 1 },
      { id: 'piso', label: 'Piso/Sala', type: 'text', maxScore: 1 },
    ],
  },
  {
    key: 'registro',
    title: 'Registro',
    description: 'Recuerde estas tres palabras: Casa - Mesa - Gato',
    questions: [
      { id: 'registro_casa', label: 'Repita: Casa', type: 'boolean', maxScore: 1 },
      { id: 'registro_mesa', label: 'Repita: Mesa', type: 'boolean', maxScore: 1 },
      { id: 'registro_gato', label: 'Repita: Gato', type: 'boolean', maxScore: 1 },
    ],
  },
  {
    key: 'atencion_calculo',
    title: 'Atención y cálculo',
    description: 'Reste de 7 en 7 desde 100 (cinco respuestas).',
    questions: [
      { id: '100-93', label: '100 - 7 =', type: 'number', maxScore: 1 },
      { id: '93-86', label: '93 - 7 =', type: 'number', maxScore: 1 },
      { id: '86-79', label: '86 - 7 =', type: 'number', maxScore: 1 },
      { id: '79-72', label: '79 - 7 =', type: 'number', maxScore: 1 },
      { id: '72-65', label: '72 - 7 =', type: 'number', maxScore: 1 },
    ],
  },
  {
    key: 'recuerdo',
    title: 'Recuerdo',
    description: 'Mencione las tres palabras que recordó antes (registro).',
    questions: [
      { id: 'recuerdo1', label: 'Primera palabra', type: 'text', maxScore: 1 },
      { id: 'recuerdo2', label: 'Segunda palabra', type: 'text', maxScore: 1 },
      { id: 'recuerdo3', label: 'Tercera palabra', type: 'text', maxScore: 1 },
    ],
  },
  {
    key: 'lenguaje',
    title: 'Lenguaje y órdenes',
    description: 'Responda las siguientes preguntas.',
    questions: [
      { id: 'reloj', label: 'Nombre este objeto: reloj', type: 'boolean', maxScore: 1 },
      { id: 'lapiz', label: 'Nombre este objeto: lápiz', type: 'boolean', maxScore: 1 },
      { id: 'repita', label: 'Repita: "Ni sí, ni no, ni pero"', type: 'boolean', maxScore: 1 },
      { id: 'orden3', label: 'Tome este papel con la mano derecha, dóblelo por la mitad y póngalo en el suelo', type: 'boolean', maxScore: 3 },
      { id: 'lea', label: 'Lea y haga: "Cierre los ojos"', type: 'boolean', maxScore: 1 },
      { id: 'frase', label: 'Escriba una frase completa', type: 'text', maxScore: 1 },
    ],
  },
]

type Answers = Record<string, Answer>

export default function MMSEPatient() {
  const navigate = useNavigate()
  const [showCodeInput, setShowCodeInput] = useState(true)
  
  // Inicializar answers con valores vacíos para evitar warnings de inputs controlados
  const [answers, setAnswers] = useState<Answers>(() => {
    const initialAnswers: Answers = {}
    sections.forEach(section => {
      section.questions.forEach(question => {
        // Inicializar según el tipo de pregunta
        if (question.type === 'boolean') {
          initialAnswers[question.id] = null
        } else if (question.type === 'number') {
          initialAnswers[question.id] = null
        } else {
          initialAnswers[question.id] = ''
        }
      })
    })
    return initialAnswers
  })
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [showValidation, setShowValidation] = useState(false)
  const [fontScale] = useState(1)
  const [highContrast] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [idPaciente, setIdPaciente] = useState<number | null>(null)
  const [idCodigo] = useState<number | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState(600) // 10 minutos por defecto
  const timerRef = useRef<number | null>(null)
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false)
  const [pausando, setPausando] = useState(false)
  const [sesionesDisponibles, setSesionesDisponibles] = useState<any[]>([])
  const [mostrarSeleccionSesion, setMostrarSeleccionSesion] = useState(false)

  const storageKey = useMemo(() => `mmseSession:${idPaciente ?? 'temp'}`, [idPaciente])

  const totalMax = useMemo(
    () => sections.reduce((acc, s) => acc + s.questions.reduce((a, q) => a + q.maxScore, 0), 0),
    []
  )

  const score = useMemo(() => {
    let s = 0
    for (const sec of sections) {
      for (const q of sec.questions) {
        const v = answers[q.id]
        if (q.type === 'boolean') {
          if (v === true) s += q.maxScore
        } else if (q.type === 'text') {
          if (typeof v === 'string' && v.trim().length > 0) s += 1
        } else if (q.type === 'number') {
          if (typeof v === 'number' && !Number.isNaN(v)) s += 1
        } else if (q.type === 'select') {
          if (typeof v === 'string' && v) s += 1
        }
      }
    }
    return s
  }, [answers])


  // Auto-inicializar con datos del login si ya están disponibles
  useEffect(() => {
    // Si ya estamos en una sesión activa, no hacer nada
    if (sessionId || !showCodeInput) return
    
    // Intentar obtener datos del login
    const savedCode = localStorage.getItem('accessCode')
    const userStr = localStorage.getItem('user')
    
    if (!savedCode || !userStr || hasAttemptedValidation) return
    
    try {
      const user = JSON.parse(userStr)
      const pacienteId = user.id
      
      console.log('🔑 Inicializando MMSE con datos del login:', { savedCode, pacienteId })
      
      // Marcar que ya intentamos validar
      setHasAttemptedValidation(true)
      
      // Establecer paciente directamente del token
      setIdPaciente(pacienteId)
      
      // Verificar si ya existe una sesión
      const existingSession = localStorage.getItem(`mmseSession:${pacienteId}`)
      
      if (existingSession) {
        const sid = Number(existingSession)
        console.log('📋 Sesión existente encontrada:', sid)
        mmseService.getSession(sid).then(sessionResp => {
          if (sessionResp.success && sessionResp.data) {
            setSessionId(sid)
            setShowCodeInput(false)
            console.log('✅ Sesión existente cargada')
          } else {
            // Sesión no válida, crear una nueva
            createNewSession(pacienteId, null)
          }
        }).catch(() => {
          createNewSession(pacienteId, null)
        })
      } else {
        // No hay sesión existente, crear una nueva
        console.log('🆕 Creando nueva sesión...')
        createNewSession(pacienteId, null)
      }
    } catch (error) {
      console.error('Error inicializando MMSE:', error)
      alert('Error al inicializar la prueba. Por favor, intente nuevamente.')
    }
  }, [showCodeInput, sessionId, hasAttemptedValidation])

  const verificarSesionesExistentes = async (pacienteId: number) => {
    try {
      const sesionesResp = await mmseService.getSesionesPaciente(pacienteId)
      
      if (sesionesResp.success && sesionesResp.data) {
        // Filtrar sesiones que estén en progreso o pausadas
        const sesionesActivas = sesionesResp.data.filter(
          (s: any) => s.estado_procesamiento === 'en_progreso' || s.estado_procesamiento === 'pausada'
        )
        
        if (sesionesActivas.length > 0) {
          setSesionesDisponibles(sesionesActivas)
          setMostrarSeleccionSesion(true)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error verificando sesiones existentes:', error)
      return false
    }
  }

  const cargarSesionExistente = async (sesion: any) => {
    console.log('📂 Cargando sesión existente:', sesion)
    setSessionId(sesion.id_evaluacion)
    localStorage.setItem(`mmseSession:${sesion.id_paciente}`, String(sesion.id_evaluacion))
    
    // Intentar cargar desde el servidor primero
    let datosGuardados = sesion.datos_especificos
    
    // Si no hay datos en el servidor, intentar desde localStorage
    if (!datosGuardados || !datosGuardados.answers) {
      const backupKey = `mmse_backup_${sesion.id_evaluacion}`
      const backupData = localStorage.getItem(backupKey)
      
      if (backupData) {
        try {
          const backup = JSON.parse(backupData)
          console.log('📦 Recuperando desde backup localStorage:', backup)
          datosGuardados = {
            answers: backup.answers,
            current_section: backup.currentStep,
            progress: backup.progress
          }
        } catch (e) {
          console.error('Error parseando backup:', e)
        }
      }
    }
    
    // Cargar progreso guardado
    if (datosGuardados) {
      if (datosGuardados.answers) {
        setAnswers(datosGuardados.answers)
        console.log('✅ Respuestas cargadas:', Object.keys(datosGuardados.answers).length, 'preguntas')
      }
      if (datosGuardados.current_section !== undefined) {
        setCurrentStep(datosGuardados.current_section)
        console.log('✅ Sección actual:', datosGuardados.current_section)
      }
      console.log('✅ Progreso completo cargado')
    } else {
      console.log('⚠️ No se encontró progreso guardado')
    }
    
    // Si la sesión estaba pausada, reanudarla automáticamente
    if (sesion.estado_procesamiento === 'pausada') {
      await mmseService.reanudar(sesion.id_evaluacion)
    }
    
    setMostrarSeleccionSesion(false)
    setShowCodeInput(false)
  }

  const createNewSession = async (pacienteId: number, codigoId: number | null) => {
    console.log('📝 Creando sesión MMSE para paciente:', pacienteId)
    
    // Primero verificar si ya hay sesiones activas
    const haySesionesActivas = await verificarSesionesExistentes(pacienteId)
    if (haySesionesActivas) {
      console.log('⚠️ Ya existen sesiones activas, mostrando selector')
      return
    }
    
    try {
      const createResp = await mmseService.createSession(pacienteId, codigoId)
      
      if (createResp.success && createResp.sesion_id) {
        console.log('✅ Sesión creada exitosamente:', createResp.sesion_id)
        setSessionId(createResp.sesion_id)
        localStorage.setItem(`mmseSession:${pacienteId}`, String(createResp.sesion_id))
        setShowCodeInput(false)
      } else {
        console.error('❌ Error creando sesión:', createResp.message)
        alert(createResp.message || 'No se pudo crear la sesión')
      }
    } catch (error) {
      console.error('❌ Excepción creando sesión:', error)
      alert('Error de conexión al crear la sesión')
    }
  }

  // Función para pausar la sesión
  const handlePausar = async () => {
    if (!sessionId) return
    
    setPausando(true)
    try {
      // Guardar progreso actual antes de pausar
      const datos_especificos = {
        current_section: currentStep,
        answers,
        progress: Math.round((currentStep / Math.max(1, sections.length - 1)) * 100)
      }
      await mmseService.updateProgress(sessionId, datos_especificos, score, 'en_progreso')
      
      // Pausar la sesión
      const resp = await mmseService.pausar(sessionId)
      
      if (resp.success) {
        alert('Tu progreso ha sido guardado. Puedes volver más tarde para continuar.')
        navigate('/pruebas/pausada', { replace: true })
      } else {
        alert('Error al pausar la sesión')
      }
    } catch (error) {
      console.error('Error pausando sesión:', error)
      alert('Error al pausar la sesión')
    } finally {
      setPausando(false)
    }
  }

  // Actualizar tiempo desde el backend (solo informativo, no bloqueante)
  useEffect(() => {
    if (!sessionId || showCodeInput) return

    const updateTimer = async () => {
      try {
        const resp = await mmseService.getSession(sessionId)
        if (resp.success && resp.data?.tiempo_info) {
          setTiempoRestante(resp.data.tiempo_info.tiempo_restante_segundos)
          
          // Si el tiempo se agotó, solo mostrar advertencia pero permitir continuar
          if (resp.data.tiempo_info.tiempo_restante_segundos <= 0) {
            console.warn('⏰ Tiempo de referencia agotado, pero el usuario puede continuar')
            // No auto-finalizar, solo dejar el temporizador en 0
            setTiempoRestante(0)
          }
        }
      } catch (error) {
        console.error('Error actualizando timer:', error)
      }
    }

    // Actualizar inmediatamente
    updateTimer()

    // Actualizar cada 5 segundos
    timerRef.current = window.setInterval(updateTimer, 5000) as unknown as number

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [sessionId, showCodeInput])

  // Guardar progreso periódicamente y en localStorage como backup
  useEffect(() => {
    if (!sessionId || showCodeInput) return
    
    // No guardar si no hay respuestas todavía
    const hasAnswers = Object.keys(answers).some(key => {
      const value = answers[key]
      return value !== null && value !== undefined && value !== ''
    })
    
    if (!hasAnswers) {
      console.log('⏸️ Sin respuestas aún, esperando...')
      return
    }

    const saveProgress = async () => {
      const datos_especificos = {
        current_section: currentStep,
        answers,
        progress: Math.round((currentStep / Math.max(1, sections.length - 1)) * 100)
      }
      
      console.log('💾 Guardando progreso...', { 
        currentStep, 
        score, 
        respuestas: Object.keys(answers).filter(k => {
          const v = answers[k]
          return v !== null && v !== undefined && v !== ''
        }).length,
        sessionId 
      })
      
      try {
        // Guardar en base de datos
        await mmseService.updateProgress(sessionId, datos_especificos, score, 'en_progreso')
        console.log('✅ Progreso guardado en servidor')
        
        // Guardar también en localStorage como backup
        const backupData = {
          sessionId,
          currentStep,
          answers,
          score,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(`mmse_backup_${sessionId}`, JSON.stringify(backupData))
        console.log('✅ Backup guardado en localStorage')
      } catch (error) {
        console.error('❌ Error guardando progreso:', error)
      }
    }

    const saveTimer = setTimeout(saveProgress, 2000)
    return () => clearTimeout(saveTimer)
  }, [sessionId, currentStep, answers, score, showCodeInput])

  // Guardar progreso cuando se cierra la ventana
  useEffect(() => {
    if (!sessionId || showCodeInput) return

    const handleBeforeUnload = async () => {
      const datos_especificos = {
        current_section: currentStep,
        answers,
        progress: Math.round((currentStep / Math.max(1, sections.length - 1)) * 100)
      }
      
      console.log('🚪 Guardando progreso antes de cerrar...')
      
      // Guardar en localStorage inmediatamente (síncrono)
      const backupData = {
        sessionId,
        currentStep,
        answers,
        score,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`mmse_backup_${sessionId}`, JSON.stringify(backupData))
      
      // Intentar guardar en servidor (puede no completarse a tiempo)
      try {
        // Usar sendBeacon para envío garantizado
        const data = {
          datos_especificos,
          puntuacion_total: score,
          estado_procesamiento: 'en_progreso'
        }
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
        const url = `/api/mmse/sesiones/${sessionId}/progreso`
        
        // sendBeacon es más confiable que fetch al cerrar
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, blob)
        } else {
          // Fallback para navegadores antiguos
          mmseService.updateProgress(sessionId, datos_especificos, score, 'en_progreso')
        }
      } catch (error) {
        console.error('Error en beforeunload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionId, currentStep, answers, score, showCodeInput])

  const handleChange = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (invalid[id]) {
      setInvalid((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Auto-avanzar a la siguiente sección cuando se completen todos los campos
  useEffect(() => {
    // No hacer nada si estamos en la última sección o mostrando el input de código
    if (currentStep >= sections.length - 1 || showCodeInput || !sessionId) return

    // Validar la sección actual
    const sec = sections[currentStep]
    const allFieldsComplete = sec.questions.every((q) => {
      const v = answers[q.id]
      return isValueValid(q.id, q.type, v)
    })
    
    console.log('Auto-avance check:', {
      currentStep,
      section: sec.key,
      allFieldsComplete,
      answers: sec.questions.map(q => ({ id: q.id, value: answers[q.id], valid: isValueValid(q.id, q.type, answers[q.id]) }))
    })
    
    // Si todos los campos están completos, avanzar automáticamente después de un delay
    if (allFieldsComplete) {
      console.log('✅ Todos los campos completos, avanzando en 800ms...')
      const timer = setTimeout(() => {
        setShowValidation(false)
        setInvalid({})
        setCurrentStep((s) => Math.min(sections.length - 1, s + 1))
        console.log('⏭️ Avanzando a la siguiente sección')
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [answers, currentStep, showCodeInput, sessionId])

  const isValueValid = (questionId: string, type: Question['type'], value: Answer) => {
    // Usar la validación robusta del sistema
    const validation = validateAnswer(questionId, value, type)
    return validation.isValid
  }

  const validateStep = (stepIndex: number): { valid: boolean; invalidMap: Record<string, boolean> } => {
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!sessionId) return
    
    setSubmitting(true)
    try {
      console.log('🏁 Finalizando test MMSE...')
      await mmseService.finalize(sessionId, {
        puntuacion_total: score,
        datos_especificos: { answers, sections: sections.map(s => s.key) }
      })
      
      // Limpiar almacenamiento local
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`mmse_backup_${sessionId}`)
      console.log('🧹 Limpieza de almacenamiento completada')
      
      navigate('/pruebas/finalizado', { replace: true })
    } catch (error) {
      console.error('Error finalizando test:', error)
      alert('Error al finalizar el test')
    } finally {
      setSubmitting(false)
    }
  }

 

  // Pantalla de selección de sesión existente
  if (mostrarSeleccionSesion) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Sesiones MMSE pendientes</h2>
          <p className="text-gray-600 mb-6">
            Tienes sesiones MMSE sin completar. ¿Deseas continuar una sesión existente o iniciar una nueva?
          </p>
          
          <div className="space-y-4 mb-6">
            {sesionesDisponibles.map((sesion) => (
              <div
                key={sesion.id_evaluacion}
                className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => cargarSesionExistente(sesion)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">
                      Sesión del {new Date(sesion.fecha_evaluacion).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estado: {sesion.estado_procesamiento === 'pausada' ? 'Pausada' : 'En progreso'} • 
                      Puntuación actual: {sesion.puntuacion_total || 0} / {sesion.puntuacion_maxima}
                    </p>
                    {sesion.datos_especificos?.progress && (
                      <p className="text-sm text-blue-600">
                        Progreso: {sesion.datos_especificos.progress}%
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">Continuar</Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setMostrarSeleccionSesion(false)
                setSesionesDisponibles([])
                // Permitir crear nueva sesión
                if (idPaciente) {
                  mmseService.createSession(idPaciente, idCodigo).then(createResp => {
                    if (createResp.success && createResp.sesion_id) {
                      setSessionId(createResp.sesion_id)
                      localStorage.setItem(`mmseSession:${idPaciente}`, String(createResp.sesion_id))
                      setShowCodeInput(false)
                    }
                  })
                }
              }}
              className="flex-1"
            >
              Iniciar nueva sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla del test
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-blue-900">Prueba neuropsicológica MMSE</h1>
          <div className="flex items-center gap-3">
            {/* Botón de pausar */}
            <Button
              variant="outline"
              onClick={handlePausar}
              disabled={pausando}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {pausando ? 'Guardando...' : 'Pausar y guardar'}
            </Button>
            
            {/* Temporizador informativo */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              tiempoRestante <= 0 ? 'bg-gray-100 border-gray-300' :
              tiempoRestante <= 120 ? 'bg-orange-50 border-orange-300' : 
              tiempoRestante <= 300 ? 'bg-yellow-50 border-yellow-300' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <TimerIcon className={`w-5 h-5 ${
                tiempoRestante <= 0 ? 'text-gray-500' :
                tiempoRestante <= 120 ? 'text-orange-600' : 
                tiempoRestante <= 300 ? 'text-yellow-600' : 
                'text-blue-600'
              }`} />
              <span className={`text-lg font-semibold ${
                tiempoRestante <= 0 ? 'text-gray-700' :
                tiempoRestante <= 120 ? 'text-orange-900' : 
                tiempoRestante <= 300 ? 'text-yellow-900' : 
                'text-blue-900'
              }`}>
                {tiempoRestante <= 0 ? 'Sin límite' : formatTime(tiempoRestante)}
              </span>
            </div>
          </div>
        </div>
        {tiempoRestante <= 0 && (
          <p className="text-sm text-gray-600 italic">
            ℹ️ El tiempo de referencia ha finalizado, pero puedes continuar a tu ritmo.
          </p>
        )}
      </header>

      <MMSEProgress currentStep={currentStep} totalSteps={sections.length} score={score} totalMax={totalMax} />

      <div className="grid gap-4">
        {(() => {
          const sec = sections[currentStep]
          const invalidMap = showValidation ? invalid : {}
            return (
              <MMSESectionCard
                section={sec}
                answers={answers}
                onChange={handleChange}
                invalid={invalidMap}
                fontScale={fontScale}
                highContrast={highContrast}
              />
            )
        })()}
      </div>
      

      <div className="flex items-center justify-end gap-3">
        {currentStep < sections.length - 1 ? (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            
          </div>
        ) : (
          <Button
            style={{ display: 'none' }}
            onClick={() => {
              const { valid, invalidMap } = validateStep(currentStep)
              if (!valid) {
                setInvalid(invalidMap)
                setShowValidation(true)
                return
              }
              handleSubmit()
            }}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar respuestas'}
          </Button>
        )}
      </div>
    </div>
  )
}
