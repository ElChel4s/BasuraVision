import React from 'react';
import { Truck, CheckCircle, MapPin, ImageIcon, Trash2 } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

interface AdminOperativoProps {
  selectedReport: Reporte & { dias_espera: number };
  cambiarEstado: (id: string, nuevoEstado: number) => void;
  FACTOR_ENVEJECIMIENTO: number;
}

export default function AdminOperativo({ selectedReport, cambiarEstado, FACTOR_ENVEJECIMIENTO }: AdminOperativoProps) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in">
      
      {/* Tarjeta de Gestión (Arriba) */}
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-5">Detalles del Incidente</h3>
          
          <div className="space-y-6 mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Clasificación Reportada</p>
              <p className="text-slate-800 font-semibold">{selectedReport.tipo_basura}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-400 font-medium mb-2">Ubicación a Intervenir</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Coordenadas Registradas</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">Lat: {selectedReport.latitud} | Lng: {selectedReport.longitud}</p>
                </div>
              </div>
              <div className="mt-4 w-full h-48 rounded-lg overflow-hidden border border-slate-200 shadow-inner relative bg-slate-200">
                {selectedReport.latitud && selectedReport.longitud ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    scrolling="no" 
                    src={`https://maps.google.com/maps?q=${selectedReport.latitud},${selectedReport.longitud}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    title="Mapa de Ubicación"
                    className="absolute inset-0 grayscale-[20%] contrast-125"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Ubicación GPS no disponible</div>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">Cálculo del Algoritmo (Aging)</p>
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                  <span className="text-slate-500">Base: </span><span className="font-bold text-slate-700">{selectedReport.urgencia_base.toFixed(1)}</span>
                </div>
                <span className="text-slate-300 font-bold">+</span>
                <div className="bg-amber-50 px-3 py-2 rounded-md border border-amber-100">
                  <span className="text-amber-600">Espera: </span><span className="font-bold text-amber-700">{(selectedReport.dias_espera * FACTOR_ENVEJECIMIENTO).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100">
            {selectedReport.tracking_step === 0 && (
              <button onClick={() => cambiarEstado(selectedReport.codigo_seguimiento, 1)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg transition-all shadow-sm active:scale-95 flex justify-center items-center gap-2">
                <Truck className="w-4 h-4" /> Inspeccionar Incidente
              </button>
            )}
            {selectedReport.tracking_step === 1 && (
              <button onClick={() => cambiarEstado(selectedReport.codigo_seguimiento, 2)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg transition-all shadow-sm active:scale-95 flex justify-center items-center gap-2">
                <Truck className="w-4 h-4" /> Despachar Equipo de Limpieza
              </button>
            )}
            {selectedReport.tracking_step === 2 && (
              <button onClick={() => cambiarEstado(selectedReport.codigo_seguimiento, 3)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-all shadow-sm active:scale-95 flex justify-center items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Confirmar Zona Limpia
              </button>
            )}
            {selectedReport.tracking_step === 3 && (
              <div className="w-full bg-slate-50 text-slate-500 border border-slate-200 font-medium py-3 rounded-lg flex justify-center items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Reporte Resuelto y Archivado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Evidencia (Abajo) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full mb-10">
        <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-600" /> Evidencia Fotográfica
        </h3>
        <div className="w-full bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center justify-center relative min-h-[300px] md:min-h-[450px]">
          {selectedReport.imagen_url ? (
            <img src={selectedReport.imagen_url} alt="Evidencia" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center p-6">
              <Trash2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Imagen Purgada / No disponible</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">El archivo fue eliminado del servidor tras la limpieza de la zona o no se subió evidencia.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
