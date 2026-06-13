import React, { useState, useEffect } from 'react';
import { Shield, Clock, Check, Loader2, CheckCircle, ClipboardCheck, UserCheck, Truck, Sparkles } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

interface TrackingViewProps {
  reportData: Reporte | null;
  onClose: () => void;
  onReset: () => void;
}

export default function TrackingView({ reportData, onClose, onReset }: TrackingViewProps) {
  const [trackingStep, setTrackingStep] = useState(reportData ? reportData.tracking_step : 0);

  useEffect(() => {
    if (!reportData?.codigo_seguimiento) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/reports?code=${reportData.codigo_seguimiento}`);
        const data = await res.json();
        
        if (data.success && data.reporte) {
          setTrackingStep(data.reporte.tracking_step);
          return;
        }
      } catch (err) {
        console.warn("Error consultando estado en el servidor:", err);
      }

      // Fallback a localStorage para el modo Demo/Desconectado
      try {
        const localData = localStorage.getItem('basuravision_reports');
        if (localData) {
          const reports = JSON.parse(localData);
          const current = reports.find((r: any) => r.codigo_seguimiento === reportData.codigo_seguimiento);
          if (current && current.tracking_step !== undefined) {
            setTrackingStep(current.tracking_step);
          }
        }
      } catch (localErr) {
        console.error("Error leyendo localStorage:", localErr);
      }
    };

    // Consultar inmediatamente
    fetchStatus();

    // Establecer polling cada 3 segundos
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [reportData?.codigo_seguimiento]);

  const trackingPhases = [
    {
      title: "Reporte Registrado",
      desc: "Ingresado exitosamente en el sistema central del GAMLP.",
      Icon: ClipboardCheck
    },
    {
      title: "Unidad Asignada",
      desc: "Cuadrilla de limpieza notificada y preparándose.",
      Icon: UserCheck
    },
    {
      title: "En Camino",
      desc: "El camión compactador se dirige a las coordenadas indicadas.",
      Icon: Truck
    },
    {
      title: "Trabajo Completado",
      desc: "El foco de basura ha sido despejado. ¡La Paz en movimiento!",
      Icon: Sparkles
    }
  ];

  return (
    <main className="flex-1 bg-gray-50 flex flex-col relative animate-fade-in overflow-hidden">
      <div className="bg-green-900 text-white p-6 shadow-md border-b-4 border-amber-400 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 -mr-10 -mt-10" />
        </div>
        <h2 className="text-2xl font-extrabold mb-1 relative z-10">Estado del Reporte</h2>
        <p className="text-green-200 text-sm font-medium relative z-10 flex items-center gap-2">
          <Clock className="w-4 h-4" /> ID: {reportData?.codigo_seguimiento || `GAMLP-${Math.floor(Math.random() * 90000) + 10000}`}
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative">
          <div className="absolute left-[27px] top-4 bottom-12 w-1 bg-gray-200 rounded-full"></div>
          
          <div
            className="absolute left-[27px] top-4 w-1 bg-green-600 rounded-full transition-all duration-1000 ease-in-out"
            style={{ height: `${(trackingStep / (trackingPhases.length - 1)) * 90}%` }}
          ></div>

          {trackingPhases.map((phase, index) => {
            const isActive = index === trackingStep;
            const isPast = index < trackingStep;

            return (
              <div key={index} className="flex items-start gap-5 mb-8 relative z-10">
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-500 flex-shrink-0 bg-white
                  ${isPast ? 'border-green-600' : isActive ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'border-gray-200'}
                `}>
                  {isPast ? (
                    <Check className="w-6 h-6 text-green-600 stroke-[3]" />
                  ) : isActive ? (
                    <>
                      <phase.Icon className="w-6 h-6 text-amber-500 animate-pulse" />
                      {index < 3 && <Loader2 className="absolute -inset-1.5 w-[60px] h-[60px] text-amber-400 animate-spin opacity-50" />}
                    </>
                  ) : (
                    <phase.Icon className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                <div className={`pt-2 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : isPast ? 'opacity-70 scale-100' : 'opacity-40 scale-95'}`}>
                  <h4 className={`text-lg font-extrabold ${isActive ? 'text-green-900' : isPast ? 'text-gray-800' : 'text-gray-400'}`}>
                    {phase.title}
                  </h4>
                  <p className={`text-sm mt-1 leading-tight ${isActive ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {phase.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-20">
        {trackingStep === 3 ? (
          <button
            onClick={onReset}
            className="w-full py-4 bg-green-900 text-white font-bold rounded-xl shadow-md hover:bg-green-800 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-green-950 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-amber-400" />
            Volver al Inicio
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            Cerrar y Ejecutar en Segundo Plano
          </button>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </main>
  );
}
