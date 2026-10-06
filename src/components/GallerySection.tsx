import React, { useState } from 'react';
import { Wrench, Cog, Home, Puzzle, Hammer, Palette, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'funcional' | 'mecanica' | 'decoracion' | 'prototipos' | 'repuestos' | 'disenos';
  categoryLabel: string;
  title: string;
  material: string;
  infill: string;
  printTime: string;
  tolerance: string;
  application: string;
  description: string;
  accentColor: string;
  badge: string;
  svgIcon: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    category: 'mecanica',
    categoryLabel: '⚙️ Piezas mecánicas',
    title: 'Engranaje Reductor Epicicloidal M2.5',
    material: 'PETG / Fibra de Carbono',
    infill: '60% Giroide',
    printTime: '4.5 horas',
    tolerance: '±0.12 mm',
    application: 'Brazo robótico de embalaje automatizado',
    description: 'Dientes templados sin holguras para transmisión de par elevado sin deformación térmica hasta 75°C.',
    accentColor: '#1E6091',
    badge: 'Alta Carga',
    svgIcon: 'cog',
  },
  {
    id: 'g-2',
    category: 'repuestos',
    categoryLabel: '🛠️ Repuestos personalizados',
    title: 'Soporte de Bomba de Agua Descatalogada',
    material: 'ASA Ultra-UV',
    infill: '50% Cúbico',
    printTime: '6.2 horas',
    tolerance: '±0.15 mm',
    application: 'Repuesto agrícola de maquinaria pesada',
    description: 'Ingeniería inversa a partir de una pieza rota original. Resistente a radiación solar continua y aceites.',
    accentColor: '#0284c7',
    badge: '100% Intemperie',
    svgIcon: 'hammer',
  },
  {
    id: 'g-3',
    category: 'funcional',
    categoryLabel: '🔧 Piezas funcionales',
    title: 'Junta de Estanqueidad y Cierre Hermético',
    material: 'TPU 95A Flexible',
    infill: '100% Sólido',
    printTime: '2.8 horas',
    tolerance: '±0.10 mm',
    application: 'Caja estanca IP67 para sensores IoT',
    description: 'Resistencia total a la compresión y absorción de vibraciones continuas en cuadros eléctricos industriales.',
    accentColor: '#059669',
    badge: 'Flexible 95A',
    svgIcon: 'wrench',
  },
  {
    id: 'g-4',
    category: 'prototipos',
    categoryLabel: '🧩 Prototipos',
    title: 'Carcasa Ergonómica para Dispositivo Médico',
    material: 'Resina UV SLA Dental/Tech',
    infill: '100% Macizo',
    printTime: '5.1 horas',
    tolerance: '±0.05 mm',
    application: 'Validación ergonómica y funcional previa a molde de inyección',
    description: 'Acabado micropulido liso sin capas visibles apto para pruebas clínicas y montaje de placas PCB.',
    accentColor: '#7c3aed',
    badge: 'Micro-Precisión',
    svgIcon: 'puzzle',
  },
  {
    id: 'g-5',
    category: 'decoracion',
    categoryLabel: '🏠 Decoración',
    title: 'Luminaria Paramétrica Ondulada Voronoi',
    material: 'PLA Seda Translúcido',
    infill: '15% Visual',
    printTime: '8.4 horas',
    tolerance: '±0.20 mm',
    application: 'Interiorismo corporativo y hoteles',
    description: 'Difusión de luz homogénea a través de paredes delgadas de 1.2 mm con geometría matemática fluida.',
    accentColor: '#d97706',
    badge: 'Acabado Seda',
    svgIcon: 'home',
  },
  {
    id: 'g-6',
    category: 'disenos',
    categoryLabel: '🎨 Diseños personalizados',
    title: 'Trofeo y Escultura Geométrica Corporativa',
    material: 'PLA Bronce Metalfill Pulido',
    infill: '30% Rejilla',
    printTime: '7.0 horas',
    tolerance: '±0.15 mm',
    application: 'Eventos de innovación y entregas de premios',
    description: 'Tratamiento postprocesado con cepillado metálico para apariencia y peso similar al latón macizo.',
    accentColor: '#e11d48',
    badge: 'Postprocesado',
    svgIcon: 'palette',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Todos los trabajos' },
  { id: 'funcional', label: '🔧 Piezas funcionales' },
  { id: 'mecanica', label: '⚙️ Piezas mecánicas' },
  { id: 'decoracion', label: '🏠 Decoración' },
  { id: 'prototipos', label: '🧩 Prototipos' },
  { id: 'repuestos', label: '🛠️ Repuestos' },
  { id: 'disenos', label: '🎨 Diseños' },
];

export const GallerySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = activeTab === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section id="galeria" className="py-20 bg-white border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-blue-200">
            <span>Resultados de Impresión 3D Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Casos de éxito y piezas fabricadas en nuestro taller
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Desde recambios industriales sometidos a gran fricción hasta prototipos de máxima resolución micrométrica.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-[#1E6091] text-white shadow-md shadow-blue-900/15'
                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#1E6091]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Card Visual Header / Illustrated Canvas */}
              <div className="h-48 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 relative flex items-center justify-center p-6 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(${item.accentColor} 2px, transparent 2px)`,
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Conceptual 3D Model Representation Badge */}
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-white shadow-lg border border-slate-100 flex flex-col items-center justify-center text-slate-700 group-hover:scale-105 transition-transform duration-300">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-1 shadow-xs"
                    style={{ backgroundColor: item.accentColor }}
                  >
                    {item.category === 'mecanica' && <Cog className="w-6 h-6 animate-spin-slow" />}
                    {item.category === 'repuestos' && <Hammer className="w-6 h-6" />}
                    {item.category === 'funcional' && <Wrench className="w-6 h-6" />}
                    {item.category === 'prototipos' && <Puzzle className="w-6 h-6" />}
                    {item.category === 'decoracion' && <Home className="w-6 h-6" />}
                    {item.category === 'disenos' && <Palette className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{item.material.split(' ')[0]}</span>
                </div>

                {/* Top Badge */}
                <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-2.5 py-1 rounded-full shadow-2xs border border-slate-200">
                  {item.badge}
                </span>

                <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-slate-600 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded">
                  {item.categoryLabel}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#1E6091] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Technical Specs Pill Grid */}
                  <div className="space-y-1.5 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mb-4">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Material:</span>
                      <strong className="text-slate-800">{item.material}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Relleno (Infill):</span>
                      <span className="text-slate-800">{item.infill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Tolerancia:</span>
                      <span className="text-slate-800">{item.tolerance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Tiempo de prod.:</span>
                      <span className="text-slate-800">{item.printTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium truncate max-w-[200px]">
                    📍 {item.application}
                  </span>
                  <a
                    href="#cotizador"
                    className="text-[#1E6091] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Cotizar similar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
