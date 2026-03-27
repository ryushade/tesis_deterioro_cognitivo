import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PruebaCognitiva } from '@/types/evaluaciones';

type Modo = 'papel' | 'digital';

interface AddPruebaProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Omit<PruebaCognitiva, 'id_prueba' | 'creado_en' | 'actualizado_en'>) => Promise<void> | void;
}

export function AddPrueba({ open, onClose, onCreate }: AddPruebaProps) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [puntajeMaximo, setPuntajeMaximo] = useState<string>('');
  const [modoAplicacion, setModoAplicacion] = useState<Modo>('papel');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setCodigo('');
    setNombre('');
    setPuntajeMaximo('');
    setModoAplicacion('papel');
    setActivo(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!codigo.trim() || !nombre.trim()) {
        setError('Código y nombre son obligatorios');
        setSubmitting(false);
        return;
      }
      const payload = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        puntaje_maximo: puntajeMaximo ? Number(puntajeMaximo) : undefined,
        modo_aplicacion: modoAplicacion,
        activo,
      } as any;
      await onCreate(payload);
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error creando la prueba');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px) saturate(180%) brightness(0.9)'
    }}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Agregar prueba neuropsicológicas</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-2 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            {/* <div>
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: MMSE" required />
            </div> */}
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la prueba" required />
            </div>
            <div>
              <Label htmlFor="puntaje">Puntaje máximo</Label>
              <Input id="puntaje" type="number" step="0.01" min="0" value={puntajeMaximo} onChange={(e) => setPuntajeMaximo(e.target.value)} placeholder="Ej: 30" />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción de la prueba" />
                
            </div>
            <div className="flex items-center gap-2">
              <input id="activo" type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="activo">Activo</Label>
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

export default AddPrueba;
