/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/FpvHelmetHud.tsx
 * Authentically styled Extravehicular Helmet Visor HUD for First-Person View.
 * Displays suit oxygen, battery power, thermal regulation, radiation dose,
 * active mission tasks, dynamic breath fogging, and contextual [E] prompts.
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/store.ts';
import { BUILDING_FOOTPRINTS } from '../game3d/Physics/NavigationMesh.ts';

export const FpvHelmetHud: React.FC = () => {
  const cameraMode = useGameStore((s) => s.cameraMode);
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
  const breathFogOpacity = 0.08 + Math.max(0, Math.sin(breathPhase)) * 0.12;

  // Proximity check for interaction prompt
  let nearbyPrompt = '';
  if (playerPos) {
    for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
      const dist = Math.hypot(playerPos.x - fp.center.x, playerPos.z - fp.center.z);
      if (dist <= 5.0) {
        nearbyPrompt = `PRESS [E] TO ACCESS ${fp.name.toUpperCase()}`;
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
          boxShadow: 'inset 0 0 120px rgba(5, 15, 25, 0.85), inset 0 0 45px rgba(46, 196, 214, 0.18)',
          background: 'radial-gradient(ellipse at center, transparent 65%, rgba(6, 18, 30, 0.6) 100%)',
        }}
      />

      {/* 2. Soft Visor Breath Fogging at bottom edges */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 transition-opacity duration-300"
        style={{
          opacity: breathFogOpacity,
          background:
            'radial-gradient(ellipse at 50% 120%, rgba(220, 240, 255, 0.55) 0%, rgba(200, 230, 250, 0.25) 45%, transparent 75%)',
        }}
      />

      {/* 3. Subtle Glass Scratch / Solar Reflection Sheen */}
      <div
        className="absolute top-0 right-0 w-2/5 h-2/5 opacity-15"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />

      {/* 4. Top Telemetry Banner */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center text-xs">
        {/* Left: Suit Life Support Metrics */}
        <div className="flex gap-4 p-2.5 rounded bg-[#080F1B]/80 border border-[#2EC4D6]/40 backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[#2EC4D6]">O₂ SUIT:</span>
            <span className={`font-bold ${suitOxygen < 25 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {suitOxygen}%
            </span>
          </div>
          <div className="w-[1px] h-4 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#FFB020]">PWR:</span>
            <span className="font-bold text-white">{suitBattery}%</span>
          </div>
          <div className="w-[1px] h-4 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#38BDF8]">TEMP:</span>
            <span className="font-bold text-white">21°C</span>
          </div>
          <div className="w-[1px] h-4 bg-[#26374D]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#EF4444]">RAD:</span>
            <span className="font-bold text-white">{radiationDose} µSv/h</span>
          </div>
        </div>

        {/* Center: Mission Clock & Camera Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setFpvControlMode(fpvControlMode === 'watch' ? 'manual' : 'watch')}
            className={`px-3 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
              fpvControlMode === 'manual'
                ? 'bg-[#2EC4D6] text-[#050A14] border-[#2EC4D6]'
                : 'bg-[#080F1B]/80 text-[#8FA6B2] border-[#26374D]'
            }`}
          >
            {fpvControlMode === 'manual' ? 'MANUAL WALK MODE' : 'WATCH AI MODE'}
          </button>
          <button
            onClick={() => cycleCameraMode()}
            className="px-2.5 py-1 rounded bg-[#080F1B]/80 hover:bg-[#1A2636] border border-[#2EC4D6]/40 text-[#2EC4D6] text-[11px] font-bold cursor-pointer"
          >
            CAM [V]
          </button>
        </div>

        {/* Right: Active Astronaut Telemetry */}
        <div className="p-2.5 rounded bg-[#080F1B]/80 border border-[#2EC4D6]/40 backdrop-blur-sm text-right">
          <div className="font-bold text-white text-[11px]">
            {crew.name.toUpperCase()} <span className="text-[#2EC4D6]">[{activePlayerCrew.toUpperCase()}]</span>
          </div>
          <div className="text-[10px] text-[#8FA6B2]">
            HEALTH: <span className="text-white">{crew.health}%</span> • STAMINA:{' '}
            <span className="text-[#FFB020]">{crew.stamina}/8</span>
          </div>
        </div>
      </div>

      {/* 5. Center Reticle & Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-6 h-6 flex items-center justify-center opacity-70">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2EC4D6]" />
          <div className="absolute w-5 h-5 border border-[#2EC4D6]/40 rounded-full" />
        </div>
      </div>

      {/* 6. Contextual Interaction Prompt */}
      {nearbyPrompt && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
          <div className="px-5 py-2 rounded-lg bg-[#080F1B]/95 border-2 border-[#2EC4D6] text-[#2EC4D6] font-bold tracking-wider text-xs shadow-[0_0_20px_rgba(46,196,214,0.4)] animate-bounce pointer-events-auto">
            {nearbyPrompt}
          </div>
        </div>
      )}

      {/* 7. Bottom Status & Task Progress */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-xs">
        {/* Left: Active Task Status */}
        <div className="p-2.5 rounded bg-[#080F1B]/80 border border-[#26374D] max-w-sm">
          <div className="text-[10px] text-[#8FA6B2] uppercase tracking-wider mb-0.5">CURRENT DIRECTIVE:</div>
          <div className="text-white font-bold text-[11px] truncate">
            {crew.currentTask?.type ? `ACTIVE: ${crew.currentTask.type.toUpperCase()}` : 'IDLE / FREE ROAM'}
          </div>
          <div className="text-[10px] text-[#2EC4D6] mt-0.5">{crew.currentActivity || 'Stationed on surface'}</div>
        </div>

        {/* Right: Controls Reminder */}
        <div className="text-right text-[10px] text-[#8FA6B2] space-y-0.5">
          <div>[WASD] MOVE • [SHIFT] SPRINT • [E] INTERACT</div>
          <div>[V] CHANGE CAMERA • [TAB] CREW • [H] TOGGLE HUD</div>
          <div>[ALT] UNLOCK MOUSE • [ESC] PAUSE</div>
        </div>
      </div>
    </div>
  );
};
