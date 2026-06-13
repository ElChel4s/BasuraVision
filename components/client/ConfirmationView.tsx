import React from 'react';
import { AlertTriangle, CheckCircle, Info, MapPin, Truck } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

interface ConfirmationViewProps {
  reportData: Reporte;
  locationData: { lat: number; lng: number } | { error: string };
  onTrack: () => void;
  onReset: () => void;
}

export default function ConfirmationView({ reportData, locationData, onTrack, onReset }: ConfirmationViewProps) {
  const getUrgencyStyles = (level: number) => {
    if (level >= 7) {
      return {
        bgGradient: 'from-red-700 to-red-900',
        textColor: 'text-red-900',
        boxBg: 'bg-red-50 border-red-200',
        title: 'Alerta Crítica Registrada',
        Icon: AlertTriangle,
        iconAnim: 'animate-bounce'
      };
    } else if (level >= 4) {
      return {
        bgGradient: 'from-amber-500 to-amber-600',
        textColor: 'text-amber-900',
        boxBg: 'bg-amber-50 border-amber-200',
        title: 'Reporte Asignado a Ruta',
        Icon: AlertTriangle,
        iconAnim: ''
      };
    } else {
      return {
        bgGradient: 'from-green-700 to-green-800',
        textColor: 'text-green-900',
        boxBg: 'bg-green-50 border-green-200',
        title: 'Evaluación Completada',
        Icon: CheckCircle,
        iconAnim: ''
      };
    }
  };

  const urgencyStyles = getUrgencyStyles(reportData.urgencia_base);
  const IconComponent = urgencyStyles.Icon;

  return (
    <main className="flex-1 bg-gray-50 p-6 flex flex-col items-center justify-center animate-slide-up overflow-y-auto">
      <div className={`mb-6 p-5 rounded-2xl shadow-md border-2 bg-gradient-to-br ${urgencyStyles.bgGradient} border-white`}>
        <IconComponent className={`w-12 h-12 text-white ${urgencyStyles.iconAnim}`} />
      </div>

      <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
        {urgencyStyles.title}
      </h2>

      <div className="w-full grid gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
            <Info className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Clasificación IA</h4>
            <p className="font-bold text-gray-800 text-sm leading-tight">{reportData.tipo_basura}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Coordenadas Registradas</h4>
            {('lat' in locationData) ? (
              <p className="font-bold text-gray-800 text-sm font-mono">
                {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}
              </p>
            ) : (
              <p className="font-medium text-red-600 text-sm leading-tight">
                {locationData.error || "Error de señal GPS"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-xl w-full mb-8 shadow-sm border ${urgencyStyles.boxBg} ${urgencyStyles.textColor}`}>
        <p className="text-center font-medium text-sm leading-relaxed">
          "{reportData.mensaje_ciudadano}"
        </p>
      </div>

      <div className="w-full space-y-3">
        {reportData.urgencia_base >= 4 && (
          <button
            onClick={onTrack}
            className="w-full py-4 bg-green-900 text-white font-bold rounded-xl shadow-md hover:bg-green-800 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-green-950 cursor-pointer"
          >
            <Truck className="w-5 h-5 text-amber-400" />
            Ver Estado del Recojo
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 text-gray-400" />
          Finalizar y Nuevo Reporte
        </button>
      </div>
      
      <style>{`
        @keyframes slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </main>
  );
}
