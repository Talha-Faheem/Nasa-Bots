/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Decision.tsx
 * Critical decision modal with plain language (ages 7-12), clear trade-off choices, and source badges.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';

export const DecisionModal: React.FC = () => {
  const decisions = useGameStore((s) => s.state.pendingDecisions);
  const dispatch = useGameStore((s) => s.dispatch);
  const setModal = useGameStore((s) => s.setModal);

  if (!decisions || decisions.length === 0) return null;

  const current = decisions[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-200">
        {/* Source Badge & Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Mission Event · Day {current.day}
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.sourceBadge === 'Live NASA'
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
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1">
            <span>💡</span> Astronaut Science Concept:
          </div>
          <p className="text-xs text-slate-300 italic">{current.learningPoint}</p>
        </div>

        {/* Trade-off Choices */}
        <div className="space-y-3 mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
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
              className="w-full text-left p-3.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 hover:border-sky-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-sky-300">
                  {option.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">Select ➔</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{option.description}</p>
              <div className="text-[11px] font-semibold text-amber-300/90 mt-1.5 flex items-center gap-1">
                <span>⚖️ Cost:</span>
                <span>{option.costDescription}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

