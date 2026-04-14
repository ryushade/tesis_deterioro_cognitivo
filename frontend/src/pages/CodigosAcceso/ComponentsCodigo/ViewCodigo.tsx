import { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  User, 
  ClipboardList, 
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { toast } from 'sonner';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { getEstadoColor, getEstadoLabel, getTipoEvaluacionLabel } from '@/types/codigosAcceso';

interface ViewCodigoProps {
  open: boolean;
  onClose: () => void;
  codigo: CodigoAcceso | null;
}

export default function ViewCodigo({ open, onClose, codigo }: ViewCodigoProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !codigo) return null;

  // Determinar si es una prueba de voz o CDT basándose en el tipo o rastro en el objeto
  const isVoiceTest = JSON.stringify(codigo).toLowerCase().includes('fluidez') || 
                     JSON.stringify(codigo).toLowerCase().includes('voz');
  
  const testPath = isVoiceTest ? 'voz' : 'cdt';
  const evaluationUrl = `${window.location.origin}/evaluaciones/${testPath}/${codigo.id_codigo}`;
  
  // URL del QR usando api.qrserver.com (Estable y sin dependencias extra)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(evaluationUrl)}&color=1e3a8a&bgcolor=ffffff&margin=10`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(evaluationUrl);
    setCopied(true);
    toast.success("Enlace de acceso copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-[500px] border-none shadow-2xl bg-white overflow-hidden relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-blue-50 p-3 rounded-full mb-2 w-fit">
            <QrCode className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-black text-blue-900 tracking-tight">
            Entrega de Prueba
          </CardTitle>
          <CardDescription className="text-blue-700/70 font-medium">
            Muestra el QR o comparte el enlace para iniciar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          {/* Sección de QR */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border border-blue-100 shadow-inner group">
            <div className="relative p-2 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <img 
                src={qrUrl} 
                alt="Código QR de Acceso" 
                className="w-44 h-44 rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-blue-600/5 rounded-xl pointer-events-none"></div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1 block">Identificador Único</span>
              <p className="text-3xl font-mono font-black text-blue-900 tracking-[0.1em]">
                {codigo.codigo}
              </p>
            </div>
          </div>

          {/* Detalles Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                <User className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Paciente</span>
                <p className="text-[11px] font-bold text-gray-800 truncate">
                  {codigo.nombre_paciente}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Evaluación</span>
                <p className="text-[11px] font-bold text-gray-800 truncate">
                  {getTipoEvaluacionLabel(codigo.tipo_evaluacion)}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Vencimiento</span>
                <p className="text-[10px] font-bold text-gray-700">
                  {formatDate(codigo.vence_at)}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                <ShieldCheck className={`h-3.5 w-3.5 ${codigo.estado === 1 ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Estado</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getEstadoColor(codigo.estado)}`}>
                  {getEstadoLabel(codigo.estado)}
                </span>
              </div>
            </div>
          </div>

          {/* Enlace Directo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Enlace de invitación
              </label>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-1 px-3 py-1 overflow-hidden min-w-0">
                <p className="text-[10px] font-medium text-gray-400 truncate italic">
                  {evaluationUrl}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="white" 
                className="bg-white shadow-sm border border-gray-200 h-8 px-4 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all font-bold group"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-2 text-green-600" /> : <Copy className="h-3.5 w-3.5 mr-2 text-gray-400 group-hover:text-blue-600" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3 pb-8 border-t border-gray-50 pt-6">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            onClick={() => window.open(evaluationUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir prueba ahora
          </Button>
          <p className="text-[10px] text-gray-400 text-center px-4 font-medium italic">
            El paciente también puede ingresar este código manualmente en la pantalla de inicio.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
