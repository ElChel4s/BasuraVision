import React from 'react';
import Link from 'next/link';
import { Smartphone, Monitor } from 'lucide-react';

export default function HeroSection() {
  const team = [
    { name: "Chirinos Ticona Masiel Rosio", ci: "13760252 LP" },
    { name: "Salas Birrueta Edgar Alejandro", ci: "8465379 LP" },
    { name: "Villarroel Gutierrez Marcelo", ci: "10939852 LP" }
  ];

  return (
    <header className="relative bg-white border-b border-slate-200 overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full">
        
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-emerald-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">Proyecto INF-335</span>
            <span className="text-slate-400 text-sm font-mono">Universidad Mayor de San Andrés</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-serif font-bold text-slate-900 leading-[1.1] mb-6">
            Redes Neuronales para la gestión de residuos urbanos.
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
            Diseño e implementación de un modelo de <strong>Aprendizaje Profundo (Deep Learning)</strong> para la detección, clasificación y geolocalización de focos críticos de contaminación en la ciudad de La Paz.
          </p>
          
          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/client" className="bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-bold px-8 py-4 rounded-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-emerald-900/30 active:scale-95">
              <Smartphone className="w-5 h-5" /> Abrir App Ciudadana
            </Link>
            <Link href="/admin" className="bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-bold px-8 py-4 rounded-sm flex items-center justify-center gap-3 transition-all active:scale-95">
              <Monitor className="w-5 h-5 text-slate-400" /> Panel Administrativo
            </Link>
          </div>

          {/* SECCIÓN DE AUTORES / INTEGRANTES AL INICIO */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Investigadores (Equipo de Desarrollo)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm leading-tight">{member.name}</span>
                  <span className="font-mono text-xs text-slate-500 mt-1">C.I. {member.ci}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative hidden md:block">
          {/* Collage Técnico */}
          <div className="relative w-full aspect-[3/4] bg-slate-100 border border-slate-200 p-4 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80" 
              alt="La Paz Bolivia" 
              className="w-full h-[65%] object-cover grayscale opacity-90"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white border border-slate-200 p-6 shadow-xl">
              <p className="font-mono text-xs text-slate-400 mb-4 border-b border-slate-100 pb-2">// INFERENCIA_TENSOR_RESIDUOS</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 border border-emerald-100">
                  <span className="font-bold text-emerald-900 text-sm">PLÁSTICOS_PET</span>
                  <span className="font-mono font-bold text-emerald-700">0.9421</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 text-sm text-slate-500">
                  <span>ORGÁNICOS</span>
                  <span className="font-mono">0.0314</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 text-sm text-slate-500">
                  <span>METALES</span>
                  <span className="font-mono">0.0102</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
