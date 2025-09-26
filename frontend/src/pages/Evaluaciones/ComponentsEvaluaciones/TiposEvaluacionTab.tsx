import { TiposEvaluacionTable } from './TiposEvaluacionTable';
import type { TipoEvaluacion } from '../../../types/evaluaciones';

interface TiposEvaluacionTabProps {
  tiposEvaluacion: TipoEvaluacion[];
  loading: boolean;
  onView: (tipo: TipoEvaluacion) => void;
  onEdit: (tipo: TipoEvaluacion) => void;
  onDelete: (tipo: TipoEvaluacion) => void;
}

export function TiposEvaluacionTab({
  tiposEvaluacion,
  loading,
  onView,
  onEdit,
  onDelete
}: TiposEvaluacionTabProps) {
  return (
    <div className="space-y-6">
      {/* Tabla de Tipos */}
      <TiposEvaluacionTable
        tiposEvaluacion={tiposEvaluacion}
        loading={loading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
