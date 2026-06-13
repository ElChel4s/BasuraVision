import React from 'react';
import { Cpu, Play, BrainCircuit, CheckCircle, ChevronRight, Network, Layers, Binary, Database } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

interface AdminRNAProps {
  selectedReport: Reporte;
  ejecutarInferenciaAPI: (reporte: Reporte) => void;
  isScanning: boolean;
  scanStep: number;
}

export default function AdminRNA({ selectedReport, ejecutarInferenciaAPI, isScanning, scanStep }: AdminRNAProps) {
  const rnaArchitecture = [
    { 
      title: "Paso 1: Análisis Básico", 
      human: "La IA divide la imagen en pequeñas cuadrículas buscando bordes, colores y texturas.", 
      technical: "Capa Conv1: Conv2D(32 filtros, 3x3) + ReLU. Genera Feature Map inicial.", 
      icon: Layers 
    },
    { 
      title: "Paso 2: Reconocimiento de Formas", 
      human: "Agrupa los bordes descubiertos para formar figuras complejas (ej. botellas, cajas).", 
      technical: "Capa Conv2/3: MaxPooling 2x2. Conv2D(128 filtros) + BatchNorm.", 
      icon: Network 
    },
    { 
      title: "Paso 3: Síntesis Semántica", 
      human: "Convierte todos los detalles de la imagen en un resumen matemático único.", 
      technical: "Capa GAP: GlobalAveragePooling colapsa las dimensiones a un Vector Semántico 256-d.", 
      icon: Binary 
    },
    { 
      title: "Paso 4: Comparación", 
      human: "Compara este resumen con su conocimiento previo sobre tipos de basura.", 
      technical: "Capa Densa: Fully Connected Dense(256) → Dropout(0.5) → Dense(128).", 
      icon: Database 
    },
    { 
      title: "Paso 5: Decisión Final", 
      human: "Calcula qué porcentaje de seguridad tiene para cada categoría de residuo.", 
      technical: "Salida Softmax: Transforma logits en probabilidades que suman 1.00.", 
      icon: BrainCircuit 
    }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto mb-10">
      
      {selectedReport.tracking_step === 3 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center shadow-sm max-w-lg mx-auto mt-10">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Memoria Liberada</h3>
          <p className="text-sm text-slate-500">El análisis matemático de esta imagen ha sido borrado del sistema para optimizar recursos, ya que el reporte está cerrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: IMAGEN Y RESULTADO (5 Columnas) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Ejecutor de API */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm text-center">
              <p className="text-sm text-indigo-900 font-semibold mb-3">Motor de Inferencia de IA</p>
              {!selectedReport.clases_softmax ? (
                 <button 
                   onClick={() => ejecutarInferenciaAPI(selectedReport)}
                   disabled={isScanning}
                   className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 
                    ${isScanning ? 'bg-indigo-100 text-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}
                 >
                   {isScanning ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 fill-current" />}
                   {isScanning ? 'Procesando tensores...' : 'Ejecutar Análisis Visual'}
                 </button>
              ) : (
                 <div className="text-xs font-mono text-indigo-700 bg-white py-2 rounded border border-indigo-100 flex items-center justify-center gap-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" /> Análisis Completado
                 </div>
              )}
            </div>

            {/* Visor IA */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Entrada RGB</span>
              </div>
              <div className="relative bg-slate-100 aspect-video flex items-center justify-center overflow-hidden">
                {selectedReport.imagen_url ? (
                  <img src={selectedReport.imagen_url} alt="Input" className={`w-full h-full object-cover transition-all duration-1000 ${isScanning ? 'grayscale opacity-60 blur-sm' : 'grayscale-0 opacity-100'}`} />
                ) : (
                  <span className="text-slate-400 text-sm">Sin imagen de entrada</span>
                )}
                {isScanning && (
                  <div className="absolute top-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_5px_rgba(129,140,248,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                )}
              </div>
            </div>

            {/* Softmax */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Clasificación Softmax</h4>
              
              {selectedReport.clases_softmax ? (
                <div className="space-y-4 animate-fade-in">
                  {selectedReport.clases_softmax.map((det, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className={idx === 0 ? "text-slate-900 font-bold" : "text-slate-500"}>{det.clase}</span>
                        <span className={idx === 0 ? "text-indigo-600 font-bold" : "text-slate-400"}>{(det.prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} style={{ width: `${det.prob * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-sm">
                  A la espera de ejecución...
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: EXPLICACIÓN DE LA RNA (7 Columnas) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative h-fit">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" /> Proceso de la Red Neuronal (CNN)
            </h3>
            
            <div className="relative pl-3">
              {/* Líneas conectoras */}
              <div className="absolute left-[23px] top-4 bottom-6 w-0.5 bg-slate-100"></div>
              <div 
                className="absolute left-[23px] top-4 w-0.5 bg-indigo-400 transition-all duration-700"
                style={{ height: `${(scanStep / 5) * 100}%` }}
              ></div>

              {rnaArchitecture.map((layer, idx) => {
                const isActive = scanStep === idx;
                const isPassed = scanStep > idx;
                const isPending = scanStep < idx;
                const IconComponent = layer.icon;

                return (
                  <div key={idx} className={`relative flex items-start gap-4 mb-6 transition-all duration-500 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                    
                    {/* Icono */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center z-10 transition-all flex-shrink-0 bg-white border ${
                      isActive ? 'border-indigo-500 text-indigo-600 shadow-sm' :
                      isPassed ? 'border-emerald-500 text-emerald-500' : 'border-slate-200 text-slate-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    {/* Contenido Explicativo */}
                    <div className={`flex-1 pt-0.5 pb-2 border-b border-slate-50 last:border-0 ${isActive ? '' : ''}`}>
                      <h4 className={`text-sm font-bold mb-1 ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {layer.title}
                      </h4>
                      
                      {/* Explicación en lenguaje sencillo */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <span className="font-semibold text-slate-700">¿Qué hace la IA?</span> {layer.human}
                      </p>

                      {/* Detalle Técnico para la materia */}
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-md">
                        <p className="text-[10px] font-mono text-slate-500 flex items-start gap-1.5">
                          <ChevronRight className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                          {layer.technical}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
