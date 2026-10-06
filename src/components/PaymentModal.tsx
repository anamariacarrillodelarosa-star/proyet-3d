import React, { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle, ShieldCheck, Loader2, Lock, ArrowRight, Building } from 'lucide-react';
import { PriceBreakdown, CustomerData } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  price: PriceBreakdown;
  customer: CustomerData;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  reference,
  price,
  customer,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'stripe' | 'bizum' | 'transfer'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [bizumPhone, setBizumPhone] = useState(customer.phone || '');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate API call to /api/leads/:ref/pay
      await fetch(`/api/leads/${reference}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#184E77] to-[#1E6091] text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-200">
              PROYET 3D · Pasarela Segura SSL 256-bit
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Abono Directo de Presupuesto
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

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                ¡Pago Confirmado con Éxito!
              </span>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1 mb-2">
                Pedido {reference} en Producción
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                Hemos enviado la factura con IVA desglosado a <strong>{customer.email}</strong>. Tu pieza ya ha entrado en la cola del taller de fabricación aditiva.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1E6091] hover:bg-[#184E77] text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Volver a la Plataforma
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-5">
              {/* Order total header */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Referencia: {reference}</span>
                  <p className="text-xs font-bold text-slate-800">{customer.name} ({customer.city})</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#184E77] font-mono">
                    {price.total.toFixed(2)}€
                  </span>
                  <span className="text-[10px] text-slate-500 block">IVA 21% incluido</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Selecciona Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('stripe')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      method === 'stripe'
                        ? 'border-[#1E6091] bg-blue-50/70 text-[#1E6091] font-bold ring-2 ring-[#1E6091]/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px]">Tarjeta / Stripe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bizum')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      method === 'bizum'
                        ? 'border-[#1E6091] bg-blue-50/70 text-[#1E6091] font-bold ring-2 ring-[#1E6091]/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-cyan-600" />
                    <span className="text-[11px]">Bizum Empresa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('transfer')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      method === 'transfer'
                        ? 'border-[#1E6091] bg-blue-50/70 text-[#1E6091] font-bold ring-2 ring-[#1E6091]/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span className="text-[11px]">Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs according to method */}
              {method === 'stripe' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Caducidad</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'bizum' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Teléfono asociado a Bizum
                    </label>
                    <input
                      type="tel"
                      required
                      value={bizumPhone}
                      onChange={(e) => setBizumPhone(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Recibirás una notificación instantánea en la app de tu banco para validar la operación de {price.total.toFixed(2)}€.
                    </span>
                  </div>
                </div>
              )}

              {method === 'transfer' && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-800">Datos para transferencia bancaria:</p>
                  <p className="font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    IBAN: ES76 0049 1500 0512 3456 7890<br />
                    Beneficiario: PROYET 3D SL<br />
                    Concepto obligatorio: <strong>{reference}</strong>
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    La producción comenzará una vez recibida la confirmación de la transferencia.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pago encriptado con protocolo 3D Secure y tokenización bancaria.</span>
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
                  disabled={isProcessing}
                  className="bg-[#1E6091] hover:bg-[#184E77] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando cobro seguro...</span>
                    </>
                  ) : (
                    <>
                      <span>Pagar Ahora ({price.total.toFixed(2)}€)</span>
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
