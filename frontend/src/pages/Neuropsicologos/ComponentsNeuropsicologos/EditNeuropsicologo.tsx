import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Neuropsicologo, type NeuropsicologoUpdate } from '@/services/neuropsicologosService'
// import { userService } from '@/services/userService'
const userService = { updateUser: async (id:any, payload:any) => ({success: true}) };
import { X } from 'lucide-react'

export default function EditNeuropsicologo({ open, onClose, onSuccess, item }: { open: boolean; onClose: () => void; onSuccess: () => void; item: Neuropsicologo | null }) {
  const [form, setForm] = useState<NeuropsicologoUpdate>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setForm({ nombres: item.nombres, apellidos: item.apellidos, username: item.username, email: item.email, estado: item.estado })
    }
  }, [item])

  if (!open || !item) return null

  const handleChange = (k: keyof NeuropsicologoUpdate, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    setLoading(true)
    try {
      const name = `${form.nombres ?? ''} ${form.apellidos ?? ''}`.trim()
      const payload: any = { }
      if (name) payload.name = name
      if (form.email) payload.email = form.email
      const res = await userService.updateUser(item.id_neuropsicologo, payload)
      if (!res.success) throw new Error(res.message || 'No se pudo actualizar')
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle>Editar neuropsicólogo</CardTitle>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombres</Label>
              <Input value={form.nombres || ''} onChange={(e) => handleChange('nombres', e.target.value)} />
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input value={form.apellidos || ''} onChange={(e) => handleChange('apellidos', e.target.value)} />
            </div>
            <div>
              <Label>Usuario</Label>
              <Input value={form.username || ''} onChange={(e) => handleChange('username', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
