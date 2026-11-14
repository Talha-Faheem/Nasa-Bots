/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/store/store.ts
 * Zustand state store linking pure sim engine to React HUD and 3D scenes.
 */

import { create } from 'zustand';
import { GameState, Command, BuildingId, CrewId } from '../sim/types.ts';
import { createInitialState, SimulationEngine } from '../sim/engine.ts';
import { eventBus } from './bus.ts';

export type QualitySetting = 'low' | 'medium' | 'high';
export type DetailLevel = 'explorer' | 'engineer' | 'classroom';
export type ActiveNavTab =
  | 'overview'
  | 'astronauts'
  | 'buildings'
  | 'operations'
  | 'research'
  | 'rover'
  | 'construction'
  | 'inventory'
  | 'objectives'
  | 'achievements'
  | 'stats'
  | null;

export type ActiveModal =
  | 'none'
  | 'briefing'
  | 'decision'
  | 'task_menu'
  | 'report'
  | 'datasources'
  | 'learn'
  | 'settings'
  | 'manual'
  | 'tutorial'
  | 'save_load'
  | 'pause'
  | 'patch_notes'
  | 'credits'
  | 'controls';

export type AppPhase = 'start_menu' | 'in_game';
export type CameraMode = 'commander' | 'follow' | 'first_person';
export type FpvControlMode = 'watch' | 'manual';

export type SelectedEntity =
  | { type: 'building'; id: BuildingId }
  | { type: 'crew'; id: CrewId }
  | { type: 'resource'; id: 'battery' | 'oxygen' | 'water' | 'food' | 'health' | 'radiation' | 'comms' }
  | { type: 'rover' }
  | null;

export interface LearnContent {
  title: string;
  threeLineSummary: string[];
  scienceConcept: string;
  sourceBadge: 'Live NASA' | 'Archived NASA' | 'Simulated';
  datasetId?: string;
  readMoreUrl?: string;
}

export interface GameStoreState {
  // Sim State
  state: GameState;
  engine: SimulationEngine;

  // UI Selection State
  selectedBuilding: BuildingId | null;
  selectedCrew: CrewId | null;
  selectedEntity: SelectedEntity;
  activeNavTab: ActiveNavTab;
  taskTargetBuilding: BuildingId | null;
  activeModal: ActiveModal;
  learnCardContent: LearnContent | null;

  // Tutorial State
  tutorialStep: number; // -1 = dismissed/completed, 0..N = active step

  // Accessibility & Settings
  qualitySetting: QualitySetting;
  reducedMotion: boolean;
  soundMuted: boolean;
  detailLevel: DetailLevel;

  // App Phase & Camera Modes
  appPhase: AppPhase;
  cameraMode: CameraMode;
  fpvControlMode: FpvControlMode;
  fpvHelmetHudVisible: boolean;
  fpvHeadBob: boolean;
  cameraFov: number;
  mouseSensitivity: number;
  invertY: boolean;
  debugOverlay: boolean;
  pointerLocked: boolean;

  // Third-Person Character Control & Proximity State
  activePlayerCrew: CrewId;
  nearbyBuilding: BuildingId | null;
  astronautPositions: Record<CrewId, { x: number; y?: number; z: number; rotation: number }>;
  showCrewSwitcher: boolean;

  // Actions
  dispatch: (command: Command) => void;
  advanceTick: () => void;
  setAppPhase: (phase: AppPhase) => void;
  setCameraMode: (mode: CameraMode) => void;
  cycleCameraMode: () => void;
  setFpvControlMode: (mode: FpvControlMode) => void;
  setFpvHelmetHudVisible: (visible: boolean) => void;
  setFpvHeadBob: (bob: boolean) => void;
  setCameraFov: (fov: number) => void;
  setMouseSensitivity: (sens: number) => void;
  setInvertY: (invert: boolean) => void;
  toggleDebugOverlay: () => void;
  setPointerLocked: (locked: boolean) => void;
  setSelectedBuilding: (b: BuildingId | null) => void;
  setSelectedCrew: (c: CrewId | null) => void;
  setSelectedEntity: (e: SelectedEntity) => void;
  setActiveNavTab: (tab: ActiveNavTab) => void;
  setActivePlayerCrew: (c: CrewId) => void;
  setNearbyBuilding: (b: BuildingId | null) => void;
  updateAstronautPosition: (id: CrewId, pos: { x: number; y?: number; z: number; rotation: number }) => void;
  setShowCrewSwitcher: (s: boolean) => void;
  setTutorialStep: (step: number) => void;
  openTaskMenu: (b: BuildingId) => void;
  openLearnCard: (content: LearnContent) => void;
  setModal: (m: ActiveModal) => void;
  setQualitySetting: (q: QualitySetting) => void;
  setReducedMotion: (r: boolean) => void;
  setSoundMuted: (s: boolean) => void;
  setDetailLevel: (d: DetailLevel) => void;
  saveGame: (slotId?: string) => void;
  loadGame: (slotId?: string) => boolean;
  hasSavedGame: (slotId?: string) => boolean;
  restartMission: (newSeed?: number, difficulty?: any) => void;
}

