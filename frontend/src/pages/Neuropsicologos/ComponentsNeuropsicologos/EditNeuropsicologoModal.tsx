import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Neuropsicologo } from '@/services/neuropsicologosService'
import { authService, type Role } from '@/services/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/services/api'

export default function EditNeuropsicologo({ open, onClose, onSuccess, item }: { open: boolean; onClose: () => void; onSuccess: () => void; item: Neuropsicologo | null }) {
  const [username, setUsername] = useState('')
  const [roleId, setRoleId] = useState<string>('')
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setUsername(item.username || (item as any).usua || '')
      const rid = (item as any).id_rol
      setRoleId(rid !== undefined && rid !== null ? String(rid) : '')
    }
  }, [item])

  useEffect(() => {
    if (!open) return
    authService.getRoles().then((rs) => {
      // Encontrar sólo el rol de Neuropsicólogo (variantes incluidas)
      const neuro = rs.find(r => r.nom_rol === 'Neuropsicólogo')
        || rs.find(r => r.nom_rol === 'Neuropsicologo')
        || rs.find(r => (r.nom_rol || '').toLowerCase().includes('neuropsico'))

      if (neuro) {
        setRoles([neuro])
        setRoleId(String(neuro.id_rol))
      } else {
        setRoles([])
      }
    })
  }, [open])

  if (!open || !item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!username.trim() || !roleId) {
        setError('Usuario y rol son obligatorios')
        return
      }
      const res = await apiClient.put(`/users/${item.id_neuropsicologo}`, { username: username.trim(), role_id: Number(roleId) })
      if (!res.data?.success) throw new Error(res.data?.message || 'No se pudo actualizar')
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar')
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
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="w-full" disabled>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id_rol} value={String(r.id_rol)}>{r.nom_rol}</SelectItem>
                  ))}
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
