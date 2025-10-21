import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import type { MMSEConfiguracion } from '@/services/mmseConfigService'

interface MMSEConfigTableProps {
  configuraciones: MMSEConfiguracion[]
  onEdit: (config: MMSEConfiguracion) => void
  onDelete: (id: number) => void
}

export default function MMSEConfigTable({ 
  configuraciones, 
  onEdit, 
  onDelete 
}: MMSEConfigTableProps) {
  const getTipoValidacionLabel = (tipo: string) => {
    const labels = {
      'exacta': 'Exacta',
      'parcial': 'Parcial',
      'fuzzy': 'Fuzzy'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getTipoValidacionColor = (tipo: string) => {
    const colors = {
      'exacta': 'bg-green-100 text-green-800',
      'parcial': 'bg-blue-100 text-blue-800',
      'fuzzy': 'bg-orange-100 text-orange-800'
    }
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuraciones de Respuestas ({configuraciones.length})</CardTitle>
        <CardDescription>
          Lista de todas las respuestas correctas configuradas para el MMSE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pregunta</TableHead>
                <TableHead>Respuesta Correcta</TableHead>
                <TableHead>Contexto</TableHead>
                <TableHead>Tipo Validación</TableHead>
                <TableHead>Tolerancia</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configuraciones.map((config) => (
                <TableRow key={config.id_configuracion}>
                  <TableCell className="font-medium">{config.pregunta_id}</TableCell>
                  <TableCell>{config.respuesta_correcta}</TableCell>
                  <TableCell>{config.contexto || 'General'}</TableCell>
                  <TableCell>
                    <Badge className={getTipoValidacionColor(config.tipo_validacion)}>
                      {getTipoValidacionLabel(config.tipo_validacion)}
                    </Badge>
                  </TableCell>
                  <TableCell>{config.tolerancia_errores}</TableCell>
                  <TableCell>{config.puntuacion}</TableCell>
                  <TableCell>
                    <Badge variant={config.es_activa ? 'default' : 'secondary'}>
                      {config.es_activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>{config.orden}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(config)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(config.id_configuracion)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
