/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/MissionBar.tsx
 * Professional NASA-inspired Mission Control Top Bar (Area A).
 * Compact, unified layout with Mission Identification, Timeline, Simulation Speed, and Utility Actions.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';

export const MissionBar: React.FC = () => {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const setModal = useGameStore((s) => s.setModal);
  const setTutorialStep = useGameStore((s) => s.setTutorialStep);

  const { mission } = state;
  const progressPercent = Math.min(100, Math.round(((mission.day - 1 + mission.tick / 24) / 30) * 100));

  return (
    <header className="h-12 bg-[#080F1B]/95 border-b border-[#26374D] px-4 flex items-center justify-between select-none z-30 backdrop-blur-md shadow-lg pointer-events-auto">
      {/* Left: Brand, Location & Mission ID */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#101A29] border border-[#25C5F4]/40 flex items-center justify-center shadow-[0_0_8px_rgba(37,197,244,0.15)]">
            <span className="text-xs font-black text-[#25C5F4] tracking-tight">LF</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-black tracking-wider text-[#F1F5F9] uppercase">
                Lunar Frontier
              </span>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#101A29] text-[#25C5F4] border border-[#25C5F4]/30 uppercase font-semibold">
                EXP-30
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 leading-none">
              Lunar South Pole • Shackleton Rim
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#26374D] hidden md:block mx-1" />

        {/* Center-Left: Mission Timeline & Clock */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[#101A29] border border-[#26374D] rounded-lg px-2.5 py-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] uppercase font-bold text-[#25C5F4] tracking-wider">DAY</span>
            <span className="text-xs font-black font-mono text-[#F1F5F9]">{mission.day}</span>
            <span className="text-[10px] font-mono text-[#94A3B8]">/ 30</span>
          </div>
          <div className="h-3.5 w-px bg-[#26374D]" />
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[#F1F5F9] font-semibold">{String(mission.tick).padStart(2, '0')}:00</span>
            <span className="text-[9px] text-[#94A3B8]">LT</span>
          </div>
          <div className="h-3.5 w-px bg-[#26374D]" />
          {/* Subtle Progress Bar */}
          <div className="flex items-center gap-1.5 w-20">
            <div className="flex-1 h-1 bg-[#152235] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#25C5F4] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#94A3B8]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Center-Right: Simulation Controls (Speed & Pause) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#101A29] p-0.5 rounded-lg border border-[#26374D]">
          <button
            onClick={() => dispatch(mission.isPaused ? { type: 'RESUME' } : { type: 'PAUSE' })}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mission.isPaused
                ? 'bg-[#F59E0B] text-[#080F1B] shadow font-black'
                : 'bg-[#152235] text-[#F1F5F9] hover:bg-[#26374D]'
            }`}
            title="Pause / Resume Clock (Spacebar)"
          >
            <span>{mission.isPaused ? '▶' : '⏸'}</span>
            <span className="text-[10px] tracking-wider">{mission.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <div className="h-4 w-px bg-[#26374D] mx-0.5" />

          {( [1, 2, 4] as const ).map((s) => {
            const isCur = !mission.isPaused && mission.speed === s;
            return (
              <button
                key={s}
                onClick={() => dispatch({ type: 'SET_SPEED', speed: s })}
                className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-all cursor-pointer ${
                  isCur
                    ? 'bg-[#25C5F4] text-[#080F1B] font-black'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#152235]'
                }`}
                title={`Simulation Speed ${s}x`}
              >
                {s}×
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-[#26374D] hidden md:block mx-1" />

        {/* Right: Utility & Documentation Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTutorialStep(0)}
            className="px-2 py-1 rounded-md bg-[#101A29] border border-[#26374D] hover:border-[#25C5F4] text-[#94A3B8] hover:text-[#25C5F4] text-[11px] font-semibold transition-colors cursor-pointer"
            title="Interactive Tutorial"
          >
            Tutorial
          </button>

          <button
            onClick={() => setModal('manual')}
            className="px-2.5 py-1 rounded-md bg-[#152235] border border-[#25C5F4]/40 text-[#25C5F4] hover:bg-[#25C5F4] hover:text-[#080F1B] text-[11px] font-bold transition-all shadow-sm cursor-pointer"
            title="Player Manual & Scientific Mission Handbook"
          >
            Manual
          </button>

          <button
            onClick={() => setModal('save_load')}
            className="px-2 py-1 rounded-md bg-[#101A29] border border-[#26374D] hover:border-[#25C5F4] text-[#94A3B8] hover:text-[#F1F5F9] text-[11px] font-semibold transition-colors cursor-pointer"
            title="Save / Load Game"
          >
            Save/Load
          </button>

          <button
            onClick={() => setModal('datasources')}
            className="px-2 py-1 rounded-md bg-[#101A29] border border-[#26374D] hover:border-[#25C5F4] text-[#94A3B8] hover:text-[#F1F5F9] text-[11px] font-semibold transition-colors cursor-pointer"
            title="NASA DONKI & OSDR Open Data Attribution"
          >
            NASA Data
          </button>

          <button
            onClick={() => setModal('settings')}
            className="w-7 h-7 rounded-md bg-[#101A29] border border-[#26374D] hover:border-[#25C5F4] text-[#94A3B8] hover:text-[#F1F5F9] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Mission Settings & Preferences"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
};
