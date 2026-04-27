import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoriaServices } from '@/services/categoriaServices';
import toast from 'react-hot-toast';

interface AddCategoriaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoriaModal({ open, onClose, onSuccess }: AddCategoriaModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_categoria: '',
    puntaje_maximo: '',
    estado: '1',
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_categoria.trim() || !formData.puntaje_maximo) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const response = await categoriaServices.create({
        id_prueba: 2, // ID para MMSE
        nombre_categoria: formData.nombre_categoria,
        puntaje_maximo: parseInt(formData.puntaje_maximo),
        estado: parseInt(formData.estado),
      });

      if (response.success) {
        toast.success(response.message || 'Categoría creada exitosamente');
        setFormData({
          nombre_categoria: '',
          puntaje_maximo: '',
          estado: '1',
        });
        onSuccess();
      } else {
        toast.error(response.message || 'Error al crear la categoría');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Agregar categoría</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="nombre_categoria">Nombre de categoría <span className="text-red-500">*</span></Label>
              <Input
                id="nombre_categoria"
                name="nombre_categoria"
                placeholder="Ej. Orientación Temporal"
                value={formData.nombre_categoria}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="puntaje_maximo">Puntaje máximo <span className="text-red-500">*</span></Label>
              <Input
                id="puntaje_maximo"
                name="puntaje_maximo"
                type="number"
                min="1"
                placeholder="Ej. 10"
                value={formData.puntaje_maximo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <Label>Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleSelectChange('estado', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Activo</SelectItem>
                  <SelectItem value="0">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
