import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Neuropsicologo } from '@/services/neuropsicologosService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

export default function EditNeuropsicologo({ open, onClose, onSuccess, item }: { open: boolean; onClose: () => void; onSuccess: () => void; item: Neuropsicologo | null }) {
  const [username, setUsername] = useState('')
  const [estado, setEstado] = useState<string>('true')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item && open) {
      // 1. Poblamos el campo de usuario
      setUsername(item.usua || (item as any).username || '')
      
      // 2. Evaluamos el estado activo/inactivo (soporta múltiples formatos de backend)
      const isActive = item.estado_usuario === 1 || (item as any).estado === true
      setEstado(isActive ? 'true' : 'false')
    }
  }, [item, open])

  if (!open || !item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!username.trim()) {
        setError('El usuario es obligatorio')
        return
      }
      
      const isActive = estado === 'true'
      
      // Mapeamos el ID correcto dependiendo del JSON que envíe el servicio list_all
      const idUsuario = (item as any).id_neuropsicologo || item.id_usuario

      // Enviar la petición PUT con la propiedad correcta de Estado (Booleana o Numérica)
      const payload = { 
        username: username.trim(),
        estado: isActive,
        estado_usuario: isActive ? 1 : 0
      }

      // Consumimos el endpoint real /users/id que gestiona los accesos
      const res = await apiClient.put(`/users/${idUsuario}`, payload)
      
      if (res.data && res.data.success === false) {
        throw new Error(res.data.message || 'No se pudo actualizar el estado.')
      }
      
      toast.success('Neuropsicologo actualizado correctamente')
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Editar neuropsicólogo</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
