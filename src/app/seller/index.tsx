import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/features/seller/boutique-context";
import { useWallet } from "@/features/seller/wallet-context";
import { useAuth } from "@/features/auth/hooks";
import { ordersApi, type SellerAnalytics } from "@/features/orders/api";
import { produitService } from "@/service/produit.service";
import { mission as missionService } from "@/service/mission.service";
import type { Mission } from "@/model/model";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, Typography, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Card, Chip, StatTile, Button, type ChipTone } from "@/components/ui";

function statusTone(status: string): ChipTone {
  switch (status) {
    case "terminee": return "success";
    case "payee": return "info";
    default: return "warning";
  }
}

function statusLabel(status: string) {
  return status === "terminee" ? "Terminée" : status === "payee" ? "Payée" : status;
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Données réelles du tableau de bord : ventes du mois, stock et missions du commerçant. */
function useSellerOverview(userId?: number) {
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [stock, setStock] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  useEffect(() => {
    if (!userId) return;
    const now = new Date();
    ordersApi.getSellerAnalytics(monthKey(new Date(now.getFullYear(), now.getMonth(), 1)), monthKey(now)).then(setAnalytics).catch(() => setAnalytics(null));
    produitService.getByOwner(userId).then((products) => {
      setProductCount(products.length);
      setStock(products.reduce((total, product) => total + Number(product.stock ?? 0), 0));
    }).catch(() => undefined);
    missionService.getMine().then(setMissions).catch(() => setMissions([]));
  }, [userId]);
  return { analytics, stock, productCount, missions };
}

export default function DashboardScreen() {
  const router = useRouter();
  const { activeStore } = useStore();
  const { totalRevenue, availableBalance, pendingBalance } = useWallet();
  const { user } = useAuth();
  const { analytics, stock, productCount, missions } = useSellerOverview(user?.id);
  const summary = analytics?.summary ?? { revenue: 0, orderCount: 0, unitsSold: 0, averageOrderValue: 0 };
  const recentSales = analytics?.recentOrders.slice(0, 5) ?? [];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="authenticated" title="Tableau de bord" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        {/* Active Store Banner */}
        <LinearGradient colors={Palette.brandGradientDeep} style={styles.storeBanner}>
          <View style={styles.storeInfo}>
            <View style={styles.storeIconBox}>
              <Ionicons name="storefront" size={22} color={Palette.onPrimary} />
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
            <Text style={styles.quickCardValue}>{stock}</Text>
            <Text style={styles.quickCardSub}>Articles en stock · {productCount} produit{productCount === 1 ? "" : "s"}</Text>
          </Card>
        </View>

        {/* Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
        </View>
        <View style={styles.statsGrid}>
          {[
            { icon: "cash-outline" as const, label: "Revenus du mois", value: formatCurrency(summary.revenue), tone: "primary" as ChipTone },
            { icon: "cart-outline" as const, label: "Commandes du mois", value: summary.orderCount.toString(), tone: "secondary" as ChipTone },
            { icon: "cube-outline" as const, label: "Articles en stock", value: stock.toString(), tone: "info" as ChipTone },
            { icon: "pricetag-outline" as const, label: "Panier moyen", value: formatCurrency(summary.averageOrderValue), tone: "warning" as ChipTone },
          ].map((stat) => (
            <View key={stat.label} style={styles.statTileWrap}>
              <StatTile icon={stat.icon} value={stat.value} label={stat.label} tone={stat.tone} />
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
          {recentSales.length === 0 ? <Text style={styles.saleDate}>Aucune vente ce mois-ci.</Text> : recentSales.map((sale) => (
            <View key={sale.venteId} style={styles.saleRow}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleProduct} numberOfLines={1}>{sale.articles.map((article) => article.nom).join(", ") || sale.reference}</Text>
                <Text style={styles.saleDate}>{new Date(sale.date).toLocaleDateString("fr-FR")}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleAmount}>{formatCurrency(sale.montant)}</Text>
                <Chip label={statusLabel(sale.statut)} tone={statusTone(sale.statut)} size="sm" />
              </View>
            </View>
          ))}
        </Card>

        {/* Missions */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Mes missions</Text>
            <TouchableOpacity onPress={() => router.push("/seller/opportunities")}>
              <Ionicons name="arrow-forward" size={18} color={Palette.primary[500]} />
            </TouchableOpacity>
          </View>
          {missions.length === 0 ? <Text style={styles.saleDate}>Aucune mission publiée.</Text> : missions.slice(0, 3).map((m) => (
            <TouchableOpacity key={m.id} style={styles.missionCard} onPress={() => router.push(`/seller/opportunities/${m.id}` as any)}>
              <View style={styles.missionTop}>
                <Text style={styles.missionTitle} numberOfLines={1}>{m.titre}</Text>
                <Chip label={m.type ?? "Mission"} tone="primary" size="sm" />
              </View>
              <View style={styles.missionFooter}>
                <Text style={styles.missionDeadline}>{m.publicationPayee ? "Publiée" : "Brouillon · paiement requis"}</Text>
                <Text style={styles.missionReward}>{m.candidatures?.length ?? 0} candidature{(m.candidatures?.length ?? 0) === 1 ? "" : "s"}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Quick Actions */}
        <LinearGradient colors={Palette.brandGradient} style={styles.ctaBanner}>
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
  storeLabel: { fontSize: 11, color: Palette.onPrimaryMuted, marginBottom: 2 },
  storeName: { fontSize: 17, fontWeight: "700", color: Palette.onPrimary },
  storeLocation: { fontSize: 11, color: Palette.onPrimaryMuted, marginTop: 2 },
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
  ctaTitle: { fontSize: 18, fontWeight: "700", color: Palette.onPrimary, marginBottom: Spacing.two },
  ctaSubtitle: { fontSize: 13, color: Palette.onPrimaryMuted, marginBottom: Spacing.four },
});
