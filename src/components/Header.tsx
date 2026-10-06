import React from 'react';
import { Layers, ShieldCheck, Phone, Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onScrollToQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onScrollToQuote }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs transition-all">
      {/* Top industrial banner */}
      <div className="bg-[#184E77] text-blue-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-white">Granja de Fabricación Activa</span>
            <span className="hidden sm:inline text-blue-200">| Entregas garantizadas en 24h/72h en toda España y Portugal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              Tolerancia ISO 2768 (±0.15 mm)
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-300" />
              Asesoría Técnica: +34 910 038 920
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E6091] to-[#184E77] text-white flex items-center justify-center shadow-md shadow-blue-900/20 group">
              <Layers className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-[#184E77]">PROYET</span>
                <span className="text-2xl font-extrabold text-[#1E6091]">3D</span>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1E6091] px-1.5 py-0.5 rounded">SaaS</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                Diseño · Presupuestos · Impresión 3D
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#cotizador" className="text-[#1E6091] hover:text-[#184E77] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Presupuesto Instantáneo
            </a>
            <a href="#como-funciona" className="hover:text-[#1E6091] transition-colors">
              Cómo funciona
            </a>
            <a href="#que-fabricamos" className="hover:text-[#1E6091] transition-colors">
              Servicios & Fabricación
            </a>
            <a href="#galeria" className="hover:text-[#1E6091] transition-colors">
              Resultados 3D
            </a>
            <a href="#materiales" className="hover:text-[#1E6091] transition-colors">
              Materiales
            </a>
            <a href="#faq" className="hover:text-[#1E6091] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-slate-600 hover:text-[#184E77] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Panel de Administración interno"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            <button
              onClick={onScrollToQuote}
              className="bg-[#1E6091] hover:bg-[#184E77] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Subir STL</span>
              <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-mono">0.0s</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
