/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/CameraRig.tsx
 * Multi-Mode Camera Rig:
 * 1. Commander View: Strategic orbit and overview controls.
 * 2. Follow View: Third-person chase camera with wall collision avoidance.
 * 3. First-Person View (FPV): Eye-level helmet camera with Pointer Lock API,
 *    clamped pitch (+-85 deg), sensitivity, invert-Y, and head bob.
 */

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { eventBus } from '../store/bus.ts';
import { BUILDING_COORDINATES } from '../sim/rules/crew.ts';
import { useGameStore } from '../store/store.ts';
import { resolveCameraCollision } from './Physics/NavigationMesh.ts';
import { getTerrainHeight } from './Physics/TerrainHeight.ts';

export const CameraRig: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();

  const cameraMode = useGameStore((s) => s.cameraMode);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const astronautPositions = useGameStore((s) => s.astronautPositions);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const cameraFov = useGameStore((s) => s.cameraFov);
  const mouseSensitivity = useGameStore((s) => s.mouseSensitivity);
  const invertY = useGameStore((s) => s.invertY);
  const fpvHeadBob = useGameStore((s) => s.fpvHeadBob);
  const setPointerLocked = useGameStore((s) => s.setPointerLocked);
  const activeModal = useGameStore((s) => s.activeModal);

  // First-person mouse look state
  const yaw = useRef(0);
  const pitch = useRef(0);
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 0));
  const headBobTimer = useRef(0);

  // Set camera FOV & near plane
  useEffect(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = camera as THREE.PerspectiveCamera;
      pCam.fov = cameraFov;
      pCam.near = 0.05;
      pCam.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  // Pointer Lock handling for First-Person View
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas;
      setPointerLocked(isLocked);
    };

    const handleCanvasClick = () => {
      if (cameraMode === 'first_person' && activeModal === 'none') {
        canvas.requestPointerLock?.();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas || cameraMode !== 'first_person') return;

      const sens = mouseSensitivity * 0.0022;
      yaw.current -= e.movementX * sens;

      const pitchDelta = e.movementY * sens * (invertY ? -1 : 1);
      pitch.current -= pitchDelta;

      // Clamp pitch to +-85 degrees
      const maxPitch = THREE.MathUtils.degToRad(85);
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cameraMode, activeModal, gl, mouseSensitivity, invertY, setPointerLocked]);

  // Focus event listeners
  useEffect(() => {
    const unsubFocus = eventBus.on('camera:focus', ({ buildingId, crewId }) => {
      if (buildingId) {
        const coords = BUILDING_COORDINATES[buildingId];
        targetLookAt.current.set(coords.x, 1.2, coords.z);
      } else if (crewId) {
        const pos = useGameStore.getState().astronautPositions[crewId];
        if (pos) targetLookAt.current.set(pos.x, 1.2, pos.z);
      }
    });

    return () => unsubFocus();
  }, []);

  useFrame((state, delta) => {
    const astronaut = astronautPositions[activePlayerCrew] || { x: 0, z: 0, rotation: 0 };
    const groundY = astronaut.y ?? getTerrainHeight(astronaut.x, astronaut.z);

    if (cameraMode === 'commander') {
      // 1. Commander View: Smooth orbit controls following target
      if (controlsRef.current) {
        targetLookAt.current.set(astronaut.x, groundY + 1.2, astronaut.z);
        if (reducedMotion) {
          controlsRef.current.target.copy(targetLookAt.current);
        } else {
          controlsRef.current.target.lerp(targetLookAt.current, 0.12);
        }
        controlsRef.current.update();
      }
    } else if (cameraMode === 'follow') {
      // 2. Follow View: Third-person chase camera positioned behind astronaut
      const rot = astronaut.rotation;
      const desiredPos = new THREE.Vector3(
        astronaut.x - Math.sin(rot) * 3.4,
        groundY + 1.8,
        astronaut.z - Math.cos(rot) * 3.4
      );

      // Camera collision resolution
      const safeCamPos = resolveCameraCollision(
        { x: astronaut.x, y: groundY + 1.5, z: astronaut.z },
        desiredPos
      );

      camera.position.lerp(new THREE.Vector3(safeCamPos.x, safeCamPos.y, safeCamPos.z), 0.15);
      camera.lookAt(astronaut.x, groundY + 1.4, astronaut.z);
    } else if (cameraMode === 'first_person') {
      // 3. First-Person View (FPV): Eye-level helmet camera (1.6m above feet)
      let bobOffset = 0;
      let swayOffset = 0;

      if (fpvHeadBob && !reducedMotion) {
        headBobTimer.current += delta * 8;
        bobOffset = Math.sin(headBobTimer.current) * 0.025;
        // Subtle breathing sway
        swayOffset = Math.cos(state.clock.getElapsedTime() * 1.5) * 0.008;
      }

      const eyeY = groundY + 1.6 + bobOffset + swayOffset;
      camera.position.set(astronaut.x, eyeY, astronaut.z);

      // Apply mouse-look rotation
      const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    }
  });

  return cameraMode === 'commander' ? (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={3.5}
      maxDistance={35}
      minPolarAngle={THREE.MathUtils.degToRad(15)}
      maxPolarAngle={THREE.MathUtils.degToRad(78)}
    />
  ) : null;
};
