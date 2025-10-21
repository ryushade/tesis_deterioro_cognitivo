import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface MMSEConfigFiltersProps {
  filtroPregunta: string
  setFiltroPregunta: (value: string) => void
  filtroContexto: string
  setFiltroContexto: (value: string) => void
  preguntasDisponibles: string[]
  contextosDisponibles: string[]
}

export default function MMSEConfigFilters({
  filtroPregunta,
  setFiltroPregunta,
  filtroContexto,
  setFiltroContexto,
  preguntasDisponibles,
  contextosDisponibles
}: MMSEConfigFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filtro-pregunta">Pregunta</Label>
            <Select value={filtroPregunta} onValueChange={setFiltroPregunta}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las preguntas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las preguntas</SelectItem>
                {preguntasDisponibles.map(pregunta => (
                  <SelectItem key={pregunta} value={pregunta}>
                    {pregunta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filtro-contexto">Contexto</Label>
            <Select value={filtroContexto} onValueChange={setFiltroContexto}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los contextos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los contextos</SelectItem>
                {contextosDisponibles.map(contexto => (
                  <SelectItem key={contexto} value={contexto}>
                    {contexto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
