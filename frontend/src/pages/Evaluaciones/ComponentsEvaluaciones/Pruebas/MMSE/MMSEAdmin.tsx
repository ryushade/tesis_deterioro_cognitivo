import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, ArrowLeft, ArrowRight, Save } from 'lucide-react'
import MMSESectionCard from './ComponentsMMSE/MMSESectionCard'
import MMSEProgress from './ComponentsMMSE/MMSEProgress'
import { mmseService } from '@/services/mmseService'
import type { CodigoAcceso } from '@/types/codigosAcceso'
import { toast } from 'react-hot-toast'
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

interface MMSEAdminProps {
  codigo: CodigoAcceso
  onClose: () => void
  onSuccess: () => void
}

export default function MMSEAdmin({ codigo, onClose, onSuccess }: MMSEAdminProps) {
  const [answers, setAnswers] = useState<Answers>(() => {
    const initialAnswers: Answers = {}
    sections.forEach(section => {
      section.questions.forEach(question => {
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

  // Crear sesión al montar
  useEffect(() => {
    const createSession = async () => {
      try {
        const resp = await mmseService.createSession(codigo.id_paciente, codigo.id_codigo)
        if (resp.success && resp.sesion_id) {
          setSessionId(resp.sesion_id)
          console.log('✅ Sesión MMSE creada:', resp.sesion_id)
        } else {
          toast.error('No se pudo crear la sesión MMSE')
        }
      } catch (error) {
        console.error('Error creando sesión:', error)
        toast.error('Error al iniciar la evaluación')
      }
    }
    createSession()
  }, [codigo])

  const handleChange = (id: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (invalid[id]) {
      setInvalid((prev) => ({ ...prev, [id]: false }))
    }
  }

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

  const handleNext = () => {
    const { valid, invalidMap } = validateStep(currentStep)
    if (!valid) {
      setInvalid(invalidMap)
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setInvalid({})
    setCurrentStep((s) => Math.min(sections.length - 1, s + 1))
  }

  const handlePrev = () => {
    setShowValidation(false)
    setInvalid({})
    setCurrentStep((s) => Math.max(0, s - 1))
  }

  const handleSubmit = async () => {
    if (!sessionId) {
      toast.error('No se ha iniciado una sesión válida')
      return
    }

    const { valid, invalidMap } = validateStep(currentStep)
    if (!valid) {
      setInvalid(invalidMap)
      setShowValidation(true)
      return
    }

    setSubmitting(true)
    try {
      await mmseService.finalize(sessionId, {
        puntuacion_total: score,
        datos_especificos: { answers, sections: sections.map(s => s.key), administered_by_professional: true }
      })
      
      toast.success('Evaluación MMSE completada exitosamente')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error finalizando test:', error)
      toast.error('Error al finalizar el test')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <div>
            <h2 className="text-2xl font-bold">Administrar MMSE</h2>
            <p className="text-sm opacity-90">
              Paciente: {codigo.nombre_paciente || `ID ${codigo.id_paciente}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <MMSEProgress currentStep={currentStep} totalSteps={sections.length} score={score} totalMax={totalMax} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
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

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Sección {currentStep + 1} de {sections.length}
          </div>

          <div className="flex gap-2">
            {currentStep < sections.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Guardando...' : 'Finalizar evaluación'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

