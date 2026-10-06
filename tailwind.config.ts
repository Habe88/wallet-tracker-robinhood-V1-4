import type { Config } from 'tailwindcss';
import { theme } from './lib/theme';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: theme.colors.bg,
        text: theme.colors.text,
        border: theme.colors.border,
        borderLight: theme.colors.borderLight,
        success: theme.colors.success,
        successBg: theme.colors.successBg,
        warning: theme.colors.warning,
        warningBg: theme.colors.warningBg,
        error: theme.colors.error,
        errorBg: theme.colors.errorBg,
        info: theme.colors.info,
        infoBg: theme.colors.infoBg,
        accent: theme.colors.accent,
        chain: theme.colors.chain,
        gradient: theme.colors.gradient,
      },
      fontFamily: {
        sans: [theme.fonts.sans],
        mono: [theme.fonts.mono],
        display: [theme.fonts.display],
      },
      fontSize: theme.fontSizes,
      fontWeight: theme.fontWeights,
      lineHeight: theme.lineHeights,
      borderRadius: theme.radius,
      boxShadow: theme.shadows,
      spacing: theme.spacing,
      zIndex: theme.zIndex,
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      backgroundImage: {
        'gradient-primary': theme.colors.gradient.primary,
        'gradient-accent': theme.colors.gradient.accent,
        'gradient-dark': theme.colors.gradient.dark,
        'gradient-card': theme.colors.gradient.card,
      },
      screens: theme.breakpoints,
    },
  },
  plugins: [],
};
export default config;