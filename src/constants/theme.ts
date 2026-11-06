/**
 * Design System — Projet Orion (mobile)
 *
 * Single source of truth for color, typography, spacing, radius and
 * shadow tokens. Every screen/component should consume these instead of
 * hardcoding hex values or ad hoc StyleSheet numbers.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

/** Bordeaux Orion — couleur de marque (même valeur que le site web : #7F1033 / #841438). */
const primary = {
  50: '#FBF0F3',
  100: '#F6DEE4',
  200: '#EBB9C6',
  300: '#D98AA0',
  400: '#B4466A',
  500: '#841438',
  600: '#7F1033',
  700: '#68102D',
  800: '#520C23',
  900: '#3A0818',
} as const;

/** Beige / sable doré — accent chaleureux de la marque (badges, mises en avant). */
const secondary = {
  50: '#FBF6EE',
  100: '#F5EBD9',
  200: '#EBD6B1',
  300: '#E1C089',
  400: '#D2A766',
  500: '#B8893F',
  600: '#96702F',
  700: '#765724',
  800: '#57401A',
  900: '#3A2A11',
} as const;

/** Gris chauds (teinte beige) au lieu des gris bleutés. */
const neutral = {
  0: '#FFFFFF',
  50: '#F7F5F1',
  100: '#F1EDE7',
  200: '#E8E1D9',
  300: '#D9D0C6',
  400: '#B5AAA0',
  500: '#8F857E',
  600: '#6B615C',
  700: '#4B4140',
  800: '#302528',
  900: '#1E1719',
} as const;

const semantic = {
  success: { base: '#2F7D4A', bg: '#E8F3EC', text: '#22603A' },
  warning: { base: '#C88728', bg: '#FBF1DE', text: '#96732E' },
  danger: { base: '#C2343F', bg: '#FBE9EA', text: '#A23B42' },
  info: { base: '#8A6D5B', bg: '#F4EDE7', text: '#6B5244' },
} as const;

export const Palette = {
  primary,
  secondary,
  neutral,
  ...semantic,
  background: neutral[50],
  surface: neutral[0],
  border: neutral[200],
  text: neutral[900],
  textSecondary: neutral[600],
  textMuted: neutral[500],
  overlay: 'rgba(40, 16, 24, 0.55)',
} as const;

/** @deprecated kept only so `use-theme.ts` keeps compiling; use `Palette` directly. */
export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    backgroundElement: Palette.neutral[100],
    backgroundSelected: Palette.neutral[200],
    textSecondary: Palette.textSecondary,
  },
  dark: {
    text: Palette.text,
    background: Palette.background,
    backgroundElement: Palette.neutral[100],
    backgroundSelected: Palette.neutral[200],
    textSecondary: Palette.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

type TextStyleToken = {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
};

export const Typography: Record<string, TextStyleToken> = {
  display: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  subtitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '700', lineHeight: 14, letterSpacing: 0.6 },
};

// ---------------------------------------------------------------------------
// Spacing — 8px grid
// ---------------------------------------------------------------------------

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const Shadows = {
  sm: {
    shadowColor: '#3A0818',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#3A0818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#3A0818',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

/** Clearance to reserve at the bottom of scrollable tab screens so content isn't hidden by the floating tab bar. */
export const BottomTabInset = 110;
export const MaxContentWidth = 800;
