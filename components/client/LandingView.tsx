import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Shield, Navigation } from 'lucide-react';

interface LandingViewProps {
  onCapture: (file: File, src: string) => void;
}

export default function LandingView({ onCapture }: LandingViewProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const src = URL.createObjectURL(file);
      onCapture(file, src);
    }
    event.target.value = '';
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <div className="mb-6">
        <div className="p-5 bg-white shadow-lg rounded-2xl border border-gray-100">
          <Shield className="w-16 h-16 text-green-800" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Sistema de <span className="text-green-800">Reporte Ciudadano</span>
      </h2>
      <p className="text-gray-500 mb-8 text-sm leading-relaxed px-2">
        Plataforma oficial del Gobierno Autónomo Municipal de La Paz. Su reporte con <b>ubicación GPS</b> nos ayuda a coordinar las rutas de limpieza.
      </p>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef} 
        className="hidden" 
        onChange={handleCapture} 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        className="hidden" 
        onChange={handleCapture} 
      />

      <div className="flex flex-col items-center gap-4 w-full px-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full bg-green-900 hover:bg-green-800 text-white rounded-xl py-4 flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 border-b-4 border-green-950 cursor-pointer"
        >
          <Camera className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-lg tracking-wide">Capturar Foco de Basura</span>
        </button>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 text-green-900 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-green-800 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <ImageIcon className="w-5 h-5" />
          Subir desde Galería
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-200/50 px-4 py-2 rounded-lg border border-gray-200">
        <Navigation className="w-3.5 h-3.5 text-green-700" />
        El GPS del dispositivo debe estar activo
      </div>
    </main>
  );
}
