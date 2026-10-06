import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder exists for persistence
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Interface for Admin Settings
interface AdminSettings {
  basePrepCost: number; // Coste base preparación (€)
  machineHourlyRate: number; // Tasa horaria de máquina (€/h)
  materialRates: {
    [key: string]: number; // € por gramo
  };
  marginPercent: number; // Margen comercial industrial (%)
  shippingStandard: number; // Envío estándar (€)
  shippingExpress: number; // Envío urgente (€)
  taxRate: number; // IVA (0.21 = 21%)
}

const defaultAdminSettings: AdminSettings = {
  basePrepCost: 4.5,
  machineHourlyRate: 2.8,
  materialRates: {
    PLA: 0.045, // 45€/kg
    PETG: 0.055, // 55€/kg
    ABS: 0.052, // 52€/kg
    ASA: 0.065, // 65€/kg
    TPU: 0.075, // 75€/kg
    RESINA_UV: 0.095, // 95€/kg
  },
  marginPercent: 15,
  shippingStandard: 4.9,
  shippingExpress: 8.9,
  taxRate: 0.21,
};

function loadSettings(): AdminSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultAdminSettings, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Error loading settings, using defaults:', err);
  }
  return { ...defaultAdminSettings };
}

function saveSettings(settings: AdminSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings to file:', err);
  }
}

let adminSettings: AdminSettings = loadSettings();

export interface LeadRecord {
  id: string;
  reference: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    usageType: 'Particular' | 'Profesional';
    company?: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  modelName: string;
  dimensions: { x: number; y: number; z: number };
  volumeCm3: number;
  weightGrams: number;
  printTimeHours: number;
  config: {
    material: string;
    color: string;
    layerHeight: number;
    infillPercent: number;
    supports: boolean;
    quantity: number;
    shippingMethod: 'standard' | 'express';
    postProcessing: string;
  };
  price: {
    prepCost: number;
    materialCost: number;
    machineCost: number;
    postProcessingCost: number;
    marginCost: number;
    subtotalPiece: number;
    quantity: number;
    discountPercent: number;
    discountedSubtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  status: 'Pendiente' | 'Contactado' | 'Aceptado' | 'Rechazado' | 'En producción' | 'Enviado';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: string;
  adminNotes?: string;
  fileBase64?: string;
}

const initialLeads: LeadRecord[] = [
  {
    id: 'lead-101',
    reference: 'P3D-94812',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    customer: {
      name: 'Carlos Mendoza',
      email: 'carlos.m@ingeniar.es',
      phone: '+34 612 345 678',
      usageType: 'Profesional',
      company: 'Ingeniería Robótica Levante SL',
      address: 'Calle Industria 45, Polígono Vara de Quart',
      city: 'Valencia',
      postalCode: '46014',
      notes: 'Pieza para maquinaria de embalaje. Requiere alta resistencia química a desinfectantes.',
    },
    modelName: 'engranaje_planetario_v2.stl',
    dimensions: { x: 74.2, y: 74.2, z: 22.0 },
    volumeCm3: 38.6,
    weightGrams: 39.2,
    printTimeHours: 3.4,
    config: {
      material: 'PETG',
      color: 'Gris Industrial',
      layerHeight: 0.2,
      infillPercent: 40,
      supports: true,
      quantity: 12,
      shippingMethod: 'express',
      postProcessing: 'sanding',
    },
    price: {
      prepCost: 4.5,
      materialCost: 25.8,
      machineCost: 28.5,
      postProcessingCost: 42.0,
      marginCost: 15.2,
      subtotalPiece: 24.5,
      quantity: 12,
      discountPercent: 15,
      discountedSubtotal: 249.9,
      shipping: 8.9,
      tax: 54.35,
      total: 313.15,
    },
    status: 'En producción',
    paymentStatus: 'paid',
    paymentMethod: 'stripe',
    adminNotes: 'Cliente recurrente. Laminado con 4 perímetros en Bambu X1-Carbon.',
  },
  {
    id: 'lead-102',
    reference: 'P3D-88219',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    customer: {
      name: 'Elena Ramos',
      email: 'e.ramos@estudioarquitectura.com',
      phone: '+34 689 912 304',
      usageType: 'Profesional',
      company: 'Estudio de Arquitectura R&M',
      address: 'Avenida Diagonal 210, Planta 4',
      city: 'Barcelona',
      postalCode: '08018',
      notes: 'Maqueta volumétrica para entrega de concurso público.',
    },
    modelName: 'pabellon_vanguardista.stl',
    dimensions: { x: 120.5, y: 95.0, z: 54.3 },
    volumeCm3: 65.2,
    weightGrams: 56.7,
    printTimeHours: 5.8,
    config: {
      material: 'PLA',
      color: 'Blanco Puro',
      layerHeight: 0.16,
      infillPercent: 20,
      supports: false,
      quantity: 2,
      shippingMethod: 'standard',
      postProcessing: 'none',
    },
    price: {
      prepCost: 4.5,
      materialCost: 5.1,
      machineCost: 32.48,
      postProcessingCost: 0,
      marginCost: 6.3,
      subtotalPiece: 24.19,
      quantity: 2,
      discountPercent: 0,
      discountedSubtotal: 48.38,
      shipping: 4.9,
      tax: 11.19,
      total: 64.47,
    },
    status: 'Contactado',
    paymentStatus: 'unpaid',
    adminNotes: 'Llamada telefónica realizada. Solicitan muestra de color blanco mate.',
  },
  {
    id: 'lead-103',
    reference: 'P3D-75104',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      name: 'Marcos Vilas',
      email: 'marcos.vilas@gmail.com',
      phone: '+34 655 432 198',
      usageType: 'Particular',
      address: 'Calle Mayor 12, 3º B',
      city: 'Madrid',
      postalCode: '28013',
      notes: 'Recambio para soporte de retrovisor exterior de moto clásica.',
    },
    modelName: 'soporte_retrovisor_bmw.stl',
    dimensions: { x: 55.0, y: 42.0, z: 38.0 },
    volumeCm3: 24.1,
    weightGrams: 26.5,
    printTimeHours: 2.5,
    config: {
      material: 'ASA',
      color: 'Negro Mate',
      layerHeight: 0.2,
      infillPercent: 60,
      supports: true,
      quantity: 1,
      shippingMethod: 'standard',
      postProcessing: 'none',
    },
    price: {
      prepCost: 4.5,
      materialCost: 1.72,
      machineCost: 7.0,
      postProcessingCost: 0,
      marginCost: 1.98,
      subtotalPiece: 15.2,
      quantity: 1,
      discountPercent: 0,
      discountedSubtotal: 15.2,
      shipping: 4.9,
      tax: 4.22,
      total: 24.32,
    },
    status: 'Pendiente',
    paymentStatus: 'unpaid',
    adminNotes: 'Nuevo lead. Requiere verificación de orientación Z.',
  },
];

