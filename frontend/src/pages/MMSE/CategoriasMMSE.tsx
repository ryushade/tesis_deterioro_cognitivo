import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { authService } from "@/services/auth"
import toast, { Toaster } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Plus } from "lucide-react"

function CategoriasMMSE() {
    
    const handleLogout = async () => { await authService.logout(); window.location.href = "/login" }
    const currentUser = authService.getUserFromStorage()
    const sidebarUser = { name: currentUser?.username || "Usuario", email: currentUser?.role?.name || "Rol no definido" }

    return (
    <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="mb-2">
              <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">Categorías MMSE</h1>
              <p className="text-lg font-medium text-blue-700/80 leading-relaxed">Administra y visualiza la información de las categorías del MMSE.</p>
            </div>
          </div>
          <Button onClick={handleAdd} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500">
            <Plus className="h-4 w-4" /> Agregar categoría
          </Button>
        </div>
        </div>
    </DashboardLayout>

    )
}

export default CategoriasMMSE