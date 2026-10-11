import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, RefreshCw, ShieldCheck } from "lucide-react-native";
import { useSubscription } from "@/features/seller/subscription-context";
import { Palette, Radius, Spacing } from "@/constants/theme";

export function SubscriptionsScreen() {
  const { subscription, usage, loading, error, refresh } = useSubscription();
  return (
    <View style={styles.container}>
      <View style={styles.heading}><Text style={styles.title}>Abonnement</Text><Text style={styles.subtitle}>Votre offre active et ses limites.</Text></View>
      {loading ? <Text style={styles.muted}>Chargement de votre abonnement…</Text> : error ? <View style={styles.card}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void refresh()} style={styles.refresh}><RefreshCw size={16} color={Palette.primary[700]} /><Text style={styles.refreshText}>Réessayer</Text></Pressable></View> : (
        <View style={styles.card}>
          <View style={styles.planHeader}><View style={styles.icon}><ShieldCheck size={22} color={Palette.primary[700]} /></View><View style={styles.flex}><Text style={styles.eyebrow}>FORFAIT ACTIF</Text><Text style={styles.planName}>{subscription?.titre ?? "Standard"}</Text></View><Text style={styles.badge}>GRATUIT</Text></View>
          <Text style={styles.description}>Offre de lancement. Toutes les fonctions essentielles pour lancer votre boutique.</Text>
          <View style={styles.line}><Check size={16} color={Palette.success.base} /><Text style={styles.feature}>1 boutique gérable</Text><Text style={styles.count}>{usage?.boutiques ?? 0}/1</Text></View>
          <View style={styles.line}><Check size={16} color={Palette.success.base} /><Text style={styles.feature}>Jusqu’à 40 produits</Text><Text style={styles.count}>{usage?.produits ?? 0}/40</Text></View>
          <View style={styles.notice}><Text style={styles.noticeText}>L’abonnement Standard est activé automatiquement. Aucun paiement n’est demandé.</Text></View>
          <Pressable onPress={() => void refresh()} style={styles.refresh}><RefreshCw size={16} color={Palette.primary[700]} /><Text style={styles.refreshText}>Actualiser</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four }, heading: { marginBottom: Spacing.two }, title: { color: Palette.text, fontSize: 24, fontWeight: "800" }, subtitle: { color: Palette.textMuted, fontSize: 13, marginTop: 4 },
  card: { backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, padding: Spacing.five, gap: Spacing.four }, planHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.three }, icon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Palette.primary[50], alignItems: "center", justifyContent: "center" }, flex: { flex: 1 }, eyebrow: { fontSize: 10, letterSpacing: 0.7, color: Palette.textMuted, fontWeight: "700" }, planName: { color: Palette.text, fontWeight: "800", fontSize: 18, marginTop: 3 }, badge: { color: Palette.success.text, fontSize: 10, fontWeight: "800", backgroundColor: Palette.success.bg, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 }, description: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19 }, line: { flexDirection: "row", alignItems: "center", gap: 9 }, feature: { color: Palette.text, fontSize: 13, flex: 1 }, count: { color: Palette.text, fontSize: 12, fontWeight: "700" }, notice: { backgroundColor: Palette.neutral[100], padding: 12, borderRadius: Radius.md }, noticeText: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18 }, refresh: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 5 }, refreshText: { color: Palette.primary[700], fontSize: 13, fontWeight: "700" }, muted: { color: Palette.textMuted }, error: { color: Palette.danger.text, fontSize: 13 },
});
