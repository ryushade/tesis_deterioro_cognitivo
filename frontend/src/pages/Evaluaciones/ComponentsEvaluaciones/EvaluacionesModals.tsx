import { Button } from '../../../components/ui/button';
import type { EvaluacionCognitiva } from '../../../types/evaluaciones';
import { toast } from 'react-hot-toast';

interface EvaluacionesModalsProps {
  // Estados de modales
  showAddModal: boolean;
  showEditModal: boolean;
  showViewModal: boolean;
  showDeleteDialog: boolean;
  selectedEvaluacion: EvaluacionCognitiva | null;
  
  // Setters
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowViewModal: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setSelectedEvaluacion: (evaluacion: EvaluacionCognitiva | null) => void;
  
  // Callbacks
  onRefresh: () => void;
}

export function EvaluacionesModals({
  showAddModal,
  showEditModal,
  showViewModal,
  showDeleteDialog,
  selectedEvaluacion,
  setShowAddModal,
  setShowEditModal,
  setShowViewModal,
  setShowDeleteDialog,
  setSelectedEvaluacion,
  onRefresh
}: EvaluacionesModalsProps) {
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalBackdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
  };

  return (
    <>
      {/* Modal Agregar Evaluación */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nueva Evaluación</h3>
            <p className="text-gray-600 mb-6">
              Modal para crear nueva evaluación cognitiva - En desarrollo
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Evaluación */}
      {showEditModal && selectedEvaluacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Evaluación #{selectedEvaluacion.id_evaluacion}</h3>
            <p className="text-gray-600 mb-6">
              Modal para editar evaluación cognitiva - En desarrollo
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Evaluación */}
      {showViewModal && selectedEvaluacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Detalles Evaluación #{selectedEvaluacion.id_evaluacion}</h3>
            <div className="space-y-3 text-sm">
              <div><strong>Paciente:</strong> {selectedEvaluacion.paciente_nombre}</div>
              <div><strong>Tipo:</strong> {selectedEvaluacion.tipo_evaluacion_nombre}</div>
              <div><strong>Fecha:</strong> {formatFecha(selectedEvaluacion.fecha_evaluacion)}</div>
              <div><strong>Estado:</strong> {selectedEvaluacion.estado_procesamiento}</div>
              {selectedEvaluacion.clasificacion && (
                <div><strong>Clasificación:</strong> {selectedEvaluacion.clasificacion}</div>
              )}
              {selectedEvaluacion.puntuacion_total > 0 && (
                <div><strong>Puntuación:</strong> {selectedEvaluacion.puntuacion_total}/{selectedEvaluacion.puntuacion_maxima} ({selectedEvaluacion.porcentaje_acierto.toFixed(1)}%)</div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Eliminar Evaluación */}
      {showDeleteDialog && selectedEvaluacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={modalBackdropStyle}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la evaluación <strong>#{selectedEvaluacion.id_evaluacion}</strong>?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Paciente: {selectedEvaluacion.paciente_nombre}
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success(`Evaluación #${selectedEvaluacion.id_evaluacion} eliminada`);
                  setShowDeleteDialog(false);
                  setSelectedEvaluacion(null);
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
