import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Box,
  Eye,
  Layers,
  Grid,
  Maximize2,
  Compass,
  AlertTriangle,
  Ruler,
  Ghost,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ModelAnalysis } from '../types';

interface Viewer3DProps {
  geometry: THREE.BufferGeometry | null;
  analysis: ModelAnalysis | null;
  materialColorHex: string;
  wireframeMode?: boolean;
}

interface MeasurementPoint {
  point: THREE.Vector3;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  geometry,
  analysis,
  materialColorHex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const supportsMeshRef = useRef<THREE.Mesh | null>(null);
  const bboxHelperRef = useRef<THREE.Box3Helper | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Measurement tool objects
  const measureLineRef = useRef<THREE.Line | null>(null);
  const measurePointsGroupRef = useRef<THREE.Group | null>(null);

  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'supports' | 'both'>('solid');
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Caliper / Measurement state
  const [isCaliperActive, setIsCaliperActive] = useState(false);
  const [measuredPoints, setMeasuredPoints] = useState<THREE.Vector3[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F0F7FF');
    sceneRef.current = scene;

    scene.fog = new THREE.FogExp2('#F0F7FF', 0.002);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(120, 100, 140);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 600;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.25);
    mainLight.position.set(150, 200, 150);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 600;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x90b8e0, 0.6);
    fillLight.position.set(-150, 100, -100);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, -100, 0);
    scene.add(rimLight);

    // 6. 3D Print Bed Grid
    const gridSize = 256;
    const gridDivisions = 32; // 8mm divisions
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x1e6091, 0xc8ddf0);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Build platform base circle/shadow receiver
    const bedGeo = new THREE.PlaneGeometry(gridSize, gridSize);
    const bedMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const bedPlane = new THREE.Mesh(bedGeo, bedMat);
    bedPlane.rotation.x = -Math.PI / 2;
    bedPlane.position.y = -0.1;
    bedPlane.receiveShadow = true;
    scene.add(bedPlane);

    // Group for caliper measurements
    const measureGroup = new THREE.Group();
    scene.add(measureGroup);
    measurePointsGroupRef.current = measureGroup;

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        if (isRotating && meshRef.current) {
          meshRef.current.rotation.z += 0.005;
          if (wireframeMeshRef.current) wireframeMeshRef.current.rotation.z += 0.005;
          if (supportsMeshRef.current) supportsMeshRef.current.rotation.z += 0.005;
        }
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 460;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Geometry & Meshes when geometry or materialColor changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !geometry) return;

    if (meshRef.current) scene.remove(meshRef.current);
    if (wireframeMeshRef.current) scene.remove(wireframeMeshRef.current);
    if (supportsMeshRef.current) scene.remove(supportsMeshRef.current);
    if (bboxHelperRef.current) scene.remove(bboxHelperRef.current);

    const geomClone = geometry.clone();
    geomClone.rotateX(-Math.PI / 2);
    geomClone.computeBoundingBox();

    const bbox = geomClone.boundingBox || new THREE.Box3();
    geomClone.translate(0, -bbox.min.y, 0);
    geomClone.computeBoundingBox();

    // 1. Solid Mesh
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialColorHex),
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geomClone, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshRef.current = mesh;

    // 2. Wireframe Mesh
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0f2942,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(geomClone, wireframeMat);
    wireframeMeshRef.current = wireframeMesh;

    // 3. Supports / Overhang Heatmap Mesh (Translucent Ghost Body with Overhangs in bright red)
    const supportsMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materialColorHex),
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 1.2,
      side: THREE.DoubleSide,
    });
    const supportsMesh = new THREE.Mesh(geomClone, supportsMat);
    supportsMeshRef.current = supportsMesh;

    // 4. Bounding Box Helper
    const box3 = new THREE.Box3().setFromObject(mesh);
    const bboxHelper = new THREE.Box3Helper(box3, new THREE.Color(0x1e6091));
    bboxHelperRef.current = bboxHelper;

    // Add to scene according to active renderMode
    applyRenderMode(renderMode, mesh, wireframeMesh, supportsMesh, scene);

    if (showBoundingBox) scene.add(bboxHelper);

    centerCameraOnObject(geomClone);
    clearMeasurements();
  }, [geometry, materialColorHex]);

  const applyRenderMode = (
    mode: 'solid' | 'wireframe' | 'supports' | 'both',
    mSolid: THREE.Mesh | null,
    mWire: THREE.Mesh | null,
    mSupp: THREE.Mesh | null,
    scene: THREE.Scene
  ) => {
    if (!mSolid || !mWire || !mSupp) return;
    scene.remove(mSolid);
    scene.remove(mWire);
    scene.remove(mSupp);

    if (mode === 'solid') {
      scene.add(mSolid);
    } else if (mode === 'wireframe') {
      scene.add(mWire);
    } else if (mode === 'supports') {
      scene.add(mSupp);
      scene.add(mWire);
    } else if (mode === 'both') {
      scene.add(mSolid);
      scene.add(mWire);
    }
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    applyRenderMode(renderMode, meshRef.current, wireframeMeshRef.current, supportsMeshRef.current, scene);
  }, [renderMode]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !bboxHelperRef.current) return;
    if (showBoundingBox) scene.add(bboxHelperRef.current);
    else scene.remove(bboxHelperRef.current);
  }, [showBoundingBox]);

  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
  }, [showGrid]);

  const centerCameraOnObject = (geom: THREE.BufferGeometry) => {
    if (!cameraRef.current || !controlsRef.current) return;
    geom.computeBoundingSphere();
    const sphere = geom.boundingSphere;
    if (!sphere) return;

    const radius = Math.max(sphere.radius, 15);
    cameraRef.current.position.set(radius * 1.8, radius * 1.6, radius * 2.2);
    controlsRef.current.target.set(0, radius * 0.45, 0);
    controlsRef.current.update();
  };

  const handleResetCamera = (view: 'iso' | 'top' | 'front') => {
    if (!cameraRef.current || !controlsRef.current || !geometry) return;
    const radius = analysis ? Math.max(analysis.dimensions.x, analysis.dimensions.y, analysis.dimensions.z) * 0.8 : 50;

    if (view === 'iso') {
      cameraRef.current.position.set(radius * 1.8, radius * 1.6, radius * 2.2);
      controlsRef.current.target.set(0, radius * 0.4, 0);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, radius * 2.8, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'front') {
      cameraRef.current.position.set(0, radius * 0.6, radius * 2.6);
      controlsRef.current.target.set(0, radius * 0.4, 0);
    }
    controlsRef.current.update();
  };

  // Caliper / Measurement Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCaliperActive || !rendererRef.current || !cameraRef.current || !meshRef.current || !sceneRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObject(meshRef.current, false);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;

      if (measuredPoints.length === 0 || measuredPoints.length === 2) {
        // First point
        setMeasuredPoints([hitPoint]);
        setMeasuredDistance(null);
        renderMeasurementVisuals([hitPoint]);
      } else if (measuredPoints.length === 1) {
        // Second point
        const p1 = measuredPoints[0];
        const p2 = hitPoint;
        const dist = Number(p1.distanceTo(p2).toFixed(2));
        setMeasuredPoints([p1, p2]);
        setMeasuredDistance(dist);
        renderMeasurementVisuals([p1, p2]);
      }
    }
  };

  const renderMeasurementVisuals = (points: THREE.Vector3[]) => {
    const group = measurePointsGroupRef.current;
    if (!group) return;

    // Clear old visual objects
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Draw Spheres for each point
    points.forEach((pt, index) => {
      const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0xef4444 : 0x10b981,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pt);
      group.add(sphere);
    });

    // Draw connection line if 2 points
    if (points.length === 2) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x1e6091,
        linewidth: 3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    }
  };

  const clearMeasurements = () => {
    setMeasuredPoints([]);
    setMeasuredDistance(null);
    if (measurePointsGroupRef.current) {
      while (measurePointsGroupRef.current.children.length > 0) {
        measurePointsGroupRef.current.remove(measurePointsGroupRef.current.children[0]);
      }
    }
  };

  return (
    <div className="relative w-full h-[470px] sm:h-[530px] bg-gradient-to-b from-[#EEF6FF] to-[#D9ECFF] rounded-2xl overflow-hidden border border-blue-200/80 shadow-inner group">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className={`w-full h-full ${
          isCaliperActive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-blue-100 shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setRenderMode('solid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              renderMode === 'solid'
                ? 'bg-[#1E6091] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Sólido</span>
          </button>

          <button
            type="button"
            onClick={() => setRenderMode('wireframe')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              renderMode === 'wireframe'
                ? 'bg-[#1E6091] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Malla</span>
          </button>

          <button
            type="button"
            onClick={() => setRenderMode('supports')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              renderMode === 'supports'
                ? 'bg-[#1E6091] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Modo transparente con inspección de voladizos"
          >
            <Ghost className="w-3.5 h-3.5" />
            <span>Transparente / Soportes</span>
          </button>
        </div>

        {/* Right: Quick Dimension HUD */}
        {analysis && (
          <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-blue-100 shadow-md text-xs font-mono font-medium text-slate-700 pointer-events-auto">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              X: <strong>{analysis.dimensions.x}</strong> mm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Y: <strong>{analysis.dimensions.y}</strong> mm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Z: <strong>{analysis.dimensions.z}</strong> mm
            </span>
          </div>
        )}
      </div>

      {/* Caliper Floating HUD Banner when Active */}
      {isCaliperActive && (
        <div className="absolute top-16 left-4 right-4 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 pointer-events-auto flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              {measuredDistance !== null ? (
                <p className="font-mono font-bold text-emerald-300 text-sm">
                  Distancia: {measuredDistance} mm
                </p>
              ) : measuredPoints.length === 1 ? (
                <p className="text-blue-200">Punto 1 fijado. Haz clic en el 2º punto...</p>
              ) : (
                <p className="text-slate-300">Haz clic sobre cualquier punto de la pieza para medir.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {measuredPoints.length > 0 && (
              <button
                type="button"
                onClick={clearMeasurements}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 cursor-pointer"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsCaliperActive(false);
                clearMeasurements();
              }}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Quick Perspectives */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-blue-100 shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => handleResetCamera('iso')}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1E6091] rounded-lg transition-colors cursor-pointer"
          >
            Isométrica
          </button>
          <button
            type="button"
            onClick={() => handleResetCamera('top')}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1E6091] rounded-lg transition-colors cursor-pointer"
          >
            Planta
          </button>
          <button
            type="button"
            onClick={() => handleResetCamera('front')}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1E6091] rounded-lg transition-colors cursor-pointer"
          >
            Frontal
          </button>
        </div>

        {/* Right: Tools (Caliper, Bounding Box, Grid, Spin, Reset) */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-blue-100 shadow-md pointer-events-auto">
          {/* Caliper / Ruler Button */}
          <button
            type="button"
            onClick={() => {
              setIsCaliperActive(!isCaliperActive);
              if (isCaliperActive) clearMeasurements();
            }}
            title="Medidor de distancias (Calibre 3D)"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              isCaliperActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#1E6091]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Medir</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            title="Alternar Caja Delimitadora"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              showBoundingBox ? 'bg-blue-100 text-[#1E6091]' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Alternar Cama de Impresión 256x256mm"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              showGrid ? 'bg-blue-100 text-[#1E6091]' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            title="Auto-rotación 360°"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isRotating ? 'bg-blue-100 text-[#1E6091] animate-spin' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleResetCamera('iso')}
            title="Centrar y reajustar cámara"
            className="p-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-[#1E6091] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overhang Alert Badge in Viewer */}
      {analysis?.hasOverhangs && (
        <div className="absolute top-16 left-4 bg-amber-500/95 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Voladizos detectados (activa modo Soportes para inspeccionar)</span>
        </div>
      )}

      {/* Helper info on bottom right */}
      <div className="absolute bottom-16 right-4 hidden lg:block bg-black/40 backdrop-blur-xs text-white/90 text-[10px] px-2.5 py-1 rounded-md pointer-events-none">
        🖱️ Clic izq: Rotar 360° · Clic der: Mover · Rueda: Zoom
      </div>
    </div>
  );
};
