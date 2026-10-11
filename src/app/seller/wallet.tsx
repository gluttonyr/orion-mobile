import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "@/features/seller/wallet-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, Typography, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Chip, EmptyState, Input, type ChipTone } from "@/components/ui";

type FilterType = "all" | "vente" | "retrait" | "commission";
const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Toutes", value: "all" },
  { label: "Ventes", value: "vente" },
  { label: "Retraits", value: "retrait" },
  { label: "Commissions", value: "commission" },
];

function getTransactionColor(type: string) {
  switch (type) {
    case "vente": return Palette.secondary[600];
    case "retrait": return Palette.warning.text;
    case "commission": return Palette.info.text;
    default: return Palette.textSecondary;
  }
}

function getTransactionBg(type: string) {
  switch (type) {
    case "vente": return Palette.secondary[50];
    case "retrait": return Palette.warning.bg;
    case "commission": return Palette.info.bg;
    default: return Palette.neutral[100];
  }
}

function getTransactionIconName(type: string): any {
  switch (type) {
    case "vente": return "arrow-up-circle";
    case "retrait": return "arrow-down-circle";
    case "commission": return "cash";
    default: return "cash-outline";
  }
}

function getStatusTone(status: string): ChipTone {
  switch (status) {
    case "completed": return "success";
    case "pending": return "warning";
    case "cancelled": return "danger";
    default: return "neutral";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed": return "Complété";
    case "pending": return "En attente";
    case "cancelled": return "Annulé";
    default: return status;
  }
}

export default function WalletScreen() {
  const { totalRevenue, availableBalance, pendingBalance, transactions, withdrawFunds } = useWallet();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const filtered = transactions.filter((t) =>
    filterType === "all" ? true : t.type === filterType
  );

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide.");
      return;
    }
    if (amount > availableBalance) {
      Alert.alert("Erreur", "Montant supérieur au solde disponible.");
      return;
    }
    withdrawFunds(amount);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    Alert.alert("Succès", "Demande de retrait soumise avec succès !");
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title="Mon Portefeuille"
        subtitle="Gérez vos revenus et retraits"
        rightIcon="arrow-down-circle-outline"
        onRight={() => setShowWithdrawModal(true)}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Balance Cards */}
        <View style={styles.balanceCards}>
          <LinearGradient colors={[Palette.info.base, Palette.primary[700]]} style={styles.balanceCard}>
            <View style={styles.balanceIconBox}>
              <Ionicons name="trending-up" size={22} color={Palette.surface} />
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.balanceLabel}>Revenus totaux</Text>
          </LinearGradient>

          <LinearGradient colors={[Palette.secondary[500], Palette.secondary[700]]} style={styles.balanceCard}>
            <View style={styles.balanceIconBox}>
              <Ionicons name="wallet" size={22} color={Palette.surface} />
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
          </LinearGradient>

          <LinearGradient colors={[Palette.warning.base, Palette.warning.text]} style={styles.balanceCard}>
            <View style={styles.balanceIconBox}>
              <Ionicons name="time" size={22} color={Palette.surface} />
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(pendingBalance)}</Text>
            <Text style={styles.balanceLabel}>Solde en attente</Text>
          </LinearGradient>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Palette.info.text} />
          <Text style={styles.infoText}>
            Les fonds des ventes sont disponibles immédiatement après confirmation.
            Les retraits sont traités dans un délai de 24-48h.
          </Text>
        </View>

        {/* Transactions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historique des transactions</Text>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={{ gap: Spacing.two }}
          >
            {FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={filterType === f.value}
                onPress={() => setFilterType(f.value)}
              />
            ))}
          </ScrollView>

          {/* Transaction List */}
          {filtered.length === 0 ? (
            <EmptyState icon="wallet-outline" title="Aucune transaction" />
          ) : (
            <View style={styles.txList}>
              {filtered.map((tx) => {
                const iconColor = getTransactionColor(tx.type);
                return (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={[styles.txIconBox, { backgroundColor: getTransactionBg(tx.type) }]}>
                      <Ionicons name={getTransactionIconName(tx.type)} size={20} color={iconColor} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                      <Text style={styles.txDate}>
                        {tx.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        {tx.orderId ? ` • ${tx.orderId}` : ""}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Chip label={getStatusLabel(tx.status)} tone={getStatusTone(tx.status)} size="sm" />
                      <Text style={[styles.txAmount, { color: iconColor }]}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Retirer des fonds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBalance}>
              <Text style={styles.modalBalanceLabel}>Solde disponible</Text>
              <Text style={[styles.modalBalanceValue, { color: Palette.secondary[600] }]}>
                {formatCurrency(availableBalance)}
              </Text>
            </View>

            <View style={styles.modalField}>
              <Input
                label="Montant à retirer (FCFA)"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Entrez le montant"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <Button title="Annuler" variant="outline" onPress={() => setShowWithdrawModal(false)} style={styles.modalCancelBtn} />
              <Button title="Confirmer" variant="secondary" onPress={handleWithdraw} style={styles.modalConfirmBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  balanceCards: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.three, marginBottom: Spacing.four },
  balanceCard: { padding: Spacing.five, borderRadius: Radius.lg, ...Shadows.md },
  balanceIconBox: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: Spacing.three },
  balanceAmount: { fontSize: 26, fontWeight: "800", color: Palette.surface, marginBottom: 4 },
  balanceLabel: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: Spacing.two, marginHorizontal: Spacing.four,
    marginBottom: Spacing.four, backgroundColor: Palette.info.bg, borderRadius: Radius.md, padding: Spacing.three,
  },
  infoText: { flex: 1, fontSize: 13, color: Palette.info.text, lineHeight: 20 },
  card: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, padding: Spacing.five, ...Shadows.sm },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Palette.text, marginBottom: Spacing.four },
  filterScroll: { marginBottom: Spacing.four },
  txList: { gap: Spacing.three },
  txRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.md, backgroundColor: Palette.neutral[50] },
  txIconBox: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "600", color: Palette.text },
  txDate: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 15, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: Palette.overlay, justifyContent: "flex-end" },
  modalContent: { backgroundColor: Palette.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.six, paddingBottom: Spacing.eight, ...Shadows.lg },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Palette.neutral[300], alignSelf: "center", marginBottom: Spacing.four },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.five },
  modalTitle: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text },
  modalBalance: { marginBottom: Spacing.five },
  modalBalanceLabel: { fontSize: 13, color: Palette.textSecondary, marginBottom: 4 },
  modalBalanceValue: { fontSize: 28, fontWeight: "800" },
  modalField: { marginBottom: Spacing.five },
  modalActions: { flexDirection: "row", gap: Spacing.three },
  modalCancelBtn: { flex: 1 },
  modalConfirmBtn: { flex: 2 },
});
