import { Button } from '../../../components/ui/button';
import type { TipoEvaluacion } from '../../../types/evaluaciones';
import { toast } from 'react-hot-toast';

interface TiposEvaluacionModalsProps {
  // Estados de modales
  showAddTipoModal: boolean;
  showEditTipoModal: boolean;
  showViewTipoModal: boolean;
  showDeleteTipoDialog: boolean;
  selectedTipo: TipoEvaluacion | null;
  
  // Setters
  setShowAddTipoModal: (show: boolean) => void;
  setShowEditTipoModal: (show: boolean) => void;
  setShowViewTipoModal: (show: boolean) => void;
  setShowDeleteTipoDialog: (show: boolean) => void;
  setSelectedTipo: (tipo: TipoEvaluacion | null) => void;
  
  // Callbacks
  onRefresh: () => void;
}

export function TiposEvaluacionModals({
  showAddTipoModal,
  showEditTipoModal,
  showViewTipoModal,
  showDeleteTipoDialog,
  selectedTipo,
  setShowAddTipoModal,
  setShowEditTipoModal,
  setShowViewTipoModal,
  setShowDeleteTipoDialog,
  setSelectedTipo,
  onRefresh
}: TiposEvaluacionModalsProps) {
  const formatFechaSimple = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const modalBackdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
  };

  return (
    <>
      {/* Modal Agregar Tipo */}
      {showAddTipoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nuevo Tipo de Evaluación</h3>
            <p className="text-gray-600 mb-6">
              Modal para crear nuevo tipo de evaluación - En desarrollo
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowAddTipoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Tipo */}
      {showEditTipoModal && selectedTipo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Tipo: {selectedTipo.codigo}</h3>
            <p className="text-gray-600 mb-6">
              Modal para editar tipo de evaluación - En desarrollo
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowEditTipoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Tipo */}
      {showViewTipoModal && selectedTipo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Detalles Tipo: {selectedTipo.codigo}</h3>
            <div className="space-y-3 text-sm">
              <div><strong>ID:</strong> {selectedTipo.id_tipo}</div>
              <div><strong>Código:</strong> {selectedTipo.codigo}</div>
              <div><strong>Nombre:</strong> {selectedTipo.nombre}</div>
              <div><strong>Requiere Imagen:</strong> {selectedTipo.requiere_imagen ? 'Sí' : 'No'}</div>
              <div><strong>Requiere Método:</strong> {selectedTipo.requiere_metodo ? 'Sí' : 'No'}</div>
              <div><strong>Estado:</strong> {selectedTipo.activo ? 'Activo' : 'Inactivo'}</div>
              <div><strong>Creado:</strong> {formatFechaSimple(selectedTipo.creado_en)}</div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => setShowViewTipoModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Eliminar Tipo */}
      {showDeleteTipoDialog && selectedTipo && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el tipo <strong>{selectedTipo.codigo}</strong>?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Nombre: {selectedTipo.nombre}
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteTipoDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success(`Tipo ${selectedTipo.codigo} eliminado`);
                  setShowDeleteTipoDialog(false);
                  setSelectedTipo(null);
                  onRefresh();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
