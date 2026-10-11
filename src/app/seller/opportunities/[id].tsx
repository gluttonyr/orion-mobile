import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useOpportunity } from "@/features/opportunities/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Spacing, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, Chip, EmptyState, StatTile, type ChipTone } from "@/components/ui";

function getTypeTone(type: string): ChipTone {
  const map: Record<string, ChipTone> = {
    Emploi: "info",
    Mission: "success",
    Freelance: "primary",
    Formation: "warning",
    Livraison: "secondary",
  };
  return map[type] ?? "neutral";
}

const GRADIENT_MAP: Record<ChipTone, [string, string]> = {
  info: [Palette.info.base, Palette.primary[700]],
  success: [Palette.secondary[500], Palette.secondary[700]],
  primary: [Palette.primary[400], Palette.primary[700]],
  warning: [Palette.warning.base, Palette.warning.text],
  secondary: [Palette.secondary[400], Palette.secondary[700]],
  danger: [Palette.danger.base, Palette.danger.text],
  neutral: [Palette.neutral[500], Palette.neutral[700]],
};

function candidatureTone(statut?: string): ChipTone {
  if (statut === "Accepté") return "success";
  if (statut === "Refusé") return "danger";
  return "neutral";
}

export default function SellerOpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { opportunity: opp, loading } = useOpportunity(Number(id));

  const handleDelete = () => {
    Alert.alert("Supprimer", "Supprimer cette opportunité définitivement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="back" title="Opportunité" />
        <ActivityIndicator color={Palette.primary[500]} size="large" style={{ marginVertical: 60 }} />
      </SafeAreaView>
    );
  }

  if (!opp) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="back" title="Opportunité" />
        <EmptyState
          icon="briefcase-outline"
          title="Opportunité introuvable"
          actionLabel="Retour"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const typeTone = getTypeTone(opp.type ?? "");
  const gradient = GRADIENT_MAP[typeTone];
  const candidatures = opp.candidatures ?? [];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Détails de l'opportunité" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Hero */}
        <LinearGradient colors={gradient} style={styles.hero}>
          <View style={styles.heroBadgeRow}>
            <Chip label={opp.type ?? "Autre"} tone="neutral" size="sm" style={styles.heroBadge} />
            <Chip label={opp.statut ?? "Ouverte"} tone="neutral" size="sm" style={[styles.heroBadge, styles.heroBadgeAlt]} />
          </View>
          <Text style={styles.heroTitle}>{opp.titre}</Text>
          {opp.localisation && (
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{opp.localisation}</Text>
            </View>
          )}
          {opp.montant != null && (
            <Text style={styles.heroPrice}>{formatCurrency(opp.montant)} / {opp.frequencePaiement ?? "projet"}</Text>
          )}
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatTile icon="people-outline" label="Candidatures" value={candidatures.length.toString()} tone="primary" style={styles.statTile} />
          <StatTile icon="time-outline" label="Date limite" value={opp.dateLimiteCandidature ? new Date(opp.dateLimiteCandidature).toLocaleDateString("fr-FR") : "—"} tone="warning" style={styles.statTile} />
          <StatTile icon="checkmark-circle-outline" label="Statut" value={opp.statut ?? "Ouverte"} tone="secondary" style={styles.statTile} />
        </View>

        {/* Description */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{opp.descriptionCourte ?? opp.description ?? "Aucune description."}</Text>
          {opp.descriptionCourte && opp.description && (
            <Text style={styles.descText}>{opp.description}</Text>
          )}
        </Card>

        {/* Candidatures */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Candidatures ({candidatures.length})</Text>
          {candidatures.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="people-outline" size={32} color={Palette.neutral[300]} />
              <Text style={styles.emptySectionText}>Aucune candidature reçue</Text>
            </View>
          ) : (
            <View style={styles.candList}>
              {candidatures.slice(0, 5).map((c: any, i: number) => (
                <View key={i} style={styles.candItem}>
                  <View style={styles.candAvatar}>
                    <Text style={styles.candAvatarText}>{(c.nom ?? "?")[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.candInfo}>
                    <Text style={styles.candName}>{c.nom ?? `Candidat ${i + 1}`}</Text>
                    <Text style={styles.candDate}>{c.dateSoumission ? new Date(c.dateSoumission).toLocaleDateString("fr-FR") : "Récemment"}</Text>
                  </View>
                  <Chip label={c.statut ?? "En attente"} tone={candidatureTone(c.statut)} size="sm" />
                </View>
              ))}
              {candidatures.length > 5 && (
                <Text style={styles.moreText}>+{candidatures.length - 5} autres candidatures</Text>
              )}
            </View>
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Button
            title="Modifier l'opportunité"
            icon="create-outline"
            onPress={() => Alert.alert("Modifier", "Formulaire d'édition à venir")}
            fullWidth
          />
          <Button
            title="Supprimer"
            icon="trash-outline"
            variant="danger"
            onPress={handleDelete}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  hero: { padding: Spacing.six, paddingBottom: Spacing.seven },
  heroBadgeRow: { flexDirection: "row", gap: Spacing.two, marginBottom: Spacing.three },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.25)" },
  heroBadgeAlt: { backgroundColor: "rgba(255,255,255,0.15)" },
  heroTitle: { fontSize: 20, fontWeight: "700", color: Palette.surface, lineHeight: 28, marginBottom: Spacing.two },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: Spacing.two },
  heroMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroPrice: { fontSize: 22, fontWeight: "700", color: Palette.surface, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: Spacing.three, margin: Spacing.four },
  statTile: { flex: 1 },
  section: { marginHorizontal: Spacing.four, marginBottom: Spacing.three },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Palette.text, marginBottom: Spacing.three },
  descText: { fontSize: 14, color: Palette.textSecondary, lineHeight: 22, marginBottom: Spacing.two },
  emptySection: { alignItems: "center", paddingVertical: Spacing.six },
  emptySectionText: { fontSize: 13, color: Palette.textMuted, marginTop: Spacing.two },
  candList: { gap: Spacing.three },
  candItem: { flexDirection: "row", alignItems: "center", gap: Spacing.three, padding: Spacing.three, backgroundColor: Palette.neutral[50], borderRadius: Radius.md },
  candAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Palette.primary[500], alignItems: "center", justifyContent: "center" },
  candAvatarText: { color: Palette.surface, fontWeight: "700", fontSize: 15 },
  candInfo: { flex: 1 },
  candName: { fontSize: 14, fontWeight: "600", color: Palette.text },
  candDate: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  moreText: { fontSize: 12, color: Palette.textSecondary, textAlign: "center", paddingVertical: Spacing.two },
  actionsCard: { marginHorizontal: Spacing.four, gap: Spacing.three },
});
