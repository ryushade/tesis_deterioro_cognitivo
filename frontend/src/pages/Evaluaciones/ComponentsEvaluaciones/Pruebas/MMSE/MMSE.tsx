import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Contrast, Minus, Plus } from 'lucide-react'
import MMSESectionCard from './components/MMSESectionCard'
import MMSEProgress from './components/MMSEProgress'

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
      { id: 'estacion', label: 'Estación', type: 'select', maxScore: 1, options: [
        { value: 'primavera', label: 'Primavera' },
        { value: 'verano', label: 'Verano' },
        { value: 'otoño', label: 'Otoño' },
        { value: 'invierno', label: 'Invierno' },
      ]},
      { id: 'fecha', label: 'Fecha (día del mes)', type: 'number', maxScore: 1 },
      { id: 'dia', label: 'Día de la semana', type: 'select', maxScore: 1, options: [
        { value: 'lunes', label: 'Lunes' },
        { value: 'martes', label: 'Martes' },
        { value: 'miercoles', label: 'Miércoles' },
        { value: 'jueves', label: 'Jueves' },
        { value: 'viernes', label: 'Viernes' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' },
      ]},
      { id: 'mes', label: 'Mes', type: 'select', maxScore: 1, options: [
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
      ]},
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
    description: 'Repita las tres palabras que le diga el evaluador. (P. ej.: “Casa – Mesa – Gato”)',
    questions: [
      { id: 'palabra1', label: 'Palabra 1', type: 'text', maxScore: 1 },
      { id: 'palabra2', label: 'Palabra 2', type: 'text', maxScore: 1 },
      { id: 'palabra3', label: 'Palabra 3', type: 'text', maxScore: 1 },
    ],
  },
  {
    key: 'atencion_calculo',
    title: 'Atención y cálculo',
    description: 'Reste de 7 en 7 desde 100 (cinco respuestas) o deletree “MUNDO” al revés.',
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
      { id: 'repita', label: 'Repita: “Ni sí, ni no, ni pero”', type: 'boolean', maxScore: 1 },
      { id: 'orden3', label: 'Tome este papel con la mano derecha, dóblelo por la mitad y póngalo en el suelo', type: 'boolean', maxScore: 3 },
      { id: 'lea', label: 'Lea y haga: “Cierre los ojos”', type: 'boolean', maxScore: 1 },
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
          if (typeof v === 'string' && v.trim().length > 0) s += 1 // marcador simple
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

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Aquí podrías llamar a tu API para registrar las respuestas
      // await api.post('/mmse/responder', { answers, score })
      console.log('MMSE submit', { answers, score })
      alert('Respuestas enviadas. Puntaje preliminar: ' + score + ' / ' + totalMax)
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
        <h1 className="text-3xl font-extrabold text-blue-900">MMSE — Cuestionario para el paciente</h1>
        <p className="text-base text-gray-700">Responda a cada pregunta según se le solicite. Algunas tareas requieren ejecutar acciones simples.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFontScale((v) => Math.max(1, Math.round((v - 0.1) * 10) / 10))}
            aria-label="Reducir tamaño de texto"
          >
            <Minus className="w-4 h-4" /> A-
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFontScale((v) => Math.min(1.6, Math.round((v + 0.1) * 10) / 10))}
            aria-label="Aumentar tamaño de texto"
          >
            <Plus className="w-4 h-4" /> A+
          </Button>
          <Button
            type="button"
            variant={highContrast ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHighContrast((v) => !v)}
            aria-pressed={highContrast}
            aria-label="Alternar alto contraste"
          >
            <Contrast className="w-4 h-4 mr-1" /> Alto contraste
          </Button>
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

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0}>
          Anterior
        </Button>
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
            {submitting ? 'Enviando…' : 'Enviar respuestas'}
          </Button>
        )}
      </div>

      {false && (<div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Puntaje preliminar: <span className="font-semibold">{score}</span> / {totalMax}</div>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar respuestas'}
        </Button>
      </div>)}
    </div>
  )
}
