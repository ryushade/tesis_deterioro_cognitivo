import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-blue-900">MMSE – Cuestionario para el paciente</h1>
        <p className="text-sm text-gray-600">Responda a cada pregunta según se le solicite. Algunas tareas requieren ejecutar acciones simples.</p>
      </header>

      <div className="grid gap-4">
        {sections.map((sec) => (
          <Card key={sec.key}>
            <CardHeader>
              <CardTitle className="text-base">{sec.title}</CardTitle>
              {sec.description && <p className="text-xs text-gray-500">{sec.description}</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              {sec.questions.map((q) => (
                <div key={q.id} className="grid gap-1">
                  <label className="text-sm font-medium text-gray-800" htmlFor={q.id}>{q.label}</label>
                  {q.type === 'text' && (
                    <Input id={q.id} value={(answers[q.id] as string) || ''} onChange={(e) => handleChange(q.id, e.target.value)} />
                  )}
                  {q.type === 'number' && (
                    <Input id={q.id} type="number" value={answers[q.id] as number | undefined} onChange={(e) => handleChange(q.id, Number(e.target.value))} />
                  )}
                  {q.type === 'select' && (
                    <Select value={(answers[q.id] as string) || ''} onValueChange={(v) => handleChange(q.id, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {q.type === 'boolean' && (
                    <div className="flex gap-2">
                      <Button type="button" variant={(answers[q.id] as boolean) === true ? 'default' : 'outline'} onClick={() => handleChange(q.id, true)}>Cumple</Button>
                      <Button type="button" variant={(answers[q.id] as boolean) === false ? 'default' : 'outline'} onClick={() => handleChange(q.id, false)}>No cumple</Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Puntaje preliminar: <span className="font-semibold">{score}</span> / {totalMax}</div>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar respuestas'}
        </Button>
      </div>
    </div>
  )
}
