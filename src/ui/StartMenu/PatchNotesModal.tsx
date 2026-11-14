/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/StartMenu/PatchNotesModal.tsx
 * Patch notes and version updates overlay.
 */

import React from 'react';
import { THEME, chamferedBtnStyle } from '../theme.ts';
import { eventBus } from '../../store/bus.ts';

interface PatchNotesModalProps {
  onClose: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div
        className="relative w-full max-w-2xl bg-[#080F1B]/95 border border-[#2EC4D6]/60 p-6 rounded-lg shadow-2xl text-[#E6F1F5] font-sans"
        style={{ clipPath: THEME.clipPaths.chamferedCard }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26374D] pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-[#2EC4D6] uppercase font-mono">
              MISSION PATCH NOTES
            </h2>
            <div className="text-xs text-[#8FA6B2] mt-0.5">Version 1.2.0 • NASA Space Apps Build</div>
          </div>
          <button
            onClick={() => {
              eventBus.emit('sound:play', { name: 'click' });
              onClose();
            }}
            className="text-[#8FA6B2] hover:text-[#2EC4D6] text-xl font-bold px-2 py-1 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 font-mono text-xs">
          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#2EC4D6]">v1.2.0 — Ground Collision & In-Situ Mining</span>
              <span className="text-[10px] text-[#8FA6B2]">November 2026</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#CBD5E1] text-[11px]">
              <li>Complete terrain height physics query with analytical elevation & slope normals.</li>
              <li>Fixed all sinking and floating character issues; astronauts follow ground accurately.</li>
              <li>7 distinct lunar geological deposits with finite reserves & specialist scan/mine yields.</li>
              <li>ISRU refinery: melt cryogenic water ice, sinter regolith, smelt ore, and fabricate solar cells.</li>
              <li>Continuous obstacle collision with tangent wall sliding response.</li>
            </ul>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#FFB020]">v1.1.0 — Third-Person Controls & Proximity</span>
              <span className="text-[10px] text-[#8FA6B2]">October 2026</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#CBD5E1] text-[11px]">
              <li>Third-person astronaut movement with smooth rotation and procedural gait animations.</li>
              <li>Real-time proximity detection for all 8 outpost modules with contextual task menus.</li>
              <li>Live 4-crew switcher with health, stamina, morale, and task telemetry.</li>
            </ul>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#8FA6B2]">v1.0.0 — 30-Day South Pole Survival Core</span>
              <span className="text-[10px] text-[#8FA6B2]">September 2026</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#CBD5E1] text-[11px]">
              <li>Deterministic headless simulation engine with 24 ticks/day and seeded Mulberry32 PRNG.</li>
              <li>Power generation, battery buffering, life support, and water recyclers.</li>
              <li>Hydroponic greenhouse crop lifecycles and radiation shelter alert protocols.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#26374D] flex justify-end">
          <button
            onClick={() => {
              eventBus.emit('sound:play', { name: 'click' });
              onClose();
            }}
            className={chamferedBtnStyle}
            style={{ clipPath: THEME.clipPaths.chamferedBtn }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
