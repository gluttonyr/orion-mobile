import { Appearance } from 'react-native';

/**
 * Mode de couleur figé au démarrage de l'app.
 *
 * Les styles React Native (StyleSheet.create) sont calculés une seule fois, au chargement des fichiers.
 * Pour que TOUS les écrans passent en sombre, les palettes sont donc choisies ici, au démarrage,
 * et un changement de thème recharge l'app (voir store/theme-mode.tsx).
 * Appearance reflète le thème forcé par l'app (Appearance.setColorScheme) ou, à défaut, celui du téléphone.
 */
export const isDark = Appearance.getColorScheme() === 'dark';

/** Choisit la valeur claire ou sombre selon le mode du démarrage. */
export const pick = <T,>(light: T, dark: T): T => (isDark ? dark : light);

/** Couleurs d'interface partagées pour les styles écrits directement dans les écrans. */
export const ui = {
  /** Fond des cartes, feuilles et champs (blanc en clair). */
  surface: pick('#FFFFFF', '#1E1B1F'),
  /** Variante crème des surfaces (formulaires d'authentification, champs). */
  surfaceWarm: pick('#FFFCF7', '#1E1B1F'),
  field: pick('#FFFEFC', '#262126'),
  /** Fond général des pages. */
  canvas: pick('#F5EFE7', '#141215'),
  soft: pick('#F7F1E9', '#262126'),
  /** Texte principal, secondaire et discret. */
  ink: pick('#241C1C', '#F4EEE9'),
  muted: pick('#766D67', '#B3A8A1'),
  /** Bordures et séparateurs. */
  line: pick('#E8DED2', '#352E32'),
  /** Bordeaux lisible : couleur de marque en clair, version éclaircie en sombre (texte et boutons). */
  brand: pick('#74122E', '#D1416B'),
  brandDark: pick('#580D27', '#A82B52'),
  brandSoft: pick('#F6E7E7', '#3A1622'),
  /** Texte posé sur un fond de marque (toujours clair). */
  onBrand: '#FFFFFF',
};
