import React from 'react';

export default function ProblemSection() {
  return (
    <section id="investigacion" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          <div className="md:col-span-5">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">El Problema de <br/>Estudio</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              La ciudad de La Paz cuenta con más de 900,000 habitantes. La identificación manual de puntos de acumulación de basura es lenta, inconsistente y no escala ante el volumen diario.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Este proyecto elimina la dependencia de la intervención humana directa, utilizando una Red Neuronal Convolucional (CNN) capaz de analizar imágenes en la vía pública, clasificarlas y calcular el nivel de criticidad.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 border border-slate-200">
              <span className="text-emerald-800 font-mono font-bold text-xl mb-4 block">01</span>
              <h3 className="font-bold text-slate-900 mb-2">Visión Artificial Local</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Superar la dependencia de MLaaS (Google Cloud Vision) mediante el desarrollo de una arquitectura RNA propietaria y soberana.
              </p>
            </div>
            <div className="bg-white p-8 border border-slate-200">
              <span className="text-emerald-800 font-mono font-bold text-xl mb-4 block">02</span>
              <h3 className="font-bold text-slate-900 mb-2">Clasificación Estricta</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Identificación categórica del residuo predominante: plásticos, metales, orgánicos, papel o mixto.
              </p>
            </div>
            <div className="bg-white p-8 border border-slate-200">
              <span className="text-emerald-800 font-mono font-bold text-xl mb-4 block">03</span>
              <h3 className="font-bold text-slate-900 mb-2">Algoritmo de Aging</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Solución matemática al problema de inanición (starvation) de tareas en sistemas logísticos.
              </p>
            </div>
            <div className="bg-white p-8 border border-slate-200">
              <span className="text-emerald-800 font-mono font-bold text-xl mb-4 block">04</span>
              <h3 className="font-bold text-slate-900 mb-2">Procesamiento Efímero</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Arquitectura enfocada en privacidad y ahorro de ancho de banda procesando imágenes en RAM y descartándolas.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
