/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/icons.tsx
 * Unified, professional SVG icon system powered by lucide-react.
 * Replaces all emojis throughout the entire game interface with consistent, scalable, styled icons.
 */

import React from 'react';
import {
  Zap,
  Wind,
  Droplets,
  Wheat,
  HeartPulse,
  Radiation,
  Radio,
  Home,
  Sun,
  Sprout,
  Shield,
  FlaskConical,
  Truck,
  Wrench,
  Pickaxe,
  Compass,
  Target,
  Trophy,
  BarChart3,
  Users,
  Building2,
  Package,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  ScanEye,
  Camera,
  UserCheck,
  Bed,
  CheckCircle2,
  Flame,
  Snowflake,
  Layers,
  Cog,
  HelpCircle,
  Clock,
  Maximize2,
  Sliders,
  Maximize,
  BatteryCharging,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  BookOpen,
  Hammer,
  GraduationCap,
  Save,
  Database,
  RotateCcw,
  Move,
  X,
} from 'lucide-react';
import { BuildingId, CrewId } from '../sim/types.ts';

export {
  Zap,
  Wind,
  Droplets,
  Wheat,
  HeartPulse,
  Radiation,
  Radio,
  Home,
  Sun,
  Sprout,
  Shield,
  FlaskConical,
  Truck,
  Wrench,
  Pickaxe,
  Compass,
  Target,
  Trophy,
  BarChart3,
  Users,
  Building2,
  Package,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  ScanEye,
  Camera,
  UserCheck,
  Bed,
  CheckCircle2,
  Flame,
  Snowflake,
  Layers,
  Cog,
  HelpCircle,
  Clock,
  Maximize2,
  Sliders,
  Maximize,
  BatteryCharging,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  BookOpen,
  Hammer,
  GraduationCap,
  Save,
  Database,
  RotateCcw,
  Move,
  X,
};

// Building ID -> Lucide icon mapping
export const BUILDING_ICONS: Record<BuildingId, React.ComponentType<{ className?: string }>> = {
  habitat: Home,
  power_station: Sun,
  greenhouse: Sprout,
  recycler: Droplets,
  shelter: Shield,
  laboratory: FlaskConical,
  comms: Radio,
  rover_bay: Truck,
};

// Resource ID -> Lucide icon mapping
export const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  battery: Zap,
  oxygen: Wind,
  water: Droplets,
  food: Wheat,
  health: HeartPulse,
  radiation: Radiation,
  comms: Radio,
};

// Astronaut Crew ID -> Role, Badges, and Vector Portraits
export interface CrewMeta {
  id: CrewId;
  name: string;
  role: string;
  specialtyCode: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CREW_METAS: Record<CrewId, CrewMeta> = {
  alex: {
    id: 'alex',
    name: 'Alex Morgan',
    role: 'Systems Engineer',
    specialtyCode: 'ENG',
    badgeColor: '#38bdf8', // Cyan/Sky
    icon: Wrench,
  },
  sara: {
    id: 'sara',
    name: 'Dr. Sara Williams',
    role: 'Mission Biologist',
    specialtyCode: 'BIO',
    badgeColor: '#22c55e', // Emerald
    icon: Sprout,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Brooks',
    role: 'Chief Geologist',
    specialtyCode: 'GEO',
    badgeColor: '#f59e0b', // Amber
    icon: Pickaxe,
  },
  maya: {
    id: 'maya',
    name: 'Dr. Maya Chen',
    role: 'Flight Surgeon',
    specialtyCode: 'MED',
    badgeColor: '#ec4899', // Pink
    icon: Stethoscope,
  },
};

/**
 * High-definition vector astronaut portrait avatar.
 * Renders an authentic NASA-inspired EVA helmet silhouette with colored role badge and visor sheen.
 */
export const AstronautPortrait: React.FC<{
  crewId: CrewId;
  size?: number;
  isActive?: boolean;
}> = ({ crewId, size = 44, isActive = false }) => {
  const meta = CREW_METAS[crewId] || CREW_METAS.alex;

  return (
    <div
      className={`relative rounded-lg overflow-hidden flex items-center justify-center transition-all ${
        isActive ? 'ring-2 ring-[#25C5F4] shadow-[0_0_12px_rgba(37,197,244,0.4)]' : ''
      }`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #0d1a2d 0%, #060c17 100%)',
        border: `1.5px solid ${meta.badgeColor}66`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        {/* Helmet Outer Shell */}
        <path
          d="M32 6C20 6 12 15 12 28C12 37 17 44 23 48L22 54C22 56 24 58 26 58H38C40 58 42 56 42 54L41 48C47 44 52 37 52 28C52 15 44 6 32 6Z"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Suit Collar & Torso Upper */}
        <path
          d="M18 56L10 64H54L46 56H18Z"
          fill="#334155"
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* Gold/Reflective Visor Bubble */}
        <ellipse
          cx="32"
          cy="27"
          rx="14"
          ry="12"
          fill="url(#visorGrad)"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Visor Glare / Reflection Highlight */}
        <path
          d="M24 20C27 18 31 18 35 19C32 21 28 24 26 28C24.5 25 24 22 24 20Z"
          fill="#ffffff"
          opacity="0.55"
        />
        {/* Specialist Color Role Beacon on Helmet Crest */}
        <circle cx="32" cy="11" r="2.5" fill={meta.badgeColor} />
        <defs>
          <linearGradient id="visorGrad" x1="18" y1="15" x2="46" y2="39" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="0.6" stopColor="#d97706" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Role Code Badge in bottom right */}
      <span
        className="absolute bottom-0.5 right-0.5 font-mono text-[8px] font-bold px-1 rounded leading-none"
        style={{
          backgroundColor: `${meta.badgeColor}33`,
          color: meta.badgeColor,
          border: `1px solid ${meta.badgeColor}88`,
        }}
      >
        {meta.specialtyCode}
      </span>
    </div>
  );
};
