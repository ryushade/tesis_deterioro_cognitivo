import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Timer as TimerIcon, Lock } from 'lucide-react'
import MMSESectionCard from './components/MMSESectionCard'
import MMSEProgress from './components/MMSEProgress'
import { mmseService } from '@/services/mmseService'

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
  const [codigo, setCodigo] = useState('')
  const [codigoError, setCodigoError] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)
  
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [showValidation, setShowValidation] = useState(false)
  const [fontScale] = useState(1)
  const [highContrast] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [idPaciente, setIdPaciente] = useState<number | null>(null)
  const [idCodigo, setIdCodigo] = useState<number | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState(600) // 10 minutos por defecto
  const timerRef = useRef<number | null>(null)

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

  // Validar código de acceso
  const handleValidateCode = async () => {
    if (!codigo.trim()) {
      setCodigoError('Por favor ingrese un código de acceso')
      return
    }

    setValidatingCode(true)
    setCodigoError('')

    try {
      const response = await mmseService.validarCodigo(codigo.trim())
      
      if (!response.success || !response.data) {
        setCodigoError(response.message || 'Código inválido')
        setValidatingCode(false)
        return
      }

      const codigoData = response.data
      setIdPaciente(codigoData.id_paciente)
      setIdCodigo(codigoData.id_codigo)
      
      // Verificar si hay una sesión guardada en localStorage
      const existingSession = localStorage.getItem(`mmseSession:${codigoData.id_paciente}`)
      
      if (existingSession) {
        // Recuperar sesión existente
        const sid = Number(existingSession)
        const sessionResp = await mmseService.getSession(sid)
        
        if (sessionResp.success && sessionResp.data) {
          setSessionId(sid)
          // Cargar progreso guardado si existe en datos_especificos
          setShowCodeInput(false)
        } else {
          // La sesión no existe, crear una nueva
          await createNewSession(codigoData.id_paciente, codigoData.id_codigo)
        }
      } else {
        // Crear nueva sesión
        await createNewSession(codigoData.id_paciente, codigoData.id_codigo)
      }
    } catch (error) {
      console.error('Error validando código:', error)
      setCodigoError('Error al validar el código')
    } finally {
      setValidatingCode(false)
    }
  }

  const createNewSession = async (pacienteId: number, codigoId: number) => {
    const createResp = await mmseService.createSession(pacienteId, codigoId)
    
    if (createResp.success && createResp.sesion_id) {
      setSessionId(createResp.sesion_id)
      localStorage.setItem(`mmseSession:${pacienteId}`, String(createResp.sesion_id))
      setShowCodeInput(false)
    } else {
      setCodigoError(createResp.message || 'No se pudo crear la sesión')
    }
  }

  // Actualizar tiempo desde el backend
  useEffect(() => {
    if (!sessionId || showCodeInput) return

    const updateTimer = async () => {
      try {
        const resp = await mmseService.getSession(sessionId)
        if (resp.success && resp.data?.tiempo_info) {
          setTiempoRestante(resp.data.tiempo_info.tiempo_restante_segundos)
          
          // Si el tiempo se agotó
          if (resp.data.tiempo_info.tiempo_restante_segundos <= 0) {
            if (timerRef.current) window.clearInterval(timerRef.current)
            // Auto finalizar o mostrar mensaje
            alert('El tiempo ha terminado')
            await handleSubmit()
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

  // Guardar progreso periódicamente
  useEffect(() => {
    if (!sessionId || showCodeInput) return

    const saveProgress = async () => {
      const progreso = Math.round((currentStep / Math.max(1, sections.length - 1)) * 100)
      try {
        await mmseService.updateProgress(sessionId, progreso, 'en_progreso')
      } catch (error) {
        console.error('Error guardando progreso:', error)
      }
    }

    const saveTimer = setTimeout(saveProgress, 2000)
    return () => clearTimeout(saveTimer)
  }, [sessionId, currentStep, showCodeInput])

  const handleChange = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (invalid[id]) {
      setInvalid((prev) => ({ ...prev, [id]: false }))
    }
  }

  const isValueValid = (type: Question['type'], value: Answer) => {
    switch (type) {
      case 'boolean':
        return typeof value === 'boolean'
      case 'text':
        return typeof value === 'string' && value.trim().length > 0
      case 'number':
        return typeof value === 'number' && Number.isFinite(value)
      case 'select':
        return typeof value === 'string' && value.length > 0
      case 'image':
        return typeof value === 'string' && value.length > 0
      default:
        return false
    }
  }

  const validateStep = (stepIndex: number): { valid: boolean; invalidMap: Record<string, boolean> } => {
    const sec = sections[stepIndex]
    const invalidMap: Record<string, boolean> = {}
    for (const q of sec.questions) {
      const v = answers[q.id]
      if (!isValueValid(q.type, v)) {
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
      await mmseService.finalize(sessionId, {
        puntuacion_total: score,
        datos_especificos: { answers, sections: sections.map(s => s.key) }
      })
      localStorage.removeItem(storageKey)
      navigate('/pruebas/finalizado', { replace: true })
    } catch (error) {
      console.error('Error finalizando test:', error)
      alert('Error al finalizar el test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSpeak = (text: string) => {
    try {
      const s = window.speechSynthesis
      if (!s) return
      s.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'es-ES'
      s.speak(utter)
    } catch {}
  }

 

  // Pantalla del test
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-blue-900">Prueba neuropsicológica MMSE</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            tiempoRestante <= 120 ? 'bg-red-50 border-red-300' : 
            tiempoRestante <= 300 ? 'bg-yellow-50 border-yellow-300' : 
            'bg-blue-50 border-blue-200'
          }`}>
            <TimerIcon className={`w-5 h-5 ${
              tiempoRestante <= 120 ? 'text-red-600' : 
              tiempoRestante <= 300 ? 'text-yellow-600' : 
              'text-blue-600'
            }`} />
            <span className={`text-lg font-semibold ${
              tiempoRestante <= 120 ? 'text-red-900' : 
              tiempoRestante <= 300 ? 'text-yellow-900' : 
              'text-blue-900'
            }`}>{formatTime(tiempoRestante)}</span>
          </div>
        </div>
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
              onSpeak={handleSpeak}
            />
          )
        })()}
      </div>

      <div className="flex items-center justify-end gap-3">
        {currentStep < sections.length - 1 ? (
          <Button
            type="button"
            onClick={() => {
              const { valid, invalidMap } = validateStep(currentStep)
              if (!valid) {
                setInvalid(invalidMap)
                setShowValidation(true)
                return
              }
              setShowValidation(false)
              setInvalid({})
              setCurrentStep((s) => Math.min(sections.length - 1, s + 1))
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
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
