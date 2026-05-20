import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Neuropsicologo } from '@/services/neuropsicologosService';
import { apiClient } from '@/services/api';

interface ViewNeuropsicologoModalProps {
  open: boolean;
  onClose: () => void;
  item: Neuropsicologo | null;
}

interface NeuroMetricas {
  total_pacientes: number;
  total_evaluaciones: number;
  diagnosticos: Array<{ diagnostico: string; cantidad: number }>;
  pruebas: Array<{ nombre_prueba: string; cantidad: number }>;
}

export default function ViewNeuropsicologoModal({ open, onClose, item }: ViewNeuropsicologoModalProps) {
  const [metricas, setMetricas] = useState<NeuroMetricas | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && open) {
      setLoading(true);
      const idUsuario = item.id_usuario;
      apiClient.get(`/auth/obtener_neuropsicologo/${idUsuario}/metricas`)
        .then((res) => {
          if (res.data && res.data.success) {
            setMetricas(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Error al obtener métricas del neuropsicólogo:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [item, open]);

  if (!open || !item) return null;

  const isActive = item.estado_usuario === 1 || (item as any).estado === true || item.estado === 1;

  // Clasificar diagnóstico para dar color
  const getDiagnosticoColor = (diag: string) => {
    const d = diag.toLowerCase();
    if (d.includes('alto') || d.includes('severo') || d.includes('moderado') || d.includes('deterioro')) {
      return 'bg-red-500';
    }
    if (d.includes('moderado') || d.includes('dcl') || d.includes('leve') || d.includes('límite') || d.includes('limite')) {
      return 'bg-amber-500';
    }
    return 'bg-green-500';
  };

  const initials = `${item.nombres?.charAt(0) || ''}${item.apellidos?.charAt(0) || ''}`.toUpperCase();

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <Card 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-white shadow-2xl rounded-xl flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Expediente del especialista
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Métricas de actividad diagnóstica y validación clínica de los resultados de la IA</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        {/* Body (Split layout) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left Column: Demographics & Stats summary */}
          <div className="w-full md:w-72 bg-slate-50 p-6 border-r border-slate-100 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {initials || 'SP'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Neuropsicólogo</p>
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {item.nombres} {item.apellidos}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-slate-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuario del sistema</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">@{item.usua}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado de actividad</span>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-105 text-slate-600 border-slate-200'} font-bold text-xs uppercase px-2.5 py-0.5`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-lg border border-slate-150 text-center">
                  <span className="text-2xl font-black text-indigo-600 block">
                    {loading ? '...' : metricas?.total_pacientes ?? 0}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Pacientes a cargo</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-150 text-center">
                  <span className="text-2xl font-black text-indigo-600 block">
                    {loading ? '...' : metricas?.total_evaluaciones ?? 0}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Pruebas supervisadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Research & IA classification metrics */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-semibold">Cargando métricas de auditoría...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* section: Diagnosticos por IA */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Diagnósticos de la IA supervisados
                  </h3>
                  
                  {(!metricas?.diagnosticos || metricas.diagnosticos.length === 0) ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
                      Aún no se registran diagnósticos validados por este especialista.
                    </p>
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-slate-150 space-y-3">
                      {metricas.diagnosticos.map((diag) => {
                        const total = metricas.total_evaluaciones || 1;
                        const pct = Math.round((diag.cantidad / total) * 100);
                        const barColor = getDiagnosticoColor(diag.diagnostico);

                        return (
                          <div key={diag.diagnostico} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span className="truncate">{diag.diagnostico}</span>
                              <span>{diag.cantidad} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }} 
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* section: Pruebas aplicadas */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pruebas validadas por tipo de instrumento
                  </h3>
                  
                  {(!metricas?.pruebas || metricas.pruebas.length === 0) ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
                      No se han catalogado pruebas validadas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metricas.pruebas.map((pr) => (
                        <div key={pr.nombre_prueba} className="bg-white p-3.5 rounded-lg border border-slate-150 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-700 truncate mr-2" title={pr.nombre_prueba}>
                            {pr.nombre_prueba}
                          </span>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-black text-xs px-2.5 py-0.5 rounded-md border-indigo-100 border">
                            {pr.cantidad}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footnote inside the content area */}
                <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/50 mt-4">
                  <p className="text-[10px] text-indigo-850/80 leading-relaxed font-medium">
                    * Estos indicadores reflejan la actividad de validación clínica del especialista, supervisando la coherencia del diagnóstico generado por la IA en las pruebas de dibujo del reloj (CDT) y análisis de audio (voz).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end bg-slate-50/50">
          <Button onClick={onClose} className="px-5 bg-slate-700 hover:bg-slate-800 transition-colors text-xs font-semibold h-9 rounded-lg">
            Cerrar expediente
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  );
}
