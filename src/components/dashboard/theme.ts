import { pick } from '@/constants/scheme';

/** Couleurs du tableau de bord ; variantes sombres choisies au démarrage (voir constants/scheme.ts). */
export const colors = {
  ink: pick('#171717', '#F4EEE9'),
  muted: pick('#737373', '#B3A8A1'),
  soft: pick('#F7F7F8', '#262126'),
  line: pick('#E9E9EC', '#352E32'),
  burgundy: pick('#8B0A24', '#D1416B'),
  burgundyDark: pick('#6E071D', '#A82B52'),
  burgundySoft: pick('#F9E9ED', '#3A1622'),
  green: pick('#147A57', '#4FBF8A'),
  greenSoft: pick('#E6F4EF', '#16291F'),
  gold: pick('#C88728', '#E0A84B'),
  goldSoft: pick('#FBF1DE', '#2E2414'),
  navy: '#07121E',
  error: pick('#D93458', '#EF5D68'),
  /** Blanc littéral : texte et icônes sur fond bordeaux. */
  white: '#FFFFFF',
  /** Fond des cartes et feuilles. */
  surface: pick('#FFFFFF', '#1E1B1F'),
  overlay: pick('rgba(7,18,30,0.45)', 'rgba(0,0,0,0.6)'),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
};
