import React from 'react';

export default function CodeSection() {
  return (
    <section id="codigo" className="py-24 bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-white mb-6">Implementación Táctica</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              El entrenamiento del modelo utiliza estrategias de Transfer Learning para superar las limitaciones de hardware y tiempo, extrayendo pesos pre-entrenados para ajustarlos a la topografía y residuos específicos de La Paz.
            </p>
            
            <div className="space-y-6 mt-8">
              <div className="border-l-2 border-emerald-500 pl-4">
                <h4 className="text-white font-bold mb-1">Transfer Learning</h4>
                <p className="text-sm text-slate-400">Uso de arquitecturas base (MobileNetV2, EfficientNetB0) ajustadas a la realidad local.</p>
              </div>
              <div className="border-l-2 border-slate-700 pl-4">
                <h4 className="text-white font-bold mb-1">Data Augmentation</h4>
                <p className="text-sm text-slate-400">Alteración de imágenes (zoom, rotación, contraste) para garantizar inmunidad a fotografías ciudadanas imperfectas.</p>
              </div>
              <div className="border-l-2 border-slate-700 pl-4">
                <h4 className="text-white font-bold mb-1">Despliegue</h4>
                <p className="text-sm text-slate-400">El modelo será servido a través de una API (FastAPI) integrada al backend del tablero de control logístico.</p>
              </div>
            </div>
          </div>
          
          {/* Terminal Clean Style */}
          <div className="bg-[#0f111a] border border-slate-800 rounded-sm p-6 font-mono text-sm overflow-x-auto shadow-2xl">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            </div>
            <p className="text-slate-500 mb-4"># Arquitectura de Keras - BasuraVision_v1</p>
            <pre className="text-slate-300 leading-loose">
<span className="text-emerald-400">base_model</span> = MobileNetV2(weights=<span className="text-yellow-300">'imagenet'</span>, include_top=<span className="text-rose-400">False</span>)<br/>
<br/>
x = base_model.output<br/>
x = GlobalAveragePooling2D()(x)<br/>
x = Dense(<span className="text-indigo-400">256</span>, activation=<span className="text-yellow-300">'relu'</span>)(x)<br/>
x = Dropout(<span className="text-indigo-400">0.5</span>)(x)<br/>
x = Dense(<span className="text-indigo-400">128</span>, activation=<span className="text-yellow-300">'relu'</span>)(x)<br/>
<br/>
predictions = Dense(<span className="text-indigo-400">5</span>, activation=<span className="text-yellow-300">'softmax'</span>)(x)<br/>
<br/>
model = Model(inputs=base_model.input, outputs=predictions)<br/>
model.compile(optimizer=<span className="text-yellow-300">'adam'</span>, loss=<span className="text-yellow-300">'categorical_crossentropy'</span>, metrics=[<span className="text-yellow-300">'accuracy'</span>])
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
