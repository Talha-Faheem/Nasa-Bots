/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/LearnCard.tsx
 * Three-line educational card with scientific context for kids ages 7-12.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';

export const LearnCardModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const content = useGameStore((s) => s.learnCardContent);
  const setModal = useGameStore((s) => s.setModal);

  if (activeModal !== 'learn' || !content) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📘</span>
            <h3 className="text-sm font-black text-white">{content.title}</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-600">
            {content.sourceBadge}
          </span>
        </div>

        {/* 3-Line Plain Explanation */}
        <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          {content.threeLineSummary.map((line, idx) => (
            <p key={idx} className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>{line}</span>
            </p>
          ))}
        </div>

        {/* Science Concept */}
        <div className="text-xs text-slate-400 mb-4">
          <strong className="text-sky-300 block mb-0.5">NASA Science Concept:</strong>
          {content.scienceConcept}
        </div>

        <button
          onClick={() => setModal('none')}
          className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

