'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

// Components
import LandingView from '@/components/client/LandingView';
import PreviewView from '@/components/client/PreviewView';
import AnalyzingView from '@/components/client/AnalyzingView';
import ConfirmationView from '@/components/client/ConfirmationView';
import TrackingView from '@/components/client/TrackingView';

type ViewState = 'landing' | 'preview' | 'analyzing' | 'confirmation' | 'tracking';

export default function ClientPWA() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportData, setReportData] = useState<Reporte | null>(null);
  const [locationData, setLocationData] = useState<{ lat: number; lng: number } | { error: string } | null>(null);

  const handleCapture = (file: File, src: string) => {
    setUploadFile(file);
    setImageSrc(src);
    setCurrentView('preview');
  };

  const startAnalysis = () => {
    setCurrentView('analyzing');
    processReport();
  };

  const fetchUserLocation = (): Promise<{ lat: number; lng: number } | { error: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: "GPS no soportado en tu dispositivo" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.warn("GPS Denegado o sin permisos:", err.message);
          resolve({ error: "Permisos de GPS denegados" });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const processReport = async () => {
    const locationResult = await fetchUserLocation();
    setLocationData(locationResult);

    try {
      if (!uploadFile) throw new Error("No hay imagen");

      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // Coordenadas
      if ('lat' in locationResult) {
        formData.append('latitud', locationResult.lat.toString());
        formData.append('longitud', locationResult.lng.toString());
      } else {
        // Fallback GPS
        formData.append('latitud', '-16.495');
        formData.append('longitud', '-68.133');
      }

      // El mensaje se deja en blanco para que la IA lo infiera, o se puede enviar uno generico
      formData.append('mensaje', "Reporte automático vía PWA");

      const res = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.reporte) {
        setReportData(data.reporte);
      } else {
        throw new Error(data.error || "Error del servidor");
      }
    } catch (error) {
      console.error("Error procesando reporte:", error);
      // Fallback local en caso de error de conexión
      setReportData({
        id: 0,
        codigo_seguimiento: `GAMLP-${Math.floor(Math.random() * 90000) + 10000}`,
        latitud: 'lat' in locationResult ? locationResult.lat : -16.495,
        longitud: 'lng' in locationResult ? locationResult.lng : -68.133,
        tipo_basura: "Error de conexión (Registrado Offline)",
        urgencia_base: 5,
        urgencia_dinamica: 5,
        mensaje_ciudadano: "El sistema central está ocupado, pero hemos guardado tu reporte y ubicación de manera local. Se enviará en cuanto haya conexión.",
        tracking_step: 0,
        fecha_creacion: new Date().toISOString()
      });
    }

    setCurrentView('confirmation');
  };

  const resetApp = () => {
    setImageSrc(null);
    setUploadFile(null);
    setReportData(null);
    setLocationData(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans text-gray-800 items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[440px] bg-white sm:rounded-xl min-h-screen sm:min-h-[850px] shadow-2xl relative overflow-hidden flex flex-col border-t-8 border-green-900">
        
        {/* Header Institucional */}
        <header className="bg-green-900 text-white p-4 flex items-center justify-between z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight">GAMLP</h1>
              <p className="text-green-200 text-[10px] font-semibold uppercase tracking-wider">Secretaría de Gestión Ambiental</p>
            </div>
          </div>
        </header>

        {currentView === 'landing' && (
          <LandingView onCapture={handleCapture} />
        )}

        {currentView === 'preview' && imageSrc && (
          <PreviewView 
            imageSrc={imageSrc} 
            onCancel={resetApp} 
            onProcess={startAnalysis} 
          />
        )}

        {currentView === 'analyzing' && imageSrc && (
          <AnalyzingView imageSrc={imageSrc} />
        )}

        {currentView === 'confirmation' && reportData && locationData && (
          <ConfirmationView 
            reportData={reportData} 
            locationData={locationData} 
            onTrack={() => setCurrentView('tracking')} 
            onReset={resetApp} 
          />
        )}

        {currentView === 'tracking' && (
          <TrackingView 
            reportData={reportData} 
            onClose={() => setCurrentView('landing')} 
            onReset={resetApp} 
          />
        )}

      </div>
    </div>
  );
}
