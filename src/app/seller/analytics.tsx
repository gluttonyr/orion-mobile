import {
  View, Text, StyleSheet, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Card, StatTile, type ChipTone } from "@/components/ui";

const dashboardStats = {
  revenue: 2450000,
  sales: 87,
  revenueGrowth: 12.5,
  salesGrowth: 8.3,
};

const salesByMonth = [
  { month: "Oct", ventes: 1200000, commandes: 45 },
  { month: "Nov", ventes: 1580000, commandes: 52 },
  { month: "Déc", ventes: 1950000, commandes: 68 },
  { month: "Jan", ventes: 2100000, commandes: 71 },
  { month: "Fév", ventes: 2280000, commandes: 79 },
  { month: "Mar", ventes: 2450000, commandes: 87 },
];

const salesByCategory = [
  { name: "Électronique", value: 850000, percentage: 35, color: Palette.primary[500] },
  { name: "Mode", value: 610000, percentage: 25, color: Palette.secondary[500] },
  { name: "Alimentation", value: 490000, percentage: 20, color: Palette.info.base },
  { name: "Équipement", value: 365000, percentage: 15, color: Palette.warning.base },
  { name: "Beauté", value: 135000, percentage: 5, color: Palette.primary[300] },
];

const topProducts = [
  { name: "Machine à Coudre", sales: 8, revenue: 3600000 },
  { name: "Smartphone Samsung", sales: 15, revenue: 2775000 },
  { name: "Riz Local 50kg", sales: 35, revenue: 1120000 },
  { name: "Tissus Wax", sales: 42, revenue: 1050000 },
  { name: "Générateur 5.5kVA", sales: 6, revenue: 1680000 },
];

const maxVentes = Math.max(...salesByMonth.map((m) => m.ventes));

