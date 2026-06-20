import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Brain, AlertTriangle, RefreshCw, Activity, FileText, Calendar } from 'lucide-react';
import { resultadosService } from '@/services/resultadosService';

interface SugerenciaProps {
  idPaciente?: number;
}

interface SugerenciaData {
  clasificacion?: 'Normal' | 'Deterioro Cognitivo Leve' | 'Deterioro Cognitivo Moderado' | 'Deterioro Cognitivo Severo' | 'Deterioro Cognitivo Grave';
  riesgo_pct?: number;
  analisis: string;
  fecha_guardada?: string;
  es_cache?: boolean;
  sin_generar?: boolean;
  sin_evaluaciones?: boolean;
}

export default function Sugerencia({ idPaciente }: SugerenciaProps) {
  const [sugerencia, setSugerencia] = useState<SugerenciaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSugerencia = async (id: number, regenerar = false) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await resultadosService.getSugerenciaIA(id, regenerar);
      if (resp.success && resp.data) {
        setSugerencia(resp.data);
      } else {
        setError(resp.message || 'Error al obtener la sugerencia diagnóstica.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error de red al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!idPaciente) {
      setSugerencia(null);
      setError(null);
      return;
    }
    fetchSugerencia(idPaciente, false); // Cargar de DB por defecto
  }, [idPaciente]);

  // Si no hay paciente seleccionado
  if (!idPaciente) {
    return (
      <Card className="w-full p-6 bg-slate-50 border border-dashed border-slate-200 shadow-none rounded-[16px] flex flex-col items-center justify-center text-center">
        <Brain className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-slate-500 font-medium text-sm">
          Seleccione un paciente y busque sus resultados para ver la sugerencia diagnóstica elaborada por la IA.
        </p>
      </Card>
    );
  }

  // Estado de carga (Skeleton Loader elegante)
  if (loading) {
    return (
      <Card className="w-full p-6 bg-white border border-slate-100 shadow-sm rounded-[16px] animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-slate-200 rounded-full" />
            <div className="w-44 h-5 bg-slate-200 rounded" />
          </div>
          <div className="w-28 h-8 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-24 h-6 bg-slate-200 rounded-full" />
          <div className="w-32 h-4 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 bg-slate-200 rounded" />
          <div className="w-5/6 h-4 bg-slate-200 rounded" />
          <div className="w-4/6 h-4 bg-slate-200 rounded" />
        </div>
        <div className="w-full h-10 bg-slate-100 rounded-lg" />
      </Card>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card className="w-full p-5 bg-red-50/50 border border-red-100 shadow-sm rounded-[16px] flex flex-col gap-3">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">No se pudo generar la sugerencia diagnóstica</span>
        </div>
        <p className="text-red-600 text-xs leading-snug">{error}</p>
        <button
          onClick={() => fetchSugerencia(idPaciente, true)}
          className="self-start flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 font-bold bg-white border border-red-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-50/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar análisis
        </button>
      </Card>
    );
  }

  if (!sugerencia) return null;

  // Si el paciente no tiene evaluaciones cognitivas previas en absoluto
  if (sugerencia.sin_evaluaciones) {
    return (
      <Card className="w-full p-6 border border-slate-200/80 shadow-md rounded-[20px] bg-white flex flex-col items-center justify-center text-center gap-3">
        <Brain className="w-8 h-8 text-slate-300 mb-1 shrink-0" />
        <p className="text-slate-500 font-medium text-sm max-w-md leading-relaxed">
          {sugerencia.analisis}
        </p>
      </Card>
    );
  }

  // Si la sugerencia no se ha generado en absoluto (sin_generar: true)
  if (sugerencia.sin_generar) {
    return (
      <Card className="w-full p-6 border border-slate-200/80 shadow-md rounded-[20px] bg-white flex flex-col items-center justify-center text-center gap-4">
      
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-800">Sugerencia diagnóstica no generada</h3>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Este paciente tiene evaluaciones registradas, pero aún no se ha elaborado una sugerencia diagnóstica con Inteligencia Artificial.
          </p>
        </div>
        <button
          onClick={() => fetchSugerencia(idPaciente, true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Generar sugerencia
        </button>
      </Card>
    );
  }

  // Determinar estilos según clasificación de la IA
  const clasif = sugerencia.clasificacion;
  let bgClass = "bg-[#f4fbf7] border-[#d1e9d8]";
  let textClass = "text-[#10b981]";
  let iconClass = "text-[#0f5132]";
  let badgeClass = "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]";

  if (clasif === "Deterioro Cognitivo Leve") {
    bgClass = "bg-[#fffcf0] border-[#fde68a]";
    textClass = "text-[#d97706]";
    iconClass = "text-[#92400e]";
    badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
  } else if (clasif === "Deterioro Cognitivo Moderado") {
    bgClass = "bg-[#fff7ed] border-[#ffedd5]";
    textClass = "text-[#ea580c]";
    iconClass = "text-[#c2410c]";
    badgeClass = "bg-orange-100 text-orange-800 border-orange-200";
  } else if (clasif === "Deterioro Cognitivo Severo" || clasif === "Deterioro Cognitivo Grave") {
    bgClass = "bg-[#fff5f5] border-[#fed7d7]";
    textClass = "text-[#dc2626]";
    badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
  }

  return (
    <Card className="w-full p-6 border shadow-md rounded-[20px] transition-all bg-white flex flex-col gap-4 border-slate-200/80">
      
      {/* Cabecera: Título y Botón de Recarga */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-800">
          <h3>Sugerencia diagnóstica</h3>
        </div>
        <button
          onClick={() => fetchSugerencia(idPaciente, true)}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          Actualizar análisis IA
        </button>
      </div>

      {/* Tabla con la Sugerencia */}
      <div className="w-full overflow-hidden border border-slate-200/80 rounded-[16px] shadow-xs bg-slate-50/30">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-700 font-semibold text-xs tracking-wider uppercase">
              <th className="px-5 py-3.5 w-1/3 sm:w-1/4">Indicador Clínico</th>
              <th className="px-5 py-3.5 w-2/3 sm:w-3/4">Resultado / Recomendación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="px-5 py-4 font-semibold text-slate-600 flex items-center gap-2">
                <span>Sugerencia</span>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold border shadow-xs ${badgeClass}`}>
                  {clasif}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="px-5 py-4 font-semibold text-slate-600 flex items-center gap-2">
                <span>Riesgo de deterioro cognitivo</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-base ${textClass}`}>{sugerencia.riesgo_pct}%</span>
                  <div className="w-full max-w-[200px] bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        clasif === 'Normal' ? 'bg-[#10b981]' : 
                        clasif === 'Deterioro Cognitivo Leve' ? 'bg-amber-500' :
                        clasif === 'Deterioro Cognitivo Moderado' ? 'bg-orange-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sugerencia.riesgo_pct}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="px-5 py-4 font-semibold text-slate-600 flex items-center gap-2 align-top">
                <span>Análisis clínico</span>
              </td>
              <td className="px-5 py-4 text-slate-700 leading-relaxed font-normal text-[13.5px] whitespace-pre-line">
                {sugerencia.analisis}
              </td>
            </tr>
            {sugerencia.fecha_guardada && (
              <tr className="hover:bg-slate-50/40 transition-colors bg-slate-50/10">
                <td className="px-5 py-3 font-semibold text-slate-500 flex items-center gap-2">
                  <span>Última evaluación</span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                  {sugerencia.fecha_guardada} <span className="text-slate-400 ml-1.5"></span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Caja de Aviso Legal/Clínico */}
      <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3 mt-1 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <p className="text-amber-800 text-xs sm:text-[13px] leading-relaxed">
          <strong className="font-extrabold mr-1">Aviso importante:</strong> 
          Esta sugerencia es generada automáticamente por inteligencia artificial como apoyo diagnóstico neuropsicológico. El diagnóstico definitivo de deterioro cognitivo debe ser realizado exclusivamente por un profesional de la salud calificado (neurólogo, psiquiatra o neuropsicólogo), integrando la historia clínica completa, la exploración física-neurológica y otros estudios diagnósticos complementarios.
        </p>
      </div>
      
    </Card>
  );
}
