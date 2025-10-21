import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MMSEConfiguracion, CreateConfiguracionRequest } from '@/services/mmseConfigService'

// Simple Switch component
interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Switch = ({ checked = false, onCheckedChange, disabled = false, id, className }: SwitchProps) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      id={id}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${className || ''}`}
      onClick={handleClick}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

interface MMSEConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateConfiguracionRequest) => void
  editingConfig: MMSEConfiguracion | null
  preguntasDisponibles: string[]
  contextosDisponibles: string[]
}

export default function MMSEConfigModal({
  isOpen,
  onClose,
  onSave,
  editingConfig,
  preguntasDisponibles,
  contextosDisponibles
}: MMSEConfigModalProps) {
  const [formData, setFormData] = useState<CreateConfiguracionRequest>({
    pregunta_id: '',
    respuesta_correcta: '',
    contexto: 'general',
    tipo_validacion: 'exacta',
    tolerancia_errores: 0,
    puntuacion: 1.0,
    es_activa: true,
    orden: 1
  })

  // Actualizar formData cuando cambie editingConfig
  useEffect(() => {
    if (editingConfig) {
      setFormData({
        pregunta_id: editingConfig.pregunta_id,
        respuesta_correcta: editingConfig.respuesta_correcta,
        contexto: editingConfig.contexto || 'general',
        tipo_validacion: editingConfig.tipo_validacion,
        tolerancia_errores: editingConfig.tolerancia_errores,
        puntuacion: editingConfig.puntuacion,
        es_activa: editingConfig.es_activa,
        orden: editingConfig.orden
      })
    } else {
      setFormData({
        pregunta_id: '',
        respuesta_correcta: '',
        contexto: 'general',
        tipo_validacion: 'exacta',
        tolerancia_errores: 0,
        puntuacion: 1.0,
        es_activa: true,
        orden: 1
      })
    }
  }, [editingConfig])

  const handleSave = () => {
    // Preparar datos para envío
    const dataToSave = {
      ...formData,
      contexto: formData.contexto === 'general' ? '' : formData.contexto
    }
    
    onSave(dataToSave)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
          </CardTitle>
          <CardDescription>
            {editingConfig 
              ? 'Modifica los valores de la configuración existente' 
              : 'Agrega una nueva respuesta correcta para el MMSE'
            }
          </CardDescription>
        </CardHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div>
            <Label htmlFor="pregunta_id">Pregunta *</Label>
            <Select 
              value={formData.pregunta_id} 
              onValueChange={(value) => setFormData({...formData, pregunta_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar pregunta" />
              </SelectTrigger>
              <SelectContent>
                {preguntasDisponibles.map(pregunta => (
                  <SelectItem key={pregunta} value={pregunta}>
                    {pregunta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="contexto">Contexto</Label>
            <Select 
              value={formData.contexto} 
              onValueChange={(value) => setFormData({...formData, contexto: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="General" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                {contextosDisponibles.map(contexto => (
                  <SelectItem key={contexto} value={contexto}>
                    {contexto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="respuesta_correcta">Respuesta Correcta *</Label>
            <Input
              id="respuesta_correcta"
              value={formData.respuesta_correcta}
              onChange={(e) => setFormData({...formData, respuesta_correcta: e.target.value})}
              placeholder="Ej: Hospital General"
            />
          </div>
          
          <div>
            <Label htmlFor="tipo_validacion">Tipo de Validación</Label>
            <Select 
              value={formData.tipo_validacion} 
              onValueChange={(value: 'exacta' | 'parcial' | 'fuzzy') => 
                setFormData({...formData, tipo_validacion: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exacta">Exacta</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="fuzzy">Fuzzy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tolerancia_errores">Tolerancia a Errores</Label>
            <Input
              id="tolerancia_errores"
              type="number"
              min="0"
              max="3"
              value={formData.tolerancia_errores}
              onChange={(e) => setFormData({...formData, tolerancia_errores: parseInt(e.target.value) || 0})}
            />
          </div>
          
          <div>
            <Label htmlFor="puntuacion">Puntuación</Label>
            <Input
              id="puntuacion"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.puntuacion}
              onChange={(e) => setFormData({...formData, puntuacion: parseFloat(e.target.value) || 1.0})}
            />
          </div>
          
          <div>
            <Label htmlFor="orden">Orden</Label>
            <Input
              id="orden"
              type="number"
              min="1"
              value={formData.orden}
              onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value) || 1})}
            />
          </div>
          
          <div className="md:col-span-2 flex items-center space-x-2">
            <Switch
              id="es_activa"
              checked={formData.es_activa}
              onCheckedChange={(checked: boolean) => setFormData({...formData, es_activa: checked})}
            />
            <Label htmlFor="es_activa">Configuración activa</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.pregunta_id || !formData.respuesta_correcta}>
            {editingConfig ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