const QUICK_STATS: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; growth: string; tone: ChipTone }[] = [
  { icon: "cash-outline", label: "Revenus totaux", value: formatCurrency(dashboardStats.revenue), growth: `+${dashboardStats.revenueGrowth}%`, tone: "primary" },
  { icon: "cart-outline", label: "Ventes totales", value: dashboardStats.sales.toString(), growth: `+${dashboardStats.salesGrowth}%`, tone: "secondary" },
  { icon: "trending-up-outline", label: "Valeur moyenne", value: formatCurrency(dashboardStats.revenue / dashboardStats.sales), growth: "+5.1%", tone: "info" },
  { icon: "eye-outline", label: "Visiteurs uniques", value: "2 847", growth: "+18.5%", tone: "warning" },
];

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Analyses" subtitle="Vue d'ensemble de votre performance commerciale" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {QUICK_STATS.map((s) => (
            <View key={s.label} style={styles.statTileWrap}>
              <StatTile icon={s.icon} value={s.value} label={s.label} tone={s.tone} />
              <Text style={[styles.statGrowth, { color: s.growth.startsWith("+") ? Palette.success.text : Palette.danger.text }]}>{s.growth}</Text>
            </View>
          ))}
        </View>

        {/* Sales Trend */}
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Évolution des ventes</Text>
            <Ionicons name="trending-up-outline" size={18} color={Palette.secondary[600]} />
          </View>
          <View style={styles.barChart}>
            {salesByMonth.map((item) => {
              const heightPct = item.ventes / maxVentes;
              return (
                <View key={item.month} style={styles.barCol}>
                  <Text style={styles.barValue} numberOfLines={1}>
                    {(item.ventes / 1000000).toFixed(1)}M
                  </Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[Palette.primary[500], Palette.info.base]}
                      style={[styles.barFill, { height: `${Math.round(heightPct * 100)}%` }]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.barLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Ventes mensuelles (en millions XOF)</Text>
          </View>
        </Card>

        {/* Category Distribution */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ventes par catégorie</Text>
          <View style={styles.categoryList}>
            {salesByCategory.map((cat) => (
              <View key={cat.name} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={styles.categoryPct}>{cat.percentage}%</Text>
                  <Text style={styles.categoryVal}>{formatCurrency(cat.value)}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Orders by month */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Commandes par mois</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeadText]}>Mois</Text>
            <Text style={[styles.tableCell, styles.tableHeadText, styles.tableCellRight]}>Commandes</Text>
            <Text style={[styles.tableCell, styles.tableHeadText, styles.tableCellRight]}>Ventes</Text>
          </View>
          {salesByMonth.map((item, i) => (
            <View key={item.month} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
              <Text style={styles.tableCell}>{item.month}</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>{item.commandes}</Text>
              <Text style={[styles.tableCell, styles.tableCellRight, { color: Palette.primary[500], fontWeight: "700" }]}>
                {formatCurrency(item.ventes)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Top Products */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Produits les plus vendus</Text>
          {topProducts
            .slice()
            .sort((a, b) => b.revenue - a.revenue)
            .map((p, i) => (
              <View key={p.name} style={[styles.topProductRow, i < topProducts.length - 1 && styles.topProductBorder]}>
                <View style={[styles.rankBadge, { backgroundColor: i === 0 ? Palette.warning.bg : Palette.neutral[100] }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? Palette.warning.text : Palette.textSecondary }]}>#{i + 1}</Text>
                </View>
                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.topProductSales}>{p.sales} ventes</Text>
                </View>
                <Text style={styles.topProductRevenue}>{formatCurrency(p.revenue)}</Text>
              </View>
            ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  statTileWrap: { width: "47%", position: "relative" },
  statGrowth: { position: "absolute", top: Spacing.three, right: Spacing.three, fontSize: 12, fontWeight: "700" },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.three },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Palette.text, marginBottom: Spacing.four },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.four },
  barChart: { flexDirection: "row", height: 120, gap: Spacing.two, marginBottom: Spacing.three },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { fontSize: 9, color: Palette.textSecondary, textAlign: "center" },
  barTrack: { flex: 1, width: "100%", backgroundColor: Palette.neutral[100], justifyContent: "flex-end", borderRadius: Radius.sm, overflow: "hidden" },
  barFill: { width: "100%", minHeight: 4 },
  barLabel: { fontSize: 11, color: Palette.textSecondary, fontWeight: "600" },
  barLegend: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  legendDot: { width: 12, height: 12, borderRadius: Radius.pill, backgroundColor: Palette.primary[500] },
  legendText: { fontSize: 11, color: Palette.textSecondary },
  categoryList: { gap: Spacing.three },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  categoryLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.two, width: 110 },
  categoryDot: { width: 10, height: 10, borderRadius: Radius.pill },
  categoryName: { fontSize: 12, color: Palette.textSecondary, fontWeight: "600", flex: 1 },
  categoryRight: { flex: 1, flexDirection: "row", alignItems: "center", gap: Spacing.two },
  progressTrack: { flex: 1, height: 8, backgroundColor: Palette.neutral[100], borderRadius: Radius.pill, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: Radius.pill },
  categoryPct: { width: 32, fontSize: 12, fontWeight: "700", color: Palette.text, textAlign: "right" },
  categoryVal: { width: 80, fontSize: 11, color: Palette.textSecondary, textAlign: "right" },
  tableHeader: { flexDirection: "row", paddingVertical: Spacing.two, borderBottomWidth: 1, borderBottomColor: Palette.border, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: Spacing.three, borderRadius: Radius.sm },
  tableRowEven: { backgroundColor: Palette.neutral[50] },
  tableCell: { flex: 1, fontSize: 13, color: Palette.textSecondary },
  tableHeadText: { fontWeight: "700", color: Palette.text, fontSize: 12 },
  tableCellRight: { textAlign: "right" },
  topProductRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three, paddingVertical: Spacing.three },
  topProductBorder: { borderBottomWidth: 1, borderBottomColor: Palette.border },
  rankBadge: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 12, fontWeight: "700" },
  topProductInfo: { flex: 1 },
  topProductName: { fontSize: 13, fontWeight: "600", color: Palette.text },
  topProductSales: { fontSize: 11, color: Palette.textSecondary, marginTop: 2 },
  topProductRevenue: { fontSize: 13, fontWeight: "700", color: Palette.primary[500] },
});
