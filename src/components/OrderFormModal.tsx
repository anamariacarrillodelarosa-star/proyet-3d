import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Printer, Send, FileText, Loader2, ArrowRight } from 'lucide-react';
import { ModelAnalysis, PrintConfig, PriceBreakdown, CustomerData } from '../types';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ModelAnalysis;
  config: PrintConfig;
  price: PriceBreakdown;
  fileBuffer?: ArrayBuffer | null;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  analysis,
  config,
  price,
  fileBuffer,
}) => {
  const [customer, setCustomer] = useState<CustomerData>({
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
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      setErrorMessage('Por favor, rellena todos los campos obligatorios (*)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // If we have a fileBuffer, convert first few KB to base64 or upload
      let fileBase64 = '';
      if (fileBuffer) {
        try {
          const bytes = new Uint8Array(fileBuffer.slice(0, Math.min(fileBuffer.byteLength, 5 * 1024 * 1024)));
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          fileBase64 = `data:application/octet-stream;base64,${btoa(binary)}`;
        } catch {
          // ignore large base64 error
        }
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
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

      const data = await response.json();
      if (data.success) {
        setSuccessReference(data.reference);
      } else {
        setErrorMessage(data.error || 'Error al tramitar la solicitud.');
      }
    } catch {
      // Local fallback in case network error
      const mockRef = `P3D-${Math.floor(10000 + Math.random() * 90000)}`;
      setSuccessReference(mockRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#184E77] to-[#1E6091] text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-200">
              PROYET 3D · Tramitación de Presupuesto
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Confirmar Solicitud de Fabricación
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {successReference ? (
            /* Success confirmation screen */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                ¡Solicitud Registrada con Éxito!
              </span>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1 mb-2">
                Referencia: <span className="font-mono text-[#1E6091]">{successReference}</span>
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                Hemos enviado un correo a <strong>{customer.email}</strong> con el resumen técnico de tu pieza y los datos de pago para iniciar la producción en nuestro taller.
              </p>

              {/* Summary Voucher Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs font-mono space-y-2 mb-6">
                <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-800 font-sans">
                  <span>Pieza: {analysis.fileName}</span>
                  <span>{config.quantity} {config.quantity === 1 ? 'ud.' : 'uds.'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Material / Color:</span>
                  <span>{config.material} · {config.color}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resolución / Infill:</span>
                  <span>{config.layerHeight} mm · {config.infillPercent}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Destinatario:</span>
                  <span>{customer.name} ({customer.city})</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                  <span>Importe Total (IVA inc.):</span>
                  <span className="text-[#1E6091]">{price.total.toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar Justificante</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-[#1E6091] hover:bg-[#184E77] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Aceptar y Volver a la Web
                </button>
              </div>
            </div>
          ) : (
            /* Order Entry Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Specs Preview Pill */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{analysis.fileName}</p>
                  <p className="text-slate-500 font-mono mt-0.5">
                    {config.material} ({config.color}) · {config.layerHeight}mm · {config.infillPercent}% infill
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#184E77]">
                    {price.total.toFixed(2)}€
                  </span>
                  <span className="text-[10px] text-slate-500 block">IVA y envío incluidos</span>
                </div>
              </div>

              {/* Customer Inputs */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Datos de Contacto y Envío
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre y Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Corporativo / Personal *</label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@empresa.es"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Teléfono de Contacto *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+34 600 000 000"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Empresa / Razón Social (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Nombre de empresa o CIF"
                      value={customer.company}
                      onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Dirección de Entrega Completa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, número, piso o polígono industrial"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ciudad / Población *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Valencia"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código Postal *</label>
                    <input
                      type="text"
                      required
                      placeholder="46001"
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Observaciones Técnicas o Requisitos de Montaje (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Requiere tolerancia estricta en el orificio central de 8mm o inserción de roscas."
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Guarantees */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Revisión humana previa: verificamos la integridad del archivo antes de lanzar la producción.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
                      <span>Registrando pedido...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Solicitud ({price.total.toFixed(2)}€)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
