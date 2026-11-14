/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/PauseMenu/ControlsModal.tsx
 * Keybindings and Gamepad controls cheat sheet overlay.
 */

import React from 'react';
import { THEME, chamferedBtnStyle } from '../theme.ts';
import { eventBus } from '../../store/bus.ts';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div
        className="relative w-full max-w-2xl bg-[#080F1B]/95 border border-[#2EC4D6]/60 p-6 rounded-lg shadow-2xl text-[#E6F1F5] font-sans"
        style={{ clipPath: THEME.clipPaths.chamferedCard }}
      >
        <div className="flex items-center justify-between border-b border-[#26374D] pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-[#2EC4D6] uppercase font-mono">
              CONTROLS & KEYBINDINGS
            </h2>
            <div className="text-xs text-[#8FA6B2] mt-0.5">Keyboard, Mouse & Gamepad Shortcuts</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 font-mono text-xs">
          {/* General Navigation & Cameras */}
          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded space-y-2">
            <span className="font-bold text-[#2EC4D6] block border-b border-[#1E2E42] pb-1">
              CAMERA & VIEWS
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Cycle Camera Modes:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-[#2EC4D6] border border-[#26374D]">V</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Orbit / Rotate:</span>
              <span className="text-white">Right Click + Drag</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Pan Strategic Camera:</span>
              <span className="text-white">Middle Click / Arrow Keys</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Zoom In / Out:</span>
              <span className="text-white">Scroll Wheel</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Toggle F3 Debug Overlay:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-[#FFB020] border border-[#26374D]">F3</kbd>
            </div>
          </div>

          {/* First-Person Astronaut Controls */}
          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded space-y-2">
            <span className="font-bold text-[#2EC4D6] block border-b border-[#1E2E42] pb-1">
              FIRST-PERSON & MANUAL WALK
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Move Character:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">W A S D</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Sprint / Leap:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">Shift</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Interact / Inspect:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-[#2EC4D6] border border-[#26374D]">E</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Release Mouse Cursor:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-[#FFB020] border border-[#26374D]">Alt / Esc</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Toggle Helmet Visor HUD:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">H</kbd>
            </div>
          </div>

          {/* Simulation & Time */}
          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded space-y-2">
            <span className="font-bold text-[#2EC4D6] block border-b border-[#1E2E42] pb-1">
              SIMULATION TIME
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Pause / Resume:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">Space / P</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Speed 1x / 2x / 4x:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">1 / 2 / 4</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Open Pause Menu:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">Esc</kbd>
            </div>
          </div>

          {/* Crew Switcher & Gamepad */}
          <div className="p-3 bg-[#0D1826] border border-[#1E2E42] rounded space-y-2">
            <span className="font-bold text-[#2EC4D6] block border-b border-[#1E2E42] pb-1">
              CREW & GAMEPAD
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Switch Crew [Alex..Maya]:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">F1 - F4</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Open Crew Management:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A2636] text-white border border-[#26374D]">Tab</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Gamepad Movement:</span>
              <span className="text-white">Left Stick</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#8FA6B2]">Gamepad Interact:</span>
              <span className="text-white">Button A / X</span>
            </div>
          </div>
        </div>

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
