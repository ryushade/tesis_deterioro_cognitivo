import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Contrast, Minus, Plus, Timer as TimerIcon } from 'lucide-react'
import MMSESectionCard from './components/MMSESectionCard'
import MMSEProgress from './components/MMSEProgress'
import { mmseService } from '@/services/mmseService'

type Answer = string | number | boolean | null

type Question = {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean'
  options?: { value: string; label: string; score?: number }[]
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
    description: 'Seleccione las im�genes correctas para las palabras: Casa - Mesa - Gato',
    questions: [
      {
        id: 'palabra1',
        label: 'Seleccione "Casa"',
        type: 'image',
        maxScore: 1,
        options: [
          { value: 'casa', label: 'Casa', emoji: '??' },
          { value: 'coche', label: 'Coche', emoji: '??' },
          { value: 'arbol', label: '�rbol', emoji: '??' }
        ]
      },
      {
        id: 'palabra2',
        label: 'Seleccione "Mesa"',
        type: 'image',
        maxScore: 1,
        options: [
          { value: 'mesa', label: 'Mesa', emoji: '???' },
          { value: 'silla', label: 'Silla', emoji: '??' },
          { value: 'cama', label: 'Cama', emoji: '???' }
        ]
      },
      {
        id: 'palabra3',
        label: 'Seleccione "Gato"',
        type: 'image',
        maxScore: 1,
        options: [
          { value: 'gato', label: 'Gato', emoji: '??' },
          { value: 'perro', label: 'Perro', emoji: '??' },
          { value: 'pajaro', label: 'P�jaro', emoji: '??' }
        ]
      }
    ],
  },
  {
    key: 'atencion_calculo',
    title: 'Atención y cálculo',
    description: 'Reste de 7 en 7 desde 100 (cinco respuestas) o deletree "MUNDO" al revés.',
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
      { id: 'recuerdo1', label: 'Recuerdo 1', type: 'text', maxScore: 1 },
      { id: 'recuerdo2', label: 'Recuerdo 2', type: 'text', maxScore: 1 },
      { id: 'recuerdo3', label: 'Recuerdo 3', type: 'text', maxScore: 1 },
    ],
  },
  {
    key: 'lenguaje',
    title: 'Lenguaje y órdenes',
    description: 'Nombre objetos, repita una frase, cumpla una orden de 3 pasos, lea y haga, escriba una frase.',
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
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [showValidation, setShowValidation] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [highContrast, setHighContrast] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const saveTimer = useRef<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(600) // 10 minutos en segundos
  const timerRef = useRef<number | null>(null)

  const patientId = useMemo(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const v = Number(sp.get('id_paciente') || sp.get('paciente_id'))
      return Number.isFinite(v) && v > 0 ? v : null
    } catch {
      return null
    }
  }, [])

  const storageKey = useMemo(() => `mmseSession:${patientId ?? 'global'}`, [patientId])

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

  const handleChange = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (invalid[id]) {
      setInvalid((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Cargar o crear sesión
  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      try {
        const existing = localStorage.getItem(storageKey)
        if (existing) {
          const sid = Number(existing)
          setSessionId(sid)
          const resp = await mmseService.getSession(sid)
          if (!cancelled && resp.success && resp.data?.datos_especificos) {
            const datos = resp.data.datos_especificos
            if (datos.answers) setAnswers(datos.answers)
            if (typeof datos.current_section === 'number') setCurrentStep(datos.current_section)
          }
          return
        }
        const create = await mmseService.createSession(patientId ?? 0, { current_section: 0, answers: {}, progress: 0 })
        if (!cancelled && create.success && create.sesion_id) {
          setSessionId(create.sesion_id)
          localStorage.setItem(storageKey, String(create.sesion_id))
        }
      } catch {}
    }
    boot()
    return () => { cancelled = true }
  }, [storageKey, patientId])

  // Autosave con debounce
  useEffect(() => {
    if (!sessionId) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      mmseService.updateProgress(sessionId, {
        datos_especificos: {
          current_section: currentStep,
          answers,
          progress: Math.round((currentStep / Math.max(1, sections.length - 1)) * 100),
        },
        puntuacion_total: score,
        estado_procesamiento: 'en_progreso',
      }).catch(() => {})
    }, 700) as unknown as number
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [answers, currentStep, score, sessionId])

  // Timer contador regresivo desde 10 minutos
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsedTime((prev) => {
        if (prev <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

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
    setSubmitting(true)
    try {
      if (sessionId) {
        await mmseService.finalize(sessionId, { puntuacion_total: score })
        localStorage.removeItem(storageKey)
      }
      navigate('/pruebas/finalizado', { replace: true })
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-blue-900 mt-6">Prueba neuropsicológica MMSE </h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            elapsedTime <= 120 ? 'bg-red-50 border-red-300' : 
            elapsedTime <= 300 ? 'bg-yellow-50 border-yellow-300' : 
            'bg-blue-50 border-blue-200'
          }`}>
            <TimerIcon className={`w-5 h-5 ${
              elapsedTime <= 120 ? 'text-red-600' : 
              elapsedTime <= 300 ? 'text-yellow-600' : 
              'text-blue-600'
            }`} />
            <span className={`text-lg font-semibold ${
              elapsedTime <= 120 ? 'text-red-900' : 
              elapsedTime <= 300 ? 'text-yellow-900' : 
              'text-blue-900'
            }`}>{formatTime(elapsedTime)}</span>
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




