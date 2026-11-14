/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Hud.tsx
 * Complete NASA-inspired Mission Control HUD layer.
 * Assembles:
 * - Area A: Mission Control Bar (MissionBar)
 * - Area B: Resource Telemetry Strip (ResourceDashboard)
 * - Area D: Narrow Navigation Sidebar (LeftNavPanel)
 * - Area C/F: Single Unified Inspector Panel (ContextPanel)
 * - Area E: Compact Collapsible Crew Bar (AstronautRoster)
 * - Section 4: Non-obstructive Notification Tray (NotificationTray)
 * - Subtle Proximity Interaction Prompt (InteractionPrompt)
 */

import React from 'react';
import { MissionBar } from './MissionBar.tsx';
import { ResourceDashboard } from './ResourceDashboard.tsx';
import { LeftNavPanel } from './LeftNavPanel.tsx';
import { ContextPanel } from './ContextPanel.tsx';
import { AstronautRoster } from './AstronautRoster.tsx';
import { NotificationTray } from './NotificationTray.tsx';
import { InteractionPrompt } from './InteractionPrompt.tsx';
import { useGameStore } from '../store/store.ts';

export const Hud: React.FC = () => {
  const cameraMode = useGameStore((s) => s.cameraMode);

  // In first-person helmet view, suppress the 2D colony overview HUD in favor of the dedicated FPV visor overlay
  if (cameraMode === 'first_person') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between overflow-hidden z-10">
        <NotificationTray />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between overflow-hidden z-10">
      {/* Top Mission Control Cluster (Area A & B) */}
      <div className="w-full flex flex-col pointer-events-auto">
        <MissionBar />
        <ResourceDashboard />
      </div>

      {/* Left Navigation Sidebar (Area D) */}
      <LeftNavPanel />

      {/* Right Unified Contextual Inspection Panel (Area C & F) */}
      <ContextPanel />

      {/* Space Weather Alert & Recent Notification Toasts (Section 4) */}
      <NotificationTray />

      {/* Physical Proximity Interaction Prompt [E] */}
      <InteractionPrompt />

      {/* Bottom Compact Crew Bar (Area E) */}
      <AstronautRoster />
    </div>
  );
};
