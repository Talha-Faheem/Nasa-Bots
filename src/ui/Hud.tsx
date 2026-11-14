/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Hud.tsx
 * Complete NASA-inspired Mission Control HUD layer assembling MissionBar, ResourceDashboard, LeftNavPanel, ContextPanel, AstronautRoster, and NotificationTray.
 */

import React from 'react';
import { MissionBar } from './MissionBar.tsx';
import { ResourceDashboard } from './ResourceDashboard.tsx';
import { LeftNavPanel } from './LeftNavPanel.tsx';
import { ContextPanel } from './ContextPanel.tsx';
import { AstronautRoster } from './AstronautRoster.tsx';
import { NotificationTray } from './NotificationTray.tsx';
import { InteractionPrompt } from './InteractionPrompt.tsx';
import { CrewSwitcherHUD } from './CrewSwitcherHUD.tsx';

export const Hud: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between overflow-hidden z-10">
      {/* Top Mission Control Cluster */}
      <div className="w-full flex flex-col">
        <MissionBar />
        <ResourceDashboard />
      </div>

      {/* Left Navigation Icon Rail & Drawers */}
      <LeftNavPanel />

      {/* Astronaut Switcher HUD & Keyboard Controls */}
      <CrewSwitcherHUD />

      {/* Right Contextual Inspection Panel */}
      <ContextPanel />

      {/* Notification and Space Weather Banner */}
      <NotificationTray />

      {/* Physical Proximity Interaction Prompt [E] */}
      <InteractionPrompt />

      {/* Bottom Astronaut Expedition Roster */}
      <AstronautRoster />
    </div>
  );
};
