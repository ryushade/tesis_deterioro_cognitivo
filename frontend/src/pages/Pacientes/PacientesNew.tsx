import { useState, useEffect } from 'react';
import { Plus, Users, Brain, Download } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PacientesForm from './PacientesForm';
import ShowPacientes from './ShowPacientes';
import BarraSearch from './BarraSearch';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { pacientesService } from '@/services/pacientes.services';
import type { Paciente } from '@/services/pacientes.services';

interface SearchFilters {
  estadoCognitivo: string;
  edadMin: number;
  edadMax: number;
  estadoPaciente: string;
}

function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [activeAdd, setModalOpen] = useState(false);
  const [showPaciente, setShowPaciente] = useState<{ show: boolean; data: Paciente | null }>({
    show: false,
    data: null
  });
  const [editPaciente, setEditPaciente] = useState<{ id_paciente: number; data: Paciente } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; paciente: Paciente | null }>({
    show: false,
    paciente: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    estadoCognitivo: '',
    edadMin: 65,
    edadMax: 100,
    estadoPaciente: ''
  });

  // Cargar pacientes al iniciar
  useEffect(() => {
    loadPacientes();
  }, []);

  // Filtrar pacientes cuando cambie el término de búsqueda o filtros
  useEffect(() => {
    filterPacientes();
  }, [pacientes, searchTerm, filters]);

  const loadPacientes = async () => {
    setIsLoading(true);
    try {
      const data = await pacientesService.getAllPacientes();
      setPacientes(data);
      toast.success('Pacientes cargados correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPacientes = () => {
    let filtered = [...pacientes];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(paciente =>
        paciente.nombres.toLowerCase().includes(search) ||
        paciente.apellidos.toLowerCase().includes(search) ||
        paciente.cedula.includes(search) ||
        paciente.telefono.includes(search)
      );
    }

    // Aplicar filtros avanzados
    if (filters.estadoCognitivo) {
      filtered = filtered.filter(p => p.estado_cognitivo === filters.estadoCognitivo);
    }

    if (filters.estadoPaciente) {
      filtered = filtered.filter(p => p.estado_paciente.toString() === filters.estadoPaciente);
    }

    if (filters.edadMin || filters.edadMax) {
      filtered = filtered.filter(p => {
        const edad = p.edad || 0;
        return edad >= filters.edadMin && edad <= filters.edadMax;
      });
    }

    setFilteredPacientes(filtered);
  };

  const handleAddPaciente = async (pacienteData: Paciente) => {
    try {
      const newPaciente = await pacientesService.createPaciente(pacienteData);
      setPacientes(prev => [...prev, newPaciente]);
      setModalOpen(false);
      toast.success('Paciente registrado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar paciente');
    }
  };

  const handleEditPaciente = async (pacienteData: Paciente) => {
    if (!editPaciente) return;
    
    try {
      const updatedPaciente = await pacientesService.updatePaciente(editPaciente.id_paciente, pacienteData);
      setPacientes(prev => prev.map(p =>
        p.id_paciente === editPaciente.id_paciente ? updatedPaciente : p
      ));
      setEditPaciente(null);
      toast.success('Paciente actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar paciente');
    }
  };

  const handleDeletePaciente = async () => {
    if (!deleteModal.paciente?.id_paciente) return;

    try {
      await pacientesService.deletePaciente(deleteModal.paciente.id_paciente);
      setPacientes(prev => prev.filter(p => p.id_paciente !== deleteModal.paciente?.id_paciente));
      setDeleteModal({ show: false, paciente: null });
      toast.success('Paciente eliminado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar paciente');
    }
  };

  const exportPacientes = () => {
    const csvData = filteredPacientes.map(p => ({
      'Nombres': p.nombres,
      'Apellidos': p.apellidos,
      'Cédula': p.cedula,
      'Edad': p.edad,
      'Teléfono': p.telefono,
      'Estado Cognitivo': p.estado_cognitivo,
      'Estado': p.estado_paciente === '1' || p.estado_paciente === 1 ? 'Activo' : 'Inactivo'
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Datos exportados exitosamente');
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
            <p className="text-gray-600">Sistema de seguimiento cognitivo para adultos mayores (65+)</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportPacientes}
            disabled={filteredPacientes.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-blue-600">{pacientes.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {pacientes.filter(p => p.estado_paciente === '1' || p.estado_paciente === 1).length}
                </p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Evaluación</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pacientes.filter(p => p.estado_cognitivo === 'No evaluado').length}
                </p>
              </div>
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resultados Mostrados</p>
                <p className="text-2xl font-bold text-purple-600">{filteredPacientes.length}</p>
              </div>
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <BarraSearch
        onSearch={setSearchTerm}
        onFilterChange={setFilters}
        placeholder="Buscar por nombre, cédula o teléfono..."
      />

      {/* Lista de pacientes */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      ) : filteredPacientes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
            <p className="text-gray-600 mb-6">
              {pacientes.length === 0 
                ? 'Aún no hay pacientes registrados en el sistema.'
                : 'No hay pacientes que coincidan con los criterios de búsqueda.'
              }
            </p>
            {pacientes.length === 0 && (
              <Button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primer Paciente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ShowPacientes
          pacientes={filteredPacientes}
          onView={(paciente) => setShowPaciente({ show: true, data: paciente })}
          onEdit={(paciente) => setEditPaciente({ id_paciente: paciente.id_paciente!, data: paciente })}
          onDelete={(paciente) => setDeleteModal({ show: true, paciente })}
        />
      )}

      {/* Modales */}
      {activeAdd && (
        <PacientesForm
          modalTitle="Registrar Nuevo Paciente"
          onClose={() => setModalOpen(false)}
          onSuccess={handleAddPaciente}
          pacientes={pacientes}
        />
      )}

      {editPaciente && (
        <PacientesForm
          modalTitle="Editar Paciente"
          onClose={() => setEditPaciente(null)}
          onSuccess={handleEditPaciente}
          initialData={editPaciente}
          pacientes={pacientes}
        />
      )}

      {showPaciente.show && showPaciente.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Información del Paciente</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowPaciente({ show: false, data: null })}
                >
                  Cerrar
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShowPacientes
                  pacientes={[showPaciente.data]}
                  onView={() => {}}
                  onEdit={(paciente) => {
                    setShowPaciente({ show: false, data: null });
                    setEditPaciente({ id_paciente: paciente.id_paciente!, data: paciente });
                  }}
                  onDelete={(paciente) => {
                    setShowPaciente({ show: false, data: null });
                    setDeleteModal({ show: true, paciente });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, paciente: null })}
        onConfirm={handleDeletePaciente}
        title="Eliminar Paciente"
        message="¿Está seguro de que desea eliminar este paciente del sistema?"
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        patientName={deleteModal.paciente ? `${deleteModal.paciente.nombres} ${deleteModal.paciente.apellidos}` : ''}
        details={[
          'El paciente será marcado como inactivo',
          'Sus datos se conservarán para auditoría',
          'Esta acción puede revertirse posteriormente'
        ]}
      />
    </div>
  );
}

export default Pacientes;