function loadLeads(): LeadRecord[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading leads file:', err);
  }
  return initialLeads;
}

function saveLeads(leads: LeadRecord[]) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving leads to file:', err);
  }
}

let leadsDatabase: LeadRecord[] = loadLeads();

// In-memory binary file store for admin downloads
const uploadedFiles: Map<string, { name: string; buffer: string; mime: string }> = new Map();

// Helper to initialize Gemini
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// 1. CHATBOT API (ProyetBot - Gemini 3.8 Flash)
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { message, modelContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const systemInstruction = `Eres "ProyetBot", el ingeniero técnico senior y asesor comercial de fabricación aditiva de PROYET 3D (Diseño, Presupuestos e Impresión 3D).
Tu función es asesorar de forma profesional, precisa, técnica y cercana a clientes, ingenieros y creadores.

Dominio técnico clave:
1. MATERIALES:
   - PLA: Prototipado conceptual, figuras y maquetas. Deforma a >55°C.
   - PETG: Excelente resistencia mecánica, química y a la humedad. Apto para contacto alimentario y exteriores moderados.
   - ABS: Resistencia térmica hasta 95°C y gran tenacidad mecánica.
   - ASA: El rey del exterior y sol directo UV continuo sin degradación ni pérdida de color. Aguanta lluvia, frío y calor.
   - TPU (95A): Flexible tipo caucho/goma, absorbe impactos y vibraciones continuas. Ideal para juntas de estanqueidad IP67.
   - RESINA UV (SLA): Máxima resolución microscópica (hasta 0.025mm), acabado liso sin líneas visibles.

2. CÁLCULO DE RELLENO (INFILL) Y POSTPROCESADO:
   - 15%: Visual/decorativo.
   - 30-40%: Funcional general.
   - 55-80%: Piezas mecánicas bajo esfuerzo o engranajes.
   - 100%: Macizo para roscas y compresión pesada.
   - Postprocesado: Ofrecemos pulido fino, pintura profesional lacada e inserción térmica de roscas metálicas de latón (Heat-Set inserts).

3. PROCESO DE COTIZACIÓN Y LEADS:
   - Explica con amabilidad que para ver el desglose económico oficial, descargar el PDF formal o tramitar el pedido solo deben completar el breve formulario de contacto con sus datos de envío.
   - Envíos a toda España peninsular y Portugal en 24h a 72h.

Si se proporciona contexto del modelo 3D activo (dimensiones, volumen o material), haz referencia directa a esas medidas con recomendaciones técnicas específicas.
Responde en español con formato Markdown limpio (negritas, viñetas cortas).`;

  let prompt = message;
  if (modelContext) {
    prompt = `[CONTEXTO DE LA PIEZA ACTUAL DEL CLIENTE]
- Archivo: ${modelContext.name || 'Sin nombre'}
- Dimensiones: ${modelContext.dimensions ? `${modelContext.dimensions.x} x ${modelContext.dimensions.y} x ${modelContext.dimensions.z} mm` : 'No calculadas'}
- Volumen estimado: ${modelContext.volumeCm3 ? `${modelContext.volumeCm3.toFixed(1)} cm³` : 'N/A'}
- Peso estimado: ${modelContext.weightGrams ? `${modelContext.weightGrams.toFixed(1)} g` : 'N/A'}
- Material seleccionado en configurador: ${modelContext.material || 'PLA'}
- Relleno actual: ${modelContext.infill ? `${modelContext.infill}%` : 'N/A'}
- Requiere soportes: ${modelContext.hasOverhangs ? 'SÍ' : 'NO'}

[CONSULTA DEL CLIENTE]:
${message}`;
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'Disculpa, no he podido generar una respuesta en este momento.';
      return res.json({ reply });
    }
  } catch (error: any) {
    console.warn('Fallo llamada Gemini, usando respuesta experta de contingencia:', error?.message);
  }

  // Fallback técnico de alta calidad
  let fallbackReply = '';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('sol') || lowerMsg.includes('exterior') || lowerMsg.includes('intemperie') || lowerMsg.includes('uv')) {
    fallbackReply = `☀️ **Para uso en exteriores y sol directo**, en **Proyet 3D** te recomendamos categóricamente **ASA** o **PETG**:

1. **ASA (Recomendación principal):** Formulado con acrilato para resistir radiación UV sin amarillear ni fragilizarse. Soporta hasta 95°C.
2. **PETG (Alternativa económica):** Alta resistencia química e intemperie moderada hasta 70°C.
❌ *Evita el PLA:* Bajo el sol y calor estival se deforma rápidamente.`;
  } else if (lowerMsg.includes('flex') || lowerMsg.includes('goma') || lowerMsg.includes('amortigua') || lowerMsg.includes('junta')) {
    fallbackReply = `⚡ **Para piezas flexibles o elásticas**, tu mejor opción es **TPU 95A**:

- Dureza Shore 95A (similar al caucho de neumático o rueda de skate).
- Prácticamente indestructible a impactos y rozamiento continuo.
- Ideal para juntas estancas, fundas antigolpes y amortiguadores de vibración.`;
  } else if (lowerMsg.includes('pdf') || lowerMsg.includes('presupuesto') || lowerMsg.includes('desglose') || lowerMsg.includes('formal')) {
    fallbackReply = `📄 **Cómo obtener tu presupuesto formal en PDF:**

1. Sube tu archivo 3D (.STL, .OBJ o .3MF).
2. Elige el material, color, infill y acabado deseado.
3. Haz clic en **"Desbloquear Presupuesto Completo"** y completa tus datos de envío.
4. Obtendrás un código de referencia oficial (ej. *P3D-94812*) y podrás descargar al instante el PDF formal con 15 días de validez e IVA desglosado.`;
  } else {
    fallbackReply = `Hola, soy **ProyetBot**, especialista técnico de **PROYET 3D**. 

Puedo ayudarte con:
- **Selección de material:** ¿Tu pieza resistirá calor, esfuerzo mecánico, sol exterior o química?
- **Optimización de diseño:** Espesores de pared mínimos (≥1.2 mm), orientación para evitar soportes y tolerancias de montaje (±0.15 mm).
- **Ajuste de presupuesto:** Cómo optimizar el relleno (*infill*) y el volumen para reducir tiempo y costes.

¿Qué uso final va a tener tu pieza o qué duda tienes sobre tu archivo?`;
  }

  return res.json({ reply: fallbackReply });
});

