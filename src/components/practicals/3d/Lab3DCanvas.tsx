import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  AssembledItem, 
  ChemistryState, 
  PhysicsState, 
  BiologyState, 
  LabSubject 
} from './types';
import { EQUIPMENT_CATALOG } from './equipmentCatalog';

interface Lab3DCanvasProps {
  subject: LabSubject;
  assembledItems: AssembledItem[];
  selectedInstanceId: string | null;
  onSelectInstance: (id: string | null) => void;
  onUpdatePosition: (id: string, newPos: [number, number, number]) => void;
  chemistryState: ChemistryState;
  physicsState: PhysicsState;
  biologyState: BiologyState;
  cameraPreset: 'workbench' | 'room' | 'closeup' | 'topdown';
  onOpenMicroscopeModal?: () => void;
}

export const Lab3DCanvas: React.FC<Lab3DCanvasProps> = ({
  subject,
  assembledItems,
  selectedInstanceId,
  onSelectInstance,
  onUpdatePosition,
  chemistryState,
  physicsState,
  biologyState,
  cameraPreset,
  onOpenMicroscopeModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Interaction State
  const isDraggingCameraRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6, radius: 4.5 });

  // Raycasting / Object Dragging
  const isDraggingObjectRef = useRef(false);
  const draggedInstanceIdRef = useRef<string | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // References to 3D Mesh Groups mapped by instanceId
  const meshGroupMapRef = useRef<Map<string, THREE.Group>>(new Map());

  // Dynamic Animated Mesh References
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const dripParticlesRef = useRef<THREE.Points | null>(null);
  const gasParticlesRef = useRef<THREE.Points | null>(null);
  const needleAmmeterRef = useRef<THREE.Group | null>(null);
  const needleVoltmeterRef = useRef<THREE.Group | null>(null);
  const bulbFilamentLightRef = useRef<THREE.PointLight | null>(null);
  const bulbFilamentMeshRef = useRef<THREE.Mesh | null>(null);
  const pendulumBobRef = useRef<THREE.Mesh | null>(null);
  const pendulumStringRef = useRef<THREE.Line | null>(null);
  const lightRayMeshRef = useRef<THREE.Mesh | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Dark slate slate-900

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x0f172a, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainSunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainSunLight.position.set(5, 8, 5);
    mainSunLight.castShadow = true;
    mainSunLight.shadow.mapSize.width = 1024;
    mainSunLight.shadow.mapSize.height = 1024;
    mainSunLight.shadow.camera.near = 0.5;
    mainSunLight.shadow.camera.far = 25;
    mainSunLight.shadow.camera.left = -5;
    mainSunLight.shadow.camera.right = 5;
    mainSunLight.shadow.camera.top = 5;
    mainSunLight.shadow.camera.bottom = -5;
    scene.add(mainSunLight);

    // Bench Spotlight for warm lab focus
    const benchSpotLight = new THREE.SpotLight(0x38bdf8, 0.8, 15, Math.PI / 4, 0.5, 1);
    benchSpotLight.position.set(0, 5, 0);
    benchSpotLight.target.position.set(0, 0, 0);
    scene.add(benchSpotLight);
    scene.add(benchSpotLight.target);

    // Build Laboratory Room Environment (Floor, Workbench, Back Wall, Shelves)
    buildLabRoomEnvironment(scene, subject);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update dynamic animations (chemical swirling, pendulum swing, particle drip, gas evolution)
      updateDynamicAnimations(elapsedTime);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [subject]);

  // Update Camera position based on preset or orbit angles
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    
    // Convert spherical coordinates to Cartesian
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(0.4, y), z);
    cameraRef.current.lookAt(0, 0.3, 0);
  };

  // Handle Preset Changes
  useEffect(() => {
    if (cameraPreset === 'workbench') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 4, radius: 2.8 };
    } else if (cameraPreset === 'room') {
      cameraAngleRef.current = { theta: Math.PI / 5, phi: Math.PI / 3, radius: 5.5 };
    } else if (cameraPreset === 'closeup') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 3.2, radius: 1.6 };
    } else if (cameraPreset === 'topdown') {
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: 4.0 };
    }
    updateCameraPosition();
  }, [cameraPreset]);

  // Sync 3D Assembled Items with Scene Meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old meshes that are no longer in assembledItems
    const currentIds = new Set(assembledItems.map(i => i.instanceId));
    meshGroupMapRef.current.forEach((group, id) => {
      if (!currentIds.has(id)) {
        scene.remove(group);
        meshGroupMapRef.current.delete(id);
      }
    });

    // Add or Update Meshes
    assembledItems.forEach((item) => {
      const equipDef = EQUIPMENT_CATALOG.find(e => e.id === item.equipmentId);
      if (!equipDef) return;

      let group = meshGroupMapRef.current.get(item.instanceId);
      if (!group) {
        group = create3DModelForApparatus(equipDef.modelType, item.instanceId);
        group.userData = { instanceId: item.instanceId, equipmentId: item.equipmentId, modelType: equipDef.modelType };
        scene.add(group);
        meshGroupMapRef.current.set(item.instanceId, group);
      }

      // Update position & rotation
      group.position.set(item.position[0], item.position[1], item.position[2]);
      group.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);

      // Highlight if selected
      const isSelected = item.instanceId === selectedInstanceId;
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (isSelected) {
            (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x38bdf8);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25;
          } else {
            if ((mesh.material as THREE.MeshStandardMaterial).emissive) {
              (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000);
            }
          }
        }
      });
    });
  }, [assembledItems, selectedInstanceId]);

  // Create Procedural 3D Mesh Groups for Apparatus
  const create3DModelForApparatus = (modelType: string, instanceId: string): THREE.Group => {
    const group = new THREE.Group();

    if (modelType === 'burette') {
      // Glass Burette tube
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.1
      });
      const tubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 32);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
      tubeMesh.position.y = 0.6;
      tubeMesh.castShadow = true;
      group.add(tubeMesh);

      // Stopcock valve tap
      const tapMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.4 });
      const tapGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 16);
      const tapMesh = new THREE.Mesh(tapGeo, tapMat);
      tapMesh.rotation.z = Math.PI / 2;
      tapMesh.position.set(0, 0.08, 0);
      group.add(tapMesh);

      // Liquid level inside burette
      const liquidMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 });
      const liquidGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.8, 32);
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
      liquidMesh.position.y = 0.6;
      group.add(liquidMesh);

      // Tip nozzle
      const tipGeo = new THREE.ConeGeometry(0.02, 0.1, 16);
      const tipMesh = new THREE.Mesh(tipGeo, glassMat);
      tipMesh.rotation.x = Math.PI;
      tipMesh.position.y = -0.05;
      group.add(tipMesh);
    } 
    else if (modelType === 'conical_flask') {
      // Conical Flask Glass Body
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.05,
        transmission: 0.95
      });
      const coneBodyGeo = new THREE.ConeGeometry(0.28, 0.35, 32);
      const coneBody = new THREE.Mesh(coneBodyGeo, glassMat);
      coneBody.position.y = 0.175;
      coneBody.castShadow = true;
      group.add(coneBody);

      // Flask Neck
      const neckGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 32);
      const neck = new THREE.Mesh(neckGeo, glassMat);
      neck.position.y = 0.38;
      group.add(neck);

      // Reaction Liquid inside Flask
      const liqMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85
      });
      liquidMaterialRef.current = liqMat;
      const liqGeo = new THREE.ConeGeometry(0.24, 0.2, 32);
      const liqMesh = new THREE.Mesh(liqGeo, liqMat);
      liqMesh.position.y = 0.1;
      liquidMeshRef.current = liqMesh;
      group.add(liqMesh);
    }
    else if (modelType === 'retort_stand') {
      // Iron Base Plate
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const baseGeo = new THREE.BoxGeometry(0.4, 0.04, 0.3);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.02;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Vertical Steel Rod
      const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 16);
      const rodMesh = new THREE.Mesh(rodGeo, rodMat);
      rodMesh.position.set(0.12, 0.7, 0);
      rodMesh.castShadow = true;
      group.add(rodMesh);

      // Bosshead Clamp
      const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const clampGeo = new THREE.BoxGeometry(0.1, 0.08, 0.22);
      const clampMesh = new THREE.Mesh(clampGeo, clampMat);
      clampMesh.position.set(0.08, 0.8, 0);
      group.add(clampMesh);
    }
    else if (modelType === 'bunsen_burner') {
      // Cast iron base
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const baseGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.04, 32);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.02;
      group.add(baseMesh);

      // Brass Barrel
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });
      const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 32);
      const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
      barrelMesh.position.y = 0.17;
      group.add(barrelMesh);

      // Animated 3D Flame Cone
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
      const flameGeo = new THREE.ConeGeometry(0.04, 0.18, 16);
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.y = 0.4;
      flameMesh.visible = false;
      flameMeshRef.current = flameMesh;
      group.add(flameMesh);

      // Flame Light
      const flameLight = new THREE.PointLight(0x38bdf8, 1.5, 2);
      flameLight.position.y = 0.4;
      flameLight.visible = false;
      group.add(flameLight);
    }
    else if (modelType === 'ammeter' || modelType === 'voltmeter') {
      // Meter Casing
      const caseMat = new THREE.MeshStandardMaterial({ 
        color: modelType === 'ammeter' ? 0x0284c7 : 0xe11d48, 
        roughness: 0.4 
      });
      const caseGeo = new THREE.BoxGeometry(0.28, 0.22, 0.2);
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      caseMesh.position.y = 0.11;
      caseMesh.castShadow = true;
      group.add(caseMesh);

      // Glass Dial Face
      const dialMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const dialGeo = new THREE.PlaneGeometry(0.22, 0.14);
      const dialMesh = new THREE.Mesh(dialGeo, dialMat);
      dialMesh.position.set(0, 0.13, 0.101);
      group.add(dialMesh);

      // Rotating Needle Arm
      const needleGroup = new THREE.Group();
      needleGroup.position.set(0, 0.08, 0.102);
      const needleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const needleGeo = new THREE.BoxGeometry(0.005, 0.08, 0.002);
      const needleMesh = new THREE.Mesh(needleGeo, needleMat);
      needleMesh.position.y = 0.04;
      needleGroup.add(needleMesh);

      if (modelType === 'ammeter') needleAmmeterRef.current = needleGroup;
      else needleVoltmeterRef.current = needleGroup;

      group.add(needleGroup);

      // Binding Terminals (Red + / Black -)
      const redTermMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const blackTermMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

      const termGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16);
      const redTerm = new THREE.Mesh(termGeo, redTermMat);
      redTerm.position.set(0.08, 0.23, 0);
      group.add(redTerm);

      const blackTerm = new THREE.Mesh(termGeo, blackTermMat);
      blackTerm.position.set(-0.08, 0.23, 0);
      group.add(blackTerm);
    }
    else if (modelType === 'bulb') {
      // Ceramic Base Holder
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const baseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 32);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.03;
      group.add(baseMesh);

      // Glass Bulb Sphere
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.1 });
      const bulbGeo = new THREE.SphereGeometry(0.1, 32, 32);
      const bulbMesh = new THREE.Mesh(bulbGeo, glassMat);
      bulbMesh.position.y = 0.16;
      group.add(bulbMesh);

      // Filament glowing center
      const filMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x000000 });
      const filGeo = new THREE.SphereGeometry(0.02, 16, 16);
      const filMesh = new THREE.Mesh(filGeo, filMat);
      filMesh.position.y = 0.16;
      bulbFilamentMeshRef.current = filMesh;
      group.add(filMesh);

      // Light source
      const bulbLight = new THREE.PointLight(0xf59e0b, 0, 3);
      bulbLight.position.y = 0.16;
      bulbFilamentLightRef.current = bulbLight;
      group.add(bulbLight);
    }
    else if (modelType === 'pendulum') {
      // Gallows Stand frame
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const vertGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 16);
      const vertMesh = new THREE.Mesh(vertGeo, frameMat);
      vertMesh.position.set(-0.2, 0.6, 0);
      group.add(vertMesh);

      const horizGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16);
      const horizMesh = new THREE.Mesh(horizGeo, frameMat);
      horizMesh.rotation.z = Math.PI / 2;
      horizMesh.position.set(0, 1.18, 0);
      group.add(horizMesh);

      // Metallic Bob Mass
      const bobMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const bobGeo = new THREE.SphereGeometry(0.07, 32, 32);
      const bobMesh = new THREE.Mesh(bobGeo, bobMat);
      bobMesh.position.set(0, 0.3, 0);
      bobMesh.castShadow = true;
      pendulumBobRef.current = bobMesh;
      group.add(bobMesh);
    }
    else if (modelType === 'microscope') {
      // Heavy Microscope Base & Arm
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
      const baseGeo = new THREE.BoxGeometry(0.35, 0.06, 0.45);
      const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
      baseMesh.position.y = 0.03;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // Curved Arm Body
      const armGeo = new THREE.BoxGeometry(0.08, 0.45, 0.12);
      const armMesh = new THREE.Mesh(armGeo, bodyMat);
      armMesh.position.set(0, 0.28, -0.15);
      armMesh.rotation.x = -Math.PI / 12;
      group.add(armMesh);

      // Microscope Stage Plate
      const stageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const stageGeo = new THREE.BoxGeometry(0.32, 0.03, 0.32);
      const stageMesh = new THREE.Mesh(stageGeo, stageMat);
      stageMesh.position.set(0, 0.25, 0);
      group.add(stageMesh);

      // Revolving Nosepiece Turret
      const turretMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
      const turretGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 32);
      const turretMesh = new THREE.Mesh(turretGeo, turretMat);
      turretMesh.position.set(0, 0.42, 0);
      group.add(turretMesh);

      // Objective Lenses (4x, 10x, 40x, 100x)
      const lensMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const lensGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.08, 16);
      const lens1 = new THREE.Mesh(lensGeo, lensMat);
      lens1.position.set(0.04, 0.36, 0);
      group.add(lens1);

      // Binocular Eyepiece Head
      const headGeo = new THREE.BoxGeometry(0.18, 0.12, 0.15);
      const headMesh = new THREE.Mesh(headGeo, bodyMat);
      headMesh.position.set(0, 0.58, -0.05);
      group.add(headMesh);
    }
    else {
      // General apparatus placeholder (Beaker / Cylinder / Meter Rule)
      const defaultMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3 });
      const defaultGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 32);
      const defaultMesh = new THREE.Mesh(defaultGeo, defaultMat);
      defaultMesh.position.y = 0.15;
      defaultMesh.castShadow = true;
      group.add(defaultMesh);
    }

    return group;
  };

  // Build 3D Lab Room Environment
  const buildLabRoomEnvironment = (scene: THREE.Scene, labSubject: LabSubject) => {
    // 1. Tiled Floor
    const floorTextureCanvas = document.createElement('canvas');
    floorTextureCanvas.width = 256;
    floorTextureCanvas.height = 256;
    const ctx = floorTextureCanvas.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 256);

    const floorTexture = new THREE.CanvasTexture(floorTextureCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(12, 12);

    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.6 });
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. Main Science Workbench Table
    const benchTopMat = new THREE.MeshStandardMaterial({
      color: labSubject === 'Chemistry' ? 0x0f172a : labSubject === 'Physics' ? 0x1e293b : 0x1e1b4b,
      roughness: 0.2,
      metalness: 0.1
    });
    const benchTopGeo = new THREE.BoxGeometry(4.2, 0.1, 2.2);
    const benchTopMesh = new THREE.Mesh(benchTopGeo, benchTopMat);
    benchTopMesh.position.set(0, 0, 0);
    benchTopMesh.receiveShadow = true;
    benchTopMesh.castShadow = true;
    scene.add(benchTopMesh);

    // Workbench Metal Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const legPositions = [
      [-1.9, -0.45, -0.9],
      [1.9, -0.45, -0.9],
      [-1.9, -0.45, 0.9],
      [1.9, -0.45, 0.9]
    ];
    legPositions.forEach(([x, y, z]) => {
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16);
      const legMesh = new THREE.Mesh(legGeo, legMat);
      legMesh.position.set(x, y, z);
      legMesh.castShadow = true;
      scene.add(legMesh);
    });

    // Back wall chalkboard & laboratory cabinets
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.9 });
    const wallGeo = new THREE.PlaneGeometry(16, 8);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 4, -4);
    scene.add(wallMesh);
  };

  // Dynamic Reactions & Animations Step
  const updateDynamicAnimations = (elapsedTime: number) => {
    // 1. Chemistry Solution Color & Titration Reaction
    if (liquidMaterialRef.current && subject === 'Chemistry') {
      const ph = chemistryState.ph;
      let colorHex = 0xf8fafc; // Colorless

      if (chemistryState.indicator === 'phenolphthalein') {
        colorHex = ph >= 8.2 ? 0xec4899 : 0xf8fafc; // Pink vs Colorless
      } else if (chemistryState.indicator === 'methyl_orange') {
        colorHex = ph <= 3.1 ? 0xef4444 : ph >= 4.4 ? 0xeab308 : 0xf97316; // Red, Yellow, Orange
      } else if (chemistryState.indicator === 'universal') {
        if (ph <= 2) colorHex = 0xef4444;
        else if (ph <= 4) colorHex = 0xf97316;
        else if (ph <= 6) colorHex = 0xeab308;
        else if (ph <= 8) colorHex = 0x22c55e;
        else if (ph <= 10) colorHex = 0x06b6d4;
        else colorHex = 0x8b5cf6;
      }

      liquidMaterialRef.current.color.setHex(colorHex);
    }

    // 2. Bunsen Burner Flame
    if (flameMeshRef.current) {
      flameMeshRef.current.visible = chemistryState.isBunsenLit;
      if (chemistryState.isBunsenLit) {
        const scaleY = 1 + Math.sin(elapsedTime * 15) * 0.08;
        flameMeshRef.current.scale.set(1, scaleY, 1);
      }
    }

    // 3. Electrical Ammeter & Voltmeter Needles
    if (needleAmmeterRef.current) {
      const current = physicsState.isSwitchClosed ? physicsState.currentCalculated : 0;
      const angle = -Math.PI / 4 + (current / 5) * (Math.PI / 2);
      needleAmmeterRef.current.rotation.z = angle;
    }
    if (needleVoltmeterRef.current) {
      const voltage = physicsState.isSwitchClosed ? physicsState.voltageInput : 0;
      const angle = -Math.PI / 4 + (voltage / 12) * (Math.PI / 2);
      needleVoltmeterRef.current.rotation.z = angle;
    }

    // 4. Bulb Glow Filament
    if (bulbFilamentLightRef.current && bulbFilamentMeshRef.current) {
      if (physicsState.isSwitchClosed && physicsState.bulbGlowing) {
        const intensity = physicsState.bulbBrightness * 3.5;
        bulbFilamentLightRef.current.intensity = intensity;
        (bulbFilamentMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
        (bulbFilamentMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      } else {
        bulbFilamentLightRef.current.intensity = 0;
        (bulbFilamentMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      }
    }

    // 5. Pendulum Simple Harmonic Motion
    if (pendulumBobRef.current && physicsState.isPendulumSwinging) {
      const L = physicsState.pendulumLength;
      const omega = Math.sqrt(physicsState.gravity / L);
      const angleRad = (physicsState.pendulumAngle * Math.PI / 180) * Math.cos(omega * elapsedTime);
      const bobX = L * Math.sin(angleRad);
      const bobY = 1.18 - L * Math.cos(angleRad);
      pendulumBobRef.current.position.set(bobX, bobY, 0);
    }
  };

  // Mouse Orbit Camera Drag & Raycasting Selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left Click
      // Raycast to check if student clicked an apparatus
      if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.instanceId && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.userData?.instanceId) {
          const instId = obj.userData.instanceId;
          onSelectInstance(instId);

          if (obj.userData.modelType === 'microscope' && onOpenMicroscopeModal) {
            onOpenMicroscopeModal();
          }

          isDraggingObjectRef.current = true;
          draggedInstanceIdRef.current = instId;
        } else {
          onSelectInstance(null);
          isDraggingCameraRef.current = true;
        }
      } else {
        onSelectInstance(null);
        isDraggingCameraRef.current = true;
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (isDraggingCameraRef.current) {
      cameraAngleRef.current.theta -= deltaX * 0.005;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngleRef.current.phi + deltaY * 0.005));
      updateCameraPosition();
    } else if (isDraggingObjectRef.current && draggedInstanceIdRef.current) {
      const inst = assembledItems.find(i => i.instanceId === draggedInstanceIdRef.current);
      if (inst) {
        const newX = Number((inst.position[0] + deltaX * 0.004).toFixed(2));
        const newZ = Number((inst.position[2] + deltaY * 0.004).toFixed(2));
        onUpdatePosition(inst.instanceId, [newX, inst.position[1], newZ]);
      }
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingCameraRef.current = false;
    isDraggingObjectRef.current = false;
    draggedInstanceIdRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAngleRef.current.radius = Math.max(1.2, Math.min(8.0, cameraAngleRef.current.radius + e.deltaY * 0.003));
    updateCameraPosition();
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 3D Navigation Watermark Overlay */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/60 text-[10px] text-slate-300 font-semibold flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>3D Orbit: Left-drag to rotate view | Wheel to zoom | Click apparatus to select & assemble</span>
      </div>
    </div>
  );
};
