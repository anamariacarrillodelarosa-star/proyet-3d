import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, Zap, Shield, Clock, CheckCircle2, AlertCircle, ArrowRight, Play } from 'lucide-react';
import { createSampleModel } from '../utils/stlParser';

interface HeroDropzoneProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  isLoading: boolean;
  activeFileName?: string;
}

export const HeroDropzone: React.FC<HeroDropzoneProps> = ({
  onFileLoaded,
  isLoading,
  activeFileName,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.stl', '.obj', '.3mf'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Por favor, sube un archivo con formato .STL, .OBJ o .3MF');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setErrorMessage('El archivo excede el límite máximo recomendado de 80 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        onFileLoaded(buffer, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo. Inténtalo de nuevo.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadSample = (type: 'gear' | 'turbine' | 'cube' | 'bracket') => {
    const { buffer, name } = createSampleModel(type);
    onFileLoaded(buffer, name);
  };

  return (
    <section id="cotizador" className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background industrial grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#184E77 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Quality Pill */}
        <div className="inline-flex items-center gap-2 bg-blue-100/90 text-[#1E6091] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs border border-blue-200">
          <Zap className="w-3.5 h-3.5" />
          <span>Cotizador Industrial Automático 4.0 · Sin esperas</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E293B] leading-[1.15]">
          PROYET 3D:{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E6091] via-[#184E77] to-[#1075C2]">
            Convierte tu idea en una pieza real
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          Sube tu archivo <strong className="text-slate-800 font-semibold">.STL</strong> y calcula tu presupuesto al instante con análisis volumétrico en tiempo real, visor 3D interactivo y materiales de ingeniería.
        </p>

        {/* Main Dropzone Card */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-200 bg-white ${
              isDragOver
                ? 'border-[#1E6091] bg-blue-50/70 scale-[1.01] shadow-xl ring-4 ring-blue-100'
                : 'border-blue-300 hover:border-[#1E6091] shadow-lg shadow-blue-900/5 hover:shadow-xl'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".stl,.obj,.3mf"
              className="hidden"
            />

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-14 h-14 border-4 border-blue-200 border-t-[#1E6091] rounded-full animate-spin mb-4" />
                <p className="text-base font-bold text-[#184E77]">Laminando y analizando geometría 3D...</p>
                <p className="text-xs text-slate-500 mt-1">Calculando volumen exacto, mallas y detección de voladizos</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 text-[#1E6091] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#1E6091] group-hover:text-white transition-all shadow-inner">
                  <UploadCloud className="w-10 h-10" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-2">
                  Arrastra y suelta tu archivo 3D aquí
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-4">
                  O haz clic para explorar en tu ordenador. Formatos compatibles:{' '}
                  <span className="font-mono font-semibold text-slate-700">.STL (binario/ASCII), .OBJ, .3MF</span>
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-[#1E6091] hover:bg-[#184E77] px-5 py-2.5 rounded-lg shadow-sm transition-all group-hover:shadow-md">
                  <FileCode2 className="w-4 h-4" />
                  <span>Seleccionar archivo 3D</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>

                {activeFileName && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Archivo cargado actualmente: <strong>{activeFileName}</strong></span>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs font-medium text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Demo Models */}
          <div className="mt-5 p-4 bg-white/80 backdrop-blur-xs rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#1E6091]" />
              ¿No tienes un archivo a mano? Prueba con una muestra:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => loadSample('gear')}
                className="bg-blue-50 hover:bg-blue-100 text-[#1E6091] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              >
                ⚙️ Engranaje Mecánico
              </button>
              <button
                type="button"
                onClick={() => loadSample('turbine')}
                className="bg-blue-50 hover:bg-blue-100 text-[#1E6091] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              >
                🌀 Impulsor Turbina
              </button>
              <button
                type="button"
                onClick={() => loadSample('bracket')}
                className="bg-blue-50 hover:bg-blue-100 text-[#1E6091] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              >
                🛠️ Soporte Escuadra
              </button>
              <button
                type="button"
                onClick={() => loadSample('cube')}
                className="bg-blue-50 hover:bg-blue-100 text-[#1E6091] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              >
                🧊 Cubo 20mm
              </button>
            </div>
          </div>

          {/* Industrial Trust Badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E6091] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Presupuesto en 2s</p>
                <p className="text-[11px] text-slate-500">Cálculo de algoritmo FDM</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E6091] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Tolerancia ±0.15mm</p>
                <p className="text-[11px] text-slate-500">Norma industrial ISO</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E6091] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Envíos 24h / 72h</p>
                <p className="text-[11px] text-slate-500">Entrega rápida a península</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E6091] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Garantía de Ajuste</p>
                <p className="text-[11px] text-slate-500">Revisión técnica previa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
