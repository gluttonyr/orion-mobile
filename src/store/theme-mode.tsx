import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun } from 'lucide-react-native';
import { Appearance, Platform, Pressable } from 'react-native';
import { reloadAppAsync } from 'expo';
import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { isDark } from '@/constants/scheme';

type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'orion-theme-mode';
const ThemeModeContext = createContext<{ mode: ThemeMode; toggle: () => void } | null>(null);

/** Forcer le thème n'est possible que sur iOS / Android (pas sur la version web). */
const canOverride = Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function';

/**
 * Applique un thème puis recharge l'app : les couleurs étant choisies au démarrage
 * (constants/scheme.ts), c'est ce qui fait passer tous les écrans en clair ou en sombre.
 * L'écran de démarrage Orion masque le rechargement.
 */
async function applyAndReload(next: ThemeMode) {
  await AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  if (!canOverride) return;
  Appearance.setColorScheme(next);
  await reloadAppAsync('Changement de thème');
}

export function ThemeModeProvider({ children }: PropsWithChildren) {
  // Le mode réellement affiché est celui choisi au démarrage.
  const mode: ThemeMode = isDark ? 'dark' : 'light';

  useEffect(() => {
    // Au lancement à froid, le thème forcé est perdu : on réapplique le choix enregistré si besoin.
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!active || (stored !== 'dark' && stored !== 'light') || stored === mode || !canOverride) return;
      void applyAndReload(stored);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [mode]);

  const value = useMemo(() => ({ mode, toggle: () => { void applyAndReload(mode === 'dark' ? 'light' : 'dark'); } }), [mode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode doit être utilisé dans ThemeModeProvider.');
  return context;
}

export function ThemeModeButton() {
  const { mode, toggle } = useThemeMode();
  const Icon = mode === 'dark' ? Sun : Moon;
  return <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Activer le thème clair' : 'Activer le mode sombre'} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: mode === 'dark' ? '#31313A' : '#F0EAE2', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={mode === 'dark' ? '#F5D58D' : '#8B0A24'} /></Pressable>;
}
