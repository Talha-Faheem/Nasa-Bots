/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/StartMenu/StartMenu.tsx
 * Start Menu screen inspired by reference composition:
 * - Top Left: "LUNAR / FRONTIER" on two lines with "THE LAST 30 DAYS" subtitle.
 * - Bottom Left: 6 chamfered sci-fi buttons (Start, Continue, Load, Options, Credits, Quit).
 * - Bottom Right: 2 secondary buttons (Mission Briefing, Patch Notes).
 * - Center: 3D rotating Moon with terminator and orbiting satellite.
 * - Full keyboard & gamepad navigation, reduced-motion compatibility, and clean asset disposal.
 */

import React, { useState, useEffect } from 'react';
import { StartMenuCanvas } from './StartMenuCanvas.tsx';
import { PatchNotesModal } from './PatchNotesModal.tsx';
import { CreditsModal } from './CreditsModal.tsx';
import { THEME, chamferedBtnStyle } from '../theme.ts';
import { useGameStore } from '../../store/store.ts';
import { eventBus } from '../../store/bus.ts';

export const StartMenu: React.FC = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const setAppPhase = useGameStore((s) => s.setAppPhase);
  const setModal = useGameStore((s) => s.setModal);
  const loadGame = useGameStore((s) => s.loadGame);
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);
  const seed = useGameStore((s) => s.state.mission.seed);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  const canContinue = hasSavedGame();

  const handleStartMission = () => {
    if (isStarting) return;
    setIsStarting(true);
    eventBus.emit('sound:play', { name: 'click' });

    const delay = reducedMotion ? 100 : 950;
    setTimeout(() => {
      setAppPhase('in_game');
      setModal('briefing');
    }, delay);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    eventBus.emit('sound:play', { name: 'click' });
    const success = loadGame();
    if (success) {
      setAppPhase('in_game');
      setModal('none');
    }
  };

  const handleLoadMission = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('save_load');
  };

  const handleOptions = () => {
    eventBus.emit('sound:play', { name: 'click' });
    setModal('settings');
  };

  const handleQuit = () => {
    eventBus.emit('sound:play', { name: 'click' });
    if (window.confirm('Exit Lunar Frontier: The Last 30 Days?')) {
      window.close();
    }
  };

  const mainButtons = [
    { label: 'START MISSION', action: handleStartMission, disabled: isStarting },
    { label: 'CONTINUE', action: handleContinue, disabled: !canContinue || isStarting },
    { label: 'LOAD MISSION', action: handleLoadMission, disabled: isStarting },
    { label: 'OPTIONS', action: handleOptions, disabled: isStarting },
    { label: 'CREDITS', action: () => setShowCredits(true), disabled: isStarting },
    { label: 'QUIT', action: handleQuit, disabled: isStarting },
  ];

  // Keyboard navigation for main menu buttons (Arrow Up/Down, Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPatchNotes || showCredits) {
        if (e.key === 'Escape') {
          setShowPatchNotes(false);
          setShowCredits(false);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % mainButtons.length);
        eventBus.emit('sound:play', { name: 'click' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + mainButtons.length) % mainButtons.length);
        eventBus.emit('sound:play', { name: 'click' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const btn = mainButtons[focusedIndex];
        if (btn && !btn.disabled) {
          btn.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, mainButtons, showPatchNotes, showCredits]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#050A14] to-[#0A1424] text-[#E6F1F5] font-sans select-none isolate">
      {/* 3D Rotating Moon & Starfield Scene */}
      <StartMenuCanvas isStarting={isStarting} />

      {/* Fade overlay on start mission zoom transition */}
      <div
        className={`absolute inset-0 bg-[#050A14] pointer-events-none transition-opacity duration-1000 z-10 ${
          isStarting ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Main UI Overlay */}
      <div className="relative z-20 w-full h-full p-8 md:p-14 flex flex-col justify-between pointer-events-none">
        {/* TOP LEFT: TITLE */}
        <div className="pointer-events-auto">
          <h1
            className="text-4xl md:text-6xl font-black uppercase tracking-[0.25em] text-[#E6F1F5] leading-tight"
            style={{ fontFamily: THEME.fonts.title, textShadow: '0 0 25px rgba(46, 196, 214, 0.4)' }}
          >
            LUNAR<br />FRONTIER
          </h1>
          <p
            className="text-sm md:text-base tracking-[0.35em] text-[#2EC4D6] font-light mt-1 uppercase"
            style={{ fontFamily: THEME.fonts.title }}
          >
            THE LAST 30 DAYS
          </p>
        </div>

        {/* BOTTOM AREA: Main buttons left, Secondary buttons right */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          {/* BOTTOM LEFT: 6 Stacked Main Buttons */}
          <div className="flex flex-col gap-2.5 w-64 md:w-72 pointer-events-auto">
            {mainButtons.map((btn, idx) => {
              const isFocused = focusedIndex === idx;
              return (
                <button
                  key={btn.label}
                  disabled={btn.disabled}
                  onClick={btn.action}
                  onMouseEnter={() => {
                    setFocusedIndex(idx);
                    eventBus.emit('sound:play', { name: 'click' });
                  }}
                  className={`${chamferedBtnStyle} ${
                    isFocused ? 'ring-2 ring-[#2EC4D6] ring-offset-1 ring-offset-[#050A14] translate-x-1.5' : ''
                  }`}
                  style={{ clipPath: THEME.clipPaths.chamferedBtn }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* BOTTOM RIGHT: 2 Secondary Buttons */}
          <div className="flex flex-col gap-2.5 w-52 pointer-events-auto">
            <button
              onClick={() => {
                eventBus.emit('sound:play', { name: 'click' });
                setModal('briefing');
              }}
              className="relative uppercase tracking-[0.1em] font-semibold text-xs text-[#8FA6B2] hover:text-[#2EC4D6] bg-[rgba(10,30,45,0.4)] border border-[#2EC4D6]/40 hover:border-[#2EC4D6] px-4 py-2.5 transition-all duration-200 text-center hover:shadow-[0_0_10px_rgba(46,196,214,0.25)]"
              style={{ clipPath: THEME.clipPaths.chamferedBtn }}
            >
              MISSION BRIEFING
            </button>
            <button
              onClick={() => {
                eventBus.emit('sound:play', { name: 'click' });
                setShowPatchNotes(true);
              }}
              className="relative uppercase tracking-[0.1em] font-semibold text-xs text-[#8FA6B2] hover:text-[#2EC4D6] bg-[rgba(10,30,45,0.4)] border border-[#2EC4D6]/40 hover:border-[#2EC4D6] px-4 py-2.5 transition-all duration-200 text-center hover:shadow-[0_0_10px_rgba(46,196,214,0.25)]"
              style={{ clipPath: THEME.clipPaths.chamferedBtn }}
            >
              PATCH NOTES
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-[#26374D]/40 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#8FA6B2] font-mono tracking-wider pointer-events-auto">
          <div>
            LUNAR FRONTIER <span className="text-[#2EC4D6]">v1.2.0</span> • NASA JUNIOR ASTRONAUT TRAINER
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>SEED: #{seed}</span>
            <button
              onClick={() => setShowCredits(true)}
              className="hover:text-[#2EC4D6] underline cursor-pointer transition-colors"
            >
              CREDITS & LICENSES
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      {showPatchNotes && <PatchNotesModal onClose={() => setShowPatchNotes(false)} />}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
  );
};
