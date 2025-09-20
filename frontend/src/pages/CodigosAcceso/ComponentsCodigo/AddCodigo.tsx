import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';
import { User, Calendar, FileText, X } from 'lucide-react';

interface AddCodigoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CodigoFormData {
  id_paciente: number | undefined;
  nombre_paciente: string;
  tipo_evaluacion: string;
  vence_at: string;
}

function AddCodigoModal({ open, onClose, onSuccess }: AddCodigoModalProps) {
  const [formData, setFormData] = useState<CodigoFormData>({
    id_paciente: undefined,
    nombre_paciente: '',
    tipo_evaluacion: '',
    vence_at: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_paciente || !formData.tipo_evaluacion || !formData.vence_at) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Simular API call - reemplazar con servicio real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Código de acceso creado exitosamente');
      
      // Reset form
      setFormData({
        id_paciente: undefined,
        nombre_paciente: '',
        tipo_evaluacion: '',
        vence_at: '',
      });
      
      onSuccess();
    } catch (error) {
      toast.error('Error al crear código de acceso');
      console.error('Error creating codigo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CodigoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="bg-white shadow-2xl border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Crear código de acceso</CardTitle>
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
              <Label htmlFor="id_paciente" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ID Paciente *
              </Label>
              <Input
                id="id_paciente"
                type="number"
                value={formData.id_paciente?.toString() || ''}
                onChange={(e) => handleChange('id_paciente', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ingrese el ID del paciente"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_paciente" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre del Paciente
              </Label>
              <Input
                id="nombre_paciente"
                value={formData.nombre_paciente}
                onChange={(e) => handleChange('nombre_paciente', e.target.value)}
                placeholder="Nombre completo del paciente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_evaluacion" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tipo de Evaluación *
              </Label>
              <select
                id="tipo_evaluacion"
                value={formData.tipo_evaluacion}
                onChange={(e) => handleChange('tipo_evaluacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione el tipo de evaluación</option>
                <option value="CDT">CDT - Clock Drawing Test</option>
                <option value="MMSE">MMSE - Mini Mental State Examination</option>
                <option value="MoCA">MoCA - Montreal Cognitive Assessment</option>
                <option value="ACE-III">ACE-III - Addenbrooke's Cognitive Examination</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vence_at" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Vencimiento *
              </Label>
              <Input
                id="vence_at"
                type="date"
                value={formData.vence_at}
                onChange={(e) => handleChange('vence_at', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex gap-3 pt-4">
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
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </div>
            ) : (
              'Crear código'
            )}
          </Button>
        </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default AddCodigoModal;
