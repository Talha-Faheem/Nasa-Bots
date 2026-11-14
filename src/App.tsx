/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/App.tsx
 * Top-level application component assembling 3D world, React HUD overlay, and accessible modals.
 */

import React, { useEffect } from 'react';
import { World } from './game3d/World.tsx';
import { Hud } from './ui/Hud.tsx';
import { TaskMenu } from './ui/TaskMenu.tsx';
import { DecisionModal } from './ui/Decision.tsx';
import { ReportModal } from './ui/Report.tsx';
import { DataSourcesModal } from './ui/DataSources.tsx';
import { BriefingModal } from './ui/Briefing.tsx';
import { LearnCardModal } from './ui/LearnCard.tsx';
import { SettingsModal } from './ui/Settings.tsx';
import { UserManualModal } from './ui/UserManualModal.tsx';
import { TutorialOverlay } from './ui/TutorialOverlay.tsx';
import { SaveLoadModal } from './ui/SaveLoadModal.tsx';
import { eventBus } from './store/bus.ts';
import { useGameStore } from './store/store.ts';

export const App: React.FC = () => {
  const dispatch = useGameStore((s) => s.dispatch);
  const isPaused = useGameStore((s) => s.state.mission.isPaused);
  const soundMuted = useGameStore((s) => s.soundMuted);

  // Keyboard accessibility controls (Spacebar = pause/resume, 1, 2, 4 = speeds)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        dispatch(isPaused ? { type: 'RESUME' } : { type: 'PAUSE' });
      } else if (e.key === '1') {
        dispatch({ type: 'SET_SPEED', speed: 1 });
      } else if (e.key === '2') {
        dispatch({ type: 'SET_SPEED', speed: 2 });
      } else if (e.key === '4') {
        dispatch({ type: 'SET_SPEED', speed: 4 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isPaused]);

  // Audio effects synthesizer using Web Audio API (reliable, zero external file dependency)
  useEffect(() => {
    let audioCtx: AudioContext | null = null;

    const playBeep = (freq: number, type: OscillatorType, duration: number) => {
      if (soundMuted) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch {
        // Audio policy ignore
      }
    };

    const unsubSound = eventBus.on('sound:play', ({ name }) => {
      if (name === 'click') {
        playBeep(520, 'sine', 0.04);
      } else if (name === 'alarm') {
        playBeep(740, 'triangle', 0.25);
      } else if (name === 'alert') {
        playBeep(440, 'sine', 0.15);
      } else if (name === 'harvest') {
        playBeep(660, 'sine', 0.1);
        setTimeout(() => playBeep(880, 'sine', 0.15), 100);
      } else if (name === 'repair') {
        playBeep(320, 'triangle', 0.08);
      }
    });

    return () => {
      unsubSound();
      audioCtx?.close();
    };
  }, [soundMuted]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Layer */}
      <World />

      {/* React HUD Layer */}
      <Hud />

      {/* Accessible Modals */}
      <BriefingModal />
      <TaskMenu />
      <DecisionModal />
      <ReportModal />
      <DataSourcesModal />
      <LearnCardModal />
      <SettingsModal />
      <UserManualModal />
      <SaveLoadModal />

      {/* Interactive Walkthrough Tutorial */}
      <TutorialOverlay />
    </div>
  );
};
export default App;

