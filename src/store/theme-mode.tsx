import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun } from 'lucide-react-native';
import { Appearance, Pressable } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'orion-theme-mode';
const ThemeModeContext = createContext<{ mode: ThemeMode; toggle: () => void } | null>(null);

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (active && (stored === 'dark' || stored === 'light')) setMode(stored);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  useEffect(() => {
    Appearance.setColorScheme(mode);
    void AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => undefined);
  }, [mode]);
  const value = useMemo(() => ({ mode, toggle: () => setMode((current) => current === 'dark' ? 'light' : 'dark') }), [mode]);
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
