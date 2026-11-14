/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Decision.tsx
 * Critical mission event decision modal with plain language, trade-off choices, and NASA source badges.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { AlertTriangle, Info, ChevronRight, Activity } from './icons.tsx';

export const DecisionModal: React.FC = () => {
  const decisions = useGameStore((s) => s.state.pendingDecisions);
  const dispatch = useGameStore((s) => s.dispatch);
  const setModal = useGameStore((s) => s.setModal);

  if (!decisions || decisions.length === 0) return null;

  const current = decisions[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0b1322] border-2 border-[#f59e0b]/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-200 animate-fadeIn">
        {/* Source Badge & Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#f59e0b] font-mono">
              Mission Event · Day {current.day}
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              current.sourceBadge === 'Live NASA'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : current.sourceBadge === 'Archived NASA'
                ? 'bg-sky-950 text-sky-300 border-sky-500'
                : 'bg-purple-950 text-purple-300 border-purple-500'
            }`}
          >
            {current.sourceBadge}
          </span>
        </div>

        {/* Title & Situation */}
        <h2 className="text-xl font-black text-white mb-2">{current.title}</h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{current.situation}</p>

        {/* Educational Learning Point */}
        <div className="bg-[#080d17] border border-[#1e2d42] rounded-xl p-3 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] mb-1 flex items-center gap-1.5 font-mono">
            <Info className="w-4 h-4 text-[#38bdf8]" />
            <span>Astronaut Science Concept:</span>
          </div>
          <p className="text-xs text-slate-300 italic">{current.learningPoint}</p>
        </div>

        {/* Trade-off Choices */}
        <div className="space-y-3 mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Choose Your Command Response:
          </label>
          {current.options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                dispatch({
                  type: 'RESOLVE_DECISION',
                  decisionId: current.id,
                  optionId: option.id,
                });
                setModal('none');
              }}
              className="w-full text-left p-3.5 rounded-xl border border-[#1e2d42] bg-[#080d17] hover:bg-[#132238] hover:border-[#38bdf8] transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-[#38bdf8]">
                  {option.label}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{option.description}</p>
              <div className="text-[11px] font-semibold text-[#f59e0b] mt-1.5 flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5" />
                <span>Cost: {option.costDescription}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
