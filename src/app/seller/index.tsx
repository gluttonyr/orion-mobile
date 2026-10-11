import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/features/seller/boutique-context";
import { useWallet } from "@/features/seller/wallet-context";
import { dashboardStats, recentSales, missions } from "@/features/seller/mock";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, Typography, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Card, Chip, StatTile, Button, type ChipTone } from "@/components/ui";

function statusTone(status: string): ChipTone {
  switch (status) {
    case "Livré": return "success";
    case "En cours": return "info";
    default: return "warning";
  }
}

export default function DashboardScreen() {
  const router = useRouter();
  const { activeStore } = useStore();
  const { totalRevenue, availableBalance, pendingBalance } = useWallet();

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="authenticated" title="Tableau de bord" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        {/* Active Store Banner */}
        <LinearGradient colors={[Palette.primary[600], Palette.primary[400]]} style={styles.storeBanner}>
          <View style={styles.storeInfo}>
            <View style={styles.storeIconBox}>
              <Ionicons name="storefront" size={22} color={Palette.surface} />
            </View>
            <View>
              <Text style={styles.storeLabel}>Vous gérez actuellement</Text>
              <Text style={styles.storeName}>{activeStore?.nom ?? "Aucune boutique"}</Text>
              {activeStore?.location && <Text style={styles.storeLocation}>{activeStore.location}</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.changeStoreBtn} onPress={() => router.push("/seller/shop")}>
            <Text style={styles.changeStoreText}>Changer</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick cards */}
        <View style={styles.quickCards}>
          <Card onPress={() => router.push("/seller/wallet")} style={styles.quickCard}>
            <View style={styles.quickCardHeader}>
              <View style={[styles.quickCardIcon, { backgroundColor: Palette.secondary[50] }]}>
                <Ionicons name="wallet-outline" size={22} color={Palette.secondary[600]} />
              </View>
              <Text style={styles.quickCardTitle}>Mon Portefeuille</Text>
              <Ionicons name="arrow-forward" size={16} color={Palette.textMuted} style={{ marginLeft: "auto" }} />
            </View>
            <Text style={styles.quickCardValue}>{formatCurrency(availableBalance)}</Text>
            <View style={styles.quickCardFooter}>
              <Text style={styles.quickCardFooterLabel}>En attente: </Text>
              <Text style={[styles.quickCardFooterValue, { color: Palette.warning.text }]}>{formatCurrency(pendingBalance)}</Text>
              <Text style={styles.quickCardFooterLabel}>  Total: </Text>
              <Text style={[styles.quickCardFooterValue, { color: Palette.secondary[600] }]}>{formatCurrency(totalRevenue)}</Text>
            </View>
          </Card>

          <Card onPress={() => router.push("/seller/products")} style={styles.quickCard}>
            <View style={styles.quickCardHeader}>
              <View style={[styles.quickCardIcon, { backgroundColor: Palette.primary[50] }]}>
                <Ionicons name="cube-outline" size={22} color={Palette.primary[500]} />
              </View>
              <Text style={styles.quickCardTitle}>Mes Produits</Text>
              <Ionicons name="arrow-forward" size={16} color={Palette.textMuted} style={{ marginLeft: "auto" }} />
            </View>
            <Text style={styles.quickCardValue}>{dashboardStats.stock}</Text>
            <Text style={styles.quickCardSub}>Articles en stock</Text>
          </Card>
        </View>

        {/* Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
        </View>
        <View style={styles.statsGrid}>
          {[
            { icon: "cash-outline" as const, label: "Revenus totaux", value: formatCurrency(dashboardStats.revenue), growth: dashboardStats.revenueGrowth, tone: "primary" as ChipTone },
            { icon: "cart-outline" as const, label: "Ventes ce mois", value: dashboardStats.sales.toString(), growth: dashboardStats.salesGrowth, tone: "secondary" as ChipTone },
            { icon: "cube-outline" as const, label: "Articles en stock", value: dashboardStats.stock.toString(), growth: dashboardStats.stockGrowth, tone: "info" as ChipTone },
            { icon: "time-outline" as const, label: "Commandes en cours", value: dashboardStats.pendingOrders.toString(), growth: dashboardStats.ordersGrowth, tone: "warning" as ChipTone },
          ].map((stat) => (
            <View key={stat.label} style={styles.statTileWrap}>
              <StatTile icon={stat.icon} value={stat.value} label={stat.label} tone={stat.tone} />
              <View style={[styles.growthBadge, { backgroundColor: stat.growth >= 0 ? Palette.success.bg : Palette.danger.bg }]}>
                <Ionicons name={stat.growth >= 0 ? "trending-up" : "trending-down"} size={12} color={stat.growth >= 0 ? Palette.success.text : Palette.danger.text} />
                <Text style={{ fontSize: 11, color: stat.growth >= 0 ? Palette.success.text : Palette.danger.text, fontWeight: "600" }}>
                  {stat.growth > 0 ? "+" : ""}{stat.growth}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Sales */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Ventes récentes</Text>
            <TouchableOpacity onPress={() => router.push("/seller/orders")}>
              <Text style={styles.viewAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleRow}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleProduct}>{sale.product}</Text>
                <Text style={styles.saleDate}>{sale.date}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleAmount}>{formatCurrency(sale.amount)}</Text>
                <Chip label={sale.status} tone={statusTone(sale.status)} size="sm" />
              </View>
            </View>
          ))}
        </Card>

        {/* Missions */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Missions en cours</Text>
            <TouchableOpacity onPress={() => router.push("/seller/opportunities")}>
              <Ionicons name="arrow-forward" size={18} color={Palette.primary[500]} />
            </TouchableOpacity>
          </View>
          {missions.map((m) => (
            <View key={m.id} style={styles.missionCard}>
              <View style={styles.missionTop}>
                <Text style={styles.missionTitle} numberOfLines={1}>{m.title}</Text>
                <Chip label={m.type} tone="primary" size="sm" />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progression</Text>
                <Text style={styles.progressValue}>{m.progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${m.progress}%` }]} />
              </View>
              <View style={styles.missionFooter}>
                <Text style={styles.missionDeadline}>Échéance: {m.deadline}</Text>
                <Text style={styles.missionReward}>{m.reward.split(" ")[0]}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Quick Actions */}
        <LinearGradient colors={[Palette.primary[500], Palette.secondary[500]]} style={styles.ctaBanner}>
          <Text style={styles.ctaTitle}>Développez votre activité</Text>
          <Text style={styles.ctaSubtitle}>Explorez nos opportunités de financement et formations</Text>
          <Button
            title="Découvrir les opportunités"
            onPress={() => router.push("/seller/opportunities")}
            icon="arrow-forward"
            iconPosition="right"
            size="sm"
            style={{ backgroundColor: Palette.surface, alignSelf: "flex-start" }}
            variant="ghost"
          />
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  storeBanner: {
    padding: Spacing.five, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: Radius.lg, marginHorizontal: Spacing.four, marginTop: Spacing.three, ...Shadows.md,
  },
  storeInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.three, flexShrink: 1 },
  storeIconBox: { width: 44, height: 44, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  storeLabel: { fontSize: 11, color: Palette.primary[100], marginBottom: 2 },
  storeName: { fontSize: 17, fontWeight: "700", color: Palette.surface },
  storeLocation: { fontSize: 11, color: Palette.primary[100], marginTop: 2 },
  changeStoreBtn: { backgroundColor: Palette.surface, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill },
  changeStoreText: { color: Palette.primary[500], fontSize: 13, fontWeight: "700" },
  quickCards: { padding: Spacing.four, gap: Spacing.three },
  quickCard: {},
  quickCardHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.three, marginBottom: Spacing.three },
  quickCardIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  quickCardTitle: { fontSize: 14, color: Palette.textSecondary, fontWeight: "500" },
  quickCardValue: { fontSize: 24, fontWeight: "800", color: Palette.text, marginBottom: Spacing.two },
  quickCardSub: { fontSize: 13, color: Palette.textSecondary },
  quickCardFooter: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  quickCardFooterLabel: { fontSize: 12, color: Palette.textSecondary },
  quickCardFooterValue: { fontSize: 12, fontWeight: "700" },
  sectionHeader: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  sectionTitle: { fontSize: Typography.h2.fontSize, fontWeight: "700", color: Palette.text },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.three, paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  statTileWrap: { width: "47%", position: "relative" },
  growthBadge: { position: "absolute", top: Spacing.three, right: Spacing.three, flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.pill },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.three },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.four },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Palette.text },
  viewAll: { color: Palette.primary[500], fontSize: 13, fontWeight: "600" },
  saleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Palette.neutral[50], borderRadius: Radius.md, padding: Spacing.three, marginBottom: Spacing.two },
  saleInfo: {},
  saleProduct: { fontSize: 14, fontWeight: "600", color: Palette.text },
  saleDate: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  saleRight: { alignItems: "flex-end", gap: 4 },
  saleAmount: { fontSize: 14, fontWeight: "700", color: Palette.text },
  missionCard: { backgroundColor: Palette.primary[50], borderRadius: Radius.md, padding: Spacing.three, marginBottom: Spacing.three },
  missionTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.three, gap: Spacing.two },
  missionTitle: { fontSize: 14, fontWeight: "600", color: Palette.text, flex: 1 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 12, color: Palette.textSecondary },
  progressValue: { fontSize: 12, fontWeight: "700", color: Palette.text },
  progressBarBg: { height: 8, backgroundColor: Palette.neutral[200], borderRadius: Radius.pill, marginBottom: Spacing.three, overflow: "hidden" },
  progressBarFill: { height: 8, backgroundColor: Palette.primary[500], borderRadius: Radius.pill },
  missionFooter: { flexDirection: "row", justifyContent: "space-between" },
  missionDeadline: { fontSize: 12, color: Palette.textSecondary },
  missionReward: { fontSize: 13, fontWeight: "700", color: Palette.secondary[600] },
  ctaBanner: { margin: Spacing.four, padding: Spacing.six, borderRadius: Radius.lg, ...Shadows.md },
  ctaTitle: { fontSize: 18, fontWeight: "700", color: Palette.surface, marginBottom: Spacing.two },
  ctaSubtitle: { fontSize: 13, color: Palette.primary[100], marginBottom: Spacing.four },
});
