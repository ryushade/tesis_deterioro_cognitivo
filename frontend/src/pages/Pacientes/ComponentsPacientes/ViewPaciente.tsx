import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { resultadosService, type EvaluacionResultado, type CategoriaMMSEResultado } from '@/services/resultadosService';
import { getMediaUrl } from '@/services/api'

interface ViewPacienteModalProps {
  open: boolean;
  onClose: () => void;
  paciente: any | null;
}

function formatDate(dateString: string) {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatSexo(sexo: string | number | null) {
  if (sexo === null || sexo === undefined) return 'No especificado';
  const val = String(sexo).toLowerCase();
  if (val === '0' || val === 'masculino' || val === 'm') return 'Masculino';
  if (val === '1' || val === 'femenino' || val === 'f') return 'Femenino';
  return 'No especificado';
}

function calcularEdad(fechaNacimiento: string) {
  if (!fechaNacimiento) return 'N/A';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} años`;
}

function formatEscolaridad(value?: string | null) {
  switch (value) {
    case 'primaria_basica':
      return 'Primaria básica';
    case 'secundaria_completa':
      return 'Secundaria completa';
    case 'superior_completa':
      return 'Superior completa';
    default:
      return 'No especificado';
  }
}


const ViewPacienteModal: React.FC<ViewPacienteModalProps> = ({ open, onClose, paciente }) => {
  const [resultados, setResultados] = useState<EvaluacionResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showExplanationIds, setShowExplanationIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open && paciente?.id_paciente) {
      setLoading(true);
      resultadosService.getResultadosPaciente(paciente.id_paciente)
        .then(res => {
          if (res.success) {
            setResultados(res.data || []);
          }
        })
        .catch(err => {
          console.error("Error cargando historial de paciente:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResultados([]);
      setExpandedId(null);
    }
  }, [open, paciente]);

  if (!open || !paciente) return null;

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getRiesgoGlobal = () => {
    if (!resultados || resultados.length === 0) {
      return {
        label: 'Sin evaluaciones',
        color: 'bg-gray-100 text-gray-800 border-gray-350',
        desc: 'El paciente aún no cuenta con pruebas de tamizaje cognitivo registradas.'
      };
    }

    let tieneAlto = false;
    let tieneModerado = false;

    for (const ev of resultados) {
      const nombre = ev.nombre_prueba.toLowerCase();
      const puntaje = ev.puntaje_total;
      const clasifIA = ev.clasificacion_ia ? ev.clasificacion_ia.toLowerCase() : '';

      if (nombre.includes('mmse') || nombre.includes('mini-mental') || nombre.includes('mini mental')) {
        if (puntaje !== undefined) {
          if (puntaje <= 23) tieneAlto = true;
          else if (puntaje <= 26) tieneModerado = true;
        }
      }
      else if (nombre.includes('reloj') || nombre.includes('cdt')) {
        if (clasifIA.includes('muy severo') || clasifIA.includes('severo') || clasifIA.includes('moderado')) {
          tieneAlto = true;
        } else if (clasifIA.includes('leve') || clasifIA.includes('límite') || clasifIA.includes('limite')) {
          tieneModerado = true;
        }
      }
      else if (nombre.includes('voz') || nombre.includes('fluidez')) {
        if (clasifIA.includes('deterioro') || clasifIA.includes('alzheimer') || clasifIA.includes('dementia')) {
          tieneAlto = true;
        }
      }
    }

    if (tieneAlto) {
      return {
        label: 'Riesgo alto de deterioro',
        color: 'bg-red-50 text-red-700 border-red-200',
        desc: 'Se detectaron puntajes críticos en las pruebas ejecutadas. Recomendado derivación clínica.'
      };
    } else if (tieneModerado) {
      return {
        label: 'Riesgo moderado / DCL',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        desc: 'Los resultados sugieren indicios compatibles con deterioro cognitivo leve (DCL).'
      };
    } else {
      return {
        label: 'Perfil cognitivo normal',
        color: 'bg-green-50 text-green-700 border-green-200',
        desc: 'Puntajes de tamizaje estables y dentro del rango de normalidad clínica.'
      };
    }
  };

  const riesgo = getRiesgoGlobal();

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden bg-white shadow-2xl rounded-xl flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Expediente clínico del paciente
            </h2>
            <p className="text-xs text-slate-500">Historial longitudinal de pruebas cognitivas para investigación de tesis</p>
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

          {/* Left Column - Demographics */}
          <div className="w-full md:w-80 bg-slate-50 p-6 border-r border-slate-100 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {paciente.nombres?.charAt(0)}{paciente.apellidos?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Paciente</p>
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {paciente.nombres} {paciente.apellidos}
                  </p>
                </div>
              </div>

              {/* Cognitive Risk Status */}
              <div className={`p-4 rounded-xl border ${riesgo.color}`}>
                <div className="font-bold text-sm mb-1">
                  {riesgo.label}
                </div>
                <p className="text-xs leading-relaxed opacity-90">{riesgo.desc}</p>
              </div>

              {/* Patient Fields */}
              <div className="space-y-3 pt-2">
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Fecha de nacimiento / edad</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(paciente.fecha_nacimiento)}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">{calcularEdad(paciente.fecha_nacimiento)}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Sexo</span>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs font-medium">
                      {formatSexo(paciente.sexo)}
                    </Badge>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Nivel de escolaridad</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50/30 text-xs font-medium">
                      {formatEscolaridad(paciente.escolaridad)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info Footnote */}
            {(paciente.fecha_registro || paciente.fecha_actualizacion) && (
              <div className="border-t border-slate-200 pt-4 mt-6 text-[10px] text-slate-400 space-y-1">
                {paciente.fecha_registro && (
                  <p>Registrado: {new Date(paciente.fecha_registro).toLocaleString('es-ES')}</p>
                )}
                {paciente.fecha_actualizacion && (
                  <p>Actualizado: {new Date(paciente.fecha_actualizacion).toLocaleString('es-ES')}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Timeline of Evaluations */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Historial de evaluaciones clínicas</h3>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
                <p className="text-sm text-slate-500 font-medium">Cargando evaluaciones...</p>
              </div>
            ) : resultados.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-700">Sin historial de pruebas</p>
                <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
                  Este paciente aún no registra test completados. Puede generarle un código de acceso para iniciar evaluaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultados.map((ev) => {
                  const isExpanded = expandedId === ev.id_evaluacion;
                  const isMMSE = ev.nombre_prueba.toLowerCase().includes('mmse') || ev.nombre_prueba.toLowerCase().includes('mental');
                  const isCDT = ev.nombre_prueba.toLowerCase().includes('reloj') || ev.nombre_prueba.toLowerCase().includes('cdt');
                  const mostrarExplicacion = !!showExplanationIds[ev.id_evaluacion];
                  const explicacionSrc = ev.detalles_ia_jsonb?.url_explicacion 
                    ? getMediaUrl(ev.detalles_ia_jsonb.url_explicacion) 
                    : null;

                  let scoreBadge = null;
                  if (isMMSE) {
                    const score = ev.puntaje_total ?? 0;
                    let color = 'bg-green-100 text-green-800';
                    if (score <= 23) color = 'bg-red-100 text-red-800';
                    else if (score <= 26) color = 'bg-amber-100 text-amber-800';
                    scoreBadge = <Badge className={`${color} font-bold text-xs`}>{score} / 30 pts</Badge>;
                  } else if (isCDT) {
                    const clasif = ev.clasificacion_ia || 'Sin clasificar';
                    let color = 'bg-green-100 text-green-800 border-green-200';
                    if (clasif.toLowerCase().includes('severo') || clasif.toLowerCase().includes('moderado')) {
                      color = 'bg-red-100 text-red-800 border-red-200';
                    } else if (clasif.toLowerCase().includes('leve') || clasif.toLowerCase().includes('límite') || clasif.toLowerCase().includes('limite')) {
                      color = 'bg-amber-100 text-amber-800 border-amber-200';
                    }
                    scoreBadge = <Badge variant="outline" className={`${color} font-bold text-xs`}>{clasif}</Badge>;
                  } else {
                    scoreBadge = <Badge className="bg-slate-100 text-slate-800 font-bold text-xs">{ev.clasificacion_ia || 'Completado'}</Badge>;
                  }

                  return (
                    <div
                      key={ev.id_evaluacion}
                      className={`border rounded-xl transition-all overflow-hidden ${isExpanded ? 'border-indigo-300 shadow-md bg-indigo-50/5' : 'border-slate-200 hover:border-slate-350 bg-white'
                        }`}
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => toggleExpand(ev.id_evaluacion)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{ev.nombre_prueba}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {scoreBadge}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/30">

                          {/* MMSE Category Progress Bars */}
                          {isMMSE && ev.categorias_mmse && ev.categorias_mmse.length > 0 && (
                            <div className="space-y-2 mt-2 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                Desglose por dominios cognitivos (MMSE)
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                {ev.categorias_mmse.map((cat: CategoriaMMSEResultado) => {
                                  const pct = (cat.puntaje_obtenido / cat.puntaje_maximo) * 100;
                                  let barColor = 'bg-green-500';
                                  if (pct < 60) barColor = 'bg-red-500';
                                  else if (pct < 85) barColor = 'bg-amber-500';

                                  return (
                                    <div key={cat.id_categoria} className="space-y-1">
                                      <div className="flex justify-between text-xs font-medium text-slate-600">
                                        <span>{cat.nombre_categoria}</span>
                                        <span className="font-bold">{cat.puntaje_obtenido} / {cat.puntaje_maximo}</span>
                                      </div>
                                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all duration-500 ${barColor}`} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* CDT Clock Drawing visual and AI predictions */}
                          {isCDT && ev.url_imagen && (
                            <div className="mt-2 flex flex-col md:flex-row gap-5 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex flex-col items-center gap-2 self-center">
                                <div className="w-36 h-36 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                                  <img
                                    src={mostrarExplicacion && explicacionSrc ? explicacionSrc : getMediaUrl(ev.url_imagen)}
                                    alt={mostrarExplicacion ? "Mapa de calor de la IA" : "Dibujo del reloj del paciente"}
                                    className="max-w-full max-h-full object-contain transition-all duration-300"
                                  />
                                </div>
                                {explicacionSrc && (
                                  <Button
                                    onClick={() => setShowExplanationIds(prev => ({ ...prev, [ev.id_evaluacion]: !prev[ev.id_evaluacion] }))}
                                    variant="outline"
                                    size="sm"
                                    className={`h-7 px-2 text-[10px] font-semibold rounded-full border shadow-sm transition-all duration-200 w-32 ${
                                      mostrarExplicacion
                                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                                  >
                                    <Brain className="w-3 h-3 mr-1 animate-pulse" />
                                    {mostrarExplicacion ? 'Ver Original' : 'Explicabilidad IA'}
                                  </Button>
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Resultado de inferencia (IA)</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{ev.clasificacion_ia}</span>
                                  </div>
                                </div>

                                {ev.observaciones_ia && (
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Descripción diagnóstica</p>
                                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed italic">
                                      "{ev.observaciones_ia}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Generic Observations */}
                          {!isMMSE && !isCDT && ev.observaciones_ia && (
                            <div className="mt-2 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Observaciones</p>
                              <p className="text-xs text-slate-600 leading-relaxed italic">"{ev.observaciones_ia}"</p>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex justify-end bg-slate-50/50">
          <Button onClick={onClose} className="px-4 bg-slate-700 hover:bg-slate-800 transition-colors">
            Cerrar expediente
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  );
};

export default ViewPacienteModal;
