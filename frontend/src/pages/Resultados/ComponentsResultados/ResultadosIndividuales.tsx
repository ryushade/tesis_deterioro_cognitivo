import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { subject: "Orientación", score: 80, fullMark: 100 },
  { subject: "Memoria", score: 60, fullMark: 100 },
  { subject: "Atención", score: 75, fullMark: 100 },
  { subject: "Lenguaje", score: 85, fullMark: 100 },
  { subject: "Visuoespacial", score: 70, fullMark: 100 },
];

const ProgressBar = ({ label, points, maxPoints }: { label: string; points: number; maxPoints: number }) => {
  const fillPercentage = (points / maxPoints) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-[13px] font-medium text-slate-600">{label}</span>
        <span className="text-[13px] font-semibold text-slate-800">{points}/{maxPoints} pts</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${fillPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function ResultadosIndividuales() {
  return (
    <div className="w-full pt-4 flex justify-start">
      <Card className="p-6 bg-white shadow-sm border border-slate-100 rounded-[20px] w-[800px]">
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">MMSE (Mini-Mental)</h2>
            <p className="text-slate-500 mt-1">Realizada el 28/03/2026</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            Deterioro leve
          </div>
        </div>

        {/* Cajas de Estadísticas Principales */}
        <div className="flex flex-wrap gap-4 mb-2">
          {/* Caja 1: Puntuación */}
          <div className="bg-white border border-slate-200 py-3 px-6 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
            <span className="text-xs font-medium text-slate-500 mb-1">Puntuación</span>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-800">24</span>
              <span className="text-base text-slate-400 font-medium">/30</span>
            </div>
          </div>
          
          {/* Caja 2: Tiempo */}
          <div className="bg-slate-50 border border-slate-100 py-3 px-6 rounded-2xl flex flex-col items-center justify-center min-w-[120px] relative shadow-sm">
            <span className="text-xs font-medium text-slate-500 mb-1">Tiempo</span>
            <div className="flex items-baseline gap-1 pl-4">
              <span className="text-3xl font-bold text-slate-800">12</span>
              <span className="text-base font-semibold text-slate-800">min</span>
            </div>
          </div>

          {/* Caja 3: Esperado */}
          <div className="bg-white border border-slate-200 py-3 px-6 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
            <span className="text-xs font-medium text-slate-500 mb-2">Esperado</span>
            <span className="text-[15px] font-medium text-slate-700">10-15 min</span>
          </div>
        </div>

        {/* Sección Inferior: Barras y Gráfico Radar */}
        <div className="flex gap-10 flex-col md:flex-row items-center">
          
          {/* Columna Izquierda: Barras de Desglose */}
          <div className="flex-1 w-full">
            <h3 className="font-semibold text-slate-800 mb-6 text-[15px]">Desglose por dominio</h3>
            <ProgressBar label="Orientación" points={8} maxPoints={10} />
            <ProgressBar label="Memoria" points={3} maxPoints={6} />
            <ProgressBar label="Atención" points={4} maxPoints={5} />
            <ProgressBar label="Lenguaje" points={8} maxPoints={8} />
            <ProgressBar label="Visuoespacial" points={1} maxPoints={1} />
          </div>
          
          {/* Columna Derecha: Gráfico Radar */}
          <div className="flex-1 w-full h-[240px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="75%" 
                data={data}
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                />
                {/* Desactivamos los números del eje radial para mantener limpieza */}
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar 
                  name="Paciente" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fill="#6366f1" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
