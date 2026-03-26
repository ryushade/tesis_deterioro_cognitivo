import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pacientesService, type Paciente, type PacienteUpdate } from '@/services/pacienteServices';
const NIVELES_EDUCATIVOS = ['primaria_basica', 'secundaria_completa', 'superior_completa'];
import toast from 'react-hot-toast';
import { X, User, Calendar, Users, GraduationCap } from 'lucide-react';

interface EditPacienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paciente: Paciente | null;
}

export default function EditPacienteModal({ open, onClose, onSuccess, paciente }: EditPacienteModalProps) {
  const [formData, setFormData] = useState<PacienteUpdate>({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: undefined,
    anos_escolaridad: undefined,
  });
  const [loading, setLoading] = useState(false);

  // Llenar el formulario cuando cambie el paciente
  useEffect(() => {
    if (paciente) {
      setFormData({
        nombres: paciente.nombres || '',
        apellidos: paciente.apellidos || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '',
        sexo: paciente.sexo || undefined,
        anos_escolaridad: paciente.anos_escolaridad || undefined,
      });
    }
  }, [paciente]);

  const handleChange = (field: keyof PacienteUpdate, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    setLoading(true);
    try {
      // Validaciones
      if (!formData.nombres?.trim()) {
        toast.error('El nombre es requerido');
        return;
      }
      if (!formData.apellidos?.trim()) {
        toast.error('Los apellidos son requeridos');
        return;
      }
      if (!formData.fecha_nacimiento) {
        toast.error('La fecha de nacimiento es requerida');
        return;
      }
      // Validación de edad para evitar valores negativos o irreales
      const edad = calcularEdad(formData.fecha_nacimiento!);
      const hoyISO = new Date().toISOString().split('T')[0];
      if (!edad && edad !== 0) {
        toast.error('Fecha de nacimiento inválida');
        return;
      }
      if (formData.fecha_nacimiento! > hoyISO) {
        toast.error('La fecha de nacimiento no puede ser futura');
        return;
      }
      if (edad < 0 || edad > 120) {
        toast.error('La edad debe estar entre 0 y 120 años');
        return;
      }
      const response = await pacientesService.update(paciente.id_paciente, formData);
      if (response?.success) {
        toast.success('Paciente actualizado exitosamente');
        onSuccess();
      } else {
        toast.error(response?.message || 'Error al actualizar paciente');
      }
    } catch (error) {
      toast.error('Error de conexiÃ³n al servidor');
      console.error('Error updating paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !paciente) return null;

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
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between w-full gap-2">
            <CardTitle className="text-xl font-semibold">Editar paciente</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID del Paciente */}
           
            {/* Nombres */}
            <div className="space-y-2">
              <Label htmlFor="nombres" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombres *
              </Label>
              <Input
                id="nombres"
                value={formData.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                placeholder="Ingrese los nombres"
                required
              />
            </div>
            {/* Apellidos */}
            <div className="space-y-2">
              <Label htmlFor="apellidos" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Apellidos *
              </Label>
              <Input
                id="apellidos"
                value={formData.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                placeholder="Ingrese los apellidos"
                required
              />
            </div>
            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Nacimiento *
              </Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
              />
            </div>
            {/* Sexo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sexo
              </Label>
              <select
                value={formData.sexo || ''}
                onChange={(e) => handleChange('sexo', e.target.value as 'M' | 'F' | undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            {/* Nivel Educativo */}
            <div className="space-y-2">
              <Label htmlFor="anos_escolaridad" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Nivel Educativo
              </Label>
              <select
                id="anos_escolaridad"
                value={formData.anos_escolaridad || ''}
                onChange={(e) => handleChange('anos_escolaridad', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un nivel</option>
                {NIVELES_EDUCATIVOS.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>
            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}

