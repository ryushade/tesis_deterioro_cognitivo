import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pacientesService, type PacienteCreate } from '@/services/pacientesService';
import toast from 'react-hot-toast';
import { User, Calendar, Users, GraduationCap, X } from 'lucide-react';

interface AddPacienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddPacienteModal({ open, onClose, onSuccess }: AddPacienteModalProps) {
  const [formData, setFormData] = useState<PacienteCreate>({
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: undefined,
    anos_escolaridad: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.nombres.trim()) {
        toast.error('El nombre es requerido');
        return;
      }
      if (!formData.apellidos.trim()) {
        toast.error('Los apellidos son requeridos');
        return;
      }
      if (!formData.fecha_nacimiento) {
        toast.error('La fecha de nacimiento es requerida');
        return;
      }

      const response = await pacientesService.create(formData);
      
      if (response.success) {
        toast.success('Paciente creado exitosamente');
        setFormData({
          nombres: '',
          apellidos: '',
          fecha_nacimiento: '',
          sexo: undefined,
          anos_escolaridad: undefined,
        });
        onSuccess();
      } else {
        toast.error(response.message || 'Error al crear paciente');
      }
    } catch (error) {
      toast.error('Error de conexión al servidor');
      console.error('Error creating paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PacienteCreate, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="bg-white shadow-2xl border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Agregar paciente</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
              />
            </div>
            
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
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sexo
              </Label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sexo || ''}
                onChange={(e) => handleChange('sexo', e.target.value as 'M' | 'F' | undefined)}
              >
                <option value="">Seleccionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="anos_escolaridad" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Años de Escolaridad
              </Label>
              <Input
                id="anos_escolaridad"
                type="number"
                min={0}
                max={30}
                value={formData.anos_escolaridad?.toString() || ''}
                onChange={(e) => handleChange('anos_escolaridad', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Años de educación formal"
              />
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Paciente'}
          </Button>
        </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default AddPacienteModal;