const DEFAULT_SEED = 133742;

export const useGameStore = create<GameStoreState>((set, get) => {
  let initialEngine = new SimulationEngine(DEFAULT_SEED);
  let initialState = createInitialState(DEFAULT_SEED, 'commander');

  return {
    state: initialState,
    engine: initialEngine,
    selectedBuilding: null,
    selectedCrew: null,
    selectedEntity: null,
    activeNavTab: null,
    taskTargetBuilding: null,
    activeModal: 'none',
    learnCardContent: null,
    tutorialStep: -1,
    qualitySetting: 'medium',
    reducedMotion: false,
    soundMuted: false,
    detailLevel: 'explorer',
    appPhase: 'start_menu',
    cameraMode: 'commander',
    fpvControlMode: 'watch',
    fpvHelmetHudVisible: true,
    fpvHeadBob: true,
    cameraFov: 75,
    mouseSensitivity: 1.0,
    invertY: false,
    debugOverlay: false,
    pointerLocked: false,
    activePlayerCrew: 'alex',
    nearbyBuilding: null,
    astronautPositions: {
      alex: { x: -2, z: -1, rotation: 0 },
      sara: { x: 2, z: -1, rotation: 0 },
      daniel: { x: -2, z: 1, rotation: 0 },
      maya: { x: 2, z: 1, rotation: 0 },
    },
    showCrewSwitcher: false,

    dispatch: (command: Command) => {
      const { engine, state } = get();
      const nextState = engine.dispatch(state, command);
      set({ state: nextState });

      // Emit sound cue if appropriate
      if (
        command.type === 'BUILD_SHIELD_LAYER' ||
        command.type === 'ASSIGN_TASK' ||
        command.type === 'PURCHASE_UPGRADE' ||
        command.type === 'START_RESEARCH' ||
        command.type === 'START_EXPEDITION'
      ) {
        eventBus.emit('sound:play', { name: 'click' });
      }
    },

    advanceTick: () => {
      const { engine, state } = get();
      if (state.mission.isPaused || state.mission.status !== 'in_progress') return;

      const nextState = engine.tick(state);
      set({ state: nextState });

      // Auto-trigger decision modal when a critical decision arrives
      if (nextState.pendingDecisions.length > 0 && nextState.mission.isPaused) {
        set({ activeModal: 'decision' });
        eventBus.emit('sound:play', { name: 'alarm' });
      }

      // Check mission completion modal
      if (nextState.mission.status !== 'in_progress' && get().activeModal !== 'report') {
        set({ activeModal: 'report' });
        eventBus.emit('sound:play', { name: 'alert' });
      }
    },

    setSelectedBuilding: (b: BuildingId | null) => {
      set({
        selectedBuilding: b,
        selectedEntity: b ? { type: 'building', id: b } : null,
      });
      if (b) {
        eventBus.emit('camera:focus', { buildingId: b });
        eventBus.emit('sound:play', { name: 'click' });
      }
    },

    setSelectedCrew: (c: CrewId | null) => {
      set({
        selectedCrew: c,
        selectedEntity: c ? { type: 'crew', id: c } : null,
      });
      if (c) {
        eventBus.emit('camera:focus', { crewId: c });
        eventBus.emit('sound:play', { name: 'click' });
      }
    },

    setSelectedEntity: (e: SelectedEntity) => {
      set({
        selectedEntity: e,
        selectedBuilding: e?.type === 'building' ? e.id : null,
        selectedCrew: e?.type === 'crew' ? e.id : null,
      });
      if (e?.type === 'building') {
        eventBus.emit('camera:focus', { buildingId: e.id });
      } else if (e?.type === 'crew') {
        eventBus.emit('camera:focus', { crewId: e.id });
      }
      eventBus.emit('sound:play', { name: 'click' });
    },

    setActivePlayerCrew: (c: CrewId) => {
      set({
        activePlayerCrew: c,
        selectedCrew: c,
        selectedEntity: { type: 'crew', id: c },
      });
      eventBus.emit('camera:focus', { crewId: c });
      eventBus.emit('sound:play', { name: 'click' });
    },

    setNearbyBuilding: (b: BuildingId | null) => {
      if (get().nearbyBuilding !== b) {
        set({ nearbyBuilding: b });
      }
    },

    updateAstronautPosition: (id: CrewId, pos: { x: number; y?: number; z: number; rotation: number }) => {
      const positions = { ...get().astronautPositions, [id]: pos };
      set({ astronautPositions: positions });
    },

    setShowCrewSwitcher: (s: boolean) => set({ showCrewSwitcher: s }),

    setActiveNavTab: (tab: ActiveNavTab) => {
      set({ activeNavTab: tab });
      eventBus.emit('sound:play', { name: 'click' });
    },

    setTutorialStep: (step: number) => set({ tutorialStep: step }),

    openTaskMenu: (b: BuildingId) => {
      set({ taskTargetBuilding: b, activeModal: 'task_menu' });
      eventBus.emit('sound:play', { name: 'click' });
    },

    openLearnCard: (content: LearnContent) => {
      set({ learnCardContent: content, activeModal: 'learn' });
      eventBus.emit('sound:play', { name: 'click' });
    },

    setModal: (m: ActiveModal) =>
      set({
        activeModal: m,
        taskTargetBuilding: m === 'task_menu' ? get().taskTargetBuilding : null,
      }),

    setQualitySetting: (q: QualitySetting) => set({ qualitySetting: q }),
    setReducedMotion: (r: boolean) => set({ reducedMotion: r }),
    setSoundMuted: (s: boolean) => set({ soundMuted: s }),
    setDetailLevel: (d: DetailLevel) => set({ detailLevel: d }),

    saveGame: (slotId = 'lunar_frontier_save') => {
      const { state } = get();
      try {
        const payload = JSON.stringify({
          savedAt: new Date().toISOString(),
          state,
        });
        localStorage.setItem(slotId, payload);
        eventBus.emit('sound:play', { name: 'click' });
      } catch (err) {
        console.error('Save failed:', err);
      }
    },

    loadGame: (slotId = 'lunar_frontier_save') => {
      try {
        const raw = localStorage.getItem(slotId);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data?.state) {
          const restoredEngine = new SimulationEngine(data.state.mission.seed);
          set({
            state: data.state,
            engine: restoredEngine,
            activeModal: 'none',
            selectedBuilding: null,
            selectedCrew: null,
            selectedEntity: null,
          });
          eventBus.emit('sound:play', { name: 'click' });
          return true;
        }
      } catch (err) {
        console.error('Load failed:', err);
      }
      return false;
    },

    hasSavedGame: (slotId = 'lunar_frontier_save') => {
      return !!localStorage.getItem(slotId);
    },

    restartMission: (newSeed?: number, difficulty = 'commander') => {
      const seed = newSeed ?? Math.floor(Math.random() * 900000 + 100000);
      const newEngine = new SimulationEngine(seed);
      const newState = createInitialState(seed, difficulty);
      set({
        state: newState,
        engine: newEngine,
        selectedBuilding: null,
        selectedCrew: null,
        selectedEntity: null,
        activeNavTab: null,
        taskTargetBuilding: null,
        activeModal: 'none',
        tutorialStep: -1,
      });
      eventBus.emit('camera:reset', undefined);
    },

    setAppPhase: (phase: AppPhase) => set({ appPhase: phase }),
    setCameraMode: (mode: CameraMode) => {
      set({ cameraMode: mode });
      eventBus.emit('sound:play', { name: 'click' });
    },
    cycleCameraMode: () => {
      const current = get().cameraMode;
      const next: CameraMode =
        current === 'commander' ? 'follow' : current === 'follow' ? 'first_person' : 'commander';
      set({ cameraMode: next });
      eventBus.emit('sound:play', { name: 'click' });
    },
    setFpvControlMode: (mode: FpvControlMode) => set({ fpvControlMode: mode }),
    setFpvHelmetHudVisible: (visible: boolean) => set({ fpvHelmetHudVisible: visible }),
    setFpvHeadBob: (bob: boolean) => set({ fpvHeadBob: bob }),
    setCameraFov: (fov: number) => set({ cameraFov: fov }),
    setMouseSensitivity: (sens: number) => set({ mouseSensitivity: sens }),
    setInvertY: (invert: boolean) => set({ invertY: invert }),
    toggleDebugOverlay: () => set((s) => ({ debugOverlay: !s.debugOverlay })),
    setPointerLocked: (locked: boolean) => set({ pointerLocked: locked }),
  };
});

