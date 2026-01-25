// Hawaii Sports Center - Retro 80s Neon Theme
// Matching the web app's Blade Runner aesthetic

export const colors = {
  // Backgrounds
  background: '#0a0a12',
  backgroundSecondary: '#12121f',
  backgroundTertiary: '#1a1a2e',

  // Foreground
  foreground: '#ffffff',
  foregroundMuted: '#a0a0b0',
  foregroundSubtle: '#606070',

  // Borders
  border: '#2a2a3e',
  borderHover: '#3a3a5e',

  // Neon Colors (Primary Accent Palette)
  neonPink: '#ff2a6d',      // Hot pink - primary accent, live games
  neonBlue: '#05d9e8',      // Cyan - secondary accent, selected states
  neonYellow: '#f9f002',    // Bright yellow - warnings, scheduled games
  neonPurple: '#d300c5',    // Purple - tertiary accent
  neonGreen: '#39ff14',     // Neon green - success states, wins
  neonOrange: '#ff6b35',    // Orange - alternative accent

  // Aliases for specific uses
  live: '#ff2a6d',          // Same as neonPink
  success: '#39ff14',       // Same as neonGreen
  warning: '#f9f002',       // Same as neonYellow
  error: '#ff2a6d',         // Same as neonPink
}

// Score LED styles
export const scoreLedStyles = {
  default: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
    borderColor: '#3a3a3a',
    color: '#ffffff',
  },
  amber: {
    background: 'linear-gradient(180deg, #1a1a0a 0%, #0a0a05 100%)',
    borderColor: '#3a3a1a',
    color: colors.neonYellow,
  },
  green: {
    background: 'linear-gradient(180deg, #0a1a0a 0%, #050a05 100%)',
    borderColor: '#1a3a1a',
    color: colors.neonGreen,
  },
}

// Scoreboard panel gradient
export const scoreboardGradient = {
  colors: ['#1a1a2e', '#0f0f1a'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
}

// Shadow/glow effects (for React Native)
export const glows = {
  pink: {
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  blue: {
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  yellow: {
    shadowColor: colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  green: {
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
}

// Font families (system fonts that work well for retro aesthetic)
export const fonts = {
  display: 'System', // Would use Orbitron if we add custom fonts
  mono: 'monospace',
}
