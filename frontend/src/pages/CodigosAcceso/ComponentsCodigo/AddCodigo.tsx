import { useEffect, useState } from 'react';
import { X, RefreshCw, User, FileText, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { codigosAccesoService } from '@/services/codigosAccesoService';
import { pacientesService, type Paciente } from '@/services/pacientesService';
import { pruebasCognitivasService } from '@/services/pruebasCognitivas.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AddCodigoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCodigoModal({ open, onClose, onSuccess }: AddCodigoModalProps) {
  const [codigo, setCodigo] = useState('');
  const [idPaciente, setIdPaciente] = useState<number | ''>('');
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [tipoEvaluacion, setTipoEvaluacion] = useState('');
  const [pruebas, setPruebas] = useState<{ codigo: string; nombre: string; id_prueba: number }[]>([]);
  const [diasVencimiento, setDiasVencimiento] = useState<number>(7);
  const [fechaVence, setFechaVence] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingInit, setLoadingInit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Paciente[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (!open) return;
    const init = async () => {
      try {
        setLoadingInit(true);
        setError(null);
        // Generar codigo automaticamente
        const gen = await codigosAccesoService.generarCodigo(8);
        if (gen?.success && gen?.data?.codigo) setCodigo(gen.data.codigo);
        // Cargar pruebas activas
        const res = await pruebasCognitivasService.getAll({ page: 1, limit: 100, activo: true });
        const list = (res?.data || []).map(p => ({ codigo: p.codigo, nombre: p.nombre, id_prueba: p.id_prueba }));
        setPruebas(list);
      } catch (e: any) {
        setError(e?.message || 'Error inicializando formulario');
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, [open]);

  // Buscar pacientes (debounce)
  useEffect(() => {
    let timeout: any;
    if (patientsOpen) {
      setLoadingPatients(true);
      timeout = setTimeout(async () => {
        try {
          const res = await pacientesService.getAll(1, 10, patientQuery || '');
          setPatientResults(res.data || []);
        } catch {
          setPatientResults([]);
        } finally {
          setLoadingPatients(false);
        }
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [patientQuery, patientsOpen]);

  const regenerate = async () => {
    try {
      const gen = await codigosAccesoService.generarCodigo(8);
      if (gen?.success && gen?.data?.codigo) setCodigo(gen.data.codigo);
    } catch (e) {
      toast.error('No se pudo generar codigo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPaciente || !tipoEvaluacion) {
      setError('Debe seleccionar paciente y prueba');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        id_paciente: idPaciente,
        tipo_evaluacion: tipoEvaluacion,
        codigo,
      };
      if (fechaVence) payload.vence_at = new Date(fechaVence).toISOString();
      else if (diasVencimiento) payload.dias_vencimiento = diasVencimiento;

      const res = await codigosAccesoService.create(payload);
      if (!res.success) throw new Error(res.message || 'Error al crear codigo');
      toast.success('Codigo de acceso creado');
      onSuccess();
      // reset
      setCodigo('');
      setIdPaciente('');
      setPaciente(null);
      setTipoEvaluacion('');
      setDiasVencimiento(7);
      setFechaVence('');
    } catch (err: any) {
      setError(err?.message || 'Error creando codigo de acceso');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Agregar codigo de acceso</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-3 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

          {/* Codigo generado */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><FileText className="w-4 h-4"/>Codigo (auto)</Label>
            <div className="flex gap-2">
              <Input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Auto" className="uppercase" />
              <Button type="button" variant="outline" onClick={regenerate} title="Regenerar">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Paciente (selector con búsqueda) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="w-4 h-4"/>Paciente</Label>
            <Popover open={patientsOpen} onOpenChange={setPatientsOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                  {paciente ? (
                    <span>{paciente.nombre_completo} (ID {paciente.id_paciente})</span>
                  ) : (
                    <span>Buscar y seleccionar paciente</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    autoFocus
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Buscar por nombre o apellidos"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="p-2 text-sm text-gray-500">Buscando...</div>
                  ) : patientResults.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Sin resultados</div>
                  ) : (
                    patientResults.map(p => (
                      <button
                        key={p.id_paciente}
                        type="button"
                        className="w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                        onClick={() => {
                          setPaciente(p);
                          setIdPaciente(p.id_paciente);
                          setPatientsOpen(false);
                        }}
                      >
                        <div className="text-sm font-medium text-gray-900">{p.nombres} {p.apellidos}</div>
                        <div className="text-xs text-gray-500">ID {p.id_paciente} • {p.nombre_completo}</div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Prueba cognitiva */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><FileText className="w-4 h-4"/>Prueba cognitiva</Label>
            <Select value={tipoEvaluacion} onValueChange={setTipoEvaluacion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingInit ? 'Cargando...' : 'Seleccione prueba'} />
              </SelectTrigger>
              <SelectContent>
                {pruebas.map(p => (
                  <SelectItem key={p.id_prueba} value={p.codigo}>{p.codigo} - {p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vencimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Vence en (dias)</Label>
              <Input type="number" min={1} value={diasVencimiento} onChange={(e) => setDiasVencimiento(Number(e.target.value || 1))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Calendar className="w-4 h-4"/>O fecha especifica</Label>
              <Input type="datetime-local" value={fechaVence} onChange={(e) => setFechaVence(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting || loadingInit}>{submitting ? 'Guardando...' : 'Crear'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
