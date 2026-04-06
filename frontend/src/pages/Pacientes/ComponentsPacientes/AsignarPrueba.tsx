import { useState } from "react";
import ReactDOM from "react-dom";
import { X, KeyRound, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type Paciente } from "@/services/pacienteServices";
import { useGetPruebas } from "@/services/pruebaServices";

interface AsignarPruebaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paciente: Paciente;
}

function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part(3)}-${part(4)}`;
}

export default function AsignarPruebaDialog({ open, onClose, onSuccess, paciente }: AsignarPruebaProps) {
  const [pruebaId, setPruebaId] = useState("");
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  
  // Cargamos dinámicamente las pruebas reales de la base de datos
  const { pruebas } = useGetPruebas();

  const handleGenerar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pruebaId) return;
    setCodigoGenerado(generarCodigo());
    toast.success("Código de acceso generado exitosamente");
    // Opcional: Llama a onSuccess() si deseas que guarde la prueba enseguida.
  };

  const handleCopiar = () => {
    if (codigoGenerado) {
      navigator.clipboard.writeText(codigoGenerado);
      setCopiado(true);
      toast.success("Código copiado al portapapeles");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleClose = () => {
    setPruebaId("");
    setCodigoGenerado(null);
    setCopiado(false);
    onClose();
  };

  if (!open || !paciente) return null;

  const pruebaSeleccionada = pruebas.find(p => String(p.id_prueba) === pruebaId);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-3 border-b">
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-semibold">Asignar prueba</h3>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <form onSubmit={handleGenerar} className="space-y-4">
            <div className="text-sm text-gray-600">
              Genera un código de acceso temporal para que <span className="font-semibold text-gray-900">{paciente.nombres} {paciente.apellidos}</span> realice una prueba cognitiva.
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Prueba cognitiva</label>
              <Select value={pruebaId} onValueChange={setPruebaId} disabled={!!codigoGenerado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una prueba..." />
                </SelectTrigger>
                <SelectContent>
                  {pruebas.map((p) => (
                    <SelectItem key={p.id_prueba} value={String(p.id_prueba)}>
                      <span className="font-medium">{p.nombre_prueba}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pruebaSeleccionada?.descripcion && (
                <p className="text-xs text-gray-500">{pruebaSeleccionada.descripcion}</p>
              )}
            </div>

            {codigoGenerado && (
              <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Expira en 24 horas
                </div>
                <p className="text-3xl font-extrabold tracking-[0.2em] text-blue-600 font-mono">
                  {codigoGenerado}
                </p>
                <div className="flex justify-center">
                  <Button type="button" variant="outline" size="sm" onClick={handleCopiar} className="gap-2">
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiado ? "Copiado" : "Copiar código"}
                  </Button>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                    {pruebaSeleccionada?.nombre_prueba}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              {!codigoGenerado ? (
                <>
                  <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!pruebaId} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Generar código
                  </Button>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={handleClose} className="w-full">
                  Cerrar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
