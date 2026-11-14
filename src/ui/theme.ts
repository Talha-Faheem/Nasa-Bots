/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/theme.ts
 * Unified visual design system tokens and chamfered sci-fi button styles.
 */

export const THEME = {
  colors: {
    accentCyan: '#2EC4D6',
    accentDim: '#1B7F8E',
    warningAmber: '#FFB020',
    criticalRed: '#FF4D4D',
    textMain: '#E6F1F5',
    textMuted: '#8FA6B2',
    bgDeepNavyStart: '#050A14',
    bgDeepNavyEnd: '#0A1424',
    buttonFill: 'rgba(10, 30, 45, 0.55)',
    buttonHoverFill: 'rgba(15, 45, 68, 0.75)',
    borderSubtle: '#26374D',
  },
  fonts: {
    title: "'Orbitron', 'Rajdhani', sans-serif",
    ui: "'Exo 2', 'Barlow', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Share Tech Mono', 'Space Mono', monospace",
  },
  clipPaths: {
    chamferedBtn: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
    chamferedCard: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
  },
} as const;

export const chamferedBtnStyle = `
  relative uppercase tracking-[0.12em] font-bold text-sm text-[#E6F1F5]
  bg-[rgba(10,30,45,0.55)] border-[1.5px] border-[#2EC4D6]/70
  px-5 py-3 transition-all duration-200 select-none
  hover:border-[#2EC4D6] hover:bg-[rgba(15,45,68,0.75)] hover:translate-x-1.5
  hover:shadow-[0_0_15px_rgba(46,196,214,0.35)]
  focus:outline-none focus:ring-2 focus:ring-[#2EC4D6] focus:ring-offset-1 focus:ring-offset-[#050A14]
  active:bg-[rgba(8,20,32,0.85)] active:translate-x-1
  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:shadow-none
`;
