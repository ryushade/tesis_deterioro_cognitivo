import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { authService } from "@/services/auth";
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { categoriaServices } from "@/services/categoriaServices";
import type { Categoria } from "@/services/categoriaServices";

import TablaCategorias from "./ComponentsCategorias/TablaCategorias";
import AddCategoriaModal from "./ComponentsCategorias/AddCategoria";
import EditCategoriaModal from "./ComponentsCategorias/EditCategoria";

function CategoriasMMSE() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategoriaToEdit, setSelectedCategoriaToEdit] = useState<Categoria | null>(null);

    const handleLogout = async () => { 
        await authService.logout(); 
        window.location.href = "/login"; 
    };

    const currentUser = authService.getUserFromStorage();
    const sidebarUser = { 
        name: currentUser?.username || "Usuario", 
        email: currentUser?.role?.name || "Rol no definido" 
    };

    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const response = await categoriaServices.getAll();
            if (response.success && response.data) {
                setCategorias(response.data);
            } else {
                toast.error(response.message || 'Error al cargar categorías');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const filteredCategorias = categorias.filter(c => 
        c.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setShowAddModal(true);
    };

    const handleEdit = (categoria: Categoria) => {
        setSelectedCategoriaToEdit(categoria);
        setShowEditModal(true);
    };

    const handleDelete = async (categoria: Categoria) => {
        try {
            const response = await categoriaServices.delete(categoria.id_categoria);
            if (response.success) {
                toast.success('Categoría eliminada exitosamente');
                fetchCategorias();
            } else {
                toast.error(response.message || 'Error al eliminar categoría');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Error de conexión al servidor');
        }
    };

    return (
        <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
            <Toaster position="top-right" />
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="mb-2">
                            <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">Categorías de la prueba MMSE</h1>
                            <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                                Administra y visualiza la información de las categorías del MMSE.
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500">
                        <Plus className="h-4 w-4" /> Agregar categoría
                    </Button>
                </div>

                <TablaCategorias
                    categorias={filteredCategorias}
                    loading={loading}
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <AddCategoriaModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchCategorias();
                    }}
                />

                {showEditModal && selectedCategoriaToEdit && (
                    <EditCategoriaModal
                        open={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        categoria={selectedCategoriaToEdit}
                        onSuccess={() => {
                            setShowEditModal(false);
                            fetchCategorias();
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}

export default CategoriasMMSE;