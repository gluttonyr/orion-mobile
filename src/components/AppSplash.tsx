import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { OrionLogo } from "@/components/OrionLogo";
import { useAuth } from "@/features/auth/hooks";

// Garde l'écran natif affiché jusqu'à ce que notre écran animé prenne le relais (pas de flash blanc).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const MIN_VISIBLE_MS = 1400;

/**
 * Écran de démarrage Orion, rendu par l'app elle-même : il s'affiche aussi dans Expo Go,
 * qui remplace l'écran natif par son propre écran de chargement.
 * Il reste visible au moins 1,4 s et jusqu'à la fin du chargement de la session, puis s'efface en fondu.
 */
export function AppSplash() {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [contentOpacity, logoScale]);

  useEffect(() => {
    if (!minElapsed || isLoading) return;
    Animated.timing(opacity, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true })
      .start(() => setVisible(false));
  }, [isLoading, minElapsed, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none" accessibilityLabel="Chargement d’Orion">
      <View style={styles.ringLarge} />
      <View style={styles.ringSmall} />
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <View style={styles.logoShadow}><OrionLogo size={104} boxed={false} /></View>
      </Animated.View>
      <Animated.View style={[styles.texts, { opacity: contentOpacity }]}>
        <Text style={styles.name}>ORION</Text>
        <Text style={styles.tagline}>Développez votre commerce.{"\n"}Saisissez les opportunités.</Text>
      </Animated.View>
      <Animated.Text style={[styles.footer, { opacity: contentOpacity }]}>MARKETPLACE AFRICAINE</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, alignItems: "center", justifyContent: "center", backgroundColor: "#7F1033", overflow: "hidden" },
  ringLarge: { position: "absolute", width: 520, height: 520, borderRadius: 260, borderWidth: 1, borderColor: "rgba(255,245,232,0.12)", top: -170, right: -190 },
  ringSmall: { position: "absolute", width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: "rgba(255,245,232,0.09)", bottom: -90, left: -110 },
  logoShadow: { borderRadius: 30, shadowColor: "#1E0510", shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 14 },
  texts: { alignItems: "center", marginTop: 26 },
  name: { color: "#FFF5E8", fontSize: 30, fontWeight: "700", letterSpacing: 10, marginLeft: 10 },
  tagline: { marginTop: 12, color: "rgba(255,245,232,0.72)", fontSize: 13, lineHeight: 19, textAlign: "center" },
  footer: { position: "absolute", bottom: 54, color: "#EAC494", fontSize: 10, fontWeight: "800", letterSpacing: 2.4 },
});
