import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Volume2 } from 'lucide-react'

type Answer = string | number | boolean | null

type Question = {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'image'
  options?: { value: string; label: string; score?: number; image?: string; emoji?: string }[]
  maxScore: number
}

type Section = {
  key: string
  title: string
  description?: string
  questions: Question[]
}

export default function MMSESectionCard({
  section,
  answers,
  onChange,
  invalid = {},
  fontScale = 1,
  highContrast = false,
  onSpeak,
}: {
  section: Section
  answers: Record<string, Answer>
  onChange: (id: string, value: Answer) => void
  invalid?: Record<string, boolean>
  fontScale?: number
  highContrast?: boolean
  onSpeak?: (text: string) => void
}) {
  const big = fontScale > 1.05
  const cardClasses = highContrast ? 'border-2 border-black shadow-none' : ''
  const inputSize = big ? 'h-12 text-lg' : ''
  const selectSize = big ? 'h-12 text-lg' : ''
  const buttonSize = big ? 'h-11 text-base' : ''
  const labelSize = big ? 'text-base' : 'text-sm'

  return (
    <Card key={section.key} className={cardClasses} style={{ fontSize: `${Math.round(fontScale * 100)}%` }}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
       
        </div>
        {section.description && <p className="text-xs text-gray-600">{section.description}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {section.questions.map((q) => {
          const isInvalid = !!invalid[q.id]
          return (
            <div key={q.id} className="grid gap-1">
              <label className={`${labelSize} font-medium text-gray-800`} htmlFor={q.id}>{q.label}</label>
              {q.type === 'text' && (
                <Input
                  id={q.id}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className={`${inputSize} ${isInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  aria-invalid={isInvalid}
                />
              )}
              {q.type === 'number' && (
                <Input
                  id={q.id}
                  type="number"
                  value={typeof answers[q.id] === 'number' ? (answers[q.id] as number) : undefined}
                  onChange={(e) => onChange(q.id, e.target.value === '' ? null : Number(e.target.value))}
                  className={`${inputSize} ${isInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  aria-invalid={isInvalid}
                />
              )}
              {q.type === 'select' && (
                <Select value={(answers[q.id] as string) || ''} onValueChange={(v) => onChange(q.id, v)}>
                  <SelectTrigger className={`w-full ${selectSize} ${isInvalid ? 'border-red-500' : ''}`} aria-invalid={isInvalid}>
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
                  <Button type="button" className={buttonSize} variant={(answers[q.id] as boolean) === true ? 'default' : 'outline'} onClick={() => onChange(q.id, true)}>Cumple</Button>
                  <Button type="button" className={buttonSize} variant={(answers[q.id] as boolean) === false ? 'default' : 'outline'} onClick={() => onChange(q.id, false)}>No cumple</Button>
                </div>
              )}
              {q.type === 'image' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {q.options?.map((opt) => {
                    const selected = (answers[q.id] as string) === opt.value
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => onChange(q.id, opt.value)}
                        className={`relative rounded-lg border p-2 flex flex-col items-center justify-center hover:shadow-md transition ${selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
                        aria-pressed={selected}
                      >
                        {opt.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={opt.image} alt={opt.label} className="h-16 w-16 object-contain" />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center text-4xl">{opt.emoji ?? '🔷'}</div>
                        )}
                        <span className="mt-2 text-xs font-medium text-gray-800">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {isInvalid && (
                <span className="text-xs text-red-600">Campo obligatorio</span>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
