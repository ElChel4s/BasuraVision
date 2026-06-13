import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

interface AnalyzingViewProps {
  imageSrc: string;
}

export default function AnalyzingView({ imageSrc }: AnalyzingViewProps) {
  const [loadingText, setLoadingText] = useState("Procesando en servidores municipales...");
  
  const loadingTexts = [
    "Conectando con servidores GAMLP...",
    "Verificando coordenadas geográficas...",
    "Analizando espectro de residuos...",
    "Clasificando en matriz de riesgo...",
    "Asignando unidad de recojo..."
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[index]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 bg-black relative flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <img src={imageSrc} alt="Foto capturada" className="w-full h-full object-cover opacity-60 grayscale-[50%]" />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="w-full h-1 bg-amber-400 shadow-[0_0_15px_5px_rgba(251,191,36,0.5)] animate-scan"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-950/90"></div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-green-900 border-t-4 border-amber-400 text-white p-8 text-center pb-12 animate-slide-up">
        <div className="flex justify-center mb-4">
          <RefreshCcw className="w-8 h-8 text-amber-400 animate-spin-slow" />
        </div>
        <h3 className="text-lg font-bold mb-1 text-white animate-pulse">
          {loadingText}
        </h3>
        <p className="text-green-300 text-xs">Conectando con la base de datos municipal...</p>
      </div>

      <style>{`
        @keyframes scan-animation { 0% { transform: translateY(-10px); } 50% { transform: translateY(80vh); } 100% { transform: translateY(-10px); } }
        .animate-scan { animation: scan-animation 2s ease-in-out infinite; }
        @keyframes slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin 2s linear infinite; }
      `}</style>
    </main>
  );
}
