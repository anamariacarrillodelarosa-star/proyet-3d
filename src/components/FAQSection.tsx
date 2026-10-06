import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: '¿Qué tolerancias dimensionales garantiza Proyet 3D en la fabricación?',
    answer: 'En tecnología FDM (PLA, PETG, ABS, ASA) trabajamos con tolerancias de ±0.15 mm a ±0.20 mm en piezas calibradas. En tecnología de resina UV fotopolímera (SLA), logramos tolerancias micrométricas de hasta ±0.05 mm, ideal para ensamblajes de precisión milimétrica.',
  },
  {
    question: '¿Cuál es el espesor de pared mínimo recomendado para garantizar solidez?',
    answer: 'Recomendamos un espesor de pared de al menos 1.2 mm a 1.6 mm para que la pieza cuente con 3 a 4 perímetros continuos. El mínimo técnico absoluto soportado es de 0.8 mm (2 pasadas de boquilla estándar de 0.4 mm).',
  },
  {
    question: '¿Cómo detecta vuestro software si mi modelo necesita soportes?',
    answer: 'Al subir tu archivo .STL, nuestro algoritmo analiza la normal de cada triángulo de la malla poligonal. Si se detectan ángulos descendentes superiores a 45° respecto al plano horizontal sin apoyo inferior, el sistema te avisa y recomendamos dejar activada la opción de soportes.',
  },
  {
    question: '¿Qué formatos de archivo 3D son compatibles con el cotizador?',
    answer: 'Admitimos .STL (tanto en formato binario estándar como ASCII), así como .OBJ y .3MF. El formato .STL binario es el estándar universal más ligero y rápido de procesar.',
  },
  {
    question: '¿Cuáles son los plazos de entrega y zonas de cobertura?',
    answer: 'Fabricamos la mayoría de prototipos y piezas unitarias en 24 a 48 horas laborables en nuestras impresoras. Los envíos se realizan por mensajería urgente peninsular: Estándar (48/72h) o Urgente Express (24h con entrega antes de las 14:00). Cubrimos toda España y Portugal continental.',
  },
  {
    question: '¿Qué debo hacer si solo tengo una pieza rota física o un boceto en papel?',
    answer: 'Contamos con servicio integral de Ingeniería Inversa y Diseño CAD en SolidWorks y Fusion 360. Puedes contactar con nuestro equipo a través de ProyetBot o mediante el formulario de contacto para que modelemos tu pieza desde cero.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#EEF6FF] border-b border-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resolución de Dudas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Todo lo que necesitas saber sobre procesos, materiales, tiempos de fabricación y envíos.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-blue-100 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-[#1E6091] transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1E6091] flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
