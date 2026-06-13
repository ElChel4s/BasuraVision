import React from 'react';
import { MapPin } from 'lucide-react';
import { Reporte } from '@/lib/supabase';

interface AdminSidebarProps {
  reportesProcesados: (Reporte & { dias_espera: number })[];
  kpis: { activos: number; criticos: number };
  selectedReportId: string;
  setSelectedReportId: (id: string) => void;
  FACTOR_ENVEJECIMIENTO: number;
}

export default function AdminSidebar({ 
  reportesProcesados, 
  kpis, 
  selectedReportId, 
  setSelectedReportId, 
  FACTOR_ENVEJECIMIENTO 
}: AdminSidebarProps) {
  
  const getCardStyle = (urgencia: number, isSelected: boolean) => {
    let base = "p-4 rounded-xl border transition-all cursor-pointer relative ";
    if (isSelected) {
      base += "bg-white ring-1 ring-emerald-500 shadow-sm border-emerald-200";
    } else {
      base += "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-300";
    }
    return base;
  };

  const getUrgencyBadge = (urgencia: number) => {
    if (urgencia >= 7.0) return "bg-rose-50 text-rose-700 border-rose-200";
    if (urgencia >= 4.0) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <section className="w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Bandeja de Reportes</h2>
        <p className="text-xs text-slate-500">Filtrado automático por {"U_{dinámica}"}</p>
        
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Activos</p>
            <p className="text-xl font-bold text-slate-800">{kpis.activos}</p>
          </div>
          <div className="flex-1 bg-rose-50 rounded-lg p-3 text-center border border-rose-100">
            <p className="text-[10px] text-rose-600 font-semibold uppercase">Críticos</p>
            <p className="text-xl font-bold text-rose-700">{kpis.criticos}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
        {reportesProcesados.map((reporte) => (
          <div 
            key={reporte.codigo_seguimiento} 
            onClick={() => setSelectedReportId(reporte.codigo_seguimiento)}
            className={getCardStyle(reporte.urgencia_dinamica, selectedReportId === reporte.codigo_seguimiento)}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${reporte.urgencia_dinamica >= 7 ? 'bg-rose-500' : reporte.urgencia_dinamica >= 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            
            <div className="flex justify-between items-start mb-1 pl-2">
              <h3 className="font-mono text-sm font-bold text-slate-800">{reporte.codigo_seguimiento}</h3>
              <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getUrgencyBadge(reporte.urgencia_dinamica)}`}>
                {reporte.urgencia_dinamica.toFixed(1)}
              </div>
            </div>
            
            <div className="pl-2 mt-2">
              <p className="text-sm text-slate-600 font-medium truncate">{reporte.tipo_basura}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Lat: {reporte.latitud.toFixed(2)}
                </span>
                {reporte.tracking_step !== 3 && reporte.dias_espera > 0 && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    +{ (reporte.dias_espera * FACTOR_ENVEJECIMIENTO).toFixed(1) }
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
