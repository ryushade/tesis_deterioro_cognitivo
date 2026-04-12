import React from 'react';
import { Card } from "@/components/ui/card";
import { Brain, AlertTriangle } from 'lucide-react';

export default function Sugerencia() {
  return (
    <Card className="w-full p-4 bg-[#f4fbf7] border-[#d1e9d8] shadow-sm rounded-[16px]">
      
      {/* Título de la tarjeta */}
      <div className="flex items-center gap-1.5 mb-2 text-[#0f5132]">
        <Brain className="w-5 h-5" />
        <h3 className="font-bold text-base tracking-tight">Sugerencia diagnóstica</h3>
      </div>
      
      {/* Diagnóstico Base */}
      <div className="mb-2 flex items-center flex-wrap gap-x-2">
        <span className="text-[#10b981] font-bold text-lg">Normal</span>
        <span className="text-slate-500 font-medium text-[14px]"> — Índice de riesgo: 9%</span>
      </div>
      
      <p className="text-slate-700 mb-3 text-[14px] leading-snug max-w-4xl">
        El rendimiento cognitivo global se encuentra dentro de los parámetros normales para la edad. No se observan indicios significativos de deterioro cognitivo.
      </p>
      
      {/* Caja de Aviso Legal/Clínico */}
      <div className="bg-[#fffdf0] border border-[#fde68a] py-2.5 px-3 rounded-lg flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
        <p className="text-[#92400e] text-[13px] leading-snug">
          <strong className="font-bold mr-1">Aviso importante:</strong> 
          Esta evaluación es una herramienta de apoyo al diagnóstico. El diagnóstico definitivo debe ser realizado por el profesional de salud correspondiente, considerando la historia clínica completa, exploración neurológica y otros estudios complementarios.
        </p>
      </div>
      
    </Card>
  );
}
