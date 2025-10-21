import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { mmseConfigService, type MMSEConfiguracion, type CreateConfiguracionRequest } from '@/services/mmseConfigService'
import MMSEConfigFilters from './components/MMSEConfigFilters'
import MMSEConfigTable from './components/MMSEConfigTable'
import MMSEConfigModal from './components/MMSEConfigModal'

export default function MMSEConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<MMSEConfiguracion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Filtros
  const [filtroPregunta, setFiltroPregunta] = useState<string>('all')
  const [filtroContexto, setFiltroContexto] = useState<string>('all')
  
  // Modal de creación/edición
  const [modalOpen, setModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<MMSEConfiguracion | null>(null)
  
  // Listas de opciones
  const [preguntasDisponibles, setPreguntasDisponibles] = useState<string[]>([])
  const [contextosDisponibles, setContextosDisponibles] = useState<string[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [configsResponse, preguntasResponse, contextosResponse] = await Promise.all([
        mmseConfigService.getConfiguraciones(
          filtroPregunta && filtroPregunta !== 'all' ? filtroPregunta : undefined, 
          filtroContexto && filtroContexto !== 'all' ? filtroContexto : undefined
        ),
        mmseConfigService.getPreguntas(),
        mmseConfigService.getContextos()
      ])
      
      setConfiguraciones(configsResponse.data)
      setPreguntasDisponibles(preguntasResponse.data)
      setContextosDisponibles(contextosResponse.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  // Recargar cuando cambien los filtros
  useEffect(() => {
    loadData()
  }, [filtroPregunta, filtroContexto])

  const handleCreate = () => {
    setEditingConfig(null)
    setModalOpen(true)
  }

  const handleEdit = (config: MMSEConfiguracion) => {
    setEditingConfig(config)
    setModalOpen(true)
  }

  const handleSave = async (data: CreateConfiguracionRequest) => {
    try {
      setError(null)
      
      if (editingConfig) {
        await mmseConfigService.updateConfiguracion(editingConfig.id_configuracion, data)
        setSuccess('Configuración actualizada exitosamente')
      } else {
        await mmseConfigService.createConfiguracion(data)
        setSuccess('Configuración creada exitosamente')
      }
      
      setModalOpen(false)
      loadData()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando configuración')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta configuración?')) {
      return
    }
    
    try {
      setError(null)
      await mmseConfigService.deleteConfiguracion(id)
      setSuccess('Configuración eliminada exitosamente')
      loadData()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando configuración')
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingConfig(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Configuración MMSE</h1>
          <p className="text-gray-600">Gestiona las respuestas correctas para el test MMSE</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Configuración
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <MMSEConfigFilters
        filtroPregunta={filtroPregunta}
        setFiltroPregunta={setFiltroPregunta}
        filtroContexto={filtroContexto}
        setFiltroContexto={setFiltroContexto}
        preguntasDisponibles={preguntasDisponibles}
        contextosDisponibles={contextosDisponibles}
      />

      <MMSEConfigTable
        configuraciones={configuraciones}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MMSEConfigModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingConfig={editingConfig}
        preguntasDisponibles={preguntasDisponibles}
        contextosDisponibles={contextosDisponibles}
      />
    </div>
  )
}
