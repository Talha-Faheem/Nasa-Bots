/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Terrain.tsx
 * High-fidelity 3D Lunar South Pole Environment:
 * - High-resolution height-displaced terrain mesh with raised crater rims.
 * - Procedural regolith bump & roughness micro-detail canvas textures (PBR).
 * - Authentic lunar grey & anorthosite color palette (zero bright blue!).
 * - Instanced 3D lunar boulders & rocks with realistic contact shadows.
 * - Distant Shackleton / Malapert horizon mountain peaks against the starfield.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight, getTerrainSample, LUNAR_CRATERS, BASE_OBSTACLES } from './Physics/TerrainHeight.ts';

// Generate procedural 512x512 regolith granular micro-detail bump & texture
function createRegolithTextures(): { albedo: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const size = 512;
  const canvasAlbedo = document.createElement('canvas');
  canvasAlbedo.width = size;
  canvasAlbedo.height = size;
  const ctxA = canvasAlbedo.getContext('2d')!;

  const canvasBump = document.createElement('canvas');
  canvasBump.width = size;
  canvasBump.height = size;
  const ctxB = canvasBump.getContext('2d')!;

  // Fill base lunar regolith neutral tone
  ctxA.fillStyle = '#64707d';
  ctxA.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, size, size);

  const imgDataA = ctxA.getImageData(0, 0, size, size);
  const dataA = imgDataA.data;

  const imgDataB = ctxB.getImageData(0, 0, size, size);
  const dataB = imgDataB.data;

  // Pseudo-random deterministic noise generator
  let seed = 42891;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // 1. Fine regolith granular noise
  for (let i = 0; i < dataA.length; i += 4) {
    const grain = (rnd() - 0.5) * 36;
    dataA[i] = Math.min(255, Math.max(0, dataA[i] + grain));
    dataA[i + 1] = Math.min(255, Math.max(0, dataA[i + 1] + grain));
    dataA[i + 2] = Math.min(255, Math.max(0, dataA[i + 2] + grain));

    const bumpVal = Math.min(255, Math.max(0, 128 + grain * 1.5));
    dataB[i] = bumpVal;
    dataB[i + 1] = bumpVal;
    dataB[i + 2] = bumpVal;
  }

  ctxA.putImageData(imgDataA, 0, 0);
  ctxB.putImageData(imgDataB, 0, 0);

  // 2. Scatter small micro-impact craterlets (2px - 8px radius)
  for (let n = 0; n < 320; n++) {
    const cx = Math.floor(rnd() * size);
    const cy = Math.floor(rnd() * size);
    const cr = 2 + rnd() * 6;

    // Outer raised rim highlight
    ctxA.beginPath();
    ctxA.arc(cx, cy, cr + 1.5, 0, Math.PI * 2);
    ctxA.fillStyle = 'rgba(210, 220, 235, 0.28)';
    ctxA.fill();

    ctxB.beginPath();
    ctxB.arc(cx, cy, cr + 1.5, 0, Math.PI * 2);
    ctxB.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctxB.fill();

    // Dark crater bowl interior
    ctxA.beginPath();
    ctxA.arc(cx, cy, cr, 0, Math.PI * 2);
    ctxA.fillStyle = 'rgba(25, 30, 38, 0.45)';
    ctxA.fill();

    ctxB.beginPath();
    ctxB.arc(cx, cy, cr, 0, Math.PI * 2);
    ctxB.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctxB.fill();
  }

  const albedo = new THREE.CanvasTexture(canvasAlbedo);
  albedo.wrapS = THREE.RepeatWrapping;
  albedo.wrapT = THREE.RepeatWrapping;
  albedo.repeat.set(16, 16);

  const bump = new THREE.CanvasTexture(canvasBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(16, 16);

  return { albedo, bump };
}

