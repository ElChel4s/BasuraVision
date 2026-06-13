import React from 'react';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-900 flex items-center justify-center rounded-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">BasuraVision AI.</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#investigacion" className="hover:text-emerald-800 transition-colors">La Investigación</a>
          <a href="#arquitectura" className="hover:text-emerald-800 transition-colors">Arquitectura RNA</a>
          <a href="#codigo" className="hover:text-emerald-800 transition-colors">Implementación</a>
        </div>
      </div>
    </nav>
  );
}
