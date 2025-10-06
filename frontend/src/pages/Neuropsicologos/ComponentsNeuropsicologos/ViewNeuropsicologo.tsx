import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Neuropsicologo } from '@/services/neuropsicologosService'
import { X, Mail, IdCard, User } from 'lucide-react'

export default function ViewNeuropsicologo({ open, onClose, item }: { open: boolean; onClose: () => void; item: Neuropsicologo | null }) {
  if (!open || !item) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Neuropsicólogo</CardTitle>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> <span className="font-medium">{item.nombres} {item.apellidos}</span></div>
          <div className="flex items-center gap-2"><IdCard className="h-4 w-4 text-gray-500" /> <span>{item.username}</span></div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-500" /> <span>{item.email}</span></div>
          <div><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.estado ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}

