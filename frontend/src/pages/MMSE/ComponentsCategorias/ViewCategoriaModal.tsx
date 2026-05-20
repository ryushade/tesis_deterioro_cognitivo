import { CheckCircle2, ChevronRight, HelpCircle, FileText, X } from 'lucide-react';
import type { MMSEEstructura } from '@/services/categoriaServices';

interface ViewCategoriaModalProps {
  open: boolean;
  onClose: () => void;
  categoriaEstructura: MMSEEstructura['categorias'][0] | null;
}

export default function ViewCategoriaModal({ open, onClose, categoriaEstructura }: ViewCategoriaModalProps) {
  if (!open || !categoriaEstructura) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm transition-opacity">
      <div className="bg-white flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b bg-gray-50/80">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-900">
              {categoriaEstructura.nombre_categoria}
            </h2>
            <p className="text-gray-600 text-sm mt-1.5">
              Estructura detallada de la categoría. Puntaje máximo total: <span className="font-semibold text-gray-900">{categoriaEstructura.puntaje_maximo} puntos</span>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <div className="space-y-6">
            {categoriaEstructura.secciones.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                <p>Esta categoría aún no tiene secciones o preguntas configuradas.</p>
              </div>
            ) : (
              categoriaEstructura.secciones.map((seccion, sIdx) => (
                <div key={seccion.id_seccion} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="bg-blue-50/60 border-b border-blue-100 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg">
                          Sección {sIdx + 1}: {seccion.nombre_seccion}
                        </h3>
                        {seccion.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{seccion.descripcion}</p>
                        )}
                        {seccion.instrucciones_aplicacion && (
                          <div className="mt-2.5 text-xs font-medium bg-white border border-blue-200 text-blue-800 px-2.5 py-1.5 rounded-md inline-block shadow-sm">
                            Instrucción: {seccion.instrucciones_aplicacion}
                          </div>
                        )}
                      </div>
                      <span className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                        {seccion.puntaje_maximo} pts
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-0">
                    {seccion.opciones.map((opcion, oIdx) => (
                      <div key={opcion.id_opcion} className={`p-4 ${oIdx > 0 ? 'border-t border-gray-100' : ''}`}>
                        {seccion.opciones.length > 1 && (
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5 bg-gray-50 p-2 rounded-md">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            Opción: {opcion.nombre_opcion}
                          </h4>
                        )}
                        
                        <div className="space-y-3 pl-1 sm:pl-3">
                          {opcion.items.map((item, iIdx) => (
                            <div key={item.id_item} className="flex gap-3.5 items-start bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-lg p-3.5 border border-gray-200/60">
                              <div className="mt-0.5">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 leading-snug">
                                  {item.texto_item}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                  {item.respuesta_esperada && (
                                    <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-sm">
                                      Respuesta: {item.respuesta_esperada}
                                    </span>
                                  )}
                                  <span className="bg-green-100 border border-green-200 text-green-700 font-medium px-2 py-0.5 rounded-md shadow-sm">
                                    {item.puntaje_maximo} {item.puntaje_maximo === 1 ? 'pto' : 'ptos'}
                                  </span>
                                </div>
                                {item.criterio_correccion && (
                                  <p className="text-xs text-gray-500 mt-2 italic bg-white p-2 rounded border border-gray-100">
                                    Criterio: {item.criterio_correccion}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white border border-gray-300 text-gray-700 hover:bg-red-600 font-medium rounded-lg shadow-sm transition-colors
            text-sm cursor-pointer 
            "
          >
            Cerrar
          </button>
        </div>
        
      </div>
    </div>
  );
}
