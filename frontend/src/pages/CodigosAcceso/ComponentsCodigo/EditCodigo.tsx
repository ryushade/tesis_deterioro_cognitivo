import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { X, User, Calendar, FileText } from 'lucide-react';
import type { CodigoAcceso } from '@/types/codigosAcceso';

interface EditCodigoModalProps {
  open: boolean;
  onClose: () => void;
  codigo: CodigoAcceso | null;
  onSuccess: () => void;
}

interface CodigoFormData {
  id_paciente: number | undefined;
  nombre_paciente: string;
  tipo_evaluacion: string;
  vence_at: string;
  estado: string;
}

function EditCodigoModal({ open, onClose, codigo, onSuccess }: EditCodigoModalProps) {
  const [formData, setFormData] = useState<CodigoFormData>({
    id_paciente: undefined,
    nombre_paciente: '',
    tipo_evaluacion: '',
    vence_at: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codigo) {
      setFormData({
        id_paciente: codigo.id_paciente,
        nombre_paciente: codigo.nombre_paciente || '',
        tipo_evaluacion: codigo.tipo_evaluacion,
        vence_at: codigo.vence_at,
        estado: codigo.estado,
      });
    } else {
      setFormData({
        id_paciente: undefined,
        nombre_paciente: '',
        tipo_evaluacion: '',
        vence_at: '',
        estado: '',
      });
    }
  }, [codigo]);

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
      
      toast.success('Código de acceso actualizado exitosamente');
      onSuccess();
    } catch (error) {
      toast.error('Error al actualizar código de acceso');
      console.error('Error updating codigo:', error);
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

  if (!open || !codigo) return null;

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Editar código de acceso</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Código */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Código
              </Label>
              <Input
                value={codigo.codigo}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* ID del Paciente */}
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
                placeholder="ID del paciente"
                required
              />
            </div>

            {/* Nombre del Paciente */}
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

            {/* Tipo de Evaluación */}
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

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Estado *
              </Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="emitido">Emitido</option>
                <option value="usado">Usado</option>
                <option value="vencido">Vencido</option>
                <option value="revocado">Revocado</option>
              </select>
            </div>

            {/* Fecha de Vencimiento */}
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
                required
              />
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}

export default EditCodigoModal;
