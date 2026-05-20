import { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { getEstadoColor, getEstadoLabel, getTipoEvaluacionLabel } from '@/types/codigosAcceso';

interface ViewCodigoProps {
  open: boolean;
  onClose: () => void;
  codigo: CodigoAcceso | null;
}

export default function ViewCodigo({ open, onClose, codigo }: ViewCodigoProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!open || !codigo) return null;

  const tipo = (codigo.tipo_evaluacion || '').toLowerCase();
  
  let testPath = 'cdt'; 
  if (tipo.includes('mmse') || tipo.includes('mini-mental') || tipo.includes('mini mental')) {
    testPath = 'mmse';
  } else if (tipo.includes('fluidez') || tipo.includes('voz')) {
    testPath = 'voz';
  }
  const evaluationUrl = `${window.location.origin}/evaluaciones/${testPath}/${codigo.id_codigo}`;
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluationUrl)}&color=1e293b&bgcolor=ffffff&margin=10`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(evaluationUrl);
    setCopiedLink(true);
    toast.success("Enlace de acceso copiado");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (codigo.codigo) {
      navigator.clipboard.writeText(codigo.codigo);
      setCopiedCode(true);
      toast.success("Código de acceso copiado");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleString('es-ES', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl border border-slate-200 shadow-2xl bg-white rounded-xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: QR Code & Direct Entry Actions */}
        <div className="w-full md:w-64 bg-slate-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
            <img 
              src={qrUrl} 
              alt="Código QR de acceso" 
              className="w-36 h-36 object-contain"
            />
          </div>

          <div className="mt-4 text-center w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código de acceso</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-2xl font-mono font-bold text-slate-800 tracking-wider">
                {codigo.codigo}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-slate-400 hover:text-slate-700"
                onClick={handleCopyCode}
                title="Copiar código"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Direct Entry Button */}
          <div className="mt-6 w-full space-y-2">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
              onClick={() => window.open(evaluationUrl, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Iniciar prueba ahora
            </Button>
            <Button 
              variant="outline"
              className="w-full border-slate-200 text-slate-700 font-semibold text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 bg-white hover:bg-slate-55"
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              {copiedLink ? "Enlace copiado" : "Copiar enlace de acceso"}
            </Button>
          </div>
        </div>

        {/* Right Side: Details & Metadata */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Detalles del código de acceso
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Información para realizar la prueba sin ingresar clave manual</p>
            </div>

            {/* Details Fields */}
            <div className="space-y-2.5">
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paciente</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {codigo.nombre_paciente}
                </p>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evaluación asignada</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {getTipoEvaluacionLabel(codigo.tipo_evaluacion)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha de vencimiento</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {formatDate(codigo.vence_at)}
                  </p>
                </div>

                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado de vigencia</span>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${getEstadoColor(codigo.estado)} text-[10px] px-2 py-0.5 font-bold uppercase border-none`}>
                      {getEstadoLabel(codigo.estado)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation URL Box */}
            <div className="space-y-1 pt-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enlace de acceso directo</span>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-mono break-all leading-normal select-all">
                {evaluationUrl}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <p className="text-[10px] text-slate-400 leading-normal italic text-center md:text-left">
              El paciente puede escanear el código QR con su dispositivo o abrir el enlace directamente para iniciar la evaluación sin ingresar datos manualmente.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
