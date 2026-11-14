/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Settings.tsx
 * Accessibility, detail level, and performance settings.
 */

import React from 'react';
import { useGameStore, QualitySetting, DetailLevel } from '../store/store.ts';

export const SettingsModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const quality = useGameStore((s) => s.qualitySetting);
  const setQuality = useGameStore((s) => s.setQualitySetting);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const soundMuted = useGameStore((s) => s.soundMuted);
  const setSoundMuted = useGameStore((s) => s.setSoundMuted);
  const detailLevel = useGameStore((s) => s.detailLevel);
  const setDetailLevel = useGameStore((s) => s.setDetailLevel);

  if (activeModal !== 'settings') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>⚙️</span> Mission Settings & Accessibility
          </h2>
          <button
            onClick={() => setModal('none')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Detail Level */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Educational Detail Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['explorer', 'engineer', 'classroom'] as DetailLevel[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDetailLevel(d)}
                  className={`py-2 px-1 rounded-xl border text-center capitalize font-bold transition-all ${
                    detailLevel === d
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Graphic Quality */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              3D Graphic Quality Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as QualitySetting[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-2 px-1 rounded-xl border text-center capitalize font-bold transition-all ${
                    quality === q
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Low = No shadows (school laptops). Medium = 1024 shadows. High = 2048 shadows.
            </p>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Reduced Motion</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Disable camera smoothing, bobbing, and rapid transitions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Sound Muted Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Audio Muted</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Mute all alarms and UI feedback sound effects.
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundMuted}
              onChange={(e) => setSoundMuted(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={() => setModal('none')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

