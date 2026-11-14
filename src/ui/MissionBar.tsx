/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/MissionBar.tsx
 * Top Mission Control bar: Mission Day, Lunar Time, Speeds, Save/Load, Manual, NASA Data, Settings.
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
    <header className="flex flex-wrap items-center justify-between gap-3 bg-[#080E19]/90 border-b border-[#293A50] px-4 py-2.5 backdrop-blur-md shadow-2xl select-none z-30">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#36C5F0] to-[#111C2D] flex items-center justify-center shadow-lg border border-[#36C5F0]/40">
            <span className="text-base font-black text-white">LF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-[#F4F7FC] uppercase">
                Lunar Frontier
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#36C5F0]/20 text-[#36C5F0] border border-[#36C5F0]/40 uppercase">
                {mission.siteId === 'mars' ? 'Mars Sol' : 'South Pole Base'}
              </span>
            </div>
            <div className="text-[10px] text-[#A7B4C8] font-mono">
              NASA Mission Simulator • 30-Day Expedition
            </div>
          </div>
        </div>

        <div className="h-7 w-px bg-[#293A50] hidden sm:block mx-1" />

        {/* Mission Day Counter & Lunar Clock */}
        <div className="flex items-center gap-2 bg-[#111C2D] border border-[#293A50] rounded-xl px-3 py-1">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#36C5F0]">
              Mission Timeline
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#F4F7FC]">
                DAY {mission.day}
              </span>
              <span className="text-xs text-[#A7B4C8] font-mono">/ 30</span>
            </div>
          </div>
          <div className="h-6 w-px bg-[#293A50]" />
          <div className="flex flex-col font-mono text-[11px] text-[#A7B4C8]">
            <span className="text-[#F4F7FC] font-bold">
              {String(mission.tick).padStart(2, '0')}:00 LT
            </span>
            <span className="text-[9px]">Tick {mission.totalTicks}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex flex-col w-28">
          <div className="flex justify-between text-[9px] text-[#A7B4C8] font-mono mb-0.5">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#111C2D] rounded-full border border-[#293A50] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#36C5F0] to-[#37D67A] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Speed & Pause Controls */}
      <div className="flex items-center gap-1.5 bg-[#111C2D] p-1 rounded-xl border border-[#293A50]">
        <button
          onClick={() => dispatch(mission.isPaused ? { type: 'RESUME' } : { type: 'PAUSE' })}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            mission.isPaused
              ? 'bg-[#F5B942] text-[#080E19] shadow-lg animate-pulse'
              : 'bg-[#17263A] text-[#F4F7FC] hover:bg-[#293A50]'
          }`}
          title="Pause / Resume Clock (Spacebar)"
        >
          <span>{mission.isPaused ? '▶' : '⏸'}</span>
          <span>{mission.isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_SPEED', speed: 1 })}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
            !mission.isPaused && mission.speed === 1
              ? 'bg-[#36C5F0] text-[#080E19] shadow-md'
              : 'bg-[#17263A] text-[#A7B4C8] hover:bg-[#293A50]'
          }`}
          title="Normal Speed (1x)"
        >
          1×
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SPEED', speed: 2 })}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
            !mission.isPaused && mission.speed === 2
              ? 'bg-[#36C5F0] text-[#080E19] shadow-md'
              : 'bg-[#17263A] text-[#A7B4C8] hover:bg-[#293A50]'
          }`}
          title="Fast Speed (2x)"
        >
          2×
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SPEED', speed: 4 })}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
            !mission.isPaused && mission.speed === 4
              ? 'bg-[#36C5F0] text-[#080E19] shadow-md'
              : 'bg-[#17263A] text-[#A7B4C8] hover:bg-[#293A50]'
          }`}
          title="Ultra Speed (4x)"
        >
          4×
        </button>
      </div>

      {/* Action / Help / Documentation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTutorialStep(0)}
          className="px-2.5 py-1.5 rounded-lg bg-[#111C2D] border border-[#293A50] hover:border-[#36C5F0] text-[#A7B4C8] hover:text-[#36C5F0] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          title="Interactive Mission Tutorial"
        >
          <span>🎓</span>
          <span className="hidden lg:inline">Tutorial</span>
        </button>

        <button
          onClick={() => setModal('manual')}
          className="px-2.5 py-1.5 rounded-lg bg-[#17263A] border border-[#36C5F0]/60 text-[#36C5F0] hover:bg-[#36C5F0] hover:text-[#080E19] text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          title="Open In-Game Player Manual & STEM Guide"
        >
          <span>📖</span>
          <span>MANUAL</span>
        </button>

        <button
          onClick={() => setModal('save_load')}
          className="px-2.5 py-1.5 rounded-lg bg-[#111C2D] border border-[#293A50] hover:border-[#36C5F0] text-[#A7B4C8] hover:text-[#F4F7FC] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          title="Save or Load Mission Progress"
        >
          <span>💾</span>
          <span className="hidden sm:inline">Save/Load</span>
        </button>

        <button
          onClick={() => setModal('datasources')}
          className="px-2.5 py-1.5 rounded-lg bg-[#111C2D] border border-[#293A50] hover:border-[#36C5F0] text-[#A7B4C8] hover:text-[#F4F7FC] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          title="NASA Open Data Information"
        >
          <span>🛰️</span>
          <span className="hidden xl:inline">NASA Data</span>
        </button>

        <button
          onClick={() => setModal('settings')}
          className="p-1.5 rounded-lg bg-[#111C2D] border border-[#293A50] hover:border-[#36C5F0] text-[#A7B4C8] hover:text-[#F4F7FC] text-xs font-bold transition-all cursor-pointer"
          title="Graphics and Sound Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};