export const Terrain: React.FC = () => {
  // 1. Procedural PBR Textures
  const { albedo, bump } = useMemo(() => createRegolithTextures(), []);

  // 2. High-Resolution Terrain Plane Mesh
  const terrainGeo = useMemo(() => {
    // 150m x 150m with 120x120 subdivisions for smooth physical topography
    const geo = new THREE.PlaneGeometry(150, 150, 120, 120);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    // Authentic South Pole Regolith Palette
    const baseRegolithColor = new THREE.Color('#525e6d'); // Neutral lunar regolith
    const highlandAnorthositeColor = new THREE.Color('#98a5b5'); // Pale feldspathic ejecta ridges
    const craterDeepShadowColor = new THREE.Color('#1c232f'); // Deep crater basin
    const volatileIceFrostColor = new THREE.Color('#9bb0c4'); // Subtle icy frost (silvery grey-blue, NOT neon)
    const mineralOreColor = new THREE.Color('#414954'); // Dark basaltic ilmenite / titanium

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Query authoritative elevation formula
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      const sample = getTerrainSample(x, z);
      const vertexColor = baseRegolithColor.clone();

      // Realistic Geological Zone Tone Mapping
      if (sample.zone === 'Water Ice Deposit Zone') {
        // Cold polar permafrost frost sheen in permanently shadowed crater
        const iceFactor = Math.min(1.0, Math.max(0, -y / 3.0));
        vertexColor.lerp(volatileIceFrostColor, iceFactor * 0.55);
      } else if (sample.zone === 'Mineral Deposit Zone') {
        // Basaltic mare minerals
        vertexColor.lerp(mineralOreColor, 0.45);
      } else if (y < -2.2) {
        // Shadowed deep crater basins
        vertexColor.lerp(craterDeepShadowColor, 0.65);
      } else if (y > 1.0) {
        // Highland ejecta ridges catching sunlight
        vertexColor.lerp(highlandAnorthositeColor, 0.45);
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Scattered Natural Lunar Boulders & Rocks (InstancedMesh)
  const { boulderGeo, boulderMat, boulderInstances } = useMemo(() => {
    // Irregular dodecahedron rock geometry
    const bGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const bPos = bGeo.attributes.position;
    // Jitter vertices for natural irregular rock shape
    for (let i = 0; i < bPos.count; i++) {
      const vx = bPos.getX(i);
      const vy = bPos.getY(i);
      const vz = bPos.getZ(i);
      const factor = 1.0 + (Math.sin(vx * 7 + vy * 3) * 0.18 + Math.cos(vz * 5) * 0.12);
      bPos.setXYZ(i, vx * factor, vy * factor, vz * factor);
    }
    bGeo.computeVertexNormals();

    const bMat = new THREE.MeshStandardMaterial({
      color: '#606c7a',
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true,
    });

    // Generate ~140 boulder placements clustered along crater rims and ridges
    const instances: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    let randSeed = 991823;
    const pseudoRnd = () => {
      randSeed = (randSeed * 48271) % 2147483647;
      return (randSeed - 1) / 2147483646;
    };

    // A. Boulders along crater rims
    for (const c of LUNAR_CRATERS) {
      const rockCount = 12 + Math.floor(pseudoRnd() * 8);
      for (let j = 0; j < rockCount; j++) {
        const angle = pseudoRnd() * Math.PI * 2;
        const dist = c.r * (0.95 + pseudoRnd() * 0.35); // Along and just outside the rim
        const rx = c.x + Math.cos(angle) * dist;
        const rz = c.z + Math.sin(angle) * dist;

        // Skip if inside central base or close to obstacles
        if (Math.hypot(rx, rz) < 18) continue;

        const ry = getTerrainHeight(rx, rz);
        const scale = 0.3 + pseudoRnd() * 0.9; // 0.3m to 1.2m
        dummy.position.set(rx, ry + scale * 0.45, rz);
        dummy.rotation.set(pseudoRnd() * Math.PI, pseudoRnd() * Math.PI, pseudoRnd() * Math.PI);
        dummy.scale.set(scale, scale * (0.7 + pseudoRnd() * 0.5), scale);
        dummy.updateMatrix();
        instances.push(dummy.matrix.clone());
      }
    }

    // B. General scattered regolith stones across outer terrain
    for (let k = 0; k < 60; k++) {
      const rx = (pseudoRnd() - 0.5) * 125;
      const rz = (pseudoRnd() - 0.5) * 125;

      // Keep base operational center clean
      if (Math.hypot(rx, rz) < 22) continue;

      // Check collision with base obstacles
      let tooClose = false;
      for (const obs of BASE_OBSTACLES) {
        if (Math.hypot(rx - obs.x, rz - obs.z) < 5) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const ry = getTerrainHeight(rx, rz);
      const scale = 0.2 + pseudoRnd() * 0.7; // Smaller rocks
      dummy.position.set(rx, ry + scale * 0.4, rz);
      dummy.rotation.set(pseudoRnd() * Math.PI, pseudoRnd() * Math.PI, pseudoRnd() * Math.PI);
      dummy.scale.set(scale, scale * (0.8 + pseudoRnd() * 0.4), scale);
      dummy.updateMatrix();
      instances.push(dummy.matrix.clone());
    }

    return { boulderGeo: bGeo, boulderMat: bMat, boulderInstances: instances };
  }, []);

  // 4. Distant Horizon Mountain Peaks (Simulating Malapert Mountain & Shackleton Rim)
  const mountainGeo = useMemo(() => {
    const segments = 48;
    const radius = 95;
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];

    const peakColor = new THREE.Color('#788698');
    const baseColor = new THREE.Color('#141b25');

    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;

      // Procedural height profile with peaks and saddles
      const h1 = 6 + Math.sin(a1 * 3) * 4 + Math.cos(a1 * 7) * 2.5 + Math.sin(a1 * 11) * 1.5;
      const h2 = 6 + Math.sin(a2 * 3) * 4 + Math.cos(a2 * 7) * 2.5 + Math.sin(a2 * 11) * 1.5;

      const x1 = Math.cos(a1) * radius;
      const z1 = Math.sin(a1) * radius;
      const x2 = Math.cos(a2) * radius;
      const z2 = Math.sin(a2) * radius;

      const baseY = -2;

      // Triangle 1 (base1, peak1, base2)
      vertices.push(x1, baseY, z1, x1, h1, z1, x2, baseY, z2);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
      colors.push(peakColor.r, peakColor.g, peakColor.b);
      colors.push(baseColor.r, baseColor.g, baseColor.b);

      // Triangle 2 (base2, peak1, peak2)
      vertices.push(x2, baseY, z2, x1, h1, z1, x2, h2, z2);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
      colors.push(peakColor.r, peakColor.g, peakColor.b);
      colors.push(peakColor.r, peakColor.g, peakColor.b);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Main Height-Displaced Lunar South Pole Regolith Surface */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial
          vertexColors
          map={albedo}
          bumpMap={bump}
          bumpScale={0.06}
          roughness={0.92}
          metalness={0.08}
          flatShading={false}
        />
      </mesh>

      {/* Instanced Lunar Boulders along crater rims and plains */}
      <instancedMesh
        args={[boulderGeo, boulderMat, boulderInstances.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          for (let i = 0; i < boulderInstances.length; i++) {
            self.setMatrixAt(i, boulderInstances[i]);
          }
          self.instanceMatrix.needsUpdate = true;
        }}
      />

      {/* Distant Lunar Mountain Rim on Horizon */}
      <mesh geometry={mountainGeo}>
        <meshStandardMaterial
          vertexColors
          roughness={0.95}
          metalness={0.05}
          flatShading={true}
        />
      </mesh>
    </group>
  );
};
