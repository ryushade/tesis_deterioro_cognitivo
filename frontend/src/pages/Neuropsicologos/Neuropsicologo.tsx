import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { authService } from "@/services/auth"
import { useGetNeuropsicologos, type Neuropsicologo } from "@/services/neuropsicologosService"
import TablaNeuropsicologos from "./ComponentsNeuropsicologos/TablaNeuropsicologos"
import AddNeuropsicologo from "./ComponentsNeuropsicologos/AddNeuropsicologoModal"
import EditNeuropsicologo from "./ComponentsNeuropsicologos/EditNeuropsicologoModal"
// import ViewNeuropsicologo from "./ComponentsNeuropsicologos/ViewNeuropsicologoModal"
import toast, { Toaster } from 'react-hot-toast'
// import { userService } from '@/services/userService'
const userService = { deleteUser: async (id: any) => ({ success: false, message: 'Servicio en mantenimiento' }) };
import PaginacionPacientes from '../Pacientes/ComponentsPacientes/PaginacionPacientes';
import ConfirmationModal from './ComponentsNeuropsicologos/ConfirmationModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function Neuropsicologos() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Neuropsicologo | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const { neuropsicologos, metadata, loading, error, refetch } = useGetNeuropsicologos()

  const currentUser = authService.getUserFromStorage()
  const sidebarUser = { name: currentUser?.username || "Usuario", email: currentUser?.role?.name || "Rol no definido" }

  const handleLogout = async () => { await authService.logout(); window.location.href = "/login" }
  const handleAdd = () => setShowAddModal(true)
  const handleView = (item: Neuropsicologo) => { setSelectedItem(item); setShowViewModal(true) }
  const handleEdit = (item: Neuropsicologo) => { setSelectedItem(item); setShowEditModal(true) }
  const handleDelete = (item: Neuropsicologo) => { setSelectedItem(item); setShowDeleteDialog(true) }

  const confirmDelete = async () => {
    if (!selectedItem) return
    try {
      const res = await userService.deleteUser(selectedItem.id_neuropsicologo)
      if (res.success) { toast.success("Neuropsicólogo eliminado exitosamente"); refetch(currentPage, itemsPerPage, searchTerm) }
      else { toast.error(res.message || "Error al eliminar neuropsicólogo") }
    } catch (e) {
      toast.error("Error de conexión al servidor")
    }
    setShowDeleteDialog(false); setSelectedItem(null)
  }

  const handleRefresh = () => refetch(currentPage, itemsPerPage, searchTerm)
  const handleSearch = (term: string) => { setSearchTerm(term); setCurrentPage(1); refetch(1, itemsPerPage, term) }
  const handlePageChange = (page: number) => { setCurrentPage(page); refetch(page, itemsPerPage, searchTerm) }
  const handlePageSizeChange = (size: number) => { setItemsPerPage(size); setCurrentPage(1); refetch(1, size, searchTerm) }

  return (
    <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="mb-2">
              <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">Gestión de neuropsicólogos</h1>
              <p className="text-lg font-medium text-blue-700/80 leading-relaxed">Administra y visualiza la información de los neuropsicólogos del sistema.</p>
            </div>
          </div>
          <Button onClick={handleAdd} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500">
            <Plus className="h-4 w-4" /> Agregar neuropsicólogo
          </Button>
        </div>

        <TablaNeuropsicologos
          items={neuropsicologos}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? 1}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

 {/* Paginación a la izquierda y texto centrado */}
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          {/* Izquierda: paginación */}
          <div className="flex items-center">
            <PaginacionPacientes
              currentPage={currentPage}
              totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Centro: texto */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, (metadata as any)?.total ?? (metadata as any)?.totalItems ?? pacientes.length)} de {(metadata as any)?.total ?? (metadata as any)?.totalItems ?? pacientes.length} registros
            </p>
          </div>
            
          
          {/* Derecha: espacio para balancear */}
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="whitespace-nowrap">Filas por página:</span>
            <Select value={String(itemsPerPage)} onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Entradas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100000000000">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AddNeuropsicologo open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); handleRefresh() }} />
        {showEditModal && selectedItem && (<EditNeuropsicologo open={showEditModal} onClose={() => setShowEditModal(false)} item={selectedItem} onSuccess={() => { setShowEditModal(false); handleRefresh() }} />)}
        {/* {showViewModal && selectedItem && (<ViewNeuropsicologo open={showViewModal} onClose={() => setShowViewModal(false)} item={selectedItem} />)} */}
        <ConfirmationModal isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={confirmDelete} title="Eliminar neuropsicólogo" message={`¿Eliminar a ${selectedItem?.usua}?`}   confirmText="Eliminar" type="danger" />
      </div>
    </DashboardLayout>
  )
}

export default Neuropsicologos


