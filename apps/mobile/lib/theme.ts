// Hawaii Sports Center - Retro 80s Neon Theme
// Matching the web app's Blade Runner aesthetic

// Dark theme colors (default)
export const darkColors = {
  // Backgrounds
  background: '#0a0a12',
  backgroundSecondary: '#12121f',
  backgroundTertiary: '#1a1a2e',

  // Foreground
  foreground: '#ffffff',
  foregroundMuted: '#a0a0b0',
  foregroundSubtle: '#8a8a9a',

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

// Light theme colors
export const lightColors = {
  // Backgrounds
  background: '#f5f0fa',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#ebe5f0',

  // Foreground
  foreground: '#1a1a2e',
  foregroundMuted: '#505070',
  foregroundSubtle: '#707090',

  // Borders
  border: '#d0c8e0',
  borderHover: '#b0a8c0',

  // Neon Colors (Adjusted for light backgrounds)
  neonPink: '#d91a5a',      // Darker pink for contrast
  neonBlue: '#0099aa',      // Darker cyan for contrast
  neonYellow: '#b8a000',    // Darker yellow/gold for contrast
  neonPurple: '#a000a0',    // Darker purple for contrast
  neonGreen: '#00aa00',     // Darker green for contrast
  neonOrange: '#cc5020',    // Darker orange for contrast

  // Aliases for specific uses
  live: '#d91a5a',          // Same as neonPink
  success: '#00aa00',       // Same as neonGreen
  warning: '#b8a000',       // Same as neonYellow
  error: '#d91a5a',         // Same as neonPink
}

// Default export for backward compatibility
export const colors = darkColors

export type ThemeColors = typeof darkColors

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
