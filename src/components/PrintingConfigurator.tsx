import React, { useState } from 'react';
import {
  Scale,
  Clock,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileDown,
  Send,
  HelpCircle,
  Lock,
  Unlock,
  CreditCard,
  Paintbrush,
  Hammer,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { ModelAnalysis, PrintConfig, PriceBreakdown, MaterialKey, CustomerData, PostProcessingOption } from '../types';
import { MATERIALS_DATA, COLOR_OPTIONS, LAYER_HEIGHT_OPTIONS, INFILL_PRESETS, POST_PROCESSING_OPTIONS } from '../utils/materials';

interface PrintingConfiguratorProps {
  analysis: ModelAnalysis;
  config: PrintConfig;
  price: PriceBreakdown;
  registeredLead: { customer: CustomerData; reference: string } | null;
  onChangeConfig: (newConfig: Partial<PrintConfig>) => void;
  onOpenLeadCapture: () => void;
  onDownloadPDF: () => void;
  onOpenPayment: () => void;
  onAskBot: (question: string) => void;
}

export const PrintingConfigurator: React.FC<PrintingConfiguratorProps> = ({
  analysis,
  config,
  price,
  registeredLead,
  onChangeConfig,
  onOpenLeadCapture,
  onDownloadPDF,
  onOpenPayment,
  onAskBot,
}) => {
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [showPrintabilityDetails, setShowPrintabilityDetails] = useState(false);
  const currentMaterial = MATERIALS_DATA[config.material] || MATERIALS_DATA.PLA;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 p-6 sm:p-8">
      {/* 1. GEOMETRIC ANALYSIS & PRINTABILITY SCORE HUD */}
      <div className="mb-8 pb-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E6091] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Análisis Geométrico Automatizado</h3>
              <p className="text-xs text-slate-500 font-mono">Archivo: {analysis.fileName}</p>
            </div>
          </div>

          {/* Printability Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintabilityDetails(!showPrintabilityDetails)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: `${analysis.printability.color}15`,
                borderColor: `${analysis.printability.color}40`,
                color: analysis.printability.color,
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Score: <strong>{analysis.printability.score}%</strong> ({analysis.printability.level})</span>
              {showPrintabilityDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500">Dimensiones (X, Y, Z)</span>
            <p className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {analysis.dimensions.x} × {analysis.dimensions.y} × {analysis.dimensions.z}
              <span className="text-[11px] font-sans font-normal text-slate-400 ml-1">mm</span>
            </p>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500">Volumen Real</span>
            <p className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {analysis.volumeCm3.toFixed(1)}
              <span className="text-[11px] font-sans font-normal text-slate-400 ml-1">cm³</span>
            </p>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500">Peso Estimado</span>
            <p className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {(analysis.volumeCm3 * currentMaterial.density * (0.25 + 0.75 * (config.infillPercent / 100))).toFixed(1)}
              <span className="text-[11px] font-sans font-normal text-slate-400 ml-1">g</span>
            </p>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500">Tiempo Fabricación</span>
            <p className="text-sm font-bold font-mono text-slate-800 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {((analysis.volumeCm3 * 0.055 * (0.2 / config.layerHeight)) + 0.5).toFixed(1)}
              <span className="text-[11px] font-sans font-normal text-slate-400">h</span>
            </p>
          </div>
        </div>

        {/* Expandable Printability Details HUD */}
        {showPrintabilityDetails && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Verificación Automática de Imprimibilidad (Score):</span>
              <span className="font-mono font-bold" style={{ color: analysis.printability.color }}>
                {analysis.printability.score} / 100 puntos
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${analysis.printability.score}%`,
                  backgroundColor: analysis.printability.color,
                }}
              />
            </div>

            <div className="space-y-2 mb-3">
              {analysis.printability.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/70">
                  {c.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : c.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800">{c.title}</span>
                    <p className="text-slate-600 mt-0.5">{c.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {analysis.printability.recommendations.length > 0 && (
              <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-slate-700">
                <span className="font-bold text-blue-900 block mb-1">💡 Consejos técnicos para esta pieza:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {analysis.printability.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Critical Alerts */}
        {analysis.exceedsBedVolume && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Dimensiones superiores al volumen estándar (256x256x256 mm). El departamento técnico revisará la orientación.</span>
          </div>
        )}
      </div>

      {/* 2. PRINTING CONFIGURATION OPTIONS */}
      <div className="space-y-6">
        {/* Material Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Material de Fabricación</span>
            </label>
            <button
              type="button"
              onClick={() => onAskBot(`¿Qué material me recomiendas para una pieza con volumen de ${analysis.volumeCm3.toFixed(1)} cm³?`)}
              className="text-xs text-[#1E6091] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              ¿Qué material elijo?
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.values(MATERIALS_DATA).map((mat) => {
              const isSelected = config.material === mat.key;
              return (
                <button
                  key={mat.key}
                  type="button"
                  onClick={() => onChangeConfig({ material: mat.key as MaterialKey })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#1E6091] bg-blue-50/50 shadow-sm ring-2 ring-[#1E6091]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-800">{mat.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {mat.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{mat.bestFor}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span>Temp: {mat.tempResistanceMax}°C</span>
                    <span>·</span>
                    <span>UV: {mat.uvResistance}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#1E6091] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">{currentMaterial.name}</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{currentMaterial.description}</p>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
            2. Color del Material
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = config.color === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onChangeConfig({ color: c.name })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1E6091] bg-blue-50 text-[#1E6091] font-semibold ring-1 ring-[#1E6091]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layer Height & Infill 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layer Height Quality */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              3. Calidad / Altura de Capa
            </label>
            <div className="space-y-2">
              {LAYER_HEIGHT_OPTIONS.map((opt) => {
                const isSelected = config.layerHeight === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeConfig({ layerHeight: opt.value })}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1E6091] bg-blue-50/60 ring-1 ring-[#1E6091]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Infill (Relleno) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Relleno Interior (Infill)
              </label>
              <span className="text-xs font-mono font-bold text-[#1E6091] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {config.infillPercent}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {INFILL_PRESETS.map((p) => (
                <button
                  key={p.percent}
                  type="button"
                  onClick={() => onChangeConfig({ infillPercent: p.percent })}
                  className={`py-1.5 px-1 rounded-lg text-center border text-[11px] font-semibold transition-all cursor-pointer ${
                    config.infillPercent === p.percent
                      ? 'border-[#1E6091] bg-[#1E6091] text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.percent}%
                </button>
              ))}
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={config.infillPercent}
              onChange={(e) => onChangeConfig({ infillPercent: Number(e.target.value) })}
              className="w-full accent-[#1E6091] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>10% (Ligero)</span>
              <span>40% (Funcional)</span>
              <span>100% (Macizo)</span>
            </div>

            {/* Supports Toggle */}
            <div className="mt-5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Soportes de Fabricación</span>
                <span className="text-[11px] text-slate-500">Recomendado para voladizos &gt;45°</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeConfig({ supports: !config.supports })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config.supports ? 'bg-[#1E6091]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    config.supports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Post-Processing & Surface Finish Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
            5. Acabado y Postprocesado Técnico
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POST_PROCESSING_OPTIONS.map((opt) => {
              const isSelected = config.postProcessing === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeConfig({ postProcessing: opt.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1E6091] bg-blue-50/70 ring-2 ring-[#1E6091]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-[#1E6091] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Quantity & Bulk Discount Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                6. Cantidad de Unidades
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Escalado automático</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ quantity: Math.max(1, config.quantity - 1) })}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={config.quantity}
                  onChange={(e) => onChangeConfig({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-14 text-center font-bold text-sm text-slate-800 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => onChangeConfig({ quantity: config.quantity + 1 })}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {price.discountPercent > 0 ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg animate-pulse">
                  🎉 ¡{price.discountPercent}% DTO. aplicado!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  (5+ uds: 5% DTO · 11+ uds: 15% DTO)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              7. Envío Peninsular
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ shippingMethod: 'standard' })}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  config.shippingMethod === 'standard'
                    ? 'border-[#1E6091] bg-blue-50 text-[#1E6091] font-semibold'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <span className="font-bold block">Estándar (4.90€)</span>
                <span className="text-[10px] text-slate-500">48h-72h peninsular</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ shippingMethod: 'express' })}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  config.shippingMethod === 'express'
                    ? 'border-[#1E6091] bg-blue-50 text-[#1E6091] font-semibold'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <span className="font-bold block">Express 24h (8.90€)</span>
                <span className="text-[10px] text-slate-500">Prioridad en cola</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME QUOTE & LEAD GATING CARD */}
      <div className="mt-8 pt-6 border-t-2 border-slate-100">
        <div className="bg-gradient-to-br from-blue-950 via-[#184E77] to-[#1E6091] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Presupuesto Paramétrico Oficial
                </span>
                {registeredLead ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-mono">
                    <Unlock className="w-3 h-3" />
                    {registeredLead.reference}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Registro Requerido
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                  {price.total.toFixed(2)}€
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  (IVA 21% incl. · {config.quantity} {config.quantity === 1 ? 'unidad' : 'unidades'})
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                {price.subtotalPiece.toFixed(2)}€ / unidad base
                {price.discountPercent > 0 && ` · Descuento de ${price.discountPercent}% por volumen`}
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              {registeredLead ? (
                <>
                  <button
                    type="button"
                    onClick={onDownloadPDF}
                    className="bg-white hover:bg-blue-50 text-[#184E77] font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileDown className="w-4 h-4 text-[#1E6091]" />
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenPayment}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar Online ({price.total.toFixed(2)}€)</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLeadCapture}
                  className="bg-white hover:bg-blue-50 text-[#184E77] font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4 text-[#1E6091]" />
                  <span>Desbloquear Presupuesto Completo</span>
                </button>
              )}
            </div>
          </div>

          {/* Locked vs Unlocked notice */}
          {!registeredLead ? (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 text-xs text-blue-100 flex items-center justify-between">
              <span>🔒 Completa el formulario de contacto para desbloquear el desglose técnico completo y descargar tu PDF formal.</span>
              <button
                type="button"
                onClick={onOpenLeadCapture}
                className="underline font-bold text-white hover:text-blue-200 cursor-pointer ml-2 shrink-0"
              >
                Completar datos →
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
              <button
                type="button"
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer font-medium"
              >
                <span>{showPriceDetails ? 'Ocultar desglose técnico de costes' : 'Ver desglose transparente de costes'}</span>
                {showPriceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[11px] text-emerald-300 font-medium">✓ Desbloqueado para {registeredLead.customer.name}</span>
            </div>
          )}

          {/* Itemized Price Breakdown (Unlocked) */}
          {showPriceDetails && registeredLead && (
            <div className="mt-3 p-4 bg-black/25 rounded-xl space-y-1.5 text-xs text-blue-100 font-mono animate-in fade-in">
              <div className="flex justify-between">
                <span>Preparación de archivo / calibración laminado:</span>
                <span>{price.prepCost.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Coste materia prima ({config.material}):</span>
                <span>{(price.materialCost * config.quantity).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo de máquina FDM / SLA:</span>
                <span>{(price.machineCost * config.quantity).toFixed(2)}€</span>
              </div>
              {price.postProcessingCost > 0 && (
                <div className="flex justify-between text-cyan-200">
                  <span>Postprocesado ({POST_PROCESSING_OPTIONS.find(p => p.id === config.postProcessing)?.name}):</span>
                  <span>{price.postProcessingCost.toFixed(2)}€</span>
                </div>
              )}
              {price.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-300 font-bold">
                  <span>Descuento por volumen ({price.discountPercent}%):</span>
                  <span>-{(price.subtotalPiece * config.quantity - price.discountedSubtotal).toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío ({config.shippingMethod === 'express' ? 'Urgente 24h' : 'Estándar 48h'}):</span>
                <span>{price.shipping.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span>{price.tax.toFixed(2)}€</span>
              </div>
              <div className="border-t border-white/20 pt-1.5 flex justify-between font-bold text-white text-sm">
                <span>Total Presupuesto Oficial:</span>
                <span>{price.total.toFixed(2)}€</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
