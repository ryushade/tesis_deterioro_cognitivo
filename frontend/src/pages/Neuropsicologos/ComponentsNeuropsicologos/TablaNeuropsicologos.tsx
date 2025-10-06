import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, User, IdCard } from 'lucide-react'
import type { Neuropsicologo } from '@/services/neuropsicologosService'

interface Props {
  items: Neuropsicologo[]
  loading: boolean
  error: string | null
  searchTerm: string
  onSearch: (term: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (item: Neuropsicologo) => void
  onEdit: (item: Neuropsicologo) => void
  onDelete: (item: Neuropsicologo) => void
}

export default function TablaNeuropsicologos({ items, loading, error, searchTerm, onSearch: _onSearch, currentPage, totalPages, onPageChange, onView, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando neuropsicólogos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <p>Ocurrió un error al cargar la lista.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron neuropsicólogos</p>
                  {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda</p>}
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id_neuropsicologo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <IdCard className="h-4 w-4 mr-2 text-gray-400" />
                      {it.username || it.usua}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="default" className="!bg-blue-600 !text-white !border-transparent hover:!bg-blue-700">
                      {it.rol_nombre ?? 'Rol no definido'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${it.estado ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                      {it.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onView(it)} className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(it)} className="text-gray-600 hover:text-gray-800">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(it)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
