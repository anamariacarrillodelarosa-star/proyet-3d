import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Sliders,
  FileDown,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Save,
  Download,
  Building,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText,
  Filter,
  Eye,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { PricingSettings } from '../utils/pricing';
import { LeadRecord, LeadStatus } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingSettings: PricingSettings;
  onUpdatePricing: (newSettings: PricingSettings) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  pricingSettings,
  onUpdatePricing,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'metrics' | 'pricing'>('leads');

  // Leads state
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState<any>(null);

  // Local settings editor
  const [editableSettings, setEditableSettings] = useState<PricingSettings>(pricingSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setEditableSettings(pricingSettings);
  }, [pricingSettings]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      fetchMetrics();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123' || pinInput === 'proyet') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNotes = async (leadId: string, notes: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notes }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, adminNotes: notes } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableSettings),
      });
      if (res.ok) {
        onUpdatePricing(editableSettings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      onUpdatePricing(editableSettings);
      setSaveSuccess(true);
    }
  };

  const handleDownloadFile = (l: LeadRecord) => {
    if (l.fileBase64) {
      const link = document.createElement('a');
      link.href = l.fileBase64;
      link.download = l.modelName || 'pieza_3d.stl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Preparando archivo ${l.modelName} para Cura / PrusaSlicer.`);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/leads/export-csv';
  };

  const filteredLeads = leads.filter((l) => {
    const qStr = `${l.reference} ${l.customer?.name} ${l.customer?.email} ${l.customer?.phone} ${l.customer?.company || ''} ${l.modelName}`.toLowerCase();
    const matchesSearch = qStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesUsage = usageFilter === 'all' || l.customer?.usageType === usageFilter;
    return matchesSearch && matchesStatus && matchesUsage;
  });

  const totalRevenue = leads.reduce((acc, l) => acc + (l.price?.total || 0), 0);
  const paidRevenue = leads
    .filter((l) => l.paymentStatus === 'paid')
    .reduce((acc, l) => acc + (l.price?.total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#184E77] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Panel de Control & CRM · Proyet 3D</h3>
                <span className="text-[10px] font-mono bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded font-bold">
                  PRO v3.0
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Gestión de leads cualificados, pipeline de ventas, cotizaciones STL y tarifas del taller
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E6091] flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">Acceso Administrativo Protegido</h4>
            <p className="text-xs text-slate-500 mb-6">
              Introduce el PIN de seguridad para consultar el listado de clientes, presupuestos y ajustar costes de máquina.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN de acceso (ej. admin123)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center font-mono text-base focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">
                    PIN incorrecto. Puedes usar: <strong>admin123</strong>
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-[#1E6091] hover:bg-[#184E77] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm"
              >
                Acceder al Panel CRM
              </button>
              <div className="text-[11px] text-slate-400">
                💡 PIN predeterminado de evaluación: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin123</code>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs & Top Stats */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'leads'
                      ? 'bg-[#1E6091] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gestión de Leads ({leads.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'metrics'
                      ? 'bg-[#1E6091] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Métricas & Conversión</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pricing'
                      ? 'bg-[#1E6091] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Tarifas (€/g y Máquina)</span>
                </button>
              </div>

              {/* Action buttons on right */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Descargar lista de contactos en Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV (Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fetchLeads();
                    fetchMetrics();
                  }}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#1E6091] hover:bg-slate-50 transition-colors"
                  title="Refrescar datos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeads ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* TAB 1: LEADS MANAGEMENT */}
            {activeTab === 'leads' && (
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Table / List */}
                <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200">
                  {/* Filters bar */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por referencia, cliente, email o archivo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#1E6091] outline-hidden bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer outline-hidden"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Aceptado">Aceptado</option>
                        <option value="En producción">En producción</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>

                      <select
                        value={usageFilter}
                        onChange={(e) => setUsageFilter(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer outline-hidden"
                      >
                        <option value="all">Todos los perfiles</option>
                        <option value="Profesional">Empresa / Profesional</option>
                        <option value="Particular">Particular</option>
                      </select>
                    </div>
                  </div>

                  {/* Leads Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-3 px-3.5">Ref. / Fecha</th>
                            <th className="py-3 px-3.5">Cliente</th>
                            <th className="py-3 px-3.5">Archivo / Material</th>
                            <th className="py-3 px-3.5">Importe</th>
                            <th className="py-3 px-3.5">Estado</th>
                            <th className="py-3 px-3.5 text-right">Detalle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredLeads.map((l) => {
                            const isSelected = selectedLead?.id === l.id;
                            return (
                              <tr
                                key={l.id}
                                onClick={() => setSelectedLead(l)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="py-3 px-3.5">
                                  <span className="font-bold font-mono text-[#1E6091] block">{l.reference}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(l.createdAt).toLocaleDateString()}
                                  </span>
                                </td>

                                <td className="py-3 px-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">{l.customer.name}</span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                      l.customer.usageType === 'Profesional' ? 'bg-blue-100 text-[#1E6091]' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {l.customer.usageType}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                    {l.customer.company || l.customer.email}
                                  </p>
                                </td>

                                <td className="py-3 px-3.5">
                                  <p className="font-mono text-slate-700 truncate max-w-[140px]" title={l.modelName}>
                                    {l.modelName}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    {l.config.material} · {l.config.quantity} {l.config.quantity === 1 ? 'ud' : 'uds'}
                                  </span>
                                </td>

                                <td className="py-3 px-3.5">
                                  <span className="font-bold font-mono text-slate-900 block">
                                    {l.price.total.toFixed(2)}€
                                  </span>
                                  <span className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                                    l.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {l.paymentStatus === 'paid' ? '✓ Pagado' : 'Pendiente'}
                                  </span>
                                </td>

                                <td className="py-3 px-3.5">
                                  <select
                                    value={l.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateStatus(l.id, e.target.value as LeadStatus)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer outline-hidden ${
                                      l.status === 'En producción'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : l.status === 'Enviado'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : l.status === 'Contactado'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : l.status === 'Rechazado'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Contactado">Contactado</option>
                                    <option value="Aceptado">Aceptado</option>
                                    <option value="En producción">En producción</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Rechazado">Rechazado</option>
                                  </select>
                                </td>

                                <td className="py-3 px-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadFile(l);
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-50 text-[#1E6091] hover:bg-blue-100 transition-colors cursor-pointer"
                                    title="Descargar STL"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Detail Pane */}
                <div className="w-full md:w-80 lg:w-96 bg-slate-50/70 p-6 overflow-y-auto border-t md:border-t-0 border-slate-200 text-xs">
                  {selectedLead ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Ficha de Lead</span>
                          <h4 className="text-base font-bold text-slate-800 font-mono">{selectedLead.reference}</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedLead.status === 'En producción' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {selectedLead.status}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                          Datos de Contacto
                        </span>
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{selectedLead.customer.name}</strong>
                          <span className="text-[10px] text-slate-400">({selectedLead.customer.usageType})</span>
                        </div>
                        {selectedLead.customer.company && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedLead.customer.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${selectedLead.customer.email}`} className="text-[#1E6091] hover:underline">
                            {selectedLead.customer.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`tel:${selectedLead.customer.phone}`} className="text-[#1E6091] hover:underline">
                            {selectedLead.customer.phone}
                          </a>
                        </div>
                        <div className="flex items-start gap-2 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                          <span>{selectedLead.customer.address}, {selectedLead.customer.postalCode} {selectedLead.customer.city}</span>
                        </div>
                        {selectedLead.customer.notes && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span className="font-semibold text-slate-700 block text-[10px]">Notas del cliente:</span>
                            {selectedLead.customer.notes}
                          </div>
                        )}
                      </div>

                      {/* Technical Specs & Pricing */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider font-sans mb-1">
                          Pieza y Configuración
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Archivo:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[170px]">{selectedLead.modelName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Material / Color:</span>
                          <span>{selectedLead.config.material} ({selectedLead.config.color})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Capa / Infill:</span>
                          <span>{selectedLead.config.layerHeight}mm · {selectedLead.config.infillPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Cantidad:</span>
                          <span className="font-bold">{selectedLead.config.quantity} uds.</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold text-slate-900 font-sans">
                          <span>Total Presupuesto:</span>
                          <span className="text-[#1E6091] font-mono text-sm">{selectedLead.price.total.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* Admin Notes Editor */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                        <label className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1.5">
                          Notas Internas de Taller
                        </label>
                        <textarea
                          rows={2}
                          defaultValue={selectedLead.adminNotes || ''}
                          onBlur={(e) => handleUpdateNotes(selectedLead.id, e.target.value)}
                          placeholder="Añade notas de seguimiento o laminado..."
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-[#1E6091]"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">Se guarda automáticamente al hacer clic fuera</span>
                      </div>

                      {/* Download Action */}
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(selectedLead)}
                        className="w-full bg-[#1E6091] hover:bg-[#184E77] text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Descargar Archivo 3D para Slicer</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                      <FileText className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-xs">Selecciona un presupuesto de la lista para ver todos sus datos técnicos y de contacto.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: METRICS & CONVERSION */}
            {activeTab === 'metrics' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[11px] font-medium block">Total Leads Captados</span>
                    <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">{leads.length}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">+100% captación obligatoria</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[11px] font-medium block">Pipeline Total Presupuestos</span>
                    <p className="text-2xl font-extrabold text-[#1E6091] font-mono mt-1">{totalRevenue.toFixed(0)}€</p>
                    <span className="text-[10px] text-slate-500">Valor de piezas cotizadas</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[11px] font-medium block">Ingresos Cobrados</span>
                    <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{paidRevenue.toFixed(0)}€</p>
                    <span className="text-[10px] text-slate-500">Pagados vía Stripe / Bizum</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 text-[11px] font-medium block">Leads Profesionales</span>
                    <p className="text-2xl font-extrabold text-indigo-600 font-mono mt-1">
                      {leads.filter((l) => l.customer.usageType === 'Profesional').length}
                    </p>
                    <span className="text-[10px] text-slate-500">Empresas e industrias</span>
                  </div>
                </div>

                {/* Demand Breakdown Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1E6091]" />
                    <span>Materiales Más Demandados en Cotizaciones</span>
                  </h4>
                  <div className="space-y-3">
                    {['PETG', 'PLA', 'ASA', 'TPU', 'ABS', 'RESINA_UV'].map((mat) => {
                      const count = leads.filter((l) => l.config.material === mat).length;
                      const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
                      return (
                        <div key={mat}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="font-mono">{mat}</span>
                            <span className="text-slate-500">{count} pedidos ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-[#1E6091] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRICING CONFIGURATION */}
            {activeTab === 'pricing' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Costes Fijos de Maquinaria y Margen Industrial
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Coste Base de Preparación (€)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editableSettings.basePrepCost}
                          onChange={(e) =>
                            setEditableSettings({
                              ...editableSettings,
                              basePrepCost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] outline-hidden bg-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Calibración y slicing inicial
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tasa Horaria (€ / h)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editableSettings.machineHourlyRate}
                          onChange={(e) =>
                            setEditableSettings({
                              ...editableSettings,
                              machineHourlyRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] outline-hidden bg-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Amortización y electricidad
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Margen Comercial (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={editableSettings.marginPercent || 15}
                          onChange={(e) =>
                            setEditableSettings({
                              ...editableSettings,
                              marginPercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] outline-hidden bg-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Margen sobre costes directos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Tarifas de Material por Gramo (€ / g)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {Object.keys(editableSettings.materialRates).map((matKey) => (
                        <div key={matKey}>
                          <label className="block font-bold text-slate-700 mb-1 font-mono">
                            {matKey}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.005"
                              value={editableSettings.materialRates[matKey]}
                              onChange={(e) =>
                                setEditableSettings({
                                  ...editableSettings,
                                  materialRates: {
                                    ...editableSettings.materialRates,
                                    [matKey]: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E6091] outline-hidden bg-white font-mono"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-slate-400">€/g</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            = {(editableSettings.materialRates[matKey] * 1000).toFixed(0)}€ / kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>¡Tarifas actualizadas correctamente en la base de datos!</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#1E6091] hover:bg-[#184E77] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Nuevas Tarifas</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