// ==========================================
// 2. LEADS & QUOTES CRM API
// ==========================================

// Get all leads with optional filtering
app.get('/api/leads', (req, res) => {
  const { status, search, usageType } = req.query;
  let results = [...leadsDatabase];

  if (status && status !== 'all') {
    results = results.filter((l) => l.status === status);
  }

  if (usageType && usageType !== 'all') {
    results = results.filter((l) => l.customer.usageType === usageType);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter((l) => {
      const matchText = `${l.reference} ${l.customer.name} ${l.customer.email} ${l.customer.phone} ${l.customer.company || ''} ${l.modelName}`.toLowerCase();
      return matchText.includes(q);
    });
  }

  res.json(results);
});

// Alias for backwards compatibility
app.get('/api/quotes', (req, res) => {
  res.json(leadsDatabase);
});

// Create new lead / quote
app.post('/api/leads', (req, res) => {
  const leadData = req.body;
  if (!leadData || !leadData.customer || !leadData.price) {
    return res.status(400).json({ error: 'Datos de cliente y presupuesto incompletos' });
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const reference = `P3D-${randomNum}`;
  const id = `lead-${Date.now()}`;

  const newLead: LeadRecord = {
    ...leadData,
    id,
    reference,
    createdAt: new Date().toISOString(),
    status: 'Pendiente',
    paymentStatus: 'unpaid',
  };

  leadsDatabase.unshift(newLead);
  saveLeads(leadsDatabase);

  // Simulate automated email notification to admin
  console.log(`[NOTIFICACIÓN EMAIL ADMIN] Nuevo lead entrante: Ref ${reference} de ${newLead.customer.name} (${newLead.customer.usageType}). Total: ${newLead.price.total}€`);

  res.status(201).json({
    success: true,
    reference,
    lead: newLead,
  });
});

app.post('/api/quotes', (req, res) => {
  // redirect logic
  const leadData = req.body;
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const reference = `P3D-${randomNum}`;
  const id = `lead-${Date.now()}`;

  const newLead: LeadRecord = {
    ...leadData,
    id,
    reference,
    createdAt: new Date().toISOString(),
    status: 'Pendiente',
    paymentStatus: 'unpaid',
  };

  leadsDatabase.unshift(newLead);
  saveLeads(leadsDatabase);

  res.status(201).json({
    success: true,
    reference,
    quote: newLead,
  });
});

// Update lead status or admin notes
app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const lead = leadsDatabase.find((l) => l.id === id || l.reference === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }

  if (status) lead.status = status;
  if (adminNotes !== undefined) lead.adminNotes = adminNotes;

  saveLeads(leadsDatabase);
  res.json({ success: true, lead });
});

