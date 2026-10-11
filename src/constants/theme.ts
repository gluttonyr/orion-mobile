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

/** Deep blue — brand identity, kept from the original palette. */
const primary = {
  50: '#EEF2FB',
  100: '#DCE4F6',
  200: '#B3C3EA',
  300: '#8AA2DE',
  400: '#4A6BC8',
  500: '#1E3A8A',
  600: '#1B3378',
  700: '#162A63',
  800: '#11214E',
  900: '#0C1838',
} as const;

/** Emerald green — brand identity, kept from the original palette. */
const secondary = {
  50: '#E9FBF4',
  100: '#CFF7E6',
  200: '#9FEFCE',
  300: '#66E0B3',
  400: '#2ECB95',
  500: '#10B981',
  600: '#0D9C6E',
  700: '#0A7D59',
  800: '#075E43',
  900: '#04402E',
} as const;

const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E7EBF0',
  300: '#D6DCE5',
  400: '#AEB7C4',
  500: '#828C9B',
  600: '#5B6472',
  700: '#3D4451',
  800: '#242A34',
  900: '#12151A',
} as const;

const semantic = {
  success: { base: '#10B981', bg: '#E9FBF4', text: '#0A7D59' },
  warning: { base: '#F59E0B', bg: '#FEF6E7', text: '#B45309' },
  danger: { base: '#EF4444', bg: '#FDECEC', text: '#B91C1C' },
  info: { base: '#3B82F6', bg: '#EAF2FE', text: '#1D4ED8' },
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
  overlay: 'rgba(12, 24, 56, 0.55)',
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
    shadowColor: '#0C1838',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0C1838',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0C1838',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

/** Clearance to reserve at the bottom of scrollable tab screens so content isn't hidden by the floating tab bar. */
export const BottomTabInset = 110;
export const MaxContentWidth = 800;
