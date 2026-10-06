import React, { useState } from 'react';
import { X, Lock, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, Building, User } from 'lucide-react';
import { CustomerData, ModelAnalysis, PrintConfig, PriceBreakdown } from '../types';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ModelAnalysis;
  config: PrintConfig;
  price: PriceBreakdown;
  onLeadSuccess: (customer: CustomerData, reference: string) => void;
  fileBuffer?: ArrayBuffer | null;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  analysis,
  config,
  price,
  onLeadSuccess,
  fileBuffer,
}) => {
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    usageType: 'Particular',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      setErrorMessage('Por favor, rellena todos los campos obligatorios (*)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let fileBase64 = '';
      if (fileBuffer) {
        try {
          const bytes = new Uint8Array(fileBuffer.slice(0, Math.min(fileBuffer.byteLength, 4 * 1024 * 1024)));
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          fileBase64 = `data:application/octet-stream;base64,${btoa(binary)}`;
        } catch {
          // ignore
        }
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          modelName: analysis.fileName,
          dimensions: analysis.dimensions,
          volumeCm3: analysis.volumeCm3,
          weightGrams: analysis.weightGrams,
          printTimeHours: analysis.printTimeHours,
          config,
          price,
          fileBase64,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onLeadSuccess(formData, data.reference);
        onClose();
      } else {
        setErrorMessage(data.error || 'Error al registrar tus datos.');
      }
    } catch {
      // Local fallback
      const mockRef = `P3D-${Math.floor(10000 + Math.random() * 90000)}`;
      onLeadSuccess(formData, mockRef);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#184E77] via-[#1E6091] to-[#1075C2] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-200">
                PROYET 3D · Desbloqueo de Cotización
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            Desbloquear Desglose y Presupuesto Formal
          </h3>
          <p className="text-xs text-blue-100 mt-1 max-w-md">
            Introduce tus datos de contacto para acceder al desglose de costes en tiempo real, descargar el PDF con validez legal y recibir asesoría técnica.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {/* Usage Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Tipo de Solicitud *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, usageType: 'Particular' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  formData.usageType === 'Particular'
                    ? 'border-[#1E6091] bg-blue-50 text-[#1E6091] shadow-2xs'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Uso Particular / Creador</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, usageType: 'Profesional' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  formData.usageType === 'Profesional'
                    ? 'border-[#1E6091] bg-blue-50 text-[#1E6091] shadow-2xs'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Empresa / Profesional</span>
              </button>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Laura Gómez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                placeholder="laura@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono de Contacto *</label>
              <input
                type="tel"
                required
                placeholder="+34 600 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {formData.usageType === 'Profesional' ? 'Empresa / Razón Social *' : 'Empresa (Opcional)'}
              </label>
              <input
                type="text"
                placeholder={formData.usageType === 'Profesional' ? 'Ej. Ingeniería Mecánica SL' : 'Nombre de empresa'}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Dirección de Entrega / Facturación *</label>
              <input
                type="text"
                required
                placeholder="Calle, número, polígono o recogida en taller"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ciudad / Población *</label>
              <input
                type="text"
                required
                placeholder="Ej. Madrid"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código Postal *</label>
              <input
                type="text"
                required
                placeholder="28001"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Observaciones Técnicas o Requisitos de Fabricación
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Tolerancia crítica en orificio de eje, resistencia a solventes o roscas metálicas específicas."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] outline-hidden resize-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tus datos son confidenciales y no enviamos spam. Utilizados exclusivamente para el presupuesto de tu pieza.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1E6091] hover:bg-[#184E77] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Desbloqueando...</span>
                </>
              ) : (
                <>
                  <span>Ver Desglose y Descargar PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
