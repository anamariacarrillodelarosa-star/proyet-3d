import { MaterialKey, PrintConfig, PriceBreakdown, ModelAnalysis, PostProcessingOption } from '../types';
import { MATERIALS_DATA, POST_PROCESSING_OPTIONS } from './materials';

export interface PricingSettings {
  basePrepCost: number; // Coste fijo calibración / laminado
  machineHourlyRate: number; // Coste horario de máquina
  materialRates: Record<string, number>; // € por gramo
  marginPercent: number; // Margen industrial (ej. 20%)
  shippingStandard: number;
  shippingExpress: number;
  taxRate: number; // 0.21 para IVA 21%
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  basePrepCost: 4.5,
  machineHourlyRate: 2.8,
  materialRates: {
    PLA: 0.045,
    PETG: 0.055,
    ABS: 0.052,
    ASA: 0.065,
    TPU: 0.075,
    RESINA_UV: 0.095,
  },
  marginPercent: 15,
  shippingStandard: 4.9,
  shippingExpress: 8.9,
  taxRate: 0.21,
};

/**
 * Calculates real-time quotation price based on model geometry and printing parameters.
 * Formula:
 * Price = PrepCost + (Volume * Density * InfillEff * MaterialRate) + (EstHours * MachineRate) + Margin + PostProcessing + Shipping
 */
export function calculateQuotePrice(
  analysis: ModelAnalysis,
  config: PrintConfig,
  customSettings?: PricingSettings
): PriceBreakdown {
  const settings = customSettings || DEFAULT_PRICING_SETTINGS;
  const material = MATERIALS_DATA[config.material] || MATERIALS_DATA.PLA;

  // 1. Material rate per gram
  const ratePerGram = settings.materialRates[config.material] ?? material.basePricePerGram;

  // Effective infill calculation (perimeter walls are 100% dense + internal infill)
  const infillFraction = config.infillPercent / 100;
  const effectiveInfill = 0.25 + 0.75 * infillFraction;

  // Model Weight (grams)
  const supportWeightMultiplier = config.supports ? 1.12 : 1.0;
  const weightGrams = Math.max(1, analysis.volumeCm3 * material.density * effectiveInfill * supportWeightMultiplier);

  // 2. Material Cost (€)
  const materialCost = weightGrams * ratePerGram;

  // 3. Estimated Machine Time (hours)
  const layerHeightRatio = 0.20 / Math.max(0.1, config.layerHeight);
  const supportTimeMultiplier = config.supports ? 1.25 : 1.0;
  
  const depositionTime = (analysis.volumeCm3 * effectiveInfill * 0.055) * layerHeightRatio;
  const surfaceTravelTime = (analysis.surfaceAreaCm2 * 0.0012) * layerHeightRatio;
  
  let printTimeHours = 0;
  if (material.category === 'SLA') {
    printTimeHours = Math.max(0.5, (analysis.dimensions.z / 18.0) * (0.05 / config.layerHeight));
  } else {
    printTimeHours = Math.max(0.4, (depositionTime + surfaceTravelTime) * supportTimeMultiplier);
  }

  // 4. Machine Running Cost (€)
  const machineCost = printTimeHours * settings.machineHourlyRate;

  // 5. Preparation & Slicing Fee (€)
  const prepCost = settings.basePrepCost;

  // 6. Post-processing cost per unit (€)
  const postProcItem = POST_PROCESSING_OPTIONS.find((p) => p.id === config.postProcessing);
  const postProcessingUnitCost = postProcItem ? postProcItem.costPerUnit : 0;
  const postProcessingCost = postProcessingUnitCost * config.quantity;

  // 7. Industrial Margin (€)
  const directCostPiece = prepCost + materialCost + machineCost;
  const marginPercent = settings.marginPercent || 15;
  const marginCost = directCostPiece * (marginPercent / 100);

  // 8. Base Piece Subtotal
  const subtotalPiece = Number((directCostPiece + marginCost + postProcessingUnitCost).toFixed(2));

  // 9. Bulk Volume Discounts (Escalado de precios por cantidad)
  // - 5 a 10 unidades: 5% DTO
  // - 11 a 50 unidades: 15% DTO
  // - Más de 50 unidades: 25% DTO
  let discountPercent = 0;
  if (config.quantity > 50) {
    discountPercent = 25; // 25% OFF
  } else if (config.quantity >= 11) {
    discountPercent = 15; // 15% OFF
  } else if (config.quantity >= 5) {
    discountPercent = 5; // 5% OFF
  }

  const rawSubtotal = subtotalPiece * config.quantity;
  const discountedSubtotal = Number((rawSubtotal * (1 - discountPercent / 100)).toFixed(2));

  // 10. Shipping
  const shipping = config.shippingMethod === 'express' ? settings.shippingExpress : settings.shippingStandard;

  // 11. Taxes (IVA 21%)
  const tax = Number(((discountedSubtotal + shipping) * settings.taxRate).toFixed(2));

  // 12. Grand Total
  const total = Number((discountedSubtotal + shipping + tax).toFixed(2));

  return {
    prepCost: Number(prepCost.toFixed(2)),
    materialCost: Number(materialCost.toFixed(2)),
    machineCost: Number(machineCost.toFixed(2)),
    postProcessingCost: Number(postProcessingCost.toFixed(2)),
    marginCost: Number(marginCost.toFixed(2)),
    subtotalPiece,
    quantity: config.quantity,
    discountPercent,
    discountedSubtotal,
    shipping,
    tax,
    total,
  };
}
