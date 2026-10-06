import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Header } from './components/Header';
import { HeroDropzone } from './components/HeroDropzone';
import { Viewer3D } from './components/Viewer3D';
import { PrintingConfigurator } from './components/PrintingConfigurator';
import { GallerySection } from './components/GallerySection';
import { ManufacturingCapabilities } from './components/ManufacturingCapabilities';
import { HowItWorks } from './components/HowItWorks';
import { MaterialsGuide } from './components/MaterialsGuide';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { OrderFormModal } from './components/OrderFormModal';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { PaymentModal } from './components/PaymentModal';
import { ProyetBotChat } from './components/ProyetBotChat';
import { AdminPanelModal } from './components/AdminPanelModal';

import { ModelAnalysis, PrintConfig, PriceBreakdown, MaterialKey, CustomerData } from './types';
import { parseSTL, createSampleModel } from './utils/stlParser';
import { COLOR_OPTIONS } from './utils/materials';
import { calculateQuotePrice, DEFAULT_PRICING_SETTINGS, PricingSettings } from './utils/pricing';
import { generateQuotePDF } from './utils/pdfGenerator';

export default function App() {
  // 3D Geometry and Model State
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysis | null>(null);
  const [rawFileBuffer, setRawFileBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Printing Configuration State
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    material: 'PETG',
    color: 'Gris Industrial',
    layerHeight: 0.20,
    infillPercent: 35,
    supports: true,
    quantity: 1,
    shippingMethod: 'standard',
    postProcessing: 'none',
  });

  // Admin & Pricing settings
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(DEFAULT_PRICING_SETTINGS);

  // Gated Lead Capture state
  const [registeredLead, setRegisteredLead] = useState<{
    customer: CustomerData;
    reference: string;
  } | null>(null);

  // Modals state
  const [isLeadCaptureOpen, setIsLeadCaptureOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Chatbot State
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botPrompt, setBotPrompt] = useState<string | null>(null);

  // Load initial demo model (Mechanical Gear) on mount so user immediately sees the interactive 3D tool!
  useEffect(() => {
    loadModelFromSample('gear');
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.materialRates) {
          setPricingSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const loadModelFromSample = (type: 'gear' | 'turbine' | 'cube' | 'bracket') => {
    setIsLoadingFile(true);
    setTimeout(() => {
      try {
        const { buffer, name } = createSampleModel(type);
        const { geometry: parsedGeo, analysis } = parseSTL(buffer, name);
        setGeometry(parsedGeo);
        setModelAnalysis(analysis);
        setRawFileBuffer(buffer);

        setPrintConfig((prev) => ({
          ...prev,
          supports: analysis.hasOverhangs,
        }));
      } catch (err) {
        console.error('Error cargando modelo de muestra:', err);
      } finally {
        setIsLoadingFile(false);
      }
    }, 120);
  };

  const handleFileLoaded = (buffer: ArrayBuffer, fileName: string) => {
    setIsLoadingFile(true);
    setTimeout(() => {
      try {
        const { geometry: parsedGeo, analysis } = parseSTL(buffer, fileName);
        setGeometry(parsedGeo);
        setModelAnalysis(analysis);
        setRawFileBuffer(buffer);

        setPrintConfig((prev) => ({
          ...prev,
          supports: analysis.hasOverhangs,
        }));

        // Reset lead lock for new file or keep contact info
        if (registeredLead) {
          // Generate new quote reference for this new piece
          const newRef = `P3D-${Math.floor(10000 + Math.random() * 90000)}`;
          setRegisteredLead({ customer: registeredLead.customer, reference: newRef });
        }

        const inspectionSection = document.getElementById('inspeccion-3d');
        if (inspectionSection) {
          inspectionSection.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Error al procesar archivo 3D:', err);
        alert('No se pudo procesar el archivo. Comprueba que es un formato STL, OBJ o 3MF válido.');
      } finally {
        setIsLoadingFile(false);
      }
    }, 150);
  };

  const handleChangeConfig = (newConfig: Partial<PrintConfig>) => {
    setPrintConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleSelectMaterialFromGuide = (materialKey: MaterialKey) => {
    handleChangeConfig({ material: materialKey });
  };

  const handleAskBot = (question: string) => {
    setBotPrompt(question);
    setIsBotOpen(true);
  };

  const scrollToDropzone = () => {
    const el = document.getElementById('cotizador');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Compute live price
  const priceBreakdown: PriceBreakdown = modelAnalysis
    ? calculateQuotePrice(modelAnalysis, printConfig, pricingSettings)
    : {
        prepCost: 4.5,
        materialCost: 0,
        machineCost: 0,
        postProcessingCost: 0,
        marginCost: 0,
        subtotalPiece: 0,
        quantity: 1,
        discountPercent: 0,
        discountedSubtotal: 0,
        shipping: 4.9,
        tax: 0,
        total: 0,
      };

  const handleLeadSuccess = (customer: CustomerData, reference: string) => {
    setRegisteredLead({ customer, reference });
  };

  const handleDownloadPDF = () => {
    if (!registeredLead || !modelAnalysis) {
      setIsLeadCaptureOpen(true);
      return;
    }
    generateQuotePDF({
      reference: registeredLead.reference,
      analysis: modelAnalysis,
      config: printConfig,
      price: priceBreakdown,
      customer: registeredLead.customer,
    });
  };

  const activeColorObj = COLOR_OPTIONS.find((c) => c.name === printConfig.color) || COLOR_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#EEF6FF] flex flex-col font-sans text-[#1E293B]">
      {/* 1. Top Header */}
      <Header
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onScrollToQuote={scrollToDropzone}
      />

      {/* 2. Hero Section with Prominent Dropzone */}
      <HeroDropzone
        onFileLoaded={handleFileLoaded}
        isLoading={isLoadingFile}
        activeFileName={modelAnalysis?.fileName}
      />

      {/* 3. Interactive 3D Inspection & Real-Time Quotation Area */}
      <section id="inspeccion-3d" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6091] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1E6091]" />
              Área de Presupuesto Técnico e Inspección 3D
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
              Visor Interactivo, Detección de Voladizos y Cotizador
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">¿Quieres cambiar de pieza?</span>
            <button
              onClick={scrollToDropzone}
              className="text-xs font-bold text-[#1E6091] hover:text-[#184E77] bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              ↑ Subir otro STL
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Interactive Viewer with Caliper & X-Ray Mode */}
          <div className="lg:col-span-5 xl:col-span-6 sticky top-24">
            <Viewer3D
              geometry={geometry}
              analysis={modelAnalysis}
              materialColorHex={activeColorObj.hex}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 font-medium">
              <span>🎯 Calibre de distancia milimétrica integrado</span>
              <span className="font-mono">Volumen útil: 256×256×256 mm</span>
            </div>
          </div>

          {/* Right Column: Printing Configurator & Quotation with Gated Lead Capture */}
          <div className="lg:col-span-7 xl:col-span-6">
            {modelAnalysis ? (
              <PrintingConfigurator
                analysis={modelAnalysis}
                config={printConfig}
                price={priceBreakdown}
                registeredLead={registeredLead}
                onChangeConfig={handleChangeConfig}
                onOpenLeadCapture={() => setIsLeadCaptureOpen(true)}
                onDownloadPDF={handleDownloadPDF}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onAskBot={handleAskBot}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center text-slate-500">
                <p>Cargando análisis de geometría...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. "¿Qué podemos fabricar?" Section */}
      <ManufacturingCapabilities onScrollToDropzone={scrollToDropzone} />

      {/* 5. "Resultados de Impresión 3D" Gallery Section */}
      <GallerySection />

      {/* 6. "Cómo Funciona" Section */}
      <HowItWorks />

      {/* 7. Technical Materials Guide */}
      <MaterialsGuide
        onSelectMaterial={handleSelectMaterialFromGuide}
        onAskBot={handleAskBot}
      />

      {/* 8. FAQ Section */}
      <FAQSection />

      {/* 9. Footer */}
      <Footer />

      {/* 10. Floating Technical Commercial Assistant (ProyetBot) */}
      <ProyetBotChat
        modelAnalysis={modelAnalysis}
        currentConfig={printConfig}
        isOpen={isBotOpen}
        onToggle={() => setIsBotOpen(!isBotOpen)}
        externalPrompt={botPrompt}
        onClearExternalPrompt={() => setBotPrompt(null)}
      />

      {/* 11. Lead Capture Gating Modal */}
      {modelAnalysis && (
        <LeadCaptureModal
          isOpen={isLeadCaptureOpen}
          onClose={() => setIsLeadCaptureOpen(false)}
          analysis={modelAnalysis}
          config={printConfig}
          price={priceBreakdown}
          onLeadSuccess={handleLeadSuccess}
          fileBuffer={rawFileBuffer}
        />
      )}

      {/* 12. Online Payment Gateway Modal (Stripe / Bizum) */}
      {registeredLead && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          reference={registeredLead.reference}
          price={priceBreakdown}
          customer={registeredLead.customer}
          onPaymentSuccess={() => {}}
        />
      )}

      {/* 13. Admin Management Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        pricingSettings={pricingSettings}
        onUpdatePricing={(newSettings) => setPricingSettings(newSettings)}
      />
    </div>
  );
}
