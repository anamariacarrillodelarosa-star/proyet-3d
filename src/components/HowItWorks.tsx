import React from 'react';
import { UploadCloud, Sliders, Calculator, Truck, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Sube tu archivo .STL',
      desc: 'Arrastra tu archivo 3D (.STL, .OBJ o .3MF). Nuestro motor analiza al milisegundo el volumen exacto, la superficie y los ángulos de voladizo.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Configura Material y Calidad',
      desc: 'Elige entre PLA, PETG, ABS, ASA exterior, TPU flexible o Resina SLA. Ajusta el relleno interno y visualiza en 3D en tiempo real.',
      icon: Sliders,
    },
    {
      step: '03',
      title: 'Cotización Transparente',
      desc: 'Obtén el coste exacto desglosado (materia prima, tiempo de máquina, preparación e impuestos). Sin presupuestos manuales de 48 horas.',
      icon: Calculator,
    },
    {
      step: '04',
      title: 'Fabricación y Entrega',
      desc: 'Nuestra granja automatizada de impresoras industriales produce tu pieza bajo riguroso control dimensional y la entrega en 24h a 72h.',
      icon: Truck,
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-blue-200">
            <span>Flujo 100% Automatizado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            ¿Cómo funciona Proyet 3D?
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Hemos simplificado la fabricación aditiva industrial para que obtengas tus piezas técnicas en 4 sencillos pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-blue-200 group-hover:text-[#1E6091] transition-colors">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1E6091] flex items-center justify-center group-hover:bg-[#1E6091] group-hover:text-white transition-all shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sin registros obligatorios</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
