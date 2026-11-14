/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/PauseMenu/PauseMenu.tsx
 * Professional pause menu matching Start Menu visual language:
 * - Freezes simulation ticks and ducks audio.
 * - Releases pointer lock in FPV and restores it upon resume.
 * - Left stacked action buttons with chamfered design.
 * - Right status card with real-time resource telemetry and crew vital bars.
 */

import React, { useState, useEffect } from 'react';
import { THEME, chamferedBtnStyle } from '../theme.ts';
import { ControlsModal } from './ControlsModal.tsx';
import { useGameStore } from '../../store/store.ts';
import { eventBus } from '../../store/bus.ts';

export const PauseMenu: React.FC = () => {
  const [showControls, setShowControls] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const setAppPhase = useGameStore((s) => s.setAppPhase);
  const setActiveNavTab = useGameStore((s) => s.setActiveNavTab);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setPointerLocked = useGameStore((s) => s.setPointerLocked);

  const isVisible = activeModal === 'pause';

  // Release pointer lock when pause menu opens
  useEffect(() => {
    if (isVisible) {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      setPointerLocked(false);
    }
  }, [isVisible, setPointerLocked]);

  if (!isVisible) return null;

  const handleResume = () => {
    eventBus.emit('sound:play', { name: 'click' });
    dispatch({ type: 'RESUME' });
    setModal('none');
    // If returning to first person view, re-request pointer lock
    if (cameraMode === 'first_person') {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        canvasEl.requestPointerLock?.();
        setPointerLocked(true);
      }
    }
  };

  const handleSaveMission = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('save_load');
  };

  const handleLoadMission = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('save_load');
  };

  const handleObjectives = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('none');
    dispatch({ type: 'RESUME' });
    setActiveNavTab('objectives');
  };

  const handleOptions = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('settings');
  };

  const handleMainMenu = () => {
    eventBus.emit('sound:play', { name: 'click' });
    if (window.confirm('Return to Main Menu? Any unsaved progress will be lost.')) {
      setModal('none');
      setAppPhase('start_menu');
    }
  };

  const handleQuit = () => {
    eventBus.emit('sound:play', { name: 'click' });
    if (window.confirm('Quit Lunar Frontier: The Last 30 Days?')) {
      window.close();
    }
  };

  const pauseButtons = [
    { label: 'RESUME', action: handleResume },
    { label: 'SAVE MISSION', action: handleSaveMission },
    { label: 'LOAD MISSION', action: handleLoadMission },
    { label: 'OBJECTIVES', action: handleObjectives },
    { label: 'OPTIONS', action: handleOptions },
    { label: 'CONTROLS', action: () => setShowControls(true) },
    { label: 'MAIN MENU', action: handleMainMenu },
    { label: 'QUIT', action: handleQuit },
  ];

  // Format mission time (24 ticks per day, 1 hour per tick)
  const hour = String(state.mission.tick).padStart(2, '0');
  const minute = '00';

  // Calculate days of water/food remaining
  const waterRate = 4 * 0.125 * 24; // ~12L/day
  const waterDays = waterRate > 0 ? (state.resources.water / waterRate).toFixed(1) : '99';
  const foodRate = 4 * 0.0416 * 24; // ~4 rations/day
  const foodDays = foodRate > 0 ? (state.resources.food / foodRate).toFixed(1) : '99';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050A14]/85 backdrop-blur-md p-6 md:p-12 animate-fade-in select-none">
      <div className="w-full max-w-5xl flex flex-col justify-between h-full max-h-[85vh]">
        {/* TOP: Header Title */}
        <div className="border-b border-[#26374D] pb-3 mb-6 flex items-end justify-between">
          <div>
            <h1
              className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-[#E6F1F5]"
              style={{ fontFamily: THEME.fonts.title, textShadow: '0 0 20px rgba(46,196,214,0.4)' }}
            >
              MISSION PAUSED
            </h1>
            <p className="text-xs md:text-sm tracking-[0.25em] text-[#2EC4D6] font-mono mt-1">
              DAY {state.mission.day} OF 30 • {hour}:{minute} UTC • SOUTH POLE OUTPOST
            </p>
          </div>
          <div className="hidden sm:block text-right font-mono text-xs text-[#8FA6B2]">
            SEED: <span className="text-white">#{state.mission.seed}</span> • DIFFICULTY:{' '}
            <span className="text-[#FFB020] uppercase">{state.mission.difficulty}</span>
          </div>
        </div>

        {/* MIDDLE: Left Buttons & Right Read-Only Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start overflow-y-auto">
          {/* Left Buttons Stack (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-2.5">
            {pauseButtons.map((btn, idx) => {
              const isFocused = focusedIndex === idx;
              return (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  onMouseEnter={() => {
                    setFocusedIndex(idx);
                    eventBus.emit('sound:play', { name: 'click' });
                  }}
                  className={`${chamferedBtnStyle} ${
                    isFocused ? 'ring-2 ring-[#2EC4D6] ring-offset-1 ring-offset-[#050A14] translate-x-1.5' : ''
                  }`}
                  style={{ clipPath: THEME.clipPaths.chamferedBtn }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Right Status Card (7 cols) */}
          <div
            className="md:col-span-7 bg-[#0A1424]/90 border border-[#2EC4D6]/50 p-5 rounded-lg shadow-2xl font-mono text-xs space-y-4"
            style={{ clipPath: THEME.clipPaths.chamferedCard }}
          >
            {/* 1. Life Support & Power Reserves */}
            <div>
              <div className="text-[11px] font-bold text-[#2EC4D6] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📊</span> RESOURCE BUFFER & LIFE SUPPORT STATUS
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#080F1B] border border-[#1E2E42]">
                  <div className="flex justify-between text-[#8FA6B2]">
                    <span>BATTERY STORAGE:</span>
                    <span className="text-white font-bold">{Math.round(state.resources.battery)} / 100 kWh</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#152235] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#2EC4D6]"
                      style={{ width: `${Math.min(100, state.resources.battery)}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-[#080F1B] border border-[#1E2E42]">
                  <div className="flex justify-between text-[#8FA6B2]">
                    <span>OXYGEN BUFFER:</span>
                    <span className="text-white font-bold">{Math.round(state.resources.oxygen)} kg</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#152235] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E]"
                      style={{ width: `${Math.min(100, state.resources.oxygen)}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-[#080F1B] border border-[#1E2E42]">
                  <div className="flex justify-between text-[#8FA6B2]">
                    <span>WATER ({waterDays}d rem):</span>
                    <span className="text-white font-bold">{Math.round(state.resources.water)} L</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#152235] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8]"
                      style={{ width: `${Math.min(100, state.resources.water)}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-[#080F1B] border border-[#1E2E42]">
                  <div className="flex justify-between text-[#8FA6B2]">
                    <span>FOOD ({foodDays}d rem):</span>
                    <span className="text-white font-bold">{Math.round(state.resources.food)} rations</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#152235] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B]"
                      style={{ width: `${Math.min(100, state.resources.food)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Crew Vitals Summary */}
            <div>
              <div className="text-[11px] font-bold text-[#2EC4D6] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>👨‍🚀</span> EXPEDITION CREW VITALS
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(state.crew).map((c) => (
                  <div key={c.id} className="p-2 rounded bg-[#080F1B] border border-[#1E2E42]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-[11px]">{c.name}</span>
                      <span className="text-[9px] text-[#2EC4D6] uppercase">{c.location}</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-[#8FA6B2]">
                        <span>Health:</span>
                        <span className="text-white">{c.health}%</span>
                      </div>
                      <div className="flex justify-between text-[#8FA6B2]">
                        <span>Stamina:</span>
                        <span className="text-[#FFB020]">{c.stamina} / 8</span>
                      </div>
                      <div className="flex justify-between text-[#8FA6B2]">
                        <span>Task:</span>
                        <span className="text-[#22C55E] truncate max-w-[120px]">
                          {c.currentTask?.type ?? 'Idle'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Hardware & In-Situ Stocks */}
            <div className="p-2.5 rounded bg-[#080F1B] border border-[#1E2E42] flex justify-between items-center text-[11px]">
              <div>
                <span className="text-[#8FA6B2]">Spare Parts: </span>
                <span className="text-white font-bold">{state.resources.spareParts}</span>
              </div>
              <div>
                <span className="text-[#8FA6B2]">Raw Ice: </span>
                <span className="text-[#38BDF8] font-bold">{state.resources.rawIce || 0} kg</span>
              </div>
              <div>
                <span className="text-[#8FA6B2]">Regolith: </span>
                <span className="text-[#F59E0B] font-bold">{state.resources.rawRegolith || 0} kg</span>
              </div>
              <div>
                <span className="text-[#8FA6B2]">Science: </span>
                <span className="text-[#2EC4D6] font-bold">{state.resources.science || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Footer Hint */}
        <div className="border-t border-[#26374D] pt-3 flex justify-between items-center text-xs text-[#8FA6B2] font-mono">
          <span>PRESS [ESC] OR [P] TO RESUME</span>
          <span>SIMULATION DETERMINISTICALLY FROZEN</span>
        </div>
      </div>

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
};
