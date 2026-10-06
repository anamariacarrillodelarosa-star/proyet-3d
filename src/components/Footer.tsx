import React from 'react';
import { Layers, Mail, Phone, MapPin, ShieldCheck, Clock, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 cursor-pointer mb-4" onClick={scrollToTop}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6091] to-[#184E77] text-white flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-extrabold tracking-tight text-white">PROYET</span>
                  <span className="text-xl font-extrabold text-[#1E6091]">3D</span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Diseño · Presupuestos · Impresión 3D
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Plataforma industrial para la cotización automática y fabricación aditiva bajo demanda. Entregamos prototipos de ingeniería y series cortas de piezas en polímeros de alto rendimiento.
            </p>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="inline-flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Norma ISO 2768
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Entregas 24/72h
              </span>
            </div>
          </div>

          {/* Col 3: Materiales & Tecnología */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Materiales</h4>
            <ul className="space-y-2">
              <li><a href="#materiales" className="hover:text-white transition-colors">PLA Estándar & Plus</a></li>
              <li><a href="#materiales" className="hover:text-white transition-colors">PETG Industrial</a></li>
              <li><a href="#materiales" className="hover:text-white transition-colors">ABS Resistencia Térmica</a></li>
              <li><a href="#materiales" className="hover:text-white transition-colors">ASA Ultra-UV (Exterior)</a></li>
              <li><a href="#materiales" className="hover:text-white transition-colors">TPU 95A Flexible</a></li>
              <li><a href="#materiales" className="hover:text-white transition-colors">Resina Fotopolímero SLA</a></li>
            </ul>
          </div>

          {/* Col 4: Servicios */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li><a href="#cotizador" className="hover:text-white transition-colors">Cotizador STL en tiempo real</a></li>
              <li><a href="#que-fabricamos" className="hover:text-white transition-colors">Series cortas (1-500 uds)</a></li>
              <li><a href="#que-fabricamos" className="hover:text-white transition-colors">Repuestos descatalogados</a></li>
              <li><a href="#que-fabricamos" className="hover:text-white transition-colors">Prototipos de ingeniería</a></li>
              <li><a href="#que-fabricamos" className="hover:text-white transition-colors">Inserts y postprocesado</a></li>
            </ul>
          </div>

          {/* Col 5: Contacto */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contacto Directo</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#1E6091] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">+34 910 038 920</span>
                  <span className="text-[10px] text-slate-500">Lunes a Viernes 08:00 - 18:00</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#1E6091] shrink-0 mt-0.5" />
                <span className="text-slate-300">cotizaciones@proyet3d.es</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1E6091] shrink-0 mt-0.5" />
                <span>Parque Tecnológico Industrial, Nave 14, España</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} PROYET 3D SL. Todos los derechos reservados. Plataforma de Fabricación Aditiva.
          </p>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">Aviso Legal</span>
            <span className="hover:text-slate-300 cursor-pointer">Política de Privacidad</span>
            <span className="hover:text-slate-300 cursor-pointer">Términos de Servicio</span>
            <button
              onClick={scrollToTop}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer ml-2"
              title="Volver arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
