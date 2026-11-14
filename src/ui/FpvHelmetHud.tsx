/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/FpvHelmetHud.tsx
 * Authentically styled Extravehicular Helmet Visor HUD for First-Person View:
 * - Subtle curved visor vignette and optical glass reflections.
 * - Dynamic breath fogging cycle.
 * - Live compass bearing tape and cardinal direction indicator.
 * - Real-time suit life support telemetry with SVG icons (zero emojis).
 * - Contextual [E] physical interaction prompts when approaching modules.
 * - Smooth camera mode switcher and one-click/hotkey [ESC] exit.
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/store.ts';
import { BUILDING_FOOTPRINTS } from '../game3d/Physics/NavigationMesh.ts';
import {
  Wind,
  Zap,
  HeartPulse,
  Radiation,
  Compass,
  Camera,
  ScanEye,
} from './icons.tsx';

export const FpvHelmetHud: React.FC = () => {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const fpvControlMode = useGameStore((s) => s.fpvControlMode);
  const fpvHelmetHudVisible = useGameStore((s) => s.fpvHelmetHudVisible);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const state = useGameStore((s) => s.state);
  const playerPos = useGameStore((s) => s.astronautPositions[activePlayerCrew]);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const setFpvControlMode = useGameStore((s) => s.setFpvControlMode);
  const setFpvHelmetHudVisible = useGameStore((s) => s.setFpvHelmetHudVisible);
  const setActiveNavTab = useGameStore((s) => s.setActiveNavTab);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);

  const [breathPhase, setBreathPhase] = useState(0);

  // Animate gentle breath fogging cycle (approx 14 breaths per min)
  useEffect(() => {
    if (cameraMode !== 'first_person') return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [cameraMode]);

  // Keyboard shortcut listener for FPV hotkeys:
  // - V: cycle camera mode
  // - H: toggle helmet HUD
  // - Tab: open crew panel
  // - E: interact with nearby building
  useEffect(() => {
    if (cameraMode !== 'first_person') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setFpvHelmetHudVisible(!fpvHelmetHudVisible);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveNavTab('astronauts');
        if (document.exitPointerLock) document.exitPointerLock();
      } else if (e.key === 'e' || e.key === 'E') {
        // Trigger interaction with closest building if within range
        if (playerPos) {
          for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
            const dist = Math.hypot(playerPos.x - fp.center.x, playerPos.z - fp.center.z);
            if (dist <= 5.0) {
              openTaskMenu(fp.id);
              if (document.exitPointerLock) document.exitPointerLock();
              break;
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraMode, fpvHelmetHudVisible, setFpvHelmetHudVisible, setActiveNavTab, openTaskMenu, playerPos]);

  if (cameraMode !== 'first_person' || !fpvHelmetHudVisible) return null;

  const crew = state.crew[activePlayerCrew];
  const suitOxygen = Math.min(100, Math.max(0, Math.round(state.resources.oxygen)));
  const suitBattery = Math.min(100, Math.max(0, Math.round(state.resources.battery)));
  const radiationDose = Math.round(crew.exposure);
  const breathFogOpacity = 0.07 + Math.max(0, Math.sin(breathPhase)) * 0.11;

  // Calculate compass heading & cardinal direction from astronaut rotation
  const rotRad = playerPos?.rotation ?? 0;
  const rawDeg = ((-rotRad * 180) / Math.PI) % 360;
  const headingDeg = (Math.round(rawDeg) + 360) % 360;

  const getCardinal = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'N';
    if (deg >= 22.5 && deg < 67.5) return 'NE';
    if (deg >= 67.5 && deg < 112.5) return 'E';
    if (deg >= 112.5 && deg < 157.5) return 'SE';
    if (deg >= 157.5 && deg < 202.5) return 'S';
    if (deg >= 202.5 && deg < 247.5) return 'SW';
    if (deg >= 247.5 && deg < 292.5) return 'W';
    return 'NW';
  };
  const cardinal = getCardinal(headingDeg);

  // Proximity check for interaction prompt
  let nearbyPrompt = '';
  let nearbyDist = 0;
  if (playerPos) {
    for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
      const dist = Math.hypot(playerPos.x - fp.center.x, playerPos.z - fp.center.z);
      if (dist <= 5.0) {
        nearbyPrompt = `PRESS [E] TO ACCESS ${fp.name.toUpperCase()}`;
        nearbyDist = Math.round(dist * 10) / 10;
        break;
      }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 font-mono text-[#E6F1F5] overflow-hidden">
      {/* 1. Curved Helmet Visor Vignette (Glass Border Overlay) */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 140px rgba(4, 12, 22, 0.9), inset 0 0 50px rgba(37, 197, 244, 0.15)',
          background: 'radial-gradient(ellipse at center, transparent 62%, rgba(5, 14, 25, 0.65) 100%)',
        }}
      />

      {/* 2. Soft Visor Breath Fogging at bottom edges */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 transition-opacity duration-300"
        style={{
          opacity: breathFogOpacity,
          background:
            'radial-gradient(ellipse at 50% 120%, rgba(210, 235, 255, 0.45) 0%, rgba(190, 225, 250, 0.2) 45%, transparent 75%)',
        }}
      />

      {/* 3. Subtle Glass Scratch / Solar Reflection Sheen */}
      <div
        className="absolute top-0 right-0 w-2/5 h-2/5 opacity-15 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%)',
        }}
      />

      {/* Visor Corner Bracket Markers */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#25C5F4]/40" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#25C5F4]/40" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#25C5F4]/40" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#25C5F4]/40" />

      {/* 4. Top Telemetry Banner & Compass */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center text-xs">
        {/* Left: Suit Life Support Metrics */}
        <div className="flex items-center gap-3.5 p-2 rounded bg-[#080F1B]/90 border border-[#25C5F4]/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-[#25C5F4]" />
            <span className="text-[#8FA6B2] text-[10px]">O₂:</span>
            <span className={`font-bold ${suitOxygen < 25 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {suitOxygen}%
            </span>
          </div>
          <div className="w-[1px] h-3.5 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FFB020]" />
            <span className="text-[#8FA6B2] text-[10px]">PWR:</span>
            <span className="font-bold text-white">{suitBattery}%</span>
          </div>
          <div className="w-[1px] h-3.5 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[#8FA6B2] text-[10px]">VIT:</span>
            <span className="font-bold text-white">{crew.health}%</span>
          </div>
          <div className="w-[1px] h-3.5 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <Radiation className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="text-[#8FA6B2] text-[10px]">RAD:</span>
            <span className="font-bold text-white">{radiationDose} µSv</span>
          </div>
        </div>

        {/* Center: Visor Heading Compass Tape */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#080F1B]/90 border border-[#25C5F4]/40 backdrop-blur-md text-[11px] font-bold text-[#25C5F4] shadow-lg">
            <Compass className="w-3.5 h-3.5" />
            <span>HDG {headingDeg.toString().padStart(3, '0')}°</span>
            <span className="text-white px-1.5 py-0.2 rounded bg-[#152235] text-[10px]">{cardinal}</span>
          </div>
          <div className="text-[9px] text-[#8FA6B2] tracking-widest mt-0.5">EVA VISOR • SOUTH POLE OUTPOST</div>
        </div>

        {/* Right: Camera Mode Controls & Exit Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setFpvControlMode(fpvControlMode === 'watch' ? 'manual' : 'watch')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              fpvControlMode === 'manual'
                ? 'bg-[#25C5F4] text-[#050A14] border-[#25C5F4]'
                : 'bg-[#080F1B]/90 text-[#8FA6B2] border-[#26374D] hover:text-white'
            }`}
          >
            {fpvControlMode === 'manual' ? 'MANUAL WALK' : 'WATCH AI'}
          </button>
          <button
            onClick={() => cycleCameraMode()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#080F1B]/90 hover:bg-[#152235] border border-[#25C5F4]/40 text-[#25C5F4] text-[10px] font-bold cursor-pointer transition-colors"
            title="Cycle Camera View (V)"
          >
            <Camera className="w-3 h-3" />
            <span>CAM [V]</span>
          </button>
          <button
            onClick={() => {
              setCameraMode('commander');
              if (document.exitPointerLock) document.exitPointerLock();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/40 border border-[#EF4444]/60 text-red-300 text-[10px] font-bold cursor-pointer transition-colors"
            title="Exit Helmet View (Esc)"
          >
            <ScanEye className="w-3 h-3" />
            <span>EXIT [ESC]</span>
          </button>
        </div>
      </div>

      {/* 5. Center Reticle & Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-8 h-8 flex items-center justify-center opacity-75">
          <div className="w-1.5 h-1.5 rounded-full bg-[#25C5F4]" />
          <div className="absolute w-6 h-6 border border-[#25C5F4]/40 rounded-full" />
          <div className="absolute w-2 h-[1px] -left-2 bg-[#25C5F4]/50" />
          <div className="absolute w-2 h-[1px] -right-2 bg-[#25C5F4]/50" />
          <div className="absolute h-2 w-[1px] -top-2 bg-[#25C5F4]/50" />
          <div className="absolute h-2 w-[1px] -bottom-2 bg-[#25C5F4]/50" />
        </div>
      </div>

      {/* 6. Contextual Interaction Prompt */}
      {nearbyPrompt && (
        <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center pointer-events-auto">
          <div className="px-5 py-2 rounded-lg bg-[#080F1B]/95 border-2 border-[#25C5F4] text-[#25C5F4] font-bold tracking-wider text-xs shadow-[0_0_20px_rgba(37,197,244,0.4)] animate-bounce flex items-center gap-2">
            <span>{nearbyPrompt}</span>
            <span className="text-[10px] text-white/70">({nearbyDist}m)</span>
          </div>
        </div>
      )}

      {/* 7. Bottom Status & Task Progress */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-xs">
        {/* Left: Active Task Status */}
        <div className="p-2.5 rounded bg-[#080F1B]/90 border border-[#26374D] max-w-sm backdrop-blur-md">
          <div className="text-[10px] text-[#8FA6B2] uppercase tracking-wider mb-0.5">CURRENT DIRECTIVE:</div>
          <div className="text-white font-bold text-[11px] truncate">
            {crew.currentTask?.type ? `ACTIVE: ${crew.currentTask.type.toUpperCase()}` : 'IDLE / FREE ROAM'}
          </div>
          <div className="text-[10px] text-[#25C5F4] mt-0.5">{crew.currentActivity || 'Stationed on surface'}</div>
        </div>

        {/* Right: Controls Reminder */}
        <div className="text-right text-[10px] text-[#8FA6B2] space-y-0.5 bg-[#080F1B]/70 p-2 rounded border border-[#26374D]/40 backdrop-blur-sm">
          <div>[WASD] MOVE • [SHIFT] SPRINT • [E] INTERACT</div>
          <div>[V] CHANGE CAMERA • [TAB] CREW • [H] TOGGLE HUD</div>
          <div>[CLICK] LOCK MOUSE • [ESC] EXIT HELMET VIEW</div>
        </div>
      </div>
    </div>
  );
};