app.patch('/api/quotes/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const lead = leadsDatabase.find((l) => l.id === id || l.reference === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }

  lead.status = status;
  saveLeads(leadsDatabase);
  res.json({ success: true, quote: lead });
});

// Pay lead / quote online (Stripe / Bizum)
app.post('/api/leads/:id/pay', (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  const lead = leadsDatabase.find((l) => l.id === id || l.reference === id);
  if (!lead) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }

  lead.paymentStatus = 'paid';
  lead.paymentMethod = paymentMethod || 'stripe';
  lead.status = 'En producción';

  saveLeads(leadsDatabase);
  console.log(`[NOTIFICACIÓN PAGO] Presupuesto ${lead.reference} pagado mediante ${lead.paymentMethod}. Pasa a 'En producción'.`);

  res.json({ success: true, lead });
});

// Export Leads to CSV for Excel / Email Marketing
app.get('/api/leads/export-csv', (_req, res) => {
  // UTF-8 BOM to ensure Excel opens Spanish accents (ñ, á, é, í, ó, ú, €) cleanly
  const BOM = '\uFEFF';
  const headers = [
    'Referencia',
    'Fecha',
    'Nombre',
    'Email',
    'Telefono',
    'Tipo_Uso',
    'Empresa',
    'Ciudad',
    'Direccion',
    'Archivo_3D',
    'Material',
    'Infill',
    'Cantidad',
    'Postprocesado',
    'Total_EUR',
    'Estado',
    'Estado_Pago',
    'Metodo_Pago',
    'Observaciones',
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = leadsDatabase.map((l) => [
    escapeCSV(l.reference),
    escapeCSV(new Date(l.createdAt).toLocaleDateString('es-ES')),
    escapeCSV(l.customer.name),
    escapeCSV(l.customer.email),
    escapeCSV(l.customer.phone),
    escapeCSV(l.customer.usageType),
    escapeCSV(l.customer.company || ''),
    escapeCSV(l.customer.city),
    escapeCSV(l.customer.address),
    escapeCSV(l.modelName),
    escapeCSV(l.config.material),
    escapeCSV(`${l.config.infillPercent}%`),
    escapeCSV(l.config.quantity),
    escapeCSV(l.config.postProcessing || 'Estándar'),
    escapeCSV(l.price.total.toFixed(2)),
    escapeCSV(l.status),
    escapeCSV(l.paymentStatus),
    escapeCSV(l.paymentMethod || 'Pendiente'),
    escapeCSV(l.customer.notes || ''),
  ]);

  const csvContent = BOM + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="proyet3d_leads_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Admin Metrics API
app.get('/api/admin/metrics', (_req, res) => {
  const total = leadsDatabase.length;
  const totalPipeline = leadsDatabase.reduce((acc, l) => acc + (l.price?.total || 0), 0);
  const paidCount = leadsDatabase.filter((l) => l.paymentStatus === 'paid').length;
  const inProductionCount = leadsDatabase.filter((l) => l.status === 'En producción').length;

  const materialCounts: Record<string, number> = {};
  leadsDatabase.forEach((l) => {
    const m = l.config?.material || 'PLA';
    materialCounts[m] = (materialCounts[m] || 0) + 1;
  });

  const professionalCount = leadsDatabase.filter((l) => l.customer?.usageType === 'Profesional').length;
  const particularCount = total - professionalCount;

  res.json({
    totalLeads: total,
    totalPipeline: Number(totalPipeline.toFixed(2)),
    paidCount,
    inProductionCount,
    materialCounts,
    usageCounts: {
      profesional: professionalCount,
      particular: particularCount,
    },
  });
});

// ==========================================
// 3. ADMIN SETTINGS API
// ==========================================
app.get('/api/admin/settings', (_req, res) => {
  res.json(adminSettings);
});

app.post('/api/admin/settings', (req, res) => {
  const updated = req.body;
  if (updated && typeof updated === 'object') {
    adminSettings = {
      ...adminSettings,
      ...updated,
    };
    saveSettings(adminSettings);
    return res.json({ success: true, settings: adminSettings });
  }
  res.status(400).json({ error: 'Configuración inválida' });
});

// ==========================================
// 4. MODEL UPLOAD & DOWNLOAD FOR SLICER
// ==========================================
app.post('/api/upload-model', (req, res) => {
  const { fileName, fileData, mimeType } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Archivo no proporcionado' });
  }

  const fileId = `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  uploadedFiles.set(fileId, {
    name: fileName,
    buffer: fileData,
    mime: mimeType || 'application/octet-stream',
  });

  res.json({ success: true, fileId, fileName });
});

app.get('/api/download-model/:fileId', (req, res) => {
  const { fileId } = req.params;
  const file = uploadedFiles.get(fileId);

  if (!file) {
    return res.status(404).send('Archivo no encontrado');
  }

  const buffer = Buffer.from(file.buffer.split(',')[1] || file.buffer, 'base64');
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.setHeader('Content-Type', file.mime);
  res.send(buffer);
});

// Vite Middleware for Development / Static serve for Production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PROYET 3D Server running at http://localhost:${PORT}`);
  });
}

startServer();
