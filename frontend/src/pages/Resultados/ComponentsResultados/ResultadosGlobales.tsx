import React from 'react';
import { Card } from "@/components/ui/card";
import Sugerencia from './Sugerencia';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

const mmseData = [
  { date: 'Ene', score: 29 },
  { date: 'Mar', score: 28 },
  { date: 'Jun', score: 27 },
  { date: 'Sep', score: 26 },
  { date: 'Dic', score: 24 },
];

export default function ResultadosGlobales() {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full pt-4 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Columna Izquierda: Tabla de Historial (Ocupa el espacio restante flex-1) */}
        <Card className="flex-1 p-6 bg-white shadow-sm border border-slate-100 rounded-[20px] w-full">
          {/* Encabezado */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historial de pruebas</h2>
          <p className="text-[15px] text-slate-500 mt-1.5">Línea temporal de evaluaciones realizadas</p>
        </div>

        {/* Tabla */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2 pr-4 font-medium text-slate-500 text-[15px] w-1/3">Prueba</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-[15px]">Fecha</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-[15px]">Puntuación</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-[15px]">Tiempo</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-[15px]">Clasificación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-5 pr-4 text-[15px] font-medium text-slate-800">MMSE (Mini-Mental)</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">01/04/2026</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">28/30</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">11 min</td>
                <td className="py-5 px-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                    Normal
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-5 pr-4 text-[15px] font-medium text-slate-800">Prueba del Reloj</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">01/04/2026</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">10/10</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">4 min</td>
                <td className="py-5 px-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                    Normal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 pr-4 text-[15px] font-medium text-slate-800">Fluidez Verbal (SVF)</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">01/04/2026</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">-</td>
                <td className="py-5 px-4 text-[15px] text-slate-600">1 min 20s</td>
                <td className="py-5 px-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                    Alerta
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Columna Derecha: Spotlight Analítico (Ancho fijo en pantallas grandes) */}
      <Card className="w-full lg:w-[450px] p-6 bg-white shadow-sm border border-slate-100 rounded-[20px] flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Progresión (MMSE)</h3>
          <p className="text-[14px] text-slate-500 mt-1">Evolución de puntuación del paciente</p>
        </div>
        
        <div className="flex-1 w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mmseData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 30]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={25} />
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
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
             <span className="text-sm font-medium text-slate-600">Tendencia General</span>
             <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full text-right">Deterioro Confirmado (-5pts)</span>
        </div>
      </Card>

      </div>
      
      {/* Módulo de Sugerencia Diagnóstica */}
      <Sugerencia />
      
    </div>
  );
}
