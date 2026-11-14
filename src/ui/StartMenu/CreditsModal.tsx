/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/StartMenu/CreditsModal.tsx
 * In-game credits and NASA / Creative Commons asset attributions.
 */

import React from 'react';
import { THEME, chamferedBtnStyle } from '../theme.ts';
import { eventBus } from '../../store/bus.ts';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
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
              CREDITS & ATTRIBUTIONS
            </h2>
            <div className="text-xs text-[#8FA6B2] mt-0.5">Lunar Frontier: The Last 30 Days</div>
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
            <span className="font-bold text-[#2EC4D6] block mb-1">NASA Scientific Visualization Studio</span>
            <p className="text-[11px] text-[#CBD5E1]">
              Planetary topography and lunar surface reconnaissance data courtesy of NASA's Scientific Visualization
              Studio and the Lunar Reconnaissance Orbiter (LRO) Camera (LROC) science team.
            </p>
            <div className="text-[10px] text-[#8FA6B2] mt-1 italic">Public Domain • svs.gsfc.nasa.gov</div>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <span className="font-bold text-[#2EC4D6] block mb-1">NASA 3D Resources</span>
            <p className="text-[11px] text-[#CBD5E1]">
              Spacecraft references, lunar lander geometries, and surface sampling tools derived from the NASA 3D
              Model Archive.
            </p>
            <div className="text-[10px] text-[#8FA6B2] mt-1 italic">Public Domain • science.nasa.gov</div>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <span className="font-bold text-[#2EC4D6] block mb-1">3D Environmental & Base Assets</span>
            <p className="text-[11px] text-[#CBD5E1]">
              Modular space colony habitats, corridor tunnels, and rover base modules crafted by Kenney and Quaternius.
            </p>
            <div className="text-[10px] text-[#8FA6B2] mt-1 italic">Creative Commons CC0 1.0 Universal</div>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <span className="font-bold text-[#2EC4D6] block mb-1">PBR Textures & Surface Materials</span>
            <p className="text-[11px] text-[#CBD5E1]">
              Lunar regolith, basaltic rock, thermal blankets, and solar cell photovoltaics provided by Poly Haven
              and ambientCG.
            </p>
            <div className="text-[10px] text-[#8FA6B2] mt-1 italic">CC0 1.0 Universal • polyhaven.com & ambientcg.com</div>
          </div>

          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded">
            <span className="font-bold text-[#2EC4D6] block mb-1">Typography & Audio Synthesis</span>
            <p className="text-[11px] text-[#CBD5E1]">
              Fonts: Orbitron (Matt McInerney), Exo 2 (Natanael Gama), Share Tech Mono (Carrois Apostrophe).
              Web Audio Synthesizer: Custom synthetic procedural oscillator engine.
            </p>
            <div className="text-[10px] text-[#8FA6B2] mt-1 italic">SIL Open Font License 1.1 / MIT</div>
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
