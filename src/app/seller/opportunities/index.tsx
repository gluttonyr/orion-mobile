import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOpportunities } from "@/features/opportunities/hooks";
import { StatutMission } from "@/model/model";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Chip, EmptyState, StatTile, type ChipTone } from "@/components/ui";

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

export default function SellerOpportunitiesScreen() {
  const router = useRouter();
  const { opportunities, loading } = useOpportunities();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = opportunities.filter((o) =>
    (o.titre ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.descriptionCourte ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    Alert.alert("Supprimer", "Supprimer cette opportunité ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => Alert.alert("Supprimée", "L'opportunité a été supprimée."),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="authenticated" title="Opportunités" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Header row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subtitle}>Gérez vos opportunités publiées</Text>
            <Text style={styles.countLabel}>{filtered.length} opportunité{filtered.length !== 1 ? "s" : ""}</Text>
          </View>
          <Button
            title="Créer"
            icon="add"
            size="sm"
            onPress={() => Alert.alert("Créer", "Formulaire de création à venir")}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatTile icon="briefcase-outline" label="Total" value={opportunities.length.toString()} tone="primary" style={styles.statTile} />
          <StatTile icon="people-outline" label="Candidatures" value={opportunities.reduce((s, o) => s + (o.candidatures?.length ?? 0), 0).toString()} tone="secondary" style={styles.statTile} />
          <StatTile icon="checkmark-circle-outline" label="Ouvertes" value={opportunities.filter((o) => o.statut === StatutMission.OUVERTE).length.toString()} tone="success" style={styles.statTile} />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une opportunité..."
            placeholderTextColor={Palette.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={Palette.primary[500]} size="large" style={{ marginVertical: Spacing.eight }} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="Aucune opportunité"
            actionLabel="Créer une opportunité"
            onAction={() => Alert.alert("Créer", "Formulaire de création à venir")}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((opp) => {
              const typeTone = getTypeTone(opp.type ?? "");
              const isOpen = opp.statut === StatutMission.OUVERTE;
              return (
                <View key={opp.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                      <Chip label={opp.type ?? "Autre"} tone={typeTone} size="sm" />
                      <Chip label={opp.statut ?? "Ouverte"} tone={isOpen ? "success" : "danger"} size="sm" />
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{opp.titre}</Text>
                    {opp.localisation && (
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={13} color={Palette.primary[500]} />
                        <Text style={styles.metaText}>{opp.localisation}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {opp.descriptionCourte ?? opp.description ?? ""}
                    </Text>

                    {opp.montant != null && (
                      <View style={styles.metaRow}>
                        <Ionicons name="cash-outline" size={14} color={Palette.secondary[600]} />
                        <Text style={styles.metaText}>{formatCurrency(opp.montant)} / {opp.frequencePaiement ?? "projet"}</Text>
                      </View>
                    )}

                    <View style={styles.candidatureRow}>
                      <View style={styles.candBadge}>
                        <Ionicons name="people-outline" size={14} color={Palette.primary[500]} />
                        <Text style={styles.candText}>{opp.candidatures?.length ?? 0} candidature{(opp.candidatures?.length ?? 0) !== 1 ? "s" : ""}</Text>
                      </View>
                      {opp.dateLimiteCandidature && (
                        <Text style={styles.deadline}>
                          Limite: {new Date(opp.dateLimiteCandidature).toLocaleDateString("fr-FR")}
                        </Text>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push(`/seller/opportunities/${opp.id}` as any)}
                      >
                        <Ionicons name="eye-outline" size={16} color={Palette.primary[500]} />
                        <Text style={[styles.actionText, { color: Palette.primary[500] }]}>Voir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => Alert.alert("Modifier", "Formulaire d'édition à venir")}
                      >
                        <Ionicons name="create-outline" size={16} color={Palette.textSecondary} />
                        <Text style={styles.actionText}>Modifier</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(opp.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={Palette.danger.base} />
                        <Text style={[styles.actionText, { color: Palette.danger.base }]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  subtitle: { fontSize: 13, color: Palette.textSecondary },
  countLabel: { fontSize: 14, fontWeight: "600", color: Palette.text, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  statTile: { flex: 1 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: Spacing.two,
    backgroundColor: Palette.surface, marginHorizontal: Spacing.four, marginBottom: Spacing.four,
    borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Palette.text },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.four },
  card: { backgroundColor: Palette.surface, borderRadius: Radius.lg, overflow: "hidden", ...Shadows.sm },
  cardHeader: { backgroundColor: Palette.primary[50], padding: Spacing.four },
  badgeRow: { flexDirection: "row", gap: Spacing.two, marginBottom: Spacing.two },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Palette.text, marginBottom: Spacing.two },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: Palette.textSecondary },
  cardBody: { padding: Spacing.four },
  cardDesc: { fontSize: 13, color: Palette.textSecondary, lineHeight: 19, marginBottom: Spacing.three },
  candidatureRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.four },
  candBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Palette.primary[50], borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 5 },
  candText: { fontSize: 12, color: Palette.primary[500], fontWeight: "600" },
  deadline: { fontSize: 11, color: Palette.textSecondary },
  actionsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: Palette.border, marginHorizontal: -Spacing.four, marginBottom: -Spacing.four, paddingHorizontal: Spacing.four },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: Spacing.three },
  actionText: { fontSize: 12, fontWeight: "600", color: Palette.textSecondary },
});
