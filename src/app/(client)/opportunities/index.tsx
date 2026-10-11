import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useOpportunities } from "@/features/opportunities/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, Chip, EmptyState, Input, StatTile, type ChipTone } from "@/components/ui";

const TYPES = ["Tous", "Emploi", "Mission", "Freelance", "Formation", "Livraison"];

function getTypeTone(type: string): ChipTone {
  const map: Record<string, ChipTone> = {
    Emploi: "info",
    Mission: "success",
    Freelance: "secondary",
    Formation: "danger",
    Livraison: "warning",
  };
  return map[type] ?? "neutral";
}

export default function OpportunitiesScreen() {
  const router = useRouter();
  const { opportunities, loading } = useOpportunities();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");

  const filtered = opportunities.filter((o) => {
    const matchSearch =
      (o.titre ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.descriptionCourte ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "Tous" ||
      (o.type ?? "").toLowerCase() === selectedType.toLowerCase();
    return matchSearch && matchType;
  });

  const stats = [
    { icon: "trophy-outline" as const, value: opportunities.length.toString(), label: "Opportunités actives", tone: "success" as ChipTone },
    { icon: "business-outline" as const, value: "15", label: "Entreprises actives", tone: "primary" as ChipTone },
    { icon: "calendar-outline" as const, value: "8", label: "Nouvelles cette semaine", tone: "secondary" as ChipTone },
  ];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        {/* Hero */}
        <LinearGradient colors={[Palette.primary[600], Palette.secondary[500]]} style={styles.hero}>
          <Text style={styles.heroTitle}>Opportunités de Travail</Text>
          <Text style={styles.heroSubtitle}>
            Découvrez des missions, emplois et projets proposés par des commerçants africains
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <StatTile key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} style={styles.statTile} />
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Input
            icon="search-outline"
            placeholder="Rechercher une opportunité..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              selected={selectedType === type}
              onPress={() => setSelectedType(type)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={Palette.primary[500]} size="large" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="Aucune opportunité trouvée" />
        ) : (
          <View style={styles.list}>
            {filtered.map((opp) => (
              <Card key={opp.id} style={styles.card} padded={false}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardBadgeRow}>
                    <Chip label={opp.type ?? "Autre"} tone={getTypeTone(opp.type ?? "")} size="sm" />
                    <Chip label={opp.statut ?? "Ouvert"} tone="success" size="sm" />
                  </View>
                  <Text style={styles.cardTitle}>{opp.titre}</Text>
                  {opp.localisation && (
                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={14} color={Palette.primary[500]} />
                      <Text style={styles.metaText}>{opp.localisation}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardDesc} numberOfLines={3}>
                    {opp.descriptionCourte ?? opp.description ?? "Aucune description."}
                  </Text>

                  <View style={styles.metaList}>
                    {opp.montant != null && (
                      <View style={styles.metaRow}>
                        <Ionicons name="cash-outline" size={14} color={Palette.secondary[600]} />
                        <Text style={styles.metaText}>
                          {formatCurrency(opp.montant)} / {opp.frequencePaiement ?? "projet"}
                        </Text>
                      </View>
                    )}
                    {opp.dureeMission != null && (
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color={Palette.warning.base} />
                        <Text style={styles.metaText}>Durée : {opp.dureeMission} mois</Text>
                      </View>
                    )}
                  </View>

                  <Button
                    title="Savoir plus & Postuler"
                    onPress={() => router.push(`/opportunities/${opp.id}` as any)}
                    variant="primary"
                    fullWidth
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  hero: { padding: Spacing.seven, paddingBottom: Spacing.eight },
  heroTitle: { fontSize: Typography.display.fontSize, fontWeight: "800", color: Palette.surface, marginBottom: Spacing.three },
  heroSubtitle: { fontSize: 14, color: Palette.primary[100], lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: Spacing.three, padding: Spacing.four, marginTop: -Spacing.six },
  statTile: { flex: 1 },
  searchBox: { marginHorizontal: Spacing.four, marginBottom: Spacing.three },
  filterScroll: { marginBottom: Spacing.four },
  filterContent: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  loader: { marginVertical: Spacing.nine },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.four },
  card: { overflow: "hidden" },
  cardHeader: {
    backgroundColor: Palette.primary[50], padding: Spacing.five,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
  },
  cardBadgeRow: { flexDirection: "row", gap: Spacing.two, marginBottom: Spacing.three },
  cardTitle: { fontSize: Typography.subtitle.fontSize, fontWeight: "700", color: Palette.text, marginBottom: Spacing.two },
  cardBody: { padding: Spacing.five },
  cardDesc: { fontSize: 14, color: Palette.textSecondary, lineHeight: 21, marginBottom: Spacing.four },
  metaList: { gap: Spacing.two, marginBottom: Spacing.four },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: Palette.textSecondary },
});
