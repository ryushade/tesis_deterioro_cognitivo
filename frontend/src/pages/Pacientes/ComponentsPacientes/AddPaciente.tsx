import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerSimple } from '@/components/ui/date-birth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pacientesService } from '@/services/pacienteServices';

type Sexo = '0' | '1' | '';
type Escolaridad = 'primaria_basica' | 'secundaria_completa' | 'superior_completa';

interface AddPacienteProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // se llama tras crear correctamente
}

export function AddPaciente({ open, onClose, onSuccess }: AddPacienteProps) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('');
  const [escolaridad, setEscolaridad] = useState<Escolaridad>('secundaria_completa');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setNombres('');
    setApellidos('');
    setFechaNacimiento('');
    setSexo('');
    setEscolaridad('secundaria_completa');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
     
     
      const payload: any = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        fecha_nacimiento: fechaNacimiento,
        escolaridad,
      };
      
      const hoy = new Date();
      const year = hoy.getFullYear() - 65;
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      const dateLimite = `${year}-${month}-${day}`;

      if (fechaNacimiento > dateLimite) {
        setError('El paciente debe tener al menos 65 años');
        setSubmitting(false);
        return;
      }

      if (sexo === '0' || sexo === '1') payload.sexo = parseInt(sexo, 10);

      const res = await pacientesService.create(payload as any);
      if (!res?.success) {
        throw new Error(res?.message || 'No se pudo crear el paciente');
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error creando el paciente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Agregar paciente</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-2 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres" required />
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos" required />
            </div>
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <DatePickerSimple 
                value={fechaNacimiento} 
                onChange={(val) => setFechaNacimiento(val)}
              />

            </div>
            <div>
              <Label>Sexo</Label>
              <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Masculino</SelectItem>
                  <SelectItem value="1">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escolaridad</Label>
              <Select value={escolaridad} onValueChange={(v) => setEscolaridad(v as Escolaridad)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione escolaridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primaria_basica">Primaria básica</SelectItem>
                  <SelectItem value="secundaria_completa">Secundaria completa</SelectItem>
                  <SelectItem value="superior_completa">Superior completa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaciente;
