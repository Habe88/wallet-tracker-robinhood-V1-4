export const theme = {
  colors: {
    bg: {
      primary: '#0a0f1a',
      secondary: '#111827',
      tertiary: '#1f2937',
      card: '#161e2e',
      hover: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0f172a',
    },
    border: '#2d3748',
    borderLight: '#3f4a5a',
    
    success: '#10b981',
    successBg: '#064e3b',
    warning: '#f59e0b',
    warningBg: '#78350f',
    error: '#ef4444',
    errorBg: '#7f1d1d',
    info: '#3b82f6',
    infoBg: '#1e3a5f',
    
    accent: {
      primary: '#0ea5e9',
      hover: '#0284c7',
      light: '#38bdf8',
      muted: '#7dd3fc',
    },
    
    chain: {
      robinhood: '#00d4aa',
      ethereum: '#627eea',
      solana: '#9945ff',
      base: '#0052ff',
      arbitrum: '#28a0f0',
      polygon: '#8247e5',
      bsc: '#f0b90b',
    },
    
    gradient: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
      accent: 'linear-gradient(135deg, #0ea5e9 0%, #00d4aa 100%)',
      dark: 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)',
      card: 'linear-gradient(145deg, #161e2e 0%, #1f2937 100%)',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    glowStrong: '0 0 40px rgba(14, 165, 233, 0.5)',
  },
  
  fonts: {
    sans: '"Inter", "Geist", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
    display: '"Geist", "Inter", system-ui, sans-serif',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  zIndex: {
    dropdown: '100',
    sticky: '200',
    modal: '300',
    popover: '400',
    tooltip: '500',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Theme = typeof theme;