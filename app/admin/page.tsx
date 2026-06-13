'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Clock, LogOut, Truck, BrainCircuit, Cpu } from 'lucide-react';
import { getLocalReports, updateLocalReport, Reporte, isSupabaseConfigured } from '@/lib/supabase';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOperativo from '@/components/admin/AdminOperativo';
import AdminRNA from '@/components/admin/AdminRNA';

const FACTOR_ENVEJECIMIENTO = 0.5;

export default function AdminDashboard() {
  const [reportesDB, setReportesDB] = useState<Reporte[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'operativo' | 'ia'>('operativo'); 
  
  const [scanStep, setScanStep] = useState(0); 
  const [isScanning, setIsScanning] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Initialize Data
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (data.success && !data.isDemo) {
          setReportesDB(data.reportes);
          setIsDemoMode(false);
          if (data.reportes.length > 0) setSelectedReportId(data.reportes[0].codigo_seguimiento);
        } else {
          loadLocal();
        }
      } catch (err) {
        console.error("Usando fallback local");
        loadLocal();
      }
    };
    
    const loadLocal = () => {
      const localData = getLocalReports();
      setReportesDB(localData);
      setIsDemoMode(true);
      if (localData.length > 0) setSelectedReportId(localData[0].codigo_seguimiento);
    };

    fetchDatos();
  }, []);

  // Clock
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculated Reports
  const reportesProcesados = useMemo(() => {
    const procesados = reportesDB.map(reporte => {
      // Calculamos dias de espera
      const fechaCreacion = reporte.fecha_creacion ? new Date(reporte.fecha_creacion) : new Date();
      const diffTime = Math.abs(currentTime.getTime() - fechaCreacion.getTime());
      const diasEspera = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let urgenciaDinamica = reporte.urgencia_base + (diasEspera * FACTOR_ENVEJECIMIENTO);
      urgenciaDinamica = Math.min(10.0, urgenciaDinamica);
      
      return { 
        ...reporte, 
        dias_espera: diasEspera, 
        urgencia_dinamica: parseFloat(urgenciaDinamica.toFixed(1)) 
      };
    });
    return procesados.sort((a, b) => b.urgencia_dinamica - a.urgencia_dinamica);
  }, [reportesDB, currentTime]);

  const kpis = {
    activos: reportesProcesados.filter(r => r.tracking_step !== 3).length,
    criticos: reportesProcesados.filter(r => r.urgencia_dinamica >= 7 && r.tracking_step !== 3).length,
  };

  const selectedReport = reportesProcesados.find(r => r.codigo_seguimiento === selectedReportId) || reportesProcesados[0];

  const cambiarEstado = async (id: string, nuevoEstado: number) => {
    if (isDemoMode) {
      const updated = updateLocalReport(id, { tracking_step: nuevoEstado });
      if (updated) {
        setReportesDB(prev => prev.map(rep => rep.codigo_seguimiento === id ? updated : rep));
      }
    } else {
      try {
        const payload: Partial<Reporte> = { codigo_seguimiento: id, tracking_step: nuevoEstado };
        if (nuevoEstado === 3) {
          payload.imagen_url = "";
          payload.clases_softmax = [];
        }
        
        const res = await fetch('/api/reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          // Refetch
          const freshRes = await fetch('/api/reports');
          const freshData = await freshRes.json();
          setReportesDB(freshData.reportes);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (nuevoEstado === 3) setActiveTab('operativo');
  };

  const ejecutarInferenciaAPI = async (reporte: Reporte) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep(0);

    const progressTimer = setInterval(() => {
      setScanStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      if (isDemoMode && !isSupabaseConfigured) {
        // Simulación local sin gastar cuota si no hay API / BD real
        setTimeout(() => {
          clearInterval(progressTimer);
          const mockClasses = [
            { clase: "ORGÁNICOS", prob: 0.85 },
            { clase: "PLÁSTICOS", prob: 0.10 },
            { clase: "PAPEL/CARTÓN", prob: 0.05 }
          ];
          const updated = updateLocalReport(reporte.codigo_seguimiento, { clases_softmax: mockClasses });
          if (updated) setReportesDB(prev => prev.map(r => r.codigo_seguimiento === reporte.codigo_seguimiento ? updated : r));
          setScanStep(5);
          setIsScanning(false);
        }, 6000);
        return;
      }

      // Llamada real al backend seguro
      const response = await fetch('/api/admin/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          codigo_seguimiento: reporte.codigo_seguimiento,
          tipo_basura: reporte.tipo_basura
        })
      });

      const data = await response.json();
      
      clearInterval(progressTimer);
      if (data.success && data.clases_softmax) {
        setReportesDB(prev => prev.map(r => r.codigo_seguimiento === reporte.codigo_seguimiento ? { ...r, clases_softmax: data.clases_softmax } : r));
        setScanStep(5);
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error("Error en la inferencia RNA:", error);
      clearInterval(progressTimer);
      setScanStep(5);
    } finally {
      if (isDemoMode) return; // Se manejó en timeout
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (selectedReport && !selectedReport.clases_softmax) {
      setScanStep(0);
    } else if (selectedReport && selectedReport.clases_softmax) {
      setScanStep(5);
    }
  }, [selectedReportId, selectedReport]);

  return (
    <div className="h-screen bg-slate-100 text-slate-800 font-sans flex flex-col overflow-hidden">
      
      {/* NAVEGACIÓN SUPERIOR INSTITUCIONAL (TOPBAR) */}
      <header className="h-16 bg-slate-900 flex items-center justify-between px-6 z-30 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-wide">GAMLP <span className="font-light opacity-80">BasuraVision</span></h1>
            <p className="text-emerald-400/80 text-[10px] font-mono uppercase tracking-widest mt-0.5">Centro de Control Operativo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Reloj global del sistema */}
          <div className="hidden md:flex items-center gap-2 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono tracking-wide">
              {mounted && currentTime ? currentTime.toLocaleTimeString('es-BO') : '--:--:--'}
            </span>
          </div>
          
          {/* Perfil del Operador */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">Operador 01</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Turno Mañana</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md border border-emerald-500">
              O1
            </div>
            <button className="ml-2 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors group" title="Cerrar Sesión">
              <LogOut className="w-5 h-5 group-active:scale-95 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* COLUMNA IZQUIERDA: LISTA DE REPORTES */}
        <AdminSidebar 
          reportesProcesados={reportesProcesados} 
          kpis={kpis} 
          selectedReportId={selectedReportId} 
          setSelectedReportId={setSelectedReportId}
          FACTOR_ENVEJECIMIENTO={FACTOR_ENVEJECIMIENTO}
        />

        {/* COLUMNA DERECHA: PANEL DE DETALLES */}
        <section className="flex-1 flex flex-col h-full bg-white relative">
          {selectedReport ? (
            <>
              {/* Header del Detalle */}
              <header className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-end flex-shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1 block">Reporte Seleccionado</span>
                  <h2 className="text-2xl font-bold text-slate-800 font-mono">{selectedReport.codigo_seguimiento}</h2>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedReport.fecha_creacion ? new Date(selectedReport.fecha_creacion).toLocaleString('es-BO') : 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Índice Urgencia</p>
                  <p className={`text-3xl font-bold font-mono ${selectedReport.urgencia_dinamica >= 7 ? 'text-rose-600' : selectedReport.urgencia_dinamica >= 4 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {selectedReport.urgencia_dinamica.toFixed(1)}<span className="text-lg text-slate-300">/10</span>
                  </p>
                </div>
              </header>

              {/* Pestañas (Tabs) */}
              <div className="flex border-b border-slate-200 px-8 bg-slate-50 flex-shrink-0">
                <button 
                  onClick={() => setActiveTab('operativo')}
                  className={`py-4 px-6 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all ${activeTab === 'operativo' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  <Truck className="w-4 h-4" /> Resumen Operativo
                </button>
                <button 
                  onClick={() => setActiveTab('ia')}
                  className={`py-4 px-6 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all ${activeTab === 'ia' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  <BrainCircuit className="w-4 h-4" /> Análisis de Red Neuronal
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                {activeTab === 'operativo' && (
                  <AdminOperativo 
                    selectedReport={selectedReport} 
                    cambiarEstado={cambiarEstado}
                    FACTOR_ENVEJECIMIENTO={FACTOR_ENVEJECIMIENTO}
                  />
                )}
                {activeTab === 'ia' && (
                  <AdminRNA 
                    selectedReport={selectedReport} 
                    ejecutarInferenciaAPI={ejecutarInferenciaAPI}
                    isScanning={isScanning}
                    scanStep={scanStep}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
              <Cpu className="w-16 h-16 mb-4 opacity-20 text-slate-400" />
              <p className="text-sm font-medium">Seleccione un reporte para visualizar los detalles.</p>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes scan {
          0% { transform: translateY(0%); }
          50% { transform: translateY(200px); }
          100% { transform: translateY(0%); }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
