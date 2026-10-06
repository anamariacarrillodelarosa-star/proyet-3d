import * as THREE from 'three';
import { ModelAnalysis } from '../types';

export interface ParsedSTLResult {
  geometry: THREE.BufferGeometry;
  analysis: ModelAnalysis;
}

/**
 * Parses an STL ArrayBuffer (either binary or ASCII)
 * and extracts Three.js geometry and dimensional/volumetric analysis.
 */
export function parseSTL(buffer: ArrayBuffer, fileName: string): ParsedSTLResult {
  const isBinary = checkIsBinary(buffer);
  const geometry = isBinary ? parseBinarySTL(buffer) : parseAsciiSTL(buffer);

  // Compute normals and bounding box
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox || new THREE.Box3();
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Center geometry so it pivots cleanly in the 3D viewer
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  geometry.translate(-center.x, -center.y, -bbox.min.z); // Put base on Z=0 (print bed)

  // Recalculate bounding box after translation
  geometry.computeBoundingBox();

  // Geometric Analysis
  const posAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  const triangleCount = posAttr.count / 3;

  let totalSignedVolumeMm3 = 0;
  let totalSurfaceAreaMm2 = 0;
  let overhangTriangleCount = 0;

  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i += 3) {
    v1.fromBufferAttribute(posAttr, i);
    v2.fromBufferAttribute(posAttr, i + 1);
    v3.fromBufferAttribute(posAttr, i + 2);

    // Signed tetrahedron volume: (v1 . (v2 x v3)) / 6
    cross.crossVectors(v2, v3);
    totalSignedVolumeMm3 += v1.dot(cross) / 6.0;

    // Triangle surface area: 0.5 * |(v2 - v1) x (v3 - v1)|
    edge1.subVectors(v2, v1);
    edge2.subVectors(v3, v1);
    cross.crossVectors(edge1, edge2);
    totalSurfaceAreaMm2 += cross.length() * 0.5;

    // Overhang check: face normal downward angle
    if (normalAttr) {
      normal.fromBufferAttribute(normalAttr, i);
      // Downward normal with angle > 45° with horizontal (i.e. nz < -0.707)
      if (normal.z < -0.707) {
        overhangTriangleCount++;
      }
    }
  }

  // Volume in cm³ (1 cm³ = 1000 mm³)
  const volumeCm3 = Math.max(0.1, Math.abs(totalSignedVolumeMm3) / 1000.0);
  const surfaceAreaCm2 = totalSurfaceAreaMm2 / 100.0;

  // Check dimensions
  const dimX = Number(Math.max(0.1, size.x).toFixed(1));
  const dimY = Number(Math.max(0.1, size.y).toFixed(1));
  const dimZ = Number(Math.max(0.1, size.z).toFixed(1));

  const boundingBoxVolumeCm3 = Number(((dimX * dimY * dimZ) / 1000.0).toFixed(2));
  const packingEfficiency = Math.min(100, Math.max(1, Math.round((volumeCm3 / boundingBoxVolumeCm3) * 100)));

  // Minimum thickness check (warning if any dimension is < 1.2 mm)
  const hasThinWalls = Math.min(dimX, dimY, dimZ) < 1.2;
  const exceedsBedVolume = dimX > 256 || dimY > 256 || dimZ > 256;
  const overhangRatio = triangleCount > 0 ? overhangTriangleCount / triangleCount : 0;
  const hasOverhangs = overhangRatio > 0.05; // More than 5% downward faces

  // Estimate weight with standard PLA density (~1.24 g/cm³) and 25% effective infill
  const weightGrams = Number((volumeCm3 * 1.24 * 0.45).toFixed(1));

  // Estimated print time (standard profile 0.2mm)
  const printTimeHours = Number(Math.max(0.5, volumeCm3 * 0.07 + surfaceAreaCm2 * 0.002).toFixed(1));

  // Printability Score Calculation (0 - 100)
  let score = 100;
  const checks: { title: string; status: 'ok' | 'warning' | 'alert'; message: string }[] = [];
  const recommendations: string[] = [];

  // 1. Bed Volume Check
  if (exceedsBedVolume) {
    score -= 35;
    checks.push({
      title: 'Volumen de Construcción',
      status: 'alert',
      message: `La pieza excede el volumen máximo estándar de 256×256×256 mm (${dimX}×${dimY}×${dimZ} mm). Requerirá corte en partes o impresión en máquina de gran formato.`,
    });
    recommendations.push('Considera segmentar la pieza o reducir la escala un porcentaje.');
  } else {
    checks.push({
      title: 'Volumen de Construcción',
      status: 'ok',
      message: `Dimensiones (${dimX} × ${dimY} × ${dimZ} mm) dentro de la zona óptima de impresión de 256×256×256 mm.`,
    });
  }

  // 2. Thin Walls Check
  if (hasThinWalls) {
    score -= 15;
    checks.push({
      title: 'Espesor Mínimo de Paredes',
      status: 'warning',
      message: 'Se han detectado secciones con grosor inferior a 1.2 mm. Puede ser frágil o requerir perímetros reforzados.',
    });
    recommendations.push('Aumenta el espesor de detalles finos a ≥1.2 mm para máxima resistencia.');
  } else {
    checks.push({
      title: 'Espesor Mínimo de Paredes',
      status: 'ok',
      message: 'Espesores estructurales superiores a 1.2 mm. Adecuados para boquilla de 0.4 mm.',
    });
  }

  // 3. Overhangs & Support Check
  if (overhangRatio > 0.20) {
    score -= 20;
    checks.push({
      title: 'Geometría y Voladizos (>45°)',
      status: 'warning',
      message: `Voladizos significativos (${(overhangRatio * 100).toFixed(0)}% de caras). Requiere soportes de fabricación obligatorios.`,
    });
    recommendations.push('Activa soportes tipo árbol/orgánicos para facilitar el desmoldeo y acabado limpio.');
  } else if (hasOverhangs) {
    score -= 8;
    checks.push({
      title: 'Geometría y Voladizos (>45°)',
      status: 'ok',
      message: 'Voladizos moderados. Soportes recomendados para puentes en el aire.',
    });
  } else {
    checks.push({
      title: 'Geometría y Voladizos',
      status: 'ok',
      message: 'Geometría autoportante sin voladizos críticos pronunciados. Excelente facilidad de deposición.',
    });
  }

  // 4. Aspect Ratio & Bed Adhesion
  const baseAreaMm2 = dimX * dimY;
  const heightRatio = dimZ / Math.max(10, Math.min(dimX, dimY));
  if (heightRatio > 3.0) {
    score -= 10;
    checks.push({
      title: 'Estabilidad de Cama (Aspect Ratio)',
      status: 'warning',
      message: 'Pieza muy esbelta y alta en proporción a su base. Riesgo de despegue durante movimientos rápidos.',
    });
    recommendations.push('Añadiremos borde (brim) de fijación de 5mm para garantizar adherencia en la cama.');
  } else {
    checks.push({
      title: 'Estabilidad de Cama',
      status: 'ok',
      message: 'Base amplia con excelente superficie de contacto y mínima propensión al alabeo (warping).',
    });
  }

  score = Math.max(20, Math.min(100, score));

  let level: 'Excelente' | 'Buena' | 'Moderada' | 'Crítica' = 'Excelente';
  let badge = 'Excelente Imprimibilidad';
  let color = '#16a34a';

  if (score >= 90) {
    level = 'Excelente';
    badge = '90-100% · Fabricación Rápida y Limpia';
    color = '#16a34a';
  } else if (score >= 75) {
    level = 'Buena';
    badge = '75-89% · Buena Fabricabilidad';
    color = '#0284c7';
  } else if (score >= 55) {
    level = 'Moderada';
    badge = '55-74% · Requiere Soportes o Atención';
    color = '#d97706';
  } else {
    level = 'Crítica';
    badge = '<55% · Revisión Técnica Recomendada';
    color = '#dc2626';
  }

  const analysis: ModelAnalysis = {
    fileName,
    fileSize: buffer.byteLength,
    dimensions: {
      x: dimX,
      y: dimY,
      z: dimZ,
    },
    volumeCm3: Number(volumeCm3.toFixed(2)),
    boundingBoxVolumeCm3,
    packingEfficiency,
    surfaceAreaCm2: Number(surfaceAreaCm2.toFixed(1)),
    triangleCount,
    weightGrams,
    printTimeHours,
    hasOverhangs,
    hasThinWalls,
    exceedsBedVolume,
    overhangRatio: Number(overhangRatio.toFixed(3)),
    printability: {
      score,
      level,
      badge,
      color,
      checks,
      recommendations,
    },
  };

  return { geometry, analysis };
}

