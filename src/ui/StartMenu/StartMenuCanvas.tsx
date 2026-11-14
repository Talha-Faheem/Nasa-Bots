/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/StartMenu/StartMenuCanvas.tsx
 * Independent 3D WebGL scene for the main menu.
 * Features a high-detail rotating Moon with shadow terminator, blue rim glow,
 * distant Earth, orbiting satellite, and 3-tier parallax starfield.
 * Disposes cleanly upon transitioning into the game.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/store.ts';

interface StartMenuSceneProps {
  isStarting: boolean;
  mousePos: { x: number; y: number };
}

// Procedural cratered lunar surface texture generation
function createProceduralMoonTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base lunar regolith tone
  ctx.fillStyle = '#78818c';
  ctx.fillRect(0, 0, size, size);

  // Maria (dark lunar basalt plains)
  const mariaGradients = [
    { x: 340, y: 380, r: 180, color: 'rgba(38, 44, 52, 0.75)' }, // Sea of Tranquility
    { x: 520, y: 300, r: 240, color: 'rgba(34, 40, 48, 0.8)' },  // Ocean of Storms
    { x: 420, y: 560, r: 160, color: 'rgba(42, 48, 56, 0.7)' },  // Sea of Serenity
    { x: 680, y: 620, r: 200, color: 'rgba(36, 42, 50, 0.75)' },
  ];

  for (const m of mariaGradients) {
    const radGrad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
    radGrad.addColorStop(0, m.color);
    radGrad.addColorStop(0.7, m.color);
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lunar impact craters with bright ejecta rays
  const craterList = [
    { x: 280, y: 720, r: 35, rays: true },  // Tycho
    { x: 450, y: 410, r: 28, rays: true },  // Copernicus
    { x: 380, y: 340, r: 22, rays: false }, // Kepler
    { x: 720, y: 480, r: 30, rays: false },
    { x: 580, y: 760, r: 25, rays: false },
  ];

  for (const c of craterList) {
    // Ejecta rays
    if (c.rays) {
      ctx.strokeStyle = 'rgba(215, 225, 235, 0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const len = 120 + Math.sin(i * 3) * 60;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(angle) * len, c.y + Math.sin(angle) * len);
        ctx.stroke();
      }
    }

    // Crater rim
    const rimGrad = ctx.createRadialGradient(c.x, c.y, c.r * 0.7, c.x, c.y, c.r);
    rimGrad.addColorStop(0, '#1a1f26');
    rimGrad.addColorStop(0.8, '#cbd5e1');
    rimGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();

    // Central peak
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine regolith noise texture
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const diffuseTex = new THREE.CanvasTexture(canvas);
  diffuseTex.wrapS = THREE.RepeatWrapping;
  diffuseTex.wrapT = THREE.ClampToEdgeWrapping;

  // Bump map canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  bumpCtx.drawImage(canvas, 0, 0, 512, 512);

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.ClampToEdgeWrapping;

  return { diffuse: diffuseTex, bump: bumpTex };
}

// 3-Tier Starfield with subtle twinkle
const StarfieldLayers: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const pointsRef1 = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);

  const [geo1, geo2, geo3] = useMemo(() => {
    const makeGeo = (count: number, spread: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * spread;
        pos[i + 1] = (Math.random() - 0.5) * spread;
        pos[i + 2] = -40 - Math.random() * 80;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return geo;
    };
    return [makeGeo(1200, 160), makeGeo(600, 140), makeGeo(180, 120)];
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (pointsRef1.current) {
      pointsRef1.current.rotation.z = t * 0.003;
    }
    if (pointsRef2.current) {
      pointsRef2.current.rotation.z = -t * 0.005;
    }
  });

  return (
    <group>
      {/* Tier 1: Small dim background stars */}
      <points ref={pointsRef1} geometry={geo1}>
        <pointsMaterial size={0.65} color="#94a3b8" transparent opacity={0.6} sizeAttenuation />
      </points>
      {/* Tier 2: Medium bluish-white stars */}
      <points ref={pointsRef2} geometry={geo2}>
        <pointsMaterial size={1.1} color="#cbd5e1" transparent opacity={0.8} sizeAttenuation />
      </points>
      {/* Tier 3: Bright prominent stars */}
      <points geometry={geo3}>
        <pointsMaterial size={1.8} color="#e0f2fe" transparent opacity={0.95} sizeAttenuation />
      </points>
    </group>
  );
};

