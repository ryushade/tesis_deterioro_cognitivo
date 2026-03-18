import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { authService } from "@/services/auth"
import { useGetNeuropsicologos, type Neuropsicologo } from "@/services/neuropsicologosService"
import TablaNeuropsicologos from "./ComponentsNeuropsicologos/TablaNeuropsicologos"
import AddNeuropsicologo from "./ComponentsNeuropsicologos/AddNeuropsicologoModal"
import EditNeuropsicologo from "./ComponentsNeuropsicologos/EditNeuropsicologoModal"
import ViewNeuropsicologo from "./ComponentsNeuropsicologos/ViewNeuropsicologoModal"
import toast, { Toaster } from 'react-hot-toast'
import { userService } from '@/services/userService'
import PaginationControls from "../Pacientes/ComponentsPacientes/PaginationControls"
import ConfirmationModal from '@/components/ui/ConfirmationModal'

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

        <PaginationControls metadata={metadata as any} page={currentPage} limit={itemsPerPage} changePage={handlePageChange} changeLimit={handlePageSizeChange} />

        <AddNeuropsicologo open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); handleRefresh() }} />
        {showEditModal && selectedItem && (<EditNeuropsicologo open={showEditModal} onClose={() => setShowEditModal(false)} item={selectedItem} onSuccess={() => { setShowEditModal(false); handleRefresh() }} />)}
        {showViewModal && selectedItem && (<ViewNeuropsicologo open={showViewModal} onClose={() => setShowViewModal(false)} item={selectedItem} />)}
        <ConfirmationModal isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={confirmDelete} title="Eliminar neuropsicólogo" message={`¿Eliminar a ${selectedItem?.nombres} ${selectedItem?.apellidos}?`} confirmText="Eliminar" type="danger" />
      </div>
    </DashboardLayout>
  )
}

export default Neuropsicologos


