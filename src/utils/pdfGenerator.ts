import { jsPDF } from 'jspdf';
import { ModelAnalysis, PrintConfig, PriceBreakdown, CustomerData } from '../types';
import { POST_PROCESSING_OPTIONS } from './materials';

export function generateQuotePDF({
  reference,
  analysis,
  config,
  price,
  customer,
}: {
  reference: string;
  analysis: ModelAnalysis;
  config: PrintConfig;
  price: PriceBreakdown;
  customer: CustomerData;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const postProc = POST_PROCESSING_OPTIONS.find((p) => p.id === config.postProcessing);
  const postProcName = postProc ? postProc.name : 'Estándar';

  const today = new Date();
  const validUntil = new Date(Date.now() + 15 * 24 * 3600 * 1000);
  const dateStr = today.toLocaleDateString('es-ES');
  const validStr = validUntil.toLocaleDateString('es-ES');

  // Primary Colors
  const darkBlue = [24, 78, 119];
  const corporateBlue = [30, 96, 145];
  const slateDark = [30, 41, 59];
  const slateGray = [100, 116, 139];
  const lightBg = [238, 246, 255];

  // 1. Header Band
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Brand text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('PROYET 3D', 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 245);
  doc.text('Diseño · Presupuestos · Impresión 3D Industrial', 15, 25);
  doc.text('Parque Tecnológico Industrial, Nave 14 · cotizaciones@proyet3d.es', 15, 30);

  // Quote Reference Badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(reference, 195, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 245);
  doc.text(`Fecha: ${dateStr}`, 195, 25, { align: 'right' });
  doc.text(`Validez: ${validStr} (15 días)`, 195, 30, { align: 'right' });

  // 2. Client & Project Info Block
  let y = 48;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(15, y, 180, 34, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text('DATOS DEL CLIENTE / SOLICITANTE', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  doc.text(`Nombre: ${customer.name}`, 20, y + 14);
  doc.text(`Email: ${customer.email}`, 20, y + 20);
  doc.text(`Teléfono: ${customer.phone}`, 20, y + 26);

  const companyText = customer.company ? `Empresa: ${customer.company} (${customer.usageType})` : `Tipo: ${customer.usageType}`;
  doc.text(companyText, 105, y + 14);
  doc.text(`Dirección: ${customer.address}`, 105, y + 20);
  doc.text(`Población: ${customer.postalCode} ${customer.city}`, 105, y + 26);

  // 3. Technical Specs Box
  y = 90;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text('ESPECIFICACIONES TÉCNICAS DE FABRICACIÓN', 15, y);

  y += 5;
  doc.setDrawColor(200, 220, 245);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, y, 180, 48, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);

  doc.text('Archivo 3D:', 20, y + 8);
  doc.text('Dimensiones (X × Y × Z):', 20, y + 15);
  doc.text('Volumen Real de Pieza:', 20, y + 22);
  doc.text('Peso Estimado:', 20, y + 29);
  doc.text('Tiempo de Máquina Est.:', 20, y + 36);
  doc.text('Imprimibilidad (Score):', 20, y + 43);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  doc.text(analysis.fileName, 70, y + 8);
  doc.text(`${analysis.dimensions.x} × ${analysis.dimensions.y} × ${analysis.dimensions.z} mm`, 70, y + 15);
  doc.text(`${analysis.volumeCm3.toFixed(1)} cm³`, 70, y + 22);
  doc.text(`${analysis.weightGrams.toFixed(1)} gramos`, 70, y + 29);
  doc.text(`${analysis.printTimeHours.toFixed(1)} horas`, 70, y + 36);
  doc.text(`${analysis.printability.score}% (${analysis.printability.level})`, 70, y + 43);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('Material Seleccionado:', 115, y + 8);
  doc.text('Color:', 115, y + 15);
  doc.text('Altura de Capa:', 115, y + 22);
  doc.text('Relleno (Infill):', 115, y + 29);
  doc.text('Soportes:', 115, y + 36);
  doc.text('Postprocesado:', 115, y + 43);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(config.material, 160, y + 8);
  doc.text(config.color, 160, y + 15);
  doc.text(`${config.layerHeight} mm`, 160, y + 22);
  doc.text(`${config.infillPercent}%`, 160, y + 29);
  doc.text(config.supports ? 'Sí (Activados)' : 'No', 160, y + 36);
  doc.text(postProcName, 160, y + 43);

  // 4. Financial Breakdown Table
  y = 148;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text('DESGLOSE ECONÓMICO', 15, y);

  y += 5;
  // Table Header
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(15, y, 180, 8, 'F');

  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Concepto', 20, y + 5.5);
  doc.text('Cant.', 120, y + 5.5, { align: 'center' });
  doc.text('P. Unitario', 150, y + 5.5, { align: 'right' });
  doc.text('Total', 190, y + 5.5, { align: 'right' });

  // Rows
  const rows = [
    {
      name: `Fabricación 3D: ${analysis.fileName} (${config.material}, ${config.color})`,
      qty: `${price.quantity}`,
      unit: `${price.subtotalPiece.toFixed(2)}€`,
      total: `${(price.subtotalPiece * price.quantity).toFixed(2)}€`,
    },
    {
      name: `Postprocesado técnico: ${postProcName}`,
      qty: `${price.quantity}`,
      unit: `${(price.postProcessingCost / Math.max(1, price.quantity)).toFixed(2)}€`,
      total: `${price.postProcessingCost.toFixed(2)}€`,
    },
    {
      name: `Envío ${config.shippingMethod === 'express' ? 'Urgente Express 24h' : 'Estándar Peninsular (48-72h)'}`,
      qty: '1',
      unit: `${price.shipping.toFixed(2)}€`,
      total: `${price.shipping.toFixed(2)}€`,
    },
  ];

  if (price.discountPercent > 0) {
    const rawSum = price.subtotalPiece * price.quantity;
    const discountAmount = rawSum - price.discountedSubtotal;
    rows.push({
      name: `Descuento por Volumen (${price.discountPercent}% DTO aplicado)`,
      qty: '1',
      unit: `-${discountAmount.toFixed(2)}€`,
      total: `-${discountAmount.toFixed(2)}€`,
    });
  }

  y += 8;
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont('helvetica', 'normal');

  rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 7, 'F');
    }
    doc.text(r.name, 20, y + 5);
    doc.text(r.qty, 120, y + 5, { align: 'center' });
    doc.text(r.unit, 150, y + 5, { align: 'right' });
    doc.text(r.total, 190, y + 5, { align: 'right' });
    y += 7;
  });

  // Totals Section
  y += 4;
  doc.setDrawColor(220, 230, 242);
  doc.line(15, y, 195, y);
  y += 6;

  doc.setFontSize(9);
  doc.text('Base Imponible:', 140, y);
  doc.text(`${(price.discountedSubtotal + price.shipping).toFixed(2)}€`, 190, y, { align: 'right' });
  y += 5;

  doc.text('IVA (21%):', 140, y);
  doc.text(`${price.tax.toFixed(2)}€`, 190, y, { align: 'right' });
  y += 6;

  // Grand Total Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(130, y, 65, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text('TOTAL PRESUPUESTO:', 134, y + 7.5);
  doc.text(`${price.total.toFixed(2)}€`, 192, y + 7.5, { align: 'right' });

  // 5. Conditions & Quality Guarantees
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('CONDICIONES Y GARANTÍA INDUSTRIAL:', 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  y += 4;
  doc.text('1. Tolerancias dimensionales conforme a norma ISO 2768 (±0.15 mm en FDM y ±0.05 mm en SLA).', 15, y);
  y += 3.5;
  doc.text('2. Plazo de fabricación habitual: 24h a 72h laborables tras confirmación y pago del pedido.', 15, y);
  y += 3.5;
  doc.text('3. Formas de pago aceptadas: Tarjeta online (Stripe), Bizum Empresa y Transferencia bancaria directa.', 15, y);
  y += 3.5;
  doc.text('4. Reclamaciones dimensionales cubiertas durante los primeros 14 días naturales tras recepción.', 15, y);

  // Footer bar
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PROYET 3D SL · CIF: B-98765432 · Parque Tecnológico Industrial Nave 14 · www.proyet3d.es', 105, 293, { align: 'center' });

  // Trigger download
  doc.save(`Presupuesto_Proyet3D_${reference}.pdf`);
}
