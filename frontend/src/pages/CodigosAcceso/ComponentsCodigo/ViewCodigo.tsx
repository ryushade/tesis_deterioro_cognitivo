import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { X, User, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
// toast removed: not needed here
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { getTipoEvaluacionDescription } from '@/types/codigosAcceso';

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
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'emitido':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'usado':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'vencido':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'revocado':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'emitido':
        return <CheckCircle className="w-4 h-4" />;
      case 'usado':
        return <CheckCircle className="w-4 h-4" />;
      case 'vencido':
        return <AlertCircle className="w-4 h-4" />;
      case 'revocado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const codeValue = String(codigo.codigo || '').trim();
  const normalized = codeValue.replace(/[^A-Za-z0-9]/g, '');
  const slots = normalized.length || 6;
  // QR for mobile app scanning (uses public QR image API)
  const qrData = `code=${codeValue}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  
  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
      }}
    >
      <Card
        className="relative w-full max-w-md max-h-[90vh] overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Código de acceso</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-1 space-y-4 overflow-y-auto">
          {/* Código de acceso (visual) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" /> Código de acceso
            </Label>
            <div className="flex items-center gap-3">
              <InputOTP value={normalized} maxLength={slots} disabled containerClassName="gap-1">
                <InputOTPGroup>
                  {Array.from({ length: slots }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="h-10 w-10 text-base" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Paciente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" /> Paciente
            </Label>
            <Card className="p-4 bg-gray-50 border">
              <div className="text-sm">
                {codigo.nombre_paciente ? (
                  <span><span className="font-medium">Nombre:</span> {codigo.nombre_paciente}</span>
                ) : (
                  <span className="text-gray-500">Sin nombre asociado</span>
                )}
              </div>
            </Card>
          </div>

          {/* Prueba cognitiva */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" /> Prueba cognitiva
            </Label>
            <div className="text-sm bg-gray-50 p-3 rounded-md border">{getTipoEvaluacionDescription(codigo.tipo_evaluacion as any)}</div>
          </div>

          {/* QR para app móvil */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" /> Escanea en la app móvil
            </Label>
            <div className="flex items-center gap-4 bg-white p-3 rounded-md border">
              <img src={qrUrl} alt={`QR acceso ${codeValue}`} className="h-44 w-44 rounded" />
              <div className="text-xs text-gray-600 space-y-1">
                <p>1. Abre la aplicación móvil</p>
                <p>2. Elige “Ingresar con código”</p>
                <p>3. Escanea este QR</p>
              </div>
            </div>
          </div>

          {/* Fecha de creación */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" /> Fecha de creación
            </Label>
            <div className="text-sm bg-gray-50 p-3 rounded-md border">{formatFecha(codigo.creado_en)}</div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Estado</Label>
            <div className={`flex items-center gap-2 px-2 py-2 rounded-md border ${getEstadoColor(codigo.estado)}`}>
              {getEstadoIcon(codigo.estado)}
              <span className="font-medium capitalize">{codigo.estado}</span>
            </div>
          </div>

          {/* Acción */}
          <div className="pt-2">
            <Button onClick={onClose} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}

export default ViewCodigoModal;



