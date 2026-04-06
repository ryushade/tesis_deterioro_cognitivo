import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pacientesService, type Paciente, type PacienteUpdate } from '@/services/pacienteServices';
import toast from 'react-hot-toast';

type Sexo = '0' | '1' | '';
type Escolaridad = 'primaria_basica' | 'secundaria_completa' | 'superior_completa' | '';

interface EditPacienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paciente: Paciente | null;
}

export default function EditPacienteModal({ open, onClose, onSuccess, paciente }: EditPacienteModalProps) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('');
  const [escolaridad, setEscolaridad] = useState<Escolaridad>('');
  const [submitting, setSubmitting] = useState(false);

  // Llenar el formulario cuando cambie el paciente
  useEffect(() => {
    if (paciente) {
      setNombres(paciente.nombres || '');
      setApellidos(paciente.apellidos || '');
      
      // Aislar correctamente formato YYYY-MM-DD forzando compatibilidad en <Input type="date">
      let parsedDate = '';
      if (paciente.fecha_nacimiento) {
        try {
          const d = new Date(paciente.fecha_nacimiento);
          if (!isNaN(d.getTime())) {
            parsedDate = d.toISOString().split('T')[0];
          }
        } catch(e) {}
      }
      setFechaNacimiento(parsedDate);
      
      // Parsear sexo (en DB podría ser un string M/F o números enteros)
      let parsedSexo: Sexo = '';
      if (paciente.sexo !== undefined && paciente.sexo !== null) {
          const val = String(paciente.sexo).toLowerCase();
          if (val === '0' || val === 'masculino' || val === 'm' || val === 'false') parsedSexo = '0';
          else if (val === '1' || val === 'femenino' || val === 'f' || val === 'true') parsedSexo = '1';
      }
      setSexo(parsedSexo);
      
      // La API nos devuelve el JOIN (Ej: "Primaria basica") o el ID directo.
      let mappedEscolaridad: Escolaridad = '';
      const scId = String((paciente as any).id_escolaridad);
      const scName = String(paciente.escolaridad || '').toLowerCase();
      
      if (scId === '1' || scName.includes('primaria') || scName.includes('básica')) {
          mappedEscolaridad = 'primaria_basica';
      } else if (scId === '3' || scName.includes('superior') || scName.includes('universidad')) {
          mappedEscolaridad = 'superior_completa';
      } else if (scId === '2' || scName.includes('secundaria') || scName.includes('media')) {
          mappedEscolaridad = 'secundaria_completa'; 
      }
      setEscolaridad(mappedEscolaridad);
    }
  }, [paciente]);

  const calcularEdad = (fecha: string): number | null => {
    const nacimiento = new Date(fecha);
    if (Number.isNaN(nacimiento.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente) return;
    setSubmitting(true);
    
    try {
      // Validaciones
      if (!nombres.trim() || !apellidos.trim() || !fechaNacimiento) {
        toast.error('Nombres, apellidos y fecha de nacimiento son requeridos');
        setSubmitting(false);
        return;
      }
      
      const edad = calcularEdad(fechaNacimiento);
      const hoyISO = new Date().toISOString().split('T')[0];
      
      if (!edad && edad !== 0) {
        toast.error('Fecha de nacimiento inválida');
        setSubmitting(false);
        return;
      }
      if (fechaNacimiento > hoyISO) {
        toast.error('La fecha de nacimiento no puede ser futura');
        setSubmitting(false);
        return;
      }
      if (edad < 0 || edad > 120) {
        toast.error('La edad debe estar entre 0 y 120 años');
        setSubmitting(false);
        return;
      }

      const formData: any = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        fecha_nacimiento: fechaNacimiento,
        escolaridad: escolaridad || undefined
      };
      
      if (sexo === '0' || sexo === '1') {
        formData.sexo = sexo;
      }

      const response = await pacientesService.update(paciente.id_paciente, formData);
      if (response?.success) {
        toast.success('Paciente actualizado exitosamente');
        onSuccess();
      } else {
        toast.error(response?.message || 'Error al actualizar paciente');
      }
    } catch (error) {
      toast.error('Error de conexión al servidor');
      console.error('Error updating paciente:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !paciente) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Editar paciente</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-2 space-y-4">
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
              <Input
                id="fecha_nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
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
    </div>,
    document.body
  );
}
