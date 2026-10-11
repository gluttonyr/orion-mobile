import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCw, ShieldCheck } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { useSubscription } from "@/features/seller/subscription-context";
import { Palette, Radius, Spacing } from "@/constants/theme";

export default function SellerSubscriptionScreen() {
  const { subscription, usage, loading, error, refresh } = useSubscription();
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <AppHeader variant="back" title="Abonnement" subtitle="Votre forfait Standard" />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.heading}><View style={styles.icon}><ShieldCheck size={23} color={Palette.surface} /></View><View style={styles.flex}><Text style={styles.kicker}>OFFRE DE LANCEMENT</Text><Text style={styles.title}>{subscription?.titre ?? "Standard"}</Text></View><Text style={styles.free}>GRATUIT</Text></View>
        <Text style={styles.copy}>Le forfait Standard est activé automatiquement et reste gratuit au lancement.</Text>
        <View style={styles.metric}><Text style={styles.label}>Boutique gérable</Text><Text style={styles.value}>{usage?.boutiques ?? 0}/1</Text></View>
        <View style={styles.metric}><Text style={styles.label}>Produits</Text><Text style={styles.value}>{usage?.produits ?? 0}/40</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <Text style={styles.label}>Chargement…</Text> : null}
        <Pressable onPress={() => void refresh()} style={styles.refresh}><RefreshCw size={16} color={Palette.primary[700]} /><Text style={styles.refreshText}>Actualiser</Text></Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Palette.background }, content: { padding: Spacing.four }, card: { backgroundColor: Palette.surface, borderRadius: Radius.lg, padding: Spacing.five, gap: Spacing.four }, heading: { flexDirection: "row", alignItems: "center", gap: Spacing.three }, icon: { width: 46, height: 46, borderRadius: Radius.md, backgroundColor: Palette.secondary[600], alignItems: "center", justifyContent: "center" }, flex: { flex: 1 }, kicker: { color: Palette.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 0.7 }, title: { color: Palette.text, fontSize: 20, fontWeight: "800", marginTop: 2 }, free: { color: Palette.secondary[700], backgroundColor: Palette.secondary[50], paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, fontSize: 10, fontWeight: "800" }, copy: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19 }, metric: { flexDirection: "row", justifyContent: "space-between" }, label: { color: Palette.textSecondary, fontSize: 13 }, value: { color: Palette.text, fontSize: 13, fontWeight: "800" }, refresh: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 }, refreshText: { color: Palette.primary[700], fontWeight: "700" }, error: { color: Palette.danger?.base ?? "#B42318", fontSize: 12 } });
