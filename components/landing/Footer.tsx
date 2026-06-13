import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <GraduationCap className="w-10 h-10 text-emerald-900 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-slate-900">Universidad Mayor de San Andrés</h2>
          <p className="text-slate-500 mt-2">Facultad de Ciencias Puras y Naturales | Carrera de Informática</p>
        </div>

        <div className="max-w-xl mx-auto border-t border-b border-slate-100 py-8 mb-12">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Información Académica</h3>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-slate-800">Materia</p>
              <p className="text-sm text-slate-600">INF-335 Inteligencia Artificial</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Docente Titular</p>
              <p className="text-sm text-slate-600">Lic. Freddy Miguel Toledo Paz</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="text-center sm:text-right">
              <p className="text-sm font-bold text-slate-800">Gestión</p>
              <p className="text-sm text-slate-600">2026 - La Paz</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-400 font-mono">
          &copy; 2026 BasuraVision AI. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}
