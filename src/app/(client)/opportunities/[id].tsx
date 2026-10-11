import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOpportunity } from "@/features/opportunities/hooks";
import { useAuth } from "@/features/auth/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Spacing, Typography } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, Chip } from "@/components/ui";
import { mission } from "@/service/mission.service";

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isSeller } = useAuth();
  const { opportunity: opp, loading } = useOpportunity(Number(id));
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || isSeller || !id) { setApplied(false); return () => { cancelled = true; }; }
    mission.getMyApplication(Number(id))
      .then((application) => { if (!cancelled) setApplied(Boolean(application)); })
      .catch(() => { if (!cancelled) setApplied(false); });
    return () => { cancelled = true; };
  }, [id, isAuthenticated, isSeller]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isSeller) {
      Alert.alert("Candidature réservée", "Connectez-vous avec un profil entrepreneur pour candidater.");
      return;
    }
    if (!opp || applied || applying) return;
    setApplying(true);
    setApplicationError("");
    try {
      await mission.apply(Number(id), "Candidature envoyée depuis l’application Orion.");
      setApplied(true);
      Alert.alert("Candidature envoyée", "Votre candidature a été transmise.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Impossible d’envoyer votre candidature.";
      setApplicationError(Array.isArray(message) ? message.join("\n") : String(message));
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ActivityIndicator color={Palette.primary[500]} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!opp) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.errorCenter}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.danger.base} />
          <Text style={styles.errorTitle}>Opportunité non trouvée</Text>
          <Button title="Retour" onPress={() => router.back()} variant="primary" size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Détail opportunité" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        <Card style={styles.header}>
          <View style={styles.badgeRow}>
            <Chip label={opp.type ?? "Autre"} tone="info" size="sm" />
            <Chip label={opp.statut ?? "Ouverte"} tone="success" size="sm" />
          </View>
          <Text style={styles.title}>{opp.titre}</Text>
          {opp.localisation && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={Palette.primary[500]} />
              <Text style={styles.metaText}>{opp.localisation}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Détails de la mission</Text>
          <Text style={styles.desc}>{opp.description ?? opp.descriptionCourte ?? "Aucune description."}</Text>

          <View style={styles.detailsList}>
            {opp.montant != null && (
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={18} color={Palette.secondary[600]} />
                <Text style={styles.detailLabel}>Rémunération :</Text>
                <Text style={styles.detailValue}>{formatCurrency(opp.montant)} / {opp.frequencePaiement ?? "projet"}</Text>
              </View>
            )}
            {opp.dureeMission != null && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color={Palette.warning.base} />
                <Text style={styles.detailLabel}>Durée :</Text>
                <Text style={styles.detailValue}>{opp.dureeMission} mois</Text>
              </View>
            )}
            {opp.dateLimiteCandidature && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={Palette.secondary[700]} />
                <Text style={styles.detailLabel}>Date limite :</Text>
                <Text style={styles.detailValue}>{new Date(opp.dateLimiteCandidature).toLocaleDateString("fr-FR")}</Text>
              </View>
            )}
            {opp.datePublication && (
              <View style={styles.detailRow}>
                <Ionicons name="create-outline" size={18} color={Palette.textSecondary} />
                <Text style={styles.detailLabel}>Publiée le :</Text>
                <Text style={styles.detailValue}>{new Date(opp.datePublication).toLocaleDateString("fr-FR")}</Text>
              </View>
            )}
          </View>
        </Card>

        {opp.requis && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Prérequis</Text>
            <Text style={styles.desc}>{opp.requis}</Text>
          </Card>
        )}

        <View style={styles.applySection}>
          <Button
            title={!isAuthenticated ? "Se connecter pour postuler" : isSeller ? "Réservé aux entrepreneurs" : applied ? "Candidature envoyée" : applying ? "Envoi en cours…" : "Postuler à cette opportunité"}
            onPress={handleApply}
            variant="primary"
            size="lg"
            icon={!isAuthenticated ? "log-in-outline" : isSeller ? "lock-closed-outline" : applied ? "checkmark-circle-outline" : "send-outline"}
            disabled={applying || applied || isSeller}
            fullWidth
          />
          {applicationError ? <Text style={styles.applicationError}>{applicationError}</Text> : null}
          {!isAuthenticated && (
            <Text style={styles.applyNote}>Un compte est requis pour postuler à cette opportunité</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  header: { margin: Spacing.four, backgroundColor: Palette.primary[50] },
  badgeRow: { flexDirection: "row", gap: Spacing.two, marginBottom: Spacing.three },
  title: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text, marginBottom: Spacing.three },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 14, color: Palette.textSecondary },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.four },
  cardTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text, marginBottom: Spacing.three },
  desc: { fontSize: 14, color: Palette.textSecondary, lineHeight: 22 },
  detailsList: { marginTop: Spacing.four, gap: Spacing.three },
  detailRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  detailLabel: { fontSize: 14, color: Palette.textSecondary, fontWeight: "600", minWidth: 120 },
  detailValue: { fontSize: 14, fontWeight: "700", color: Palette.text, flex: 1 },
  applySection: { marginHorizontal: Spacing.four, marginBottom: Spacing.four },
  applyNote: { textAlign: "center", fontSize: 12, color: Palette.textSecondary, marginTop: Spacing.three },
  applicationError: { color: Palette.danger.base, fontSize: 13, marginTop: Spacing.three, textAlign: "center" },
  errorCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.eight, gap: Spacing.four },
  errorTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text },
});
