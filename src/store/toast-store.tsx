import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ToastKind = 'success' | 'error' | 'info';
type ToastValue = { message: string; kind: ToastKind; id: number } | null;
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastValue>(null);
  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ message, kind, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const Icon = toast?.kind === 'error' ? CircleAlert : toast?.kind === 'info' ? Info : CheckCircle2;
  return <ToastContext.Provider value={{ showToast }}>
    <View style={styles.root}>
      {children}
      {toast ? <View pointerEvents="box-none" style={styles.toastPosition}>
        <View accessibilityRole="alert" style={[styles.toast, toast.kind === 'error' && styles.error, toast.kind === 'info' && styles.info]}>
          <Icon size={20} color={toast.kind === 'error' ? '#FFFFFF' : toast.kind === 'info' ? '#93C5FD' : '#FFFFFF'} />
          <Text style={styles.message}>{toast.message}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer la notification" onPress={() => setToast(null)} hitSlop={12}><X size={17} color="#FFFFFF" /></Pressable>
        </View>
      </View> : null}
    </View>
  </ToastContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast doit être utilisé dans ToastProvider.');
  return value;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toastPosition: { position: 'absolute', top: 54, left: 16, right: 16, alignItems: 'center', zIndex: 10000, elevation: 10000 },
  toast: { width: '100%', maxWidth: 520, minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#15803D', borderRadius: 15, backgroundColor: '#16A34A', paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 8 },
  error: { borderColor: '#000000', backgroundColor: '#000000' },
  info: { borderColor: '#35465D', backgroundColor: '#1C222C' },
  message: { flex: 1, color: '#F4F1F4', fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
