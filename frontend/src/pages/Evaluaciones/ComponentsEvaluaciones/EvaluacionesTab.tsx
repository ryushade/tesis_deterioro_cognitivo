import { EvaluacionesTable } from './EvaluacionesTable';
import type { EvaluacionCognitiva } from '../../../types/evaluaciones';

interface EvaluacionesTabProps {
  evaluaciones: EvaluacionCognitiva[];
  loading: boolean;
  onView: (evaluacion: EvaluacionCognitiva) => void;
  onEdit: (evaluacion: EvaluacionCognitiva) => void;
  onDelete: (evaluacion: EvaluacionCognitiva) => void;
}

export function EvaluacionesTab({
  evaluaciones,
  loading,
  onView,
  onEdit,
  onDelete
}: EvaluacionesTabProps) {
  return (
    <div className="space-y-6">
      {/* Tabla de Evaluaciones */}
      <EvaluacionesTable
        evaluaciones={evaluaciones}
        loading={loading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
