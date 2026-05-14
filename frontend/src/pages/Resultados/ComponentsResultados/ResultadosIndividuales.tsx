import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, ImageOff, Brain } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { EvaluacionResultado } from '@/services/resultadosService';

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
  const puntaje = ev.puntaje_ia ?? 0;
  const puntajeMax = 5;
  const porcentaje = Math.round((puntaje / puntajeMax) * 100);
  const colores = getColorCDT(puntaje);
  const clasificacion = ev.clasificacion_ia || (ev.detalles_ia_jsonb?.clasificacion) || '—';
  const observaciones = ev.observaciones_ia || ev.detalles_ia_jsonb?.observaciones || '—';
  const conAlerta = puntaje < 4;

  const imgSrc = ev.url_imagen ? `http://localhost:5001/${ev.url_imagen}` : null;

  return (
    <Card className={`border ${colores.bg} rounded-2xl overflow-hidden shadow-sm`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex items-center justify-center bg-white border-b md:border-b-0 md:border-r border-slate-100 p-4 min-w-[180px] md:w-[200px]">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Dibujo del reloj"
              className="w-full max-w-[160px] max-h-[160px] object-contain rounded-lg border border-slate-200 shadow-sm"
            />
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
  const puntaje = ev.puntaje_total ?? 0;
  const puntajeMax = ev.puntaje_maximo_prueba ?? 30;
  const clasificacion = getClasificacionMMSE(puntaje);
  const categorias = ev.categorias_mmse || [];

  // Prepare radar data: normalize each category to percentage
  const radarData = categorias.map(cat => ({
    subject: cat.nombre_categoria,
    value: cat.puntaje_maximo > 0 ? Math.round((cat.puntaje_obtenido / cat.puntaje_maximo) * 100) : 0,
    fullMark: 100,
  }));

  return (
    <Card>
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">MMSE (Mini-Mental)</h3>
            <p className="text-sm text-muted-foreground">Realizada el {formatDateShort(ev.fecha_evaluacion)}</p>
          </div>
          <Badge variant="outline" className={clasificacionMMSE[clasificacion]}>
            {clasificacion}
          </Badge>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Info */}
          <div className="space-y-4">
            {/* Score cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Puntuación</p>
                <p className="text-xl font-bold text-foreground">
                  {puntaje}<span className="text-sm font-normal text-muted-foreground">/{puntajeMax}</span>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Tiempo</p>
                <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />11
                </p>
                <p className="text-[10px] text-muted-foreground">min</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Esperado</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">10–15 min</p>
              </div>
            </div>

            {/* Category breakdown with Progress bars */}
            {categorias.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Desglose por dominio</p>
                {categorias.map(cat => {
                  const pct = cat.puntaje_maximo > 0 ? Math.round((cat.puntaje_obtenido / cat.puntaje_maximo) * 100) : 0;
                  return (
                    <div key={cat.id_categoria} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{cat.nombre_categoria}</span>
                        <span className="font-medium text-foreground">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Radar chart using recharts */}
          {radarData.length >= 3 && (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Puntuación" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
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
