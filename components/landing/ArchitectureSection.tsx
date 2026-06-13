import React from 'react';
import { Layers, Network, Binary, Database, BrainCircuit, Code } from 'lucide-react';

export default function ArchitectureSection() {
  const rnaSteps = [
    {
      title: "Extracción de Características (Conv1)",
      desc: "La imagen RGB es procesada por un banco de 32 filtros convolucionales de 3x3. La función de activación ReLU aísla bordes y texturas primarias del residuo urbano.",
      icon: Layers
    },
    {
      title: "Detección de Patrones (Conv2 & 3)",
      desc: "Mediante agrupamiento (MaxPooling 2x2) y capas profundas de 128 filtros, el modelo detecta composiciones estructurales complejas: pliegues de cartón, curvaturas de botellas o reflectividad metálica.",
      icon: Network
    },
    {
      title: "Compresión Semántica (GAP)",
      desc: "La capa Global Average Pooling reduce drásticamente la dimensionalidad espacial. Se genera un vector matemático de 256 dimensiones que encapsula la 'firma visual' de la basura.",
      icon: Binary
    },
    {
      title: "Clasificación Densa (FCL)",
      desc: "El vector atraviesa una red neuronal totalmente conectada (Dense). Implementamos Dropout(0.5) para evitar el sobreajuste y estabilizar el rendimiento ante imágenes borrosas.",
      icon: Database
    },
    {
      title: "Distribución Probabilística (Softmax)",
      desc: "La última capa aplica la función Softmax para transformar los tensores en un espectro probabilístico (0 a 1), determinando si el foco es Orgánico, Plástico, Metálico o Mixto.",
      icon: BrainCircuit
    }
  ];

  return (
    <section id="arquitectura" className="py-24 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-16 border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Diseño de la Red Neuronal</h2>
            <p className="text-slate-600">
              El motor principal del sistema es una arquitectura convolucional profunda diseñada para abstraer representaciones visuales a partir de tensores de entrada.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-2 border border-emerald-100">
            <Code className="w-4 h-4" /> TENSORFLOW / KERAS
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Timeline Técnico */}
          <div className="lg:col-span-5 relative">
            <div className="absolute left-6 top-2 bottom-2 w-[1px] bg-slate-200"></div>
            <div className="space-y-12">
              {rnaSteps.map((step, idx) => (
                <div key={idx} className="relative pl-16">
                  <div className="absolute left-0 top-0 w-12 h-12 bg-white border border-slate-300 flex items-center justify-center text-slate-700">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagrama Esquemático Simplificado */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
            <div className="w-full max-w-md">
              <p className="text-center font-mono text-xs text-slate-400 mb-6 border-b border-slate-200 pb-2">ESQUEMA DE FLUJO (FORWARD PASS)</p>
              
              <div className="space-y-4">
                {/* Capa Input */}
                <div className="flex items-center justify-between p-3 border border-slate-300 bg-white">
                  <span className="font-mono text-xs text-slate-500">INPUT</span>
                  <span className="text-sm font-bold text-slate-800">Tensor RGB [224x224x3]</span>
                </div>
                
                {/* Flecha */}
                <div className="w-px h-6 bg-slate-300 mx-auto"></div>
                
                {/* Convoluciones */}
                <div className="flex items-center justify-between p-3 border border-slate-300 bg-white">
                  <span className="font-mono text-xs text-slate-500">BACKBONE</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 block">Capas Convolucionales</span>
                    <span className="text-xs text-slate-500">Filtros: 32 → 64 → 128 → 256</span>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-auto"></div>

                {/* Pooling */}
                <div className="flex items-center justify-between p-3 border border-slate-300 bg-emerald-50">
                  <span className="font-mono text-xs text-emerald-700">POOLING</span>
                  <span className="text-sm font-bold text-emerald-900">Global Average Pooling</span>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-auto"></div>

                {/* Dense */}
                <div className="flex items-center justify-between p-3 border border-slate-300 bg-white">
                  <span className="font-mono text-xs text-slate-500">DENSE</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 block">Fully Connected</span>
                    <span className="text-xs text-slate-500">Dropout(0.5) + ReLU</span>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-auto"></div>

                {/* Softmax */}
                <div className="flex items-center justify-between p-3 border border-emerald-300 bg-emerald-900 text-white">
                  <span className="font-mono text-xs text-emerald-400">OUTPUT</span>
                  <span className="text-sm font-bold">Vector Softmax [5 clases]</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
