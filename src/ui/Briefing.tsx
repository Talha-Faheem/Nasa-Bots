/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Briefing.tsx
 * Welcome & Mission Launch Briefing with difficulty choice, crew review, and seed control.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';

export const BriefingModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const state = useGameStore((s) => s.state);

  if (activeModal !== 'briefing') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-600 mb-2">
            NASA Space Apps Challenge 2026 · Junior Astronaut Mission Trainer
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            LUNAR FRONTIER: THE LAST 30 DAYS
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            You are the Mission Commander of Artemis Outpost Alpha near the Moon's south pole.
            Balance life support, power, water, food, and space weather radiation for 30 days until
            relief arrives.
          </p>
        </div>

        {/* Core Game Pillars for Kids 7-12 */}
        <div className="grid grid-cols-3 gap-2.5 my-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xl">⚡</span>
            <div className="text-xs font-bold text-white mt-1">No Free Choices</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Every action costs time, power, or spare parts.
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xl">🛰️</span>
            <div className="text-xs font-bold text-white mt-1">Real NASA Data</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Live and archived space weather from DONKI & OSDR.
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xl">🛡️</span>
            <div className="text-xs font-bold text-white mt-1">Safe to Learn</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Missions end in safe evacuation, never graphic harm.
            </div>
          </div>
        </div>

        {/* Crew Roster Overview */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Your 4 Astronaut Specialists:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-xl">🔧</span>
              <div>
                <strong className="text-white">Alex Morgan</strong> (Systems Engineer)
                <div className="text-[10px] text-sky-400">Repairs systems 1 hour faster</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <strong className="text-white">Dr. Sara Williams</strong> (Biologist)
                <div className="text-[10px] text-emerald-400">Greenhouse yield +10%</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-xl">⛏️</span>
              <div>
                <strong className="text-white">Daniel Brooks</strong> (Geologist)
                <div className="text-[10px] text-amber-400">Rover samples yield +3 science</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-xl">🩺</span>
              <div>
                <strong className="text-white">Dr. Maya Chen</strong> (Flight Surgeon)
                <div className="text-[10px] text-pink-400">+1 extra daily health recovery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Details & Start Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Seed: <strong className="text-white font-mono">{state.mission.seed}</strong> · Site:{' '}
            <strong className="text-sky-300">Lunar South Pole</strong>
          </div>

          <button
            onClick={() => setModal('none')}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-black shadow-xl transition-transform hover:scale-105"
          >
            Commence Mission Day 1 ➔
          </button>
        </div>
      </div>
    </div>
  );
};