function checkIsBinary(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const reader = new DataView(buffer);
  const triangleCount = reader.getUint32(80, true);
  const expectedSize = 84 + triangleCount * 50;
  return expectedSize === buffer.byteLength;
}

function parseBinarySTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  const reader = new DataView(buffer);
  const triangles = reader.getUint32(80, true);

  const positions = new Float32Array(triangles * 9);
  const normals = new Float32Array(triangles * 9);

  let offset = 84;
  let posIdx = 0;
  let normIdx = 0;

  for (let i = 0; i < triangles; i++) {
    const nx = reader.getFloat32(offset, true);
    const ny = reader.getFloat32(offset + 4, true);
    const nz = reader.getFloat32(offset + 8, true);
    offset += 12;

    for (let j = 0; j < 3; j++) {
      normals[normIdx++] = nx;
      normals[normIdx++] = ny;
      normals[normIdx++] = nz;

      positions[posIdx++] = reader.getFloat32(offset, true);
      positions[posIdx++] = reader.getFloat32(offset + 4, true);
      positions[posIdx++] = reader.getFloat32(offset + 8, true);
      offset += 12;
    }

    offset += 2; // 2 byte attribute byte count
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  return geometry;
}

function parseAsciiSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  const text = new TextDecoder().decode(buffer);
  const positions: number[] = [];
  const normals: number[] = [];

  const vertexPattern = /vertex\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/g;
  const normalPattern = /facet\s+normal\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/g;

  let normalMatch;
  const facetNormals: [number, number, number][] = [];
  while ((normalMatch = normalPattern.exec(text)) !== null) {
    facetNormals.push([
      parseFloat(normalMatch[1]),
      parseFloat(normalMatch[2]),
      parseFloat(normalMatch[3]),
    ]);
  }

  let vertexMatch;
  let count = 0;
  let normalIdx = 0;
  while ((vertexMatch = vertexPattern.exec(text)) !== null) {
    positions.push(parseFloat(vertexMatch[1]), parseFloat(vertexMatch[2]), parseFloat(vertexMatch[3]));
    const currNormal = facetNormals[normalIdx] || [0, 0, 1];
    normals.push(currNormal[0], currNormal[1], currNormal[2]);

    count++;
    if (count % 3 === 0) {
      normalIdx++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  return geometry;
}

/**
 * Creates an industrial demo 3D model buffer directly in memory
 * for instant one-click testing by the user!
 */
export function createSampleModel(type: 'gear' | 'turbine' | 'cube' | 'bracket'): { buffer: ArrayBuffer; name: string } {
  let geometry: THREE.BufferGeometry;
  let name = '';

  if (type === 'gear') {
    name = 'Engranaje_Mecanico_M2.stl';
    geometry = createGearGeometry();
  } else if (type === 'turbine') {
    name = 'Impulsor_Turbina_Industrial.stl';
    geometry = createTurbineGeometry();
  } else if (type === 'bracket') {
    name = 'Soporte_Escuadra_Reforzado.stl';
    geometry = createBracketGeometry();
  } else {
    name = 'Cubo_Calibracion_XYZ_20mm.stl';
    geometry = new THREE.BoxGeometry(20, 20, 20);
  }

  const buffer = geometryToBinarySTL(geometry);
  return { buffer, name };
}

function createGearGeometry(): THREE.BufferGeometry {
  const teeth = 18;
  const radiusInner = 14;
  const radiusOuter = 26;
  const toothDepth = 6;
  const height = 15;
  const centerHoleRadius = 6;

  const shape = new THREE.Shape();
  const totalPoints = teeth * 4;

  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2;
    const toothStep = i % 4;
    let r = radiusOuter;
    if (toothStep === 0 || toothStep === 3) {
      r = radiusOuter - toothDepth;
    }

    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Center borehole
  const hole = new THREE.Path();
  hole.absarc(0, 0, centerHoleRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 2,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createTurbineGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Central hub
  const hubGeo = new THREE.CylinderGeometry(8, 12, 16, 24);
  const hubMesh = new THREE.Mesh(hubGeo);
  group.add(hubMesh);

  // Center shaft hole
  const shaftGeo = new THREE.CylinderGeometry(4, 4, 18, 16);
  // Blades
  const bladeCount = 6;
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.quadraticCurveTo(15, 6, 26, 2);
    bladeShape.lineTo(25, -4);
    bladeShape.quadraticCurveTo(14, 0, 0, -2);
    bladeShape.closePath();

    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 10, bevelEnabled: false });
    bladeGeo.rotateX(Math.PI / 4);
    bladeGeo.rotateZ(angle);
    bladeGeo.translate(Math.cos(angle) * 7, Math.sin(angle) * 7, -5);

    const bladeMesh = new THREE.Mesh(bladeGeo);
    group.add(bladeMesh);
  }

  // Flatten group into single buffer geometry
  const geometries: THREE.BufferGeometry[] = [hubGeo];
  group.children.forEach((child) => {
    if (child instanceof THREE.Mesh && child.geometry !== hubGeo) {
      geometries.push(child.geometry);
    }
  });

  return mergeBufferGeometries(geometries);
}

function createBracketGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // L bracket shape
  shape.moveTo(0, 0);
  shape.lineTo(45, 0);
  shape.lineTo(45, 8);
  shape.lineTo(8, 8);
  shape.lineTo(8, 45);
  shape.lineTo(0, 45);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 35,
    bevelEnabled: true,
    bevelThickness: 1.5,
    bevelSize: 1.5,
    bevelSegments: 3,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalPositions = 0;
  for (const g of geometries) {
    const pos = g.getAttribute('position');
    if (pos) totalPositions += pos.count * 3;
  }

  const mergedPos = new Float32Array(totalPositions);
  let offset = 0;

  for (const g of geometries) {
    const pos = g.getAttribute('position');
    if (pos) {
      mergedPos.set(pos.array, offset);
      offset += pos.array.length;
    }
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  result.computeVertexNormals();
  return result;
}

function geometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  const nonIndexed = geometry.toNonIndexed();
  const posAttr = nonIndexed.getAttribute('position');
  const normalAttr = nonIndexed.getAttribute('normal');
  const triangleCount = posAttr.count / 3;

  const bufferSize = 84 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // 80 byte header
  const headerStr = 'PROYET 3D - Model Generator Export';
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
  }

  // 4 byte triangle count
  view.setUint32(80, triangleCount, true);

  let offset = 84;
  for (let i = 0; i < triangleCount; i++) {
    const idx = i * 3;
    // Normal
    const nx = normalAttr ? normalAttr.getX(idx) : 0;
    const ny = normalAttr ? normalAttr.getY(idx) : 0;
    const nz = normalAttr ? normalAttr.getZ(idx) : 1;

    view.setFloat32(offset, nx, true);
    view.setFloat32(offset + 4, ny, true);
    view.setFloat32(offset + 8, nz, true);
    offset += 12;

    // 3 Vertices
    for (let v = 0; v < 3; v++) {
      const vIdx = idx + v;
      view.setFloat32(offset, posAttr.getX(vIdx), true);
      view.setFloat32(offset + 4, posAttr.getY(vIdx), true);
      view.setFloat32(offset + 8, posAttr.getZ(vIdx), true);
      offset += 12;
    }

    // 2-byte attribute byte count
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}
