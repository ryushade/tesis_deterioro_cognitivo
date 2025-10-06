import { useEffect, useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService, type Role } from '@/services/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function AddNeuropsicologo({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [roleId, setRoleId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)

  // Always call hooks; guard logic inside
  useEffect(() => {
    if (!open) return
    let mounted = true
    authService.getRoles().then((rs) => {
      if (!mounted) return
      // Only allow the Neuropsicólogo role, preselected
      const neuro = rs.find(x => x.nom_rol === 'Neuropsicólogo')
        || rs.find(x => x.nom_rol === 'Neuropsicologo')
        || rs.find(x => (x.nom_rol || '').toLowerCase().includes('neuropsico'))
      if (neuro) {
        setRoles([neuro])
        setRoleId(String(neuro.id_rol))
      } else {
        setRoles([])
        setRoleId('')
      }
    })
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  const reset = () => {
    setUsername('')
    setPassword('')
    setPassword2('')
    setRoleId('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (!username.trim() || !password || !roleId) {
        setError('Todos los campos son obligatorios')
        toast.error('Todos los campos son obligatorios')
        return
      }
      if (password !== password2) {
        setError('Las contraseñas no coinciden')
        toast.error('Las contraseñas no coinciden')
        return
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        toast.error('La contraseña debe tener al menos 6 caracteres')
        return
      }
      const reg = await authService.register({ username: username.trim(), password, role_id: Number(roleId) })
      if (!reg.success) throw new Error(reg.message || 'No se pudo crear el usuario')
      toast.success('Neuropsicólogo creado exitosamente')
      reset()
      onSuccess?.()
      onClose()
    } catch (err: any) {
      const msg = err?.message || 'Error al crear neuropsicólogo'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Agregar neuropsicólogo</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="password2">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="password2"
                  type={showPassword2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword2 ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="rol">Rol</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="rol" className="w-full" disabled>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

