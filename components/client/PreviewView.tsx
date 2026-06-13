import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface PreviewViewProps {
  imageSrc: string;
  onCancel: () => void;
  onProcess: () => void;
}

export default function PreviewView({ imageSrc, onCancel, onProcess }: PreviewViewProps) {
  return (
    <main className="flex-1 bg-black relative flex flex-col justify-between animate-fade-in">
      <div className="relative flex-1 overflow-hidden flex items-center justify-center">
        <img src={imageSrc} alt="Vista previa de la basura" className="w-full h-full object-contain" />
      </div>

      <div className="bg-white rounded-t-2xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-10 animate-slide-up">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Verificar Evidencia</h3>
        <p className="text-sm text-gray-500 text-center mb-6">Confirme que la imagen es clara para el análisis del sistema.</p>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-2 border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" /> Cancelar
          </button>
          <button
            onClick={onProcess}
            className="flex-1 py-3 px-2 bg-green-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Procesar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </main>
  );
}
