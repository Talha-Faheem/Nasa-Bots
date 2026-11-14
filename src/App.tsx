/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/App.tsx
 * Top-level application component assembling 3D world, React HUD overlay, and accessible modals.
 */

import React, { useEffect } from 'react';
import { World } from './game3d/World.tsx';
import { Hud } from './ui/Hud.tsx';
import { StartMenu } from './ui/StartMenu/StartMenu.tsx';
import { PauseMenu } from './ui/PauseMenu/PauseMenu.tsx';
import { FpvHelmetHud } from './ui/FpvHelmetHud.tsx';
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
  const appPhase = useGameStore((s) => s.appPhase);
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const toggleDebugOverlay = useGameStore((s) => s.toggleDebugOverlay);

  // Keyboard accessibility controls (Esc/P = Pause menu, V = Camera, F3 = Debug, Space = Pause sim, 1/2/4 = Speeds)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // F3 Debug Overlay toggle
      if (e.key === 'F3') {
        e.preventDefault();
        toggleDebugOverlay();
        eventBus.emit('sound:play', { name: 'click' });
        return;
      }

      if (appPhase === 'in_game') {
        // Escape: Exits FPV helmet view if active; otherwise toggles pause/closes modals
        if (e.key === 'Escape') {
          e.preventDefault();
          if (activeModal === 'none' && cameraMode === 'first_person') {
            setCameraMode('commander');
            if (document.exitPointerLock) document.exitPointerLock();
            eventBus.emit('sound:play', { name: 'click' });
            return;
          }
          if (activeModal === 'none') {
            dispatch({ type: 'PAUSE' });
            setModal('pause');
            eventBus.emit('sound:play', { name: 'click' });
          } else if (activeModal === 'pause') {
            dispatch({ type: 'RESUME' });
            setModal('none');
            eventBus.emit('sound:play', { name: 'click' });
          } else {
            // Close active modal
            setModal('none');
            eventBus.emit('sound:play', { name: 'click' });
          }
          return;
        }

        // P key explicitly toggles pause
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          if (activeModal === 'none') {
            dispatch({ type: 'PAUSE' });
            setModal('pause');
            eventBus.emit('sound:play', { name: 'click' });
          } else if (activeModal === 'pause') {
            dispatch({ type: 'RESUME' });
            setModal('none');
            eventBus.emit('sound:play', { name: 'click' });
          }
          return;
        }

        // Camera mode cycling: V
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          cycleCameraMode();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    dispatch,
    isPaused,
    appPhase,
    activeModal,
    setModal,
    cameraMode,
    setCameraMode,
    cycleCameraMode,
    toggleDebugOverlay,
  ]);

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
        // Duck audio if paused
        const vol = isPaused ? 0.03 : 0.08;
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
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
  }, [soundMuted, isPaused]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {appPhase === 'start_menu' ? (
        // Start Menu Screen (Disposed completely when transitioning to in_game)
        <>
          <StartMenu />
          <SettingsModal />
          <SaveLoadModal />
          <BriefingModal />
        </>
      ) : (
        // Active 3D Lunar Frontier Game Scene & HUD
        <>
          {/* 3D WebGL Canvas Layer */}
          <World />

          {/* React HUD Layer */}
          <Hud />

          {/* First-Person Helmet Visor HUD */}
          <FpvHelmetHud />

          {/* Pause Menu Overlay */}
          <PauseMenu />

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
        </>
      )}
    </div>
  );
};
export default App;

