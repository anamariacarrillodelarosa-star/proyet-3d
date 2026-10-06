export type MaterialKey = 'PLA' | 'PETG' | 'ABS' | 'ASA' | 'TPU' | 'RESINA_UV';

export type PostProcessingOption = 'none' | 'sanding' | 'painting' | 'inserts';

export interface PostProcessingItem {
  id: PostProcessingOption;
  name: string;
  costPerUnit: number; // €/ud
  description: string;
  badge?: string;
}

export interface MaterialInfo {
  key: MaterialKey;
  name: string;
  category: 'FDM' | 'SLA';
  density: number; // g/cm³
  basePricePerGram: number; // €/g
  tempResistanceMax: number; // °C
  tensileStrength: number; // MPa
  flexibility: 'Rígido' | 'Semi-rígido' | 'Flexible (95A)' | 'Muy rígido';
  uvResistance: 'Baja' | 'Media' | 'Alta' | 'Excelente';
  description: string;
  bestFor: string;
  recommendedInfill: number;
}

export interface MaterialColor {
  name: string;
  hex: string;
  previewClass?: string;
}

export interface PrintConfig {
  material: MaterialKey;
  color: string;
  layerHeight: number; // 0.12, 0.16, 0.20, 0.28
  infillPercent: number; // 10 to 100
  supports: boolean;
  quantity: number;
  shippingMethod: 'standard' | 'express';
  postProcessing: PostProcessingOption;
}

export interface PrintabilityCheck {
  title: string;
  status: 'ok' | 'warning' | 'alert';
  message: string;
}

export interface PrintabilityScore {
  score: number; // 0 - 100
  level: 'Excelente' | 'Buena' | 'Moderada' | 'Crítica';
  badge: string;
  color: string;
  checks: PrintabilityCheck[];
  recommendations: string[];
}

export interface ModelAnalysis {
  fileName: string;
  fileSize: number; // bytes
  dimensions: {
    x: number; // mm
    y: number; // mm
    z: number; // mm
  };
  volumeCm3: number;
  boundingBoxVolumeCm3: number;
  packingEfficiency: number; // % of bounding box occupied
  surfaceAreaCm2: number;
  triangleCount: number;
  weightGrams: number;
  printTimeHours: number;
  hasOverhangs: boolean;
  hasThinWalls: boolean;
  exceedsBedVolume: boolean;
  overhangRatio: number;
  printability: PrintabilityScore;
}

export interface PriceBreakdown {
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
  tax: number; // 21% IVA
  total: number;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  usageType: 'Particular' | 'Profesional';
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export type LeadStatus = 'Pendiente' | 'Contactado' | 'Aceptado' | 'Rechazado' | 'En producción' | 'Enviado';

export interface LeadRecord {
  id: string;
  reference: string;
  createdAt: string;
  customer: CustomerData;
  modelName: string;
  dimensions: { x: number; y: number; z: number };
  volumeCm3: number;
  weightGrams: number;
  printTimeHours: number;
  config: PrintConfig;
  price: PriceBreakdown;
  status: LeadStatus;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: 'stripe' | 'bizum' | 'transfer';
  adminNotes?: string;
  fileBase64?: string;
}
