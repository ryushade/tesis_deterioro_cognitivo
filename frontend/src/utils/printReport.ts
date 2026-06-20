import type { EvaluacionResultado } from '@/services/resultadosService';
import { getMediaUrl } from '@/services/api';

export const exportarInformePDF = (ev: EvaluacionResultado) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const nombreCompleto = `${ev.paciente_nombres} ${ev.paciente_apellidos}`;
  const fecha = ev.fecha_evaluacion ? new Date(ev.fecha_evaluacion).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' }) : '—';
  const tipoPrueba = ev.nombre_prueba || 'Prueba Cognitiva';
  
  const esMMSE = tipoPrueba.toLowerCase().includes('mmse') || tipoPrueba.toLowerCase().includes('mini-mental') || tipoPrueba.toLowerCase().includes('mini mental');
  const esCDT = ev.id_analisis != null || tipoPrueba.toLowerCase().includes('reloj');

  let contentHtml = '';

  if (esMMSE) {
    const puntaje = ev.puntaje_total ?? 0;
    const puntajeMax = ev.puntaje_maximo_prueba ?? 30;
    const clasificacion = ev.clasificacion_ia || '—';
    const categorias = ev.categorias_mmse || [];
    const respuestas = ev.respuestas_detalle || [];

    contentHtml = `
      <div class="border-b-2 border-slate-300 pb-4 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-slate-955 tracking-tight">CENTRO DE SALUD SAN MARTÍN</h1>
            <p class="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Área de Neuropsicología y Geriatría</p>
          </div>
          <div class="text-right">
            <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              MMSE COMPLETO
            </span>
          </div>
        </div>
      </div>

      <div class="text-center my-6">
        <h2 class="text-md font-black text-slate-800 uppercase tracking-wider border-y border-slate-200 py-2">
          INFORME DE EVALUACIÓN COGNITIVA (MMSE)
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Paciente:</strong> ${nombreCompleto}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Escolaridad:</strong> ${ev.detalles_ia_jsonb?.escolaridad || '—'}</p>
        </div>
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Fecha de Evaluación:</strong> ${fecha}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Evaluador:</strong> Neuropsicólogo a cargo</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-6 text-center">
        <div class="border border-slate-200 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Puntuación Total</p>
          <p class="text-3xl font-black text-indigo-650">${puntaje} <span class="text-sm font-semibold text-slate-400">/ ${puntajeMax}</span></p>
        </div>
        <div class="border border-slate-200 rounded-xl p-3 col-span-2 bg-white shadow-sm flex flex-col justify-center items-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clasificación Clínica</p>
          <p class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">${clasificacion}</p>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Desglose por Categoría Cognitiva</h3>
        <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead>
            <tr class="bg-slate-55 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th class="p-3">Categoría</th>
              <th class="p-3 text-center">Puntaje Obtenido</th>
              <th class="p-3 text-center">Puntaje Máximo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${categorias.map(cat => `
              <tr>
                <td class="p-3 font-semibold text-slate-700">${cat.nombre_categoria}</td>
                <td class="p-3 text-center font-black text-slate-800">${cat.puntaje_obtenido}</td>
                <td class="p-3 text-center font-semibold text-slate-400">${cat.puntaje_maximo}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${respuestas.length > 0 ? `
      <div class="mb-6 page-break-before">
        <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Análisis de Reactivos Específicos</h3>
        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-55 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th class="p-3 w-1/4">Dimensión</th>
                <th class="p-3 w-1/2">Reactivo / Pregunta</th>
                <th class="p-3 text-center">Resultado</th>
                <th class="p-3 text-center">Puntos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${respuestas.map(r => `
                <tr class="${r.correcto ? '' : 'bg-red-50/20'}">
                  <td class="p-3 font-semibold text-slate-500 uppercase tracking-wider text-[9px]">${r.nombre_categoria}</td>
                  <td class="p-3">
                    <p class="font-bold text-slate-800">${r.texto_item}</p>
                    ${r.respuesta_texto ? `<p class="text-slate-550 text-[10px] mt-0.5 font-mono">Respuesta: "${r.respuesta_texto}"</p>` : ''}
                    ${r.observacion ? `<p class="text-indigo-655 font-semibold text-[10px] mt-0.5"><strong class="text-slate-400">Análisis IA:</strong> ${r.observacion}</p>` : ''}
                  </td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase ${r.correcto ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                      ${r.correcto ? 'CORRECTO' : 'FALLIDO'}
                    </span>
                  </td>
                  <td class="p-3 text-center font-bold ${r.correcto ? 'text-emerald-700' : 'text-red-600'}">${r.puntaje} / 1</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
    `;
  } else if (esCDT) {
    const puntaje = ev.puntaje_ia ?? 0;
    const puntajeMax = 5;
    const clasificacion = ev.clasificacion_ia || (ev.detalles_ia_jsonb?.clasificacion) || '—';
    const observaciones = ev.observaciones_ia || ev.detalles_ia_jsonb?.observaciones || '—';
    const imgSrc = ev.url_imagen ? getMediaUrl(ev.url_imagen) : null;

    contentHtml = `
      <div class="border-b-2 border-slate-300 pb-4 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-slate-955 tracking-tight">CENTRO DE SALUD SAN MARTÍN</h1>
            <p class="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Área de Neuropsicología y Geriatría</p>
          </div>
          <div class="text-right">
            <span class="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              TEST DEL RELOJ (CDT)
            </span>
          </div>
        </div>
      </div>

      <div class="text-center my-6">
        <h2 class="text-md font-black text-slate-800 uppercase tracking-wider border-y border-slate-200 py-2">
          INFORME DE EVALUACIÓN COGNITIVA (TEST DEL RELOJ)
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Paciente:</strong> ${nombreCompleto}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Evaluación:</strong> Test del Reloj (CDT - Shulman)</p>
        </div>
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Fecha de Evaluación:</strong> ${fecha}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Evaluador:</strong> Neuropsicólogo a cargo</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-6">
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center items-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Puntaje IA (Shulman)</p>
          <p class="text-4xl font-black text-blue-650">${puntaje} <span class="text-base font-semibold text-slate-400">/ ${puntajeMax}</span></p>
        </div>
        <div class="border border-slate-200 rounded-xl p-4 col-span-2 bg-white shadow-sm flex flex-col justify-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Clasificación / Nivel detectado</p>
          <p class="text-lg font-extrabold text-slate-800 uppercase tracking-wide mb-1">${clasificacion}</p>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded border self-start ${puntaje >= 4 ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'bg-red-50 border-red-250 text-red-800'}">
            ${puntaje >= 4 ? 'FUNCIÓN VISUOESPACIAL PRESERVADA' : 'REQUIERE SEGUIMIENTO CLÍNICO'}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm min-h-[250px]">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Imagen del Reloj Dibujado</p>
          ${imgSrc ? `
            <img src="${imgSrc}" alt="Dibujo del Reloj" class="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-slate-200" />
          ` : `
            <p class="text-xs text-slate-350 italic">No se cargó imagen para esta evaluación</p>
          `}
        </div>
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Observaciones y Análisis de IA</p>
            <p class="text-xs text-slate-700 leading-relaxed">${observaciones}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 text-[9px] text-slate-400 italic">
            Clasificación automática basada en el modelo ResNet18 validado clínicamente.
          </div>
        </div>
      </div>
    `;
  } else {
    const puntaje = ev.puntaje_total ?? ev.puntaje_ia ?? 0;
    const puntajeMax = ev.puntaje_maximo_prueba ?? 1;
    const clasificacion = ev.clasificacion_ia || '—';
    const observaciones = ev.observaciones_ia || '—';

    contentHtml = `
      <div class="border-b-2 border-slate-200 pb-4 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-slate-955 tracking-tight">CENTRO DE SALUD SAN MARTÍN</h1>
            <p class="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Área de Neuropsicología y Geriatría</p>
          </div>
          <div class="text-right">
            <span class="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
              ${tipoPrueba.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div class="text-center my-6">
        <h2 class="text-md font-black text-slate-800 uppercase tracking-wider border-y border-slate-200 py-2">
          INFORME DE EVALUACIÓN NEUROPSICOLÓGICA
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Paciente:</strong> ${nombreCompleto}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Evaluación:</strong> ${tipoPrueba}</p>
        </div>
        <div>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Fecha de Evaluación:</strong> ${fecha}</p>
          <p class="mb-1 text-slate-500"><strong class="text-slate-700">Evaluador:</strong> Neuropsicólogo a cargo</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-6">
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center items-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Puntuación Total</p>
          <p class="text-4xl font-black text-purple-600">${puntaje} <span class="text-base font-semibold text-slate-400">/ ${puntajeMax}</span></p>
        </div>
        <div class="border border-slate-200 rounded-xl p-4 col-span-2 bg-white shadow-sm flex flex-col justify-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Clasificación / Diagnóstico de IA</p>
          <p class="text-lg font-extrabold text-slate-800 uppercase tracking-wide mb-1">${clasificacion}</p>
        </div>
      </div>

      <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mb-6">
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones y Análisis Detallado</p>
        <p class="text-xs text-slate-700 leading-relaxed">${observaciones}</p>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Informe Clínico - ${nombreCompleto}</title>
        <style>
          /* Estilos de impresión y colores base */
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break-before { page-break-before: always; }
          }
          
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            padding: 40px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }

          /* Sistema de Grillas y Flexbox */
          .grid { display: flex; flex-wrap: wrap; gap: 16px; width: 100%; margin-bottom: 24px; }
          .grid-cols-2 > * { flex: 1 1 45%; min-width: 250px; }
          .grid-cols-3 > * { flex: 1 1 28%; min-width: 150px; }
          .gap-4 { gap: 16px; }
          .gap-6 { gap: 24px; }
          .gap-8 { gap: 32px; }
          .col-span-2 { flex: 2 2 60% !important; }

          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .justify-end { justify-content: flex-end; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .items-end { align-items: flex-end; }
          .self-start { align-self: flex-start; }
          .self-center { align-self: center; }
          .flex-shrink-0 { flex-shrink: 0; }

          /* Bordes y Separadores */
          .border-b-2 { border-bottom: 2px solid #cbd5e1; }
          .border-slate-300 { border-color: #cbd5e1; }
          .border-slate-200 { border-color: #e2e8f0; }
          .border-indigo-250, .border-indigo-200 { border-color: #c7d2fe; }
          .border-blue-200 { border-color: #bfdbfe; }
          .border-purple-200 { border-color: #e9d5ff; }
          .border { border: 1px solid #e2e8f0; }
          .border-t { border-top: 1px solid #e2e8f0; }
          .border-b { border-bottom: 1px solid #e2e8f0; }
          .border-y { border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .divide-y > * { border-bottom: 1px solid #e2e8f0; }
          .divide-y > *:last-child { border-bottom: none; }

          /* Espaciados */
          .p-3 { padding: 12px; }
          .p-4 { padding: 16px; }
          .px-3 { padding-left: 12px; padding-right: 12px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pb-4 { padding-bottom: 16px; }
          .pt-4 { padding-top: 16px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-6 { margin-bottom: 24px; }
          .my-6 { margin-top: 24px; margin-bottom: 24px; }
          .mt-0.5 { margin-top: 2px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-8 { margin-top: 32px; }
          .mt-16 { margin-top: 64px; }
          .ml-1.5 { margin-left: 6px; }

          /* Fondos */
          .bg-slate-50 { background-color: #f8fafc; }
          .bg-slate-55 { background-color: #f1f5f9; }
          .bg-indigo-50 { background-color: #e0e7ff; }
          .bg-blue-50 { background-color: #dbeafe; }
          .bg-purple-50 { background-color: #f3e8ff; }
          .bg-white { background-color: #ffffff; }
          .bg-red-50\/20 { background-color: rgba(254, 242, 242, 0.4); }
          .bg-emerald-100 { background-color: #d1fae5; }
          .bg-red-100 { background-color: #fee2e2; }

          /* Colores de Texto y Tipografías */
          .text-slate-950, .text-slate-955 { color: #0f172a; }
          .text-slate-800 { color: #1e293b; }
          .text-slate-700 { color: #334155; }
          .text-slate-550 { color: #475569; }
          .text-slate-500 { color: #64748b; }
          .text-slate-400 { color: #94a3b8; }
          .text-indigo-700 { color: #4338ca; }
          .text-indigo-650, .text-indigo-655 { color: #4f46e5; }
          .text-blue-700 { color: #1d4ed8; }
          .text-blue-650 { color: #2563eb; }
          .text-purple-700 { color: #7e22ce; }
          .text-purple-650 { color: #9333ea; }
          .text-emerald-800 { color: #065f46; }
          .text-emerald-700 { color: #047857; }
          .text-red-800 { color: #991b1b; }
          .text-red-700 { color: #b91c1c; }
          .text-red-600 { color: #dc2626; }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          
          .text-4xl { font-size: 32px; }
          .text-3xl { font-size: 26px; }
          .text-xl { font-size: 20px; }
          .text-lg { font-size: 16px; }
          .text-md { font-size: 14px; }
          .text-sm { font-size: 13px; }
          .text-xs { font-size: 12px; }
          .text-\[10px\] { font-size: 10px; }
          .text-\[9px\] { font-size: 9px; }
          .text-\[8px\] { font-size: 8px; }

          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-extrabold { font-weight: 800; }
          .font-black { font-weight: 900; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .italic { font-style: italic; }
          .uppercase { text-transform: uppercase; }
          .tracking-tight { letter-spacing: -0.5px; }
          .tracking-wide { letter-spacing: 0.5px; }
          .tracking-wider { letter-spacing: 1px; }

          /* Tablas Estilizadas */
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px; color: #475569; font-weight: 700; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }

          /* Elementos de UI Adicionales */
          .rounded-xl { border-radius: 12px; }
          .rounded-lg { border-radius: 8px; }
          .rounded-full { border-radius: 9999px; }
          .rounded { border-radius: 4px; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
          .shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
          
          .min-h-\[250px\] { min-height: 250px; }
          .max-w-\[200px\] { max-width: 200px; }
          .max-h-\[200px\] { max-height: 200px; }
          .object-contain { object-fit: contain; }
          .w-48 { width: 192px; }
          .h-12 { height: 48px; }
          
          .bg-indigo-600 { background-color: #4f46e5; }
          .text-white { color: #ffffff; }
          
          /* Opciones específicas para impresión */
          .border-b-2 { border-bottom: 2px solid #cbd5e1; }
          .border-t-2 { border-top: 2px solid #cbd5e1; }
        </style>
      </head>
      <body class="bg-white text-slate-800 p-8 max-w-4xl mx-auto flex flex-col justify-between min-h-screen">
        <div>
          ${contentHtml}
        </div>
        
        <div class="mt-16">
          <div class="grid grid-cols-2 gap-8 text-center text-xs">
            <div class="flex flex-col items-center">
              <div class="w-48 border-b border-slate-400 h-12"></div>
              <p class="mt-2 font-bold text-slate-700">Firma del Profesional</p>
              <p class="text-[10px] text-slate-400">Neuropsicólogo Evaluador</p>
            </div>
            <div class="flex flex-col items-center justify-end text-right">
              <p class="text-[9px] text-slate-400 italic leading-relaxed">
                * Este informe es una herramienta de apoyo al diagnóstico asistida por IA. No sustituye el juicio ni la firma clínica presencial de un especialista neuropsicólogo.
              </p>
            </div>
          </div>
          
          <div class="border-t border-slate-200 mt-8 pt-4 text-center text-[9px] text-slate-400 no-print flex justify-between">
            <span>Generado digitalmente por el Sistema Inteligente de Apoyo Clínico</span>
            <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded shadow transition-all">
              Imprimir o Guardar PDF
            </button>
          </div>
        </div>

        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.print();
            }, 800);
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
