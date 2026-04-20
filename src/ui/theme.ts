import type { Suit } from '@game/types';

export const colors = {
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  surfaceWarm: '#1E1A0E',
  border: '#262626',
  borderStrong: '#404040',

  text: '#F5F5F5',
  textMuted: '#A3A3A3',
  textSubtle: '#6B6B6B',

  orange: '#FF6B35',
  orangeSoft: '#FF8650',
  yellow: '#F5C518',
  purple: '#8B3FBF',
  purpleSoft: '#A94FD4',
  green: '#3FAE6A',
  greenSoft: '#4FC67B',
  red: '#E53E3E',
  redSoft: '#F25B5B',

  orangeDeep: '#C04A1F',
  yellowDeep: '#B89013',
  purpleDeep: '#5F2982',
  greenDeep: '#287846',

  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayStrong: 'rgba(0, 0, 0, 0.85)',
  overlayIntense: 'rgba(0, 0, 0, 0.95)',

  white18: 'rgba(255, 255, 255, 0.18)',
  white22: 'rgba(255, 255, 255, 0.22)',
  red35: 'rgba(229, 62, 62, 0.35)',
  red45: 'rgba(229, 62, 62, 0.45)',
  orange20: 'rgba(255, 107, 53, 0.2)',
} as const;

export const gradients = {
  blaze: [colors.orange, '#FF8A4A', colors.yellow] as const,
  pulse: [colors.green, '#4FD68E', colors.purple] as const,
  ember: [colors.red35, colors.orange20, colors.surface] as const,
  rainbow: [colors.purple, colors.orange, colors.yellow] as const,
  primary: [colors.orange, colors.orangeSoft, colors.yellow] as const,
  success: [colors.green, colors.greenSoft, colors.green] as const,
  destructive: [colors.red, colors.redSoft, colors.red] as const,
  purple: [colors.purple, colors.purpleSoft, colors.purple] as const,
} as const;

export const suitColors: Record<Suit, string> = {
  hearts: colors.green,
  diamonds: colors.orange,
  spades: colors.purple,
  clubs: colors.yellow,
};

export const suitDeepColors: Record<Suit, string> = {
  hearts: colors.greenDeep,
  diamonds: colors.orangeDeep,
  spades: colors.purpleDeep,
  clubs: colors.yellowDeep,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const layout = {
  minTapTarget: 44,
  sheetLandscapeMaxWidth: 560,
  sheetPortraitMaxHeightRatio: 0.94,
  sheetLandscapeMaxHeightRatio: 0.92,
  centerSheetMaxWidth: 480,
} as const;

export const elevation = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  prominent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

export const typography = {
  displayXL: {
    fontFamily: 'Fraunces_900Black',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  displayLG: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  displayMD: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  displaySM: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
  },
  bodyLG: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  bodyMD: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySM: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  labelLG: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  labelMD: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelSM: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 360,
  cinematic: 600,
} as const;

export type ThemeColor = keyof typeof colors;
export type TypographyVariant = keyof typeof typography;
