import React from 'react';
import { XIcon, Bookmark, Info } from 'lucide-react';
import type { PruebaCognitiva } from '@/types/evaluaciones';

interface ViewPruebaProps {
  open: boolean;
  onClose: () => void;
  prueba: PruebaCognitiva | null;
}

const normalizarCodigo = (codigo?: string) => (codigo || '').trim().toUpperCase();

const getIndicaciones = (codigo?: string) => {
  const c = normalizarCodigo(codigo);
  if (c === 'MMSE') {
    return {
      titulo: 'Indicaciones — MMSE',
      descripcion:
        'Mini-Mental State Examination. Aplicación estandarizada para evaluar orientación, memoria, atención, lenguaje y habilidades visoespaciales.',
      pasos: [
        'Explique: “Haré algunas preguntas y tareas cortas; no hay respuestas buenas o malas”.',
        'Asegure ambiente tranquilo, buena iluminación y ayudas auditivas/visuales si las usa habitualmente.',
        'Siga el orden recomendado (orientación, registro, atención/cálculo, evocación, lenguaje y copia).',
        'Lea en voz clara las consignas; repita una vez si es necesario.',
        'Registre el puntaje por ítem. Puntaje total típico 0–30 (ajustable por versión).',
      ],
      notas: [
        'Consigne escolaridad y factores sensoriales que puedan afectar el desempeño.',
        'Evite proporcionar pistas no estandarizadas durante la evaluación.',
      ],
      cortes: {
        titulo: 'Puntos de corte por escolaridad',
        niveles: [
          { nivel: 'Primaria básica', sano: '30–21', deterioro: '20–17', demencia: '16–0' },
          { nivel: 'Secundaria completa', sano: '30–22', deterioro: '21–18', demencia: '17–0' },
          { nivel: 'Superior completa', sano: '30–24', deterioro: '23–19', demencia: '18–0' },
        ],
      },
    };
  }
  if (c === 'CDT' || c === 'RELOJ' || c.includes('CLOCK')) {
    return {
      titulo: 'Indicaciones — Prueba del Reloj (CDT)',
      descripcion:
        'Clock Drawing Test. Evalúa planificación, funciones ejecutivas, construcción visoespacial y comprensión.',
      pasos: [
        'Consigna común: “Dibuje un reloj que marque las once y diez”.',
        'Entregue hoja en blanco y lápiz; evite rectificaciones del evaluador.',
        'Permita que el paciente coloque números y agujas sin más instrucciones.',
        'No dé ayudas sobre ubicación de números o longitud de agujas.',
        'Registre observaciones de estrategia, perseveraciones o desorganización.',
      ],
      notas: [
        'Use siempre la misma consigna horaria para consistencia (p. ej., 11:10).',
        'Considere escalas de puntuación validadas si corresponde (Shulman, Sunderland, etc.).',
      ],
      materiales: [
        'Hoja blanca tamaño A4 sin líneas (margen mínimo 1 cm).',
        'Lápiz grafito HB o bolígrafo negro/azul; evitar colores claros.',
        'Superficie rígida y estable; silla/mesa cómodas.',
      ],
      digitalizacion: {
        titulo: 'Captura con app móvil (escaneo)',
        puntos: [
          'Iluminación uniforme y sin sombras; evitar contraluces.',
          'Coloque la hoja plana sobre fondo liso; enmarque la hoja completa en pantalla.',
          'Asegure foco nítido; sujete el móvil paralelo a la hoja para evitar perspectiva.',
          'Evite dedos u objetos cubriendo la hoja; remueva clips o dobleces marcados.',
          'Revise la vista previa y confirme el envío para procesamiento.',
        ],
      },
    };
  }
  if (c === 'REY' || c === 'ROCF' || c.includes('REY')) {
    return {
      titulo: 'Indicaciones — Figura Compleja de Rey (ROCF)',
      descripcion:
        'Copia y memoria de la Figura Compleja de Rey–Osterrieth. Evalúa organización perceptiva, planificación y memoria visual.',
      pasos: [
        'Fase de Copia: “Copie esta figura lo mejor que pueda”. Muestre el estímulo completo.',
        'Permita borrar y corregir; no proporcione ayudas sobre secuencia o ubicación.',
        'Fase de Memoria inmediata (si aplica): retire el modelo y pida dibujar la figura de memoria.',
        'Fase de Memoria diferida (si aplica): repita la evocación tras el intervalo establecido.',
        'Registre el orden y la estrategia de construcción; anote comentarios relevantes.',
      ],
      notas: [
        'Asegure posición cómoda del papel y tiempo suficiente por fase.',
        'Utilice un sistema de puntuación consistente (p. ej., 36 puntos de Osterrieth).',
      ],
      materiales: [
        'Hoja A4 para respuesta y lámina del estímulo (copia).',
        'Lápiz grafito HB o bolígrafo negro/azul; goma opcional para la copia.',
        'Cronómetro para intervalos de memoria si corresponde.',
      ],
      digitalizacion: {
        titulo: 'Captura con app móvil (escaneo)',
        puntos: [
          'Fotografíe cada fase (copia, memoria inmediata, memoria diferida) por separado.',
          'Mantenga la hoja completa dentro del encuadre; alinee bordes y evite inclinaciones.',
          'Prefiera luz natural o artificial difusa; elimine sombras de manos o móvil.',
          'Revise nitidez de los trazos (contraste suficiente) antes de enviar.',
          'Asocie la toma al paciente/código correcto en la app móvil.',
        ],
      },
    };
  }
  return {
    titulo: 'Indicaciones — Prueba Cognitiva',
    descripcion: 'Revisa el protocolo estandarizado de aplicación y registro de puntajes.',
    pasos: [
      'Explique brevemente el propósito y obtenga el consentimiento.',
      'Asegure condiciones ambientales adecuadas (ruido, luz, ayudas).',
      'Siga las consignas estandarizadas y evite ayudas no previstas.',
    ],
    notas: ['Consigne observaciones relevantes que puedan afectar la interpretación.'],
  } as const;
};

export default function ViewPrueba({ open, onClose, prueba }: ViewPruebaProps) {
  if (!open || !prueba) return null;
  const indic = getIndicaciones(prueba.codigo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-xl max-h-[85vh] rounded-lg bg-white shadow-lg border border-gray-200 flex flex-col">
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{indic.titulo}</h2>
            <p className="text-sm text-gray-600 mt-1">{prueba.nombre} — Código: <span className="font-mono">{prueba.codigo}</span></p>
          </div>
          <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-start gap-2 text-gray-700">
            <Info className="h-4 w-4 mt-0.5 text-blue-600" />
            <p className="text-sm leading-relaxed">{indic.descripcion}</p>
          </div>

          {'cortes' in indic && (indic as any).cortes ? (
            <div className="space-y-2">
              <div className="text-gray-900 font-medium">{(indic as any).cortes.titulo}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-600">Nivel educativo</th>
                      <th className="px-3 py-2 text-left text-gray-600">Cognitivamente sano</th>
                      <th className="px-3 py-2 text-left text-gray-600">Deterioro cognitivo</th>
                      <th className="px-3 py-2 text-left text-gray-600">Demencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(indic as any).cortes.niveles.map((row: any, idx: number) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">{row.nivel}</td>
                        <td className="px-3 py-2">{row.sano}</td>
                        <td className="px-3 py-2">{row.deterioro}</td>
                        <td className="px-3 py-2">{row.demencia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {'materiales' in indic && (indic as any).materiales?.length ? (
            <div className="space-y-2">
              <div className="text-gray-900 font-medium">Materiales</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {(indic as any).materiales.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Bookmark className="h-4 w-4 text-indigo-600" /> Pasos sugeridos
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {indic.pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {'digitalizacion' in indic && (indic as any).digitalizacion ? (
            <div className="space-y-2">
              <div className="text-gray-900 font-medium">{(indic as any).digitalizacion.titulo}</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {(indic as any).digitalizacion.puntos.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {indic.notas?.length ? (
            <div className="space-y-2">
              <div className="text-gray-900 font-medium">Notas</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {indic.notas.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
