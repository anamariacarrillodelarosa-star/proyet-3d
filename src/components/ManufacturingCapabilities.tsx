import React from 'react';
import { ArrowRight, Cpu, Wrench, Factory, Sparkles, Layers, ShieldCheck, Box, Repeat } from 'lucide-react';

interface ManufacturingCapabilitiesProps {
  onScrollToDropzone: () => void;
}

export const ManufacturingCapabilities: React.FC<ManufacturingCapabilitiesProps> = ({
  onScrollToDropzone,
}) => {
  return (
    <section id="que-fabricamos" className="py-20 bg-[#EEF6FF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-blue-200">
              <Factory className="w-3.5 h-3.5" />
              <span>Capacidades de Fabricación Aditiva Industrial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              ¿Qué podemos fabricar en Proyet 3D?
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Transformamos archivos digitales en componentes listos para montar en líneas de producción, prototipos de ingeniería y recambios imposibles de encontrar.
            </p>
          </div>

          <button
            type="button"
            onClick={onScrollToDropzone}
            className="bg-[#1E6091] hover:bg-[#184E77] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 self-start md:self-auto"
          >
            <span>Quiero fabricar mi pieza</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Industrial Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Card 1: Large Featured */}
          <div className="md:col-span-2 bg-white rounded-2xl p-7 border border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E6091] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                Series Cortas & Producción
              </span>
              <h3 className="text-xl font-bold text-slate-800 mt-2 mb-3">
                Lotes de 1 a 500 Unidades sin Coste de Molde
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Olvídate de la inversión de 15.000€ en moldes de inyección de acero para tiradas cortas. Nuestra granja de impresión simultánea produce tiradas industriales en 48 horas con trazabilidad de lotes, repetibilidad micrométrica y geometrías sin restricciones de desmoldeo.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>✓ Reducción de tiempo al mercado (Time-to-market)</span>
              <span className="font-mono font-semibold text-[#1E6091]">0€ Coste de utillaje</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                Mantenimiento MRO
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 mb-2">
                Repuestos de Máquinas Descatalogadas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fabricamos engranajes, poleas, levas y fijaciones para líneas industriales cuyo fabricante original ya no provee recambios.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-amber-800">
              Materiales: ASA, PETG y Nylon-CF
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                Carcasas Electrónicas
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 mb-2">
                Enclosures Estancos IP65 / IP67
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cajas a medida para sensores PCB, conectores industriales, displays LCD y pasamuros con juntas integradas de TPU 95A.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-emerald-800">
              Con inserts roscados de latón
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase">
                Resina SLA Ultra
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 mb-2">
                Modelos de Ultra Alta Precisión
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Impresión fotopolimérica estereolitográfica sin estrías para miniaturas, joyería, prototipos dentales y moldes maestros de silicona.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-purple-800">
              Resolución XY: 25 micras
            </div>
          </div>

          {/* Card 5: Wide Featured */}
          <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E6091] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                Utillaje Rápido & Posicionadores
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 mb-2">
                Jigs, Gálibos de Soldadura y Soportes de Ensamble
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Optimiza las líneas de producción de tus operarios con útiles ergonómicos ligeros, plantillas de taladro con casquillos metálicos y garras a medida para robots colaborativos (cobots).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Fabricación en PETG con fibra o ABS reforzado</span>
              <span className="font-semibold text-emerald-600">Disponibilidad en 24h</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Box className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                Prototipado Rápido
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 mb-2">
                Validación de Forma y Encaje (Fit & Function)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprueba ergonómica y dimensionalmente tu diseño en menos de 24 horas antes de autorizar tiradas masivas o mecanizados CNC.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-rose-800">
              Ahorra semanas de errores de diseño
            </div>
          </div>
        </div>

        {/* Bottom Banner with smooth scroll */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-blue-200 shadow-lg text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-xl font-bold text-slate-800">¿Tienes un proyecto especial o una pieza compleja?</h4>
            <p className="text-sm text-slate-600 mt-1">
              Sube tu archivo .STL en nuestro cotizador o habla directamente con nuestro asistente técnico.
            </p>
          </div>
          <button
            type="button"
            onClick={onScrollToDropzone}
            className="bg-[#1E6091] hover:bg-[#184E77] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <span>[ Quiero fabricar mi pieza → ]</span>
          </button>
        </div>
      </div>
    </section>
  );
};
