import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "@/features/seller/wallet-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, Typography, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Card, Chip, EmptyState, StatTile, type ChipTone } from "@/components/ui";

function getStatusBadge(status: string): { label: string; tone: ChipTone } {
  switch (status) {
    case "completed": return { label: "Livré", tone: "success" };
    case "pending": return { label: "En cours", tone: "warning" };
    case "cancelled": return { label: "Annulé", tone: "danger" };
    default: return { label: status, tone: "neutral" };
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BUCKET_COUNT = 6;

const RANGES = [
  { key: "7d", label: "7 jours", days: 7 },
  { key: "30d", label: "30 jours", days: 30 },
  { key: "90d", label: "3 mois", days: 90 },
  { key: "365d", label: "Cette année", days: 365 },
  { key: "all", label: "Tout", days: null as number | null },
];

export default function SellerOrdersScreen() {
  const router = useRouter();
  const { transactions } = useWallet();
  const orders = transactions.filter((t) => t.type === "vente");
  const [rangeKey, setRangeKey] = useState("all");
  const selectedRange = RANGES.find((r) => r.key === rangeKey) ?? RANGES[RANGES.length - 1];

  const { rangeStart, rangeEnd, ordersInRange, revenueInRange, buckets } = useMemo(() => {
    const now = new Date();
    const end = now;
    const start = selectedRange.days != null
      ? new Date(now.getTime() - selectedRange.days * DAY_MS)
      : orders.reduce((min, o) => (o.date < min ? o.date : min), orders[0]?.date ?? now);

    const inRange = orders.filter((o) => o.date >= start && o.date <= end);
    const revenue = inRange
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);

    const spanMs = Math.max(end.getTime() - start.getTime(), DAY_MS);
    const bucketMs = spanMs / BUCKET_COUNT;
    const spanDays = spanMs / DAY_MS;
    const bucketList = Array.from({ length: BUCKET_COUNT }, (_, i) => {
      const bucketStart = new Date(start.getTime() + i * bucketMs);
      return {
        label: bucketStart.toLocaleDateString("fr-FR", spanDays <= 31 ? { day: "2-digit", month: "2-digit" } : { month: "short" }),
        total: 0,
      };
    });
    inRange.forEach((o) => {
      const idx = Math.min(BUCKET_COUNT - 1, Math.floor((o.date.getTime() - start.getTime()) / bucketMs));
      if (idx >= 0) bucketList[idx].total += o.amount;
    });

    return { rangeStart: start, rangeEnd: end, ordersInRange: inRange, revenueInRange: revenue, buckets: bucketList };
  }, [orders, selectedRange]);

  const maxBucket = Math.max(1, ...buckets.map((b) => b.total));
  const hasSalesInRange = ordersInRange.length > 0;

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="authenticated" title="Commandes" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Date range picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeScroll} contentContainerStyle={styles.rangeContent}>
          {RANGES.map((r) => (
            <Chip key={r.key} label={r.label} selected={rangeKey === r.key} onPress={() => setRangeKey(r.key)} />
          ))}
        </ScrollView>
        <Text style={styles.rangeCaption}>
          Du {rangeStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          {" "}au {rangeEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </Text>

        {/* Stats for the selected range */}
        <View style={styles.statsRow}>
          <StatTile icon="cash-outline" value={formatCurrency(revenueInRange)} label="Chiffre d'affaires" tone="primary" style={styles.statTile} />
          <StatTile icon="receipt-outline" value={ordersInRange.length.toString()} label="Commandes" tone="secondary" style={styles.statTile} />
        </View>

        {/* Sales chart for the selected range */}
        <Card style={styles.chartCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Ventes sur la période</Text>
            <Ionicons name="trending-up-outline" size={18} color={Palette.secondary[600]} />
          </View>

          {hasSalesInRange ? (
            <View style={styles.barChart}>
              {buckets.map((b, i) => {
                const heightPct = b.total / maxBucket;
                return (
                  <View key={`${b.label}-${i}`} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <LinearGradient
                        colors={[Palette.primary[500], Palette.info.base]}
                        style={[styles.barFill, { height: `${Math.max(Math.round(heightPct * 100), b.total > 0 ? 6 : 0)}%` }]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{b.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDataText}>Aucune vente sur cette période</Text>
          )}
        </Card>

        {/* Order list */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</Text>
          <TouchableOpacity onPress={() => router.push("/seller/wallet")}>
            <Text style={styles.walletLink}>Voir le portefeuille</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <EmptyState icon="receipt-outline" title="Aucune commande pour le moment" />
        ) : (
          <View style={styles.list}>
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderDesc} numberOfLines={1}>{order.description}</Text>
                    <Chip label={badge.label} tone={badge.tone} size="sm" />
                  </View>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderDate}>
                      {order.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      {order.orderId ? ` • ${order.orderId}` : ""}
                    </Text>
                    <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
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
  rangeScroll: { marginTop: Spacing.three },
  rangeContent: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  rangeCaption: { fontSize: 12, color: Palette.textMuted, paddingHorizontal: Spacing.four, marginTop: Spacing.two },
  statsRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four, marginTop: Spacing.four },
  statTile: { flex: 1 },
  chartCard: { marginHorizontal: Spacing.four, marginTop: Spacing.three },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.four },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Palette.text },
  barChart: { flexDirection: "row", height: 120, gap: Spacing.two },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barTrack: { flex: 1, width: "100%", backgroundColor: Palette.neutral[100], justifyContent: "flex-end", borderRadius: Radius.sm, overflow: "hidden" },
  barFill: { width: "100%" },
  barLabel: { fontSize: 10, color: Palette.textSecondary, fontWeight: "600" },
  noDataText: { fontSize: 13, color: Palette.textSecondary, textAlign: "center", paddingVertical: Spacing.six },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.four, paddingVertical: Spacing.four, marginTop: Spacing.two },
  subtitle: { fontSize: Typography.subtitle.fontSize, fontWeight: "700", color: Palette.text },
  walletLink: { fontSize: 13, color: Palette.primary[500], fontWeight: "700" },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  orderCard: { backgroundColor: Palette.surface, borderRadius: Radius.lg, padding: Spacing.four, ...Shadows.sm },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.two, gap: Spacing.two },
  orderDesc: { flex: 1, fontSize: 14, fontWeight: "600", color: Palette.text },
  orderBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderDate: { fontSize: 12, color: Palette.textSecondary },
  orderAmount: { fontSize: 15, fontWeight: "700", color: Palette.secondary[600] },
});
