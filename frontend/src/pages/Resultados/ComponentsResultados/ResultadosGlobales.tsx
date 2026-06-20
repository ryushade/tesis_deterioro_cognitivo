import React from 'react';
import { Card } from "@/components/ui/card";
import Sugerencia from './Sugerencia';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import type { EvaluacionResultado } from '@/services/resultadosService';
import { AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ResultadosGlobalesProps {
  idPaciente?: number;
  resultados: EvaluacionResultado[];
  loading: boolean;
  error: string | null;
}

export default function ResultadosGlobales({ idPaciente, resultados, loading, error }: ResultadosGlobalesProps) {
  
  // Formateadores auxiliares
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '-';
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return fechaStr.split('T')[0];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return fechaStr;
    }
  };

  const formatTiempo = (segundos?: number) => {
    if (segundos === undefined || segundos === null || segundos === 0) return '-';
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    if (mins > 0 && secs > 0) {
      return `${mins} min ${secs}s`;
    } else if (mins > 0) {
      return `${mins} min`;
    } else {
      return `${secs}s`;
    }
  };

  const getScore = (raw: EvaluacionResultado) => {
    const isCDT = raw.nombre_prueba.toLowerCase().includes('reloj') || raw.nombre_prueba.toLowerCase().includes('cdt');
    if (isCDT) {
      return raw.puntaje_ia !== undefined && raw.puntaje_ia !== null 
        ? `${raw.puntaje_ia}/${raw.puntaje_maximo_prueba || 10}`
        : raw.puntaje_total !== undefined && raw.puntaje_total !== null
          ? `${raw.puntaje_total}/${raw.puntaje_maximo_prueba || 10}`
          : '-';
    }
    return raw.puntaje_total !== undefined && raw.puntaje_total !== null 
      ? `${raw.puntaje_total}/${raw.puntaje_maximo_prueba || 30}` 
      : '-';
  };

  const renderClasificacionBadge = (raw: EvaluacionResultado) => {
    const isCDT = raw.nombre_prueba.toLowerCase().includes('reloj') || raw.nombre_prueba.toLowerCase().includes('cdt');
    
    // Si la evaluación ya viene clasificada desde el backend (CDT de BD o MMSE por escolaridad)
    if (raw.clasificacion_ia) {
      const label = raw.clasificacion_ia;
      const labelLower = label.toLowerCase();
      const isNormal = labelLower === 'normal';
      
      if (isNormal) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Normal
          </span>
        );
      }
      
      let badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
      if (labelLower.includes('leve')) {
        badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
      } else if (labelLower.includes('moderado')) {
        badgeColor = "bg-orange-50 text-orange-700 border-orange-100";
      }
      
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {label}
        </span>
      );
    }

    if (isCDT) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Normal
        </span>
      );
    }
    
    // Fallback estático para MMSE legacy sin clasificación de backend
    const score = raw.puntaje_total ?? 0;
    if (score >= 24) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Normal
        </span>
      );
    } else if (score >= 19) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          Deterioro Leve
        </span>
      );
    } else if (score >= 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
          Deterioro Moderado
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
          Deterioro Severo
        </span>
      );
    }
  };

  // Procesar datos para el gráfico lineal MMSE (Cronológico Ascendente)
  const mmseData = resultados
    .filter(r => r.nombre_prueba.toLowerCase().includes('mmse') || r.nombre_prueba.toLowerCase().includes('mental'))
    .map(r => {
      const d = new Date(r.fecha_evaluacion);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return {
        date: `${day}/${month}/${year}`,
        score: r.puntaje_total ?? 0,
        timestamp: d.getTime()
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp); // De más antiguo a más reciente

  // Calcular tendencia
  let tendenciaLabel = "Sin datos de MMSE";
  let tendenciaBadge = (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
      <Minus className="w-3.5 h-3.5" /> N/A
    </span>
  );

  if (mmseData.length === 1) {
    tendenciaLabel = "Tendencia Inicial";
    tendenciaBadge = (
      <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
        Primera evaluación
      </span>
    );
  } else if (mmseData.length >= 2) {
    const oldest = mmseData[0].score;
    const latest = mmseData[mmseData.length - 1].score;
    const diff = latest - oldest;
    
    if (diff < 0) {
      tendenciaLabel = "Tendencia General";
      tendenciaBadge = (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
          <TrendingDown className="w-3.5 h-3.5" /> Declive Cognitivo ({diff} pts)
        </span>
      );
    } else if (diff > 0) {
      tendenciaLabel = "Tendencia General";
      tendenciaBadge = (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" /> Mejora Cognitiva (+{diff} pts)
        </span>
      );
    } else {
      tendenciaLabel = "Tendencia General";
      tendenciaBadge = (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
          Estable (0 pts)
        </span>
      );
    }
  }

  // Renderizar estados vacíos o iniciales
  if (!idPaciente) {
    return (
      <div className="w-full flex flex-col gap-6 items-center justify-center min-h-[300px] border border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 p-8 text-center mt-4">
        <AlertCircle className="w-10 h-10 text-slate-300" />
        <div>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            Seleccione un paciente de la barra superior y haga clic en <strong>Buscar resultados</strong> para visualizar el historial completo de pruebas y gráficos evolutivos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 items-center justify-center min-h-[300px] p-8 mt-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Cargando historial clínico de evaluaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col gap-6 items-center justify-center min-h-[300px] border border-red-100 bg-red-50/20 rounded-[24px] p-8 text-center mt-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div>
          <h3 className="text-lg font-bold text-red-800">Error al cargar historial</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full pt-4 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Columna Izquierda: Tabla de Historial */}
        <Card className="flex-1 p-6 bg-white shadow-sm border border-slate-100 rounded-[20px] w-full flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historial de pruebas</h2>
              <p className="text-[15px] text-slate-500 mt-1">Línea temporal de evaluaciones cognitivas realizadas</p>
            </div>

            {/* Tabla */}
            <div className="w-full overflow-x-auto">
              {resultados.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  Este paciente no cuenta con evaluaciones registradas.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 pr-4 font-medium text-slate-500 text-[14px] w-1/3">Prueba</th>
                      <th className="py-2 px-4 font-medium text-slate-500 text-[14px]">Fecha</th>
                      <th className="py-2 px-4 font-medium text-slate-500 text-[14px]">Puntuación</th>
                      <th className="py-2 px-4 font-medium text-slate-500 text-[14px]">Tiempo</th>
                      <th className="py-2 px-4 font-medium text-slate-500 text-[14px] text-right">Clasificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((raw) => (
                      <tr key={raw.id_evaluacion} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-4 text-[14px] font-bold text-slate-800">{raw.nombre_prueba}</td>
                        <td className="py-4 px-4 text-[14px] text-slate-600">{formatFecha(raw.fecha_evaluacion)}</td>
                        <td className="py-4 px-4 text-[14px] font-semibold text-slate-700">{getScore(raw)}</td>
                        <td className="py-4 px-4 text-[14px] text-slate-600">{formatTiempo(raw.duracion_segundos)}</td>
                        <td className="py-4 px-4 text-right">{renderClasificacionBadge(raw)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>

        {/* Columna Derecha: Spotlight Analítico */}
        <Card className="w-full lg:w-[450px] p-6 bg-white shadow-sm border border-slate-100 rounded-[20px] flex flex-col justify-between shrink-0">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Progresión (MMSE)</h3>
              <p className="text-[14px] text-slate-500 mt-1">Evolución longitudinal de las puntuaciones del paciente</p>
            </div>
            
            <div className="w-full h-[220px]">
              {mmseData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-center text-slate-400 text-sm font-medium border border-dashed border-slate-100 rounded-xl">
                  Sin datos del test MMSE para graficar
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mmseData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 30]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center w-full">
            <span className="text-sm font-medium text-slate-500">{tendenciaLabel}</span>
            {tendenciaBadge}
          </div>
        </Card>

      </div>
      
      {/* Módulo de Sugerencia Diagnóstica */}
      <Sugerencia idPaciente={idPaciente} />
      
    </div>
  );
}
