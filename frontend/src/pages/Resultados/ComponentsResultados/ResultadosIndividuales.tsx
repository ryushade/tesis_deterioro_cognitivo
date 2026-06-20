import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, ImageOff, Brain } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { EvaluacionResultado } from '@/services/resultadosService';
import { getMediaUrl } from '@/services/api';

interface Props {
  resultados: EvaluacionResultado[];
  loading: boolean;
  error: string | null;
  mostrandoTodos: boolean;
}

// Colores clínicos CDT (misma escala que ResultadosCDT.tsx)
function getColorCDT(puntaje: number) {
  if (puntaje >= 4) return { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700" };
  if (puntaje === 3) return { bar: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700" };
  if (puntaje === 2) return { bar: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700" };
  return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700" };
}

// Clasificación MMSE
const clasificacionMMSE: Record<string, string> = {
  "Normal": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Deterioro leve": "bg-amber-100 text-amber-800 border-amber-200",
  "Deterioro moderado": "bg-orange-100 text-orange-800 border-orange-200",
  "Deterioro severo": "bg-red-100 text-red-800 border-red-200",
};

function getClasificacionMMSE(puntaje: number) {
  if (puntaje >= 24) return "Normal";
  if (puntaje >= 19) return "Deterioro leve";
  if (puntaje >= 14) return "Deterioro moderado";
  return "Deterioro severo";
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDateShort(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { dateStyle: 'medium' });
}

// ======== CDT Card ========
function CardCDT({ ev }: { ev: EvaluacionResultado }) {
  const [mostrarExplicacion, setMostrarExplicacion] = React.useState(false);
  
  const puntaje = ev.puntaje_ia ?? 0;
  const puntajeMax = 5;
  const porcentaje = Math.round((puntaje / puntajeMax) * 100);
  const colores = getColorCDT(puntaje);
  const clasificacion = ev.clasificacion_ia || (ev.detalles_ia_jsonb?.clasificacion) || '—';
  const observaciones = ev.observaciones_ia || ev.detalles_ia_jsonb?.observaciones || '—';
  const conAlerta = puntaje < 4;

  const imgSrc = ev.url_imagen ? getMediaUrl(ev.url_imagen) : null;
  const explicacionSrc = ev.detalles_ia_jsonb?.url_explicacion 
    ? getMediaUrl(ev.detalles_ia_jsonb.url_explicacion) 
    : null;

  return (
    <Card className={`border ${colores.bg} rounded-2xl overflow-hidden shadow-sm`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col items-center justify-center bg-white border-b md:border-b-0 md:border-r border-slate-100 p-4 min-w-[180px] md:w-[200px] gap-3">
          {imgSrc ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <img
                src={mostrarExplicacion && explicacionSrc ? explicacionSrc : imgSrc}
                alt={mostrarExplicacion ? "Mapa de calor de la IA" : "Dibujo del reloj"}
                className="w-full max-w-[160px] max-h-[160px] object-contain rounded-lg border border-slate-200 shadow-sm transition-all duration-300"
              />
              {explicacionSrc && (
                <button
                  onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
                  className={`mt-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full border shadow-sm transition-all duration-200 w-full max-w-[160px] ${
                    mostrarExplicacion
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 animate-pulse" />
                  {mostrarExplicacion ? 'Ver Original' : 'Explicabilidad IA'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <ImageOff className="w-10 h-10" />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">Prueba del Reloj</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(ev.fecha_evaluacion)}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colores.badge}`}>
              {clasificacion}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Puntaje IA</span>
              <span className={`text-2xl font-black ${colores.text}`}>
                {puntaje}<span className="text-sm font-medium text-slate-400">/{puntajeMax}</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`${colores.bar} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 mt-1">
              {[0,1,2,3,4,5].map(n => (
                <span key={n} className={n === puntaje ? `${colores.text} font-bold text-xs` : ''}>{n}</span>
              ))}
            </div>
          </div>

          <div className={`rounded-xl px-4 py-3 border ${conAlerta ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              {conAlerta
                ? <AlertTriangle className="w-4 h-4 text-orange-500" />
                : <CheckCircle2 className="w-4 h-4 text-green-500" />}
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {conAlerta ? 'Requiere atención' : 'Dentro de rango normal'}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{observaciones}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ======== MMSE Card (with recharts RadarChart) ========
function CardMMSE({ ev }: { ev: EvaluacionResultado }) {
  const [verDetalle, setVerDetalle] = React.useState(false);
  const puntaje = ev.puntaje_total ?? 0;
  const puntajeMax = ev.puntaje_maximo_prueba ?? 30;
  const clasificacion = getClasificacionMMSE(puntaje);
  const categorias = ev.categorias_mmse || [];
  const duracionMinutos = ev.duracion_segundos ? Math.round(ev.duracion_segundos / 60) : null;

  // Prepare radar data: normalize each category to percentage
  const radarData = categorias.map(cat => ({
    subject: cat.nombre_categoria,
    value: cat.puntaje_maximo > 0 ? Math.round((cat.puntaje_obtenido / cat.puntaje_maximo) * 100) : 0,
    fullMark: 100,
  }));

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">MMSE (Mini-Mental State Examination)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Realizada el {formatDate(ev.fecha_evaluacion)}</p>
          </div>
          <Badge variant="outline" className={`${clasificacionMMSE[clasificacion]} border-none px-3 py-1 font-bold text-xs uppercase`}>
            {clasificacion}
          </Badge>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Info */}
          <div className="space-y-5">
            {/* Score cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Puntuación</p>
                <p className="text-2xl font-black text-slate-800">
                  {puntaje}<span className="text-sm font-medium text-muted-foreground">/{puntajeMax}</span>
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50/50 p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tiempo</p>
                {duracionMinutos !== null ? (
                  <p className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-600" />{duracionMinutos}
                    <span className="text-xs font-semibold text-slate-400">min</span>
                  </p>
                ) : (
                  <p className="text-sm font-bold text-slate-400 mt-2">—</p>
                )}
              </div>
              <div className="rounded-xl border bg-slate-50/50 p-3 text-center flex flex-col justify-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Esperado</p>
                <p className="text-xs font-bold text-slate-600 mt-1">10–15 min</p>
              </div>
            </div>

            {/* Category breakdown table as requested by the user */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntaje por Categoría</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm p-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-2">Categoría</th>
                      <th className="py-2 text-center">Obtenido</th>
                      <th className="py-2 text-center">Máximo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(cat => (
                      <tr key={cat.id_categoria} className="border-b border-slate-100 last:border-b-0 text-xs">
                        <td className="py-2.5 font-bold text-slate-700">{cat.nombre_categoria}</td>
                        <td className="py-2.5 text-center font-black text-slate-800 text-sm">{cat.puntaje_obtenido}</td>
                        <td className="py-2.5 text-center font-bold text-slate-400">{cat.puntaje_maximo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Radar chart using recharts */}
          {radarData.length >= 3 ? (
            <div className="flex items-center justify-center bg-slate-50/30 border border-slate-100 rounded-2xl p-2">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#475569", fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Puntuación" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 border border-dashed rounded-2xl text-xs text-slate-450 italic">
              Gráfico de radar no disponible
            </div>
          )}
        </div>
      </div>

      {/* Detailed breakdown of answers and IA analysis */}
      {ev.respuestas_detalle && ev.respuestas_detalle.length > 0 && (
        <div className="border-t border-slate-150 p-5 bg-slate-50/50">
          <button
            onClick={() => setVerDetalle(!verDetalle)}
            className="flex items-center justify-between w-full text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider"
          >
            <span>{verDetalle ? "Ocultar" : "Ver"} análisis detallado de respuestas e IA</span>
            <span className="text-sm">{verDetalle ? "▲" : "▼"}</span>
          </button>

          {verDetalle && (
            <div className="mt-4 space-y-4 animate-in fade-in duration-300">
              {/* Failed Items Alert */}
              {ev.respuestas_detalle.some(r => !r.correcto) ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5 shadow-sm">
                  <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle size={15} className="text-red-600 animate-pulse" /> Reactivos con fallos detectados:
                  </span>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    {ev.respuestas_detalle.filter(r => !r.correcto).map(r => (
                      <li key={r.id_item} className="leading-relaxed">
                        <strong className="text-slate-800">{r.nombre_categoria}:</strong> {r.texto_item} 
                        {r.respuesta_texto && (
                          <span className="font-semibold text-red-700 bg-red-100/50 px-1.5 py-0.5 rounded ml-1.5">
                            Ingresó: "{r.respuesta_texto}"
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="font-bold">¡El paciente no registró fallos en ningún reactivo de la prueba!</span>
                </div>
              )}

              {/* All Items Detail */}
              <div className="space-y-2 mt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalle completo de respuestas evaluadas</h4>
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {ev.respuestas_detalle.map(r => (
                    <div key={r.id_item} className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                      <div className="space-y-1.5 flex-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                            {r.nombre_categoria}
                          </span>
                          <span className={`font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            r.correcto ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}>
                            {r.correcto ? "Correcto" : "Incorrecto / Fallido"}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-sm mt-1 leading-relaxed">{r.texto_item}</p>
                        
                        {r.respuesta_texto && (
                          <div className="text-slate-650 bg-slate-50/80 p-2 rounded-lg border border-slate-100 font-semibold mt-1">
                            <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Respuesta ingresada:</span>
                            <span className="text-xs text-slate-700 font-bold font-mono">{r.respuesta_texto}</span>
                          </div>
                        )}
                        
                        {r.observacion && (
                          <div className="text-indigo-850 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 flex items-start gap-2 mt-2">
                            <Brain className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-bold text-indigo-750 block text-[9px] uppercase tracking-wider">Detalles de análisis (IA):</span>
                              <p className="leading-relaxed mt-0.5 text-xs font-semibold">{r.observacion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 min-w-[70px] border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Puntaje</span>
                        <span className={`text-base font-black ${r.correcto ? "text-emerald-600" : "text-red-500"}`}>
                          {r.puntaje} / 1
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ======== Main component ========
export default function ResultadosIndividuales({ resultados, loading, error, mostrandoTodos }: Props) {
  if (mostrandoTodos) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
        <p className="font-medium">Selecciona un paciente para ver sus resultados.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-6 flex justify-center items-center py-16 text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
        Cargando resultados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
        <p className="font-medium">El paciente no tiene registros de evaluaciones o no ha realizado dicha prueba.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {resultados.map((ev) => {
        const nombrePrueba = (ev.nombre_prueba || '').toLowerCase();
        const esMMSE = nombrePrueba.includes('mmse') || nombrePrueba.includes('mini-mental') || nombrePrueba.includes('mini mental');
        const esCDT = ev.id_analisis != null || nombrePrueba.includes('reloj');

        if (esMMSE) {
          return <CardMMSE key={ev.id_evaluacion} ev={ev} />;
        }
        if (esCDT) {
          return <CardCDT key={ev.id_evaluacion} ev={ev} />;
        }
        // Placeholder para futuras pruebas
        return (
          <Card key={ev.id_evaluacion} className="p-5 border rounded-2xl shadow-sm text-slate-500 text-sm">
            <div className="font-semibold text-slate-700">{ev.nombre_prueba}</div>
            <div className="text-xs mt-1">{formatDate(ev.fecha_evaluacion)}</div>
            <p className="mt-2 text-slate-400 italic">Visualización detallada próximamente para este tipo de prueba.</p>
          </Card>
        );
      })}
    </div>
  );
}
