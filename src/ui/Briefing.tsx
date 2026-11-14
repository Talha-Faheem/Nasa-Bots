/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Briefing.tsx
 * Minimal, clean mission briefing overlay matching the main menu design system:
 * - Clean chamfered sci-fi panel with subtle entrance animation.
 * - Restrained, elegant palette: deep space navy, slate, and crisp cyan accents.
 * - Zero emojis — clean monochrome Lucide SVG icons.
 * - Minimal, uncluttered typography and generous whitespace.
 */

import React, { useEffect } from 'react';
import {
  Zap,
  Satellite,
  Shield,
  Wrench,
  Sprout,
  Pickaxe,
  HeartPulse,
} from 'lucide-react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';
import { THEME, chamferedBtnStyle } from './theme.ts';

export const BriefingModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const state = useGameStore((s) => s.state);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  const handleClose = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('none');
  };

  const handleCommence = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('none');
  };

  // Keyboard navigation: Enter starts mission, Escape dismisses
  useEffect(() => {
    if (activeModal !== 'briefing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCommence();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  if (activeModal !== 'briefing') return null;

  const playHoverSound = () => {
    eventBus.emit('sound:play', { name: 'click' });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050A14]/85 backdrop-blur-md flex items-center justify-center p-4 select-none isolate">
      {/* Minimal Chamfered Dossier Card */}
      <div
        className={`relative w-full max-w-2xl bg-[#080E1B]/95 border border-[#2EC4D6]/50 shadow-2xl text-[#E6F1F5] font-sans p-6 sm:p-8 max-h-[90vh] overflow-y-auto ${
          reducedMotion ? '' : 'animate-modal-in'
        }`}
        style={{ clipPath: THEME.clipPaths.chamferedCard }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#26374D]/60 pb-3 mb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.25em] text-[#2EC4D6] uppercase">
              Mission Briefing · Artemis Outpost Alpha
            </div>
            <h1
              className="text-2xl font-black uppercase tracking-[0.16em] text-[#E6F1F5] mt-1"
              style={{ fontFamily: THEME.fonts.title }}
            >
              Lunar Frontier: The Last 30 Days
            </h1>
          </div>
          <button
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="text-[#8FA6B2] hover:text-[#2EC4D6] text-xl font-bold px-2 py-0.5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Narrative / Context */}
        <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
          You are the Commander of Artemis Outpost Alpha near the lunar south pole.
          Balance life support, power, water, food, and space weather radiation over a 30-day
          expedition until relief arrives.
        </p>

        {/* 3 Core Pillars - Clean, minimal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 bg-[#0D1826]/70 border border-[#1E2E42] rounded transition-all duration-200 hover:border-[#2EC4D6]/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#2EC4D6]" />
              <span className="text-xs font-bold text-white tracking-wide">No Free Choices</span>
            </div>
            <p className="text-[11px] text-[#8FA6B2] leading-tight">
              Every action consumes crew work hours, power, or spare parts.
            </p>
          </div>

          <div className="p-3 bg-[#0D1826]/70 border border-[#1E2E42] rounded transition-all duration-200 hover:border-[#2EC4D6]/50">
            <div className="flex items-center gap-2 mb-1">
              <Satellite className="w-4 h-4 text-[#2EC4D6]" />
              <span className="text-xs font-bold text-white tracking-wide">Real NASA Data</span>
            </div>
            <p className="text-[11px] text-[#8FA6B2] leading-tight">
              Telemetry driven by NASA DONKI solar weather and OSDR research.
            </p>
          </div>

          <div className="p-3 bg-[#0D1826]/70 border border-[#1E2E42] rounded transition-all duration-200 hover:border-[#2EC4D6]/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#2EC4D6]" />
              <span className="text-xs font-bold text-white tracking-wide">Safe to Learn</span>
            </div>
            <p className="text-[11px] text-[#8FA6B2] leading-tight">
              Missions conclude in supportive debriefs and evacuation, never harm.
            </p>
          </div>
        </div>

        {/* Crew Roster (Clean 4-crew grid) */}
        <div className="mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8FA6B2] mb-2">
            Astronaut Specialists (4)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              onMouseEnter={playHoverSound}
              className="p-2.5 bg-[#0D1826]/50 border border-[#1E2E42] rounded flex items-center gap-3 transition-all duration-200 hover:border-[#2EC4D6]/50 hover:bg-[#0D1826]"
            >
              <div className="p-1.5 rounded bg-[#2EC4D6]/10 text-[#2EC4D6]">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Alex Morgan</div>
                <div className="text-[10px] text-[#8FA6B2]">Systems Engineer · Repairs +1h faster</div>
              </div>
            </div>

            <div
              onMouseEnter={playHoverSound}
              className="p-2.5 bg-[#0D1826]/50 border border-[#1E2E42] rounded flex items-center gap-3 transition-all duration-200 hover:border-[#2EC4D6]/50 hover:bg-[#0D1826]"
            >
              <div className="p-1.5 rounded bg-[#2EC4D6]/10 text-[#2EC4D6]">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Dr. Sara Williams</div>
                <div className="text-[10px] text-[#8FA6B2]">Biologist · Greenhouse yield +10%</div>
              </div>
            </div>

            <div
              onMouseEnter={playHoverSound}
              className="p-2.5 bg-[#0D1826]/50 border border-[#1E2E42] rounded flex items-center gap-3 transition-all duration-200 hover:border-[#2EC4D6]/50 hover:bg-[#0D1826]"
            >
              <div className="p-1.5 rounded bg-[#2EC4D6]/10 text-[#2EC4D6]">
                <Pickaxe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Daniel Brooks</div>
                <div className="text-[10px] text-[#8FA6B2]">Geologist · Rover samples +3 science</div>
              </div>
            </div>

            <div
              onMouseEnter={playHoverSound}
              className="p-2.5 bg-[#0D1826]/50 border border-[#1E2E42] rounded flex items-center gap-3 transition-all duration-200 hover:border-[#2EC4D6]/50 hover:bg-[#0D1826]"
            >
              <div className="p-1.5 rounded bg-[#2EC4D6]/10 text-[#2EC4D6]">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Dr. Maya Chen</div>
                <div className="text-[10px] text-[#8FA6B2]">Flight Surgeon · +1 health recovery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#26374D]/60 font-mono text-xs">
          <div className="text-[11px] text-[#8FA6B2]">
            SEED: <span className="text-[#2EC4D6]">#{state.mission.seed}</span> · SITE: LUNAR SOUTH POLE
          </div>

          <button
            onClick={handleCommence}
            onMouseEnter={playHoverSound}
            className={chamferedBtnStyle}
            style={{ clipPath: THEME.clipPaths.chamferedBtn }}
          >
            COMMENCE MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