// Orbiting Satellite / Crewed Lander
const OrbitingSatellite: React.FC<{ moonRadius: number; reducedMotion: boolean }> = ({
  moonRadius,
  reducedMotion,
}) => {
  const satRef = useRef<THREE.Group>(null);
  const orbitRadius = moonRadius + 1.25;

  useFrame((state) => {
    if (!satRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime() * 0.45;
    satRef.current.position.x = Math.cos(t) * orbitRadius;
    satRef.current.position.y = Math.sin(t * 0.8) * 0.45;
    satRef.current.position.z = Math.sin(t) * orbitRadius;
    satRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group>
      {/* Orbit Trail Ring */}
      <mesh rotation={[0.2, 0.4, 0]}>
        <ringGeometry args={[orbitRadius - 0.015, orbitRadius + 0.015, 64]} />
        <meshBasicMaterial color="#2ec4d6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Satellite Module */}
      <group ref={satRef}>
        {/* Core body */}
        <mesh>
          <boxGeometry args={[0.08, 0.08, 0.12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Solar panel wings */}
        <mesh position={[0.13, 0, 0]}>
          <boxGeometry args={[0.16, 0.01, 0.06]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.13, 0, 0]}>
          <boxGeometry args={[0.16, 0.01, 0.06]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>
        {/* Beacon light */}
        <pointLight color="#2ec4d6" intensity={0.6} distance={2} />
      </group>
    </group>
  );
};

// Center 3D Moon Component with NASA-accurate terminator & blue rim glow
const CenterMoon: React.FC<{ isStarting: boolean; reducedMotion: boolean }> = ({
  isStarting,
  reducedMotion,
}) => {
  const moonGroupRef = useRef<THREE.Group>(null);
  const textures = useMemo(() => createProceduralMoonTextures(), []);

  // Dispose canvas textures when unmounted
  useEffect(() => {
    return () => {
      textures.diffuse.dispose();
      textures.bump.dispose();
    };
  }, [textures]);

  useFrame((_, delta) => {
    if (!moonGroupRef.current) return;

    if (!reducedMotion) {
      moonGroupRef.current.rotation.y += delta * 0.035;
    }

    if (isStarting && !reducedMotion) {
      // Cinematic camera zoom: scale up & push toward player
      moonGroupRef.current.scale.lerp(new THREE.Vector3(3.2, 3.2, 3.2), 0.04);
      moonGroupRef.current.position.z += delta * 3.5;
    }
  });

  return (
    <group ref={moonGroupRef} position={[0.4, -0.1, 0]}>
      {/* 3D Lunar Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={textures.diffuse}
          bumpMap={textures.bump}
          bumpScale={0.06}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Fresnel Atmosphere / Thin Blue Rim Glow */}
      <mesh>
        <sphereGeometry args={[2.53, 48, 48]} />
        <meshStandardMaterial
          color="#2ec4d6"
          transparent
          opacity={0.16}
          roughness={0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbiting Satellite */}
      <OrbitingSatellite moonRadius={2.5} reducedMotion={reducedMotion} />
    </group>
  );
};

// Distant Blue Marble Earth
const DistantEarth: React.FC = () => {
  return (
    <group position={[6.5, 4.2, -8]}>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#1d4ed8"
          roughness={0.4}
          metalness={0.1}
          emissive="#1e40af"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Earth Cloud Wisps */}
      <mesh>
        <sphereGeometry args={[0.56, 32, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} />
      </mesh>
      {/* Atmospheric blue haze */}
      <pointLight color="#38bdf8" intensity={0.5} distance={4} />
    </group>
  );
};

// Inner 3D Scene Assembly with Camera Parallax
const StartMenuScene: React.FC<StartMenuSceneProps> = ({ isStarting, mousePos }) => {
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const sceneGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!sceneGroupRef.current || reducedMotion) return;
    // Subtle mouse parallax
    const targetX = mousePos.x * 0.35;
    const targetY = -mousePos.y * 0.25;
    sceneGroupRef.current.position.x = THREE.MathUtils.lerp(
      sceneGroupRef.current.position.x,
      targetX,
      0.05
    );
    sceneGroupRef.current.position.y = THREE.MathUtils.lerp(
      sceneGroupRef.current.position.y,
      targetY,
      0.05
    );
  });

  return (
    <group ref={sceneGroupRef}>
      {/* Directional Sun Light: Strong side-lighting creating a distinct shadow terminator */}
      <directionalLight position={[10, 2, 7]} intensity={2.8} castShadow />
      {/* Ambient Deep Space Light */}
      <ambientLight intensity={0.12} />
      {/* Blue Rim Back-Light (Fresnel glow on the dark limb) */}
      <directionalLight position={[-8, 3, -6]} intensity={0.9} color="#2ec4d6" />

      {/* Starfield */}
      <StarfieldLayers reducedMotion={reducedMotion} />

      {/* Centerpiece Moon */}
      <CenterMoon isStarting={isStarting} reducedMotion={reducedMotion} />

      {/* Distant Earth */}
      <DistantEarth />
    </group>
  );
};

export const StartMenuCanvas: React.FC<{ isStarting: boolean }> = ({ isStarting }) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <StartMenuScene isStarting={isStarting} mousePos={mousePos} />
      </Canvas>
    </div>
  );
};
