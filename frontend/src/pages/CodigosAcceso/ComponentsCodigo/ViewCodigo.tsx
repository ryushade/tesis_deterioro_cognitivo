import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, User, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { CodigoAcceso } from '@/types/codigosAcceso';

interface ViewCodigoModalProps {
  open: boolean;
  onClose: () => void;
  codigo: CodigoAcceso | null;
}

function ViewCodigoModal({ open, onClose, codigo }: ViewCodigoModalProps) {
  if (!open || !codigo) return null;

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'emitido': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'usado': return 'text-green-600 bg-green-100 border-green-200';
      case 'vencido': return 'text-red-600 bg-red-100 border-red-200';
      case 'revocado': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'emitido': return <CheckCircle className="w-4 h-4" />;
      case 'usado': return <CheckCircle className="w-4 h-4" />;
      case 'vencido': return <AlertCircle className="w-4 h-4" />;
      case 'revocado': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
      }}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Detalles del Código</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Código */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Código de Acceso
            </Label>
            <div className="font-mono text-lg font-bold text-blue-600 bg-blue-50 p-3 rounded-md border">
              {codigo.codigo}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Estado</Label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${getEstadoColor(codigo.estado)}`}>
              {getEstadoIcon(codigo.estado)}
              <span className="font-medium capitalize">{codigo.estado}</span>
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              Paciente
            </Label>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">ID:</span> {codigo.id_paciente}
              </div>
              {codigo.nombre_paciente && (
                <div className="text-sm">
                  <span className="font-medium">Nombre:</span> {codigo.nombre_paciente}
                </div>
              )}
            </div>
          </div>

          {/* Tipo de Evaluación */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Tipo de Evaluación
            </Label>
            <div className="text-sm bg-gray-50 p-3 rounded-md border">
              {codigo.tipo_evaluacion}
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Fecha de Creación
              </Label>
              <div className="text-sm bg-gray-50 p-3 rounded-md border">
                {formatFecha(codigo.creado_en)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Fecha de Vencimiento
              </Label>
              <div className={`text-sm p-3 rounded-md border ${
                codigo.esta_vencido 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {formatFecha(codigo.vence_at)}
                {codigo.esta_vencido && (
                  <span className="block text-xs mt-1 font-medium">¡Código vencido!</span>
                )}
              </div>
            </div>

            {codigo.ultimo_uso_en && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Último Uso
                </Label>
                <div className="text-sm bg-gray-50 p-3 rounded-md border">
                  {formatFecha(codigo.ultimo_uso_en)}
                </div>
              </div>
            )}
          </div>

          {/* Tiempo Restante */}
          {!codigo.esta_vencido && codigo.horas_restantes && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4" />
                Tiempo Restante
              </Label>
              <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-700">
                {Math.floor(codigo.horas_restantes / 24)} días, {codigo.horas_restantes % 24} horas
              </div>
            </div>
          )}

          {/* Botón de Cerrar */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}

export default ViewCodigoModal;
