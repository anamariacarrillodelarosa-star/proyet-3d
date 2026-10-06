import React, { useState } from 'react';
import { Shield, Sun, Thermometer, Activity, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { MATERIALS_DATA } from '../utils/materials';
import { MaterialKey } from '../types';

interface MaterialsGuideProps {
  onSelectMaterial?: (material: MaterialKey) => void;
  onAskBot?: (question: string) => void;
}

export const MaterialsGuide: React.FC<MaterialsGuideProps> = ({ onSelectMaterial, onAskBot }) => {
  const [selectedKey, setSelectedKey] = useState<MaterialKey>('PETG');
  const activeMaterial = MATERIALS_DATA[selectedKey] || MATERIALS_DATA.PETG;

  return (
    <section id="materiales" className="py-20 bg-white border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-blue-200">
            <span>Guía Técnica de Polímeros Industriales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Tabla Comparativa de Materiales 3D
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Cada aplicación requiere propiedades específicas de elasticidad, resistencia térmica y comportamiento ante rayos UV.
          </p>
        </div>

        {/* Material Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Object.values(MATERIALS_DATA).map((mat) => {
            const isSelected = selectedKey === mat.key;
            return (
              <button
                key={mat.key}
                type="button"
                onClick={() => setSelectedKey(mat.key as MaterialKey)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#1E6091] text-white shadow-md shadow-blue-900/15'
                    : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#1E6091]'
                }`}
              >
                <span>{mat.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mat.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Material Deep Dive Card */}
        <div className="bg-[#EEF6FF] rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-extrabold text-[#184E77]">{activeMaterial.name}</span>
                <span className="text-xs font-bold font-mono bg-blue-100 text-[#1E6091] px-2.5 py-1 rounded-md border border-blue-200">
                  Tecnología {activeMaterial.category}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                {activeMaterial.description}
              </p>

              {/* Technical Property Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>Temp. Máx</span>
                  </div>
                  <p className="text-lg font-extrabold font-mono text-slate-800">{activeMaterial.tempResistanceMax}°C</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    <span>Tracción</span>
                  </div>
                  <p className="text-lg font-extrabold font-mono text-slate-800">{activeMaterial.tensileStrength} MPa</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Resist. Solar UV</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">{activeMaterial.uvResistance}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Flexibilidad</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{activeMaterial.flexibility}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Aplicaciones recomendadas:
                </span>
                <p className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-blue-100">
                  {activeMaterial.bestFor}
                </p>
              </div>
            </div>

            {/* Right Col: Quick action */}
            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h4 className="text-base font-bold text-slate-800 mb-2">¿Es este el material adecuado?</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Si vas a montar tu pieza al aire libre, bajo el sol, o sometida a calor mecánico por fricción, consúltanos.
                </p>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Densidad: {activeMaterial.density} g/cm³</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Relleno base aconsejado: {activeMaterial.recommendedInfill}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {onSelectMaterial && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMaterial(selectedKey);
                      const el = document.getElementById('cotizador');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-[#1E6091] hover:bg-[#184E77] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Usar {activeMaterial.name.split(' ')[0]} en mi Cotizador
                  </button>
                )}

                {onAskBot && (
                  <button
                    type="button"
                    onClick={() => onAskBot(`Cuéntame más ventajas e inconvenientes de usar ${activeMaterial.name}`)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#1E6091]" />
                    <span>Preguntar a ProyetBot</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
