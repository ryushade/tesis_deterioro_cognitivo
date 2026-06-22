import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { codigosAccesoService } from '@/services/codigosAccesoService';
import { useGetPruebas } from '@/services/pruebaServices';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codigo: CodigoAcceso | null;
}

export default function EditCodigoModal({ open, onClose, onSuccess, codigo }: Props) {
  const [estado, setEstado] = useState<string>('1');
  const [tipoEvaluacion, setTipoEvaluacion] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { pruebas } = useGetPruebas();

  useEffect(() => {
    if (codigo && open && pruebas.length > 0) {
      setEstado(codigo.estado?.toString() || '1');
      
      const tipoStr = String(codigo.tipo_evaluacion || codigo.nombre_prueba).toLowerCase();
      // Buscamos cuál es la prueba real en base al nombre devuelto por el backend
      const matchedPrueba = pruebas.find(p => p.nombre_prueba.toLowerCase() === tipoStr);

      if (matchedPrueba) {
        setTipoEvaluacion(matchedPrueba.id_prueba.toString());
      } else {
        // Fallback por coincidencia parcial contra el catálogo real (sin ids hardcodeados)
        const partial = pruebas.find(p => {
          const nombre = p.nombre_prueba.toLowerCase();
          if (tipoStr.includes('fluidez') || tipoStr.includes('voz'))
            return nombre.includes('fluidez') || nombre.includes('voz');
          if (tipoStr.includes('mmse') || tipoStr.includes('mini'))
            return nombre.includes('mmse') || nombre.includes('mini');
          if (tipoStr.includes('reloj') || tipoStr.includes('cdt'))
            return nombre.includes('reloj');
          return nombre.includes(tipoStr) || tipoStr.includes(nombre);
        });
        setTipoEvaluacion(partial ? partial.id_prueba.toString() : pruebas[0].id_prueba.toString());
      }

      setError(null);
    }
  }, [codigo, open, pruebas]);

  if (!open || !codigo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Usamos el update enviando tipo de evaluación y estado numérico
      const res = await codigosAccesoService.update((codigo as any).id_asignacion || codigo.id_codigo, {
        estado: parseInt(estado) as any,
        tipo_evaluacion: tipoEvaluacion as any
      });
      
      if (!res.success) throw new Error(res.message || 'Error al actualizar');
      
      toast.success('Código actualizado exitosamente');
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al actualizar el código';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Editar código de acceso</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
          
          {codigo.estado === 2 && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Esta prueba ya ha sido completada. No se permite modificar el estado ni la prueba asignada de un código de acceso completado.
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Código</Label>
              <div className="mt-1 text-sm font-medium">{codigo.codigo}</div>
            </div>
            
            <div>
              <Label>Paciente</Label>
              <div className="mt-1 text-sm">{codigo.nombre_paciente || `${codigo.nombres} ${codigo.apellidos}`}</div>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full" disabled={codigo.estado === 2}>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Pendiente / Activo</SelectItem>
                  <SelectItem value="2">Completado</SelectItem>
                  <SelectItem value="3">En Progreso</SelectItem>
                  <SelectItem value="0">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prueba asignada</Label>
              <Select value={tipoEvaluacion} onValueChange={setTipoEvaluacion}>
                <SelectTrigger className="w-full" disabled={codigo.estado === 2}>
                  <SelectValue placeholder="Seleccione la prueba" />
                </SelectTrigger>
                <SelectContent>
                  {pruebas.map((prueba) => (
                    <SelectItem key={prueba.id_prueba} value={prueba.id_prueba.toString()}>
                      {prueba.nombre_prueba}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              {codigo.estado === 2 ? 'Cerrar' : 'Cancelar'}
            </Button>
            {codigo.estado !== 2 && (
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
