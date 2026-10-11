import { BarChart3, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionHeader } from '../ui';
import { colors, radius, spacing } from '../theme';

export function AnalyticsScreen() {
  const monthlyData = [
    { month: 'Mar', value: 65 },
    { month: 'Avr', value: 80 },
    { month: 'Mai', value: 72 },
    { month: 'Juin', value: 95 },
    { month: 'Juil', value: 88 },
    { month: 'Août', value: 110 },
  ];
  const maxVal = Math.max(...monthlyData.map((d) => d.value));

  const topProducts = [
    { name: 'Nike Air Max blanc', sales: 142, revenue: '3 550 000 FCFA' },
    { name: 'Robe wax moderne', sales: 87, revenue: '3 045 000 FCFA' },
    { name: 'Sac en cuir tressé', sales: 56, revenue: '1 036 000 FCFA' },
    { name: 'Montre Casio noir', sales: 34, revenue: '612 000 FCFA' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyses</Text>
        <Text style={styles.subtitle}>Performance de votre activité</Text>
      </View>

      <View style={styles.kpiRow}>
        {[
          { label: 'Revenu total', value: '8,2 M FCFA', icon: TrendingUp, delta: '+18%' },
          { label: 'Commandes', value: '1 086', icon: ShoppingBag, delta: '+12%' },
          { label: 'Clients uniques', value: '1 240', icon: Users, delta: '+5%' },
          { label: 'Panier moyen', value: '7 540 FCFA', icon: Package, delta: '+3%' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <View key={kpi.label} style={styles.kpiCard}>
              <View style={styles.kpiIconRow}>
                <View style={styles.kpiIcon}><Icon size={16} color={colors.burgundy} /></View>
                <Text style={styles.kpiDelta}>{kpi.delta}</Text>
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          );
        })}
      </View>

      <SectionHeader title="Évolution des ventes" action="6 mois" />
      <View style={styles.chartCard}>
        <View style={styles.chartArea}>
          {monthlyData.map((d, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barWrap}>
                <View style={[styles.bar, { height: `${(d.value / maxVal) * 100}%` }]} />
              </View>
              <Text style={styles.barLabel}>{d.month}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionHeader title="Top produits" action="Voir tout" />
      <View style={styles.topList}>
        {topProducts.map((product, i) => (
          <View key={i} style={styles.topRow}>
            <View style={styles.rankBadge}><Text style={styles.rankText}>{i + 1}</Text></View>
            <View style={styles.flex}>
              <Text style={styles.topName} numberOfLines={1}>{product.name}</Text>
              <Text style={topProducts.length > 0 ? styles.topSales : styles.topSales}>{product.sales} ventes · {product.revenue}</Text>
            </View>
            <BarChart3 size={18} color={colors.muted} />
          </View>
        ))}
      </View>

      <SectionHeader title="Répartition des ventes" action="Par catégorie" />
      <View style={styles.catList}>
        {[
          { name: 'Chaussures', pct: 42, color: colors.burgundy },
          { name: 'Vêtements', pct: 31, color: colors.green },
          { name: 'Accessoires', pct: 19, color: colors.gold },
          { name: 'Autres', pct: 8, color: colors.muted },
        ].map((cat) => (
          <View key={cat.name} style={styles.catRow}>
            <View style={styles.catInfo}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
            </View>
            <View style={styles.catBarWrap}>
              <View style={styles.catBarBg}>
                <View style={[styles.catBar, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
              </View>
              <Text style={styles.catPct}>{cat.pct}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.sm },
  kpiCard: { flex: 1, minWidth: '47%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  kpiIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  kpiDelta: { color: colors.green, fontSize: 11, fontWeight: '700' },
  kpiValue: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 10 },
  kpiLabel: { color: colors.muted, fontSize: 11, marginTop: 4 },
  chartCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20, marginBottom: spacing.lg },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { flex: 1, alignItems: 'center' },
  barWrap: { flex: 1, width: 28, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 22, backgroundColor: colors.burgundy, borderRadius: 6 },
  barLabel: { color: colors.muted, fontSize: 11, marginTop: 8, fontWeight: '600' },
  topList: { marginBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { color: colors.burgundy, fontSize: 13, fontWeight: '800' },
  flex: { flex: 1 },
  topName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  topSales: { color: colors.muted, fontSize: 11, marginTop: 3 },
  catList: { gap: 14 },
  catRow: { gap: 6 },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  catBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catBarBg: { flex: 1, height: 8, backgroundColor: colors.soft, borderRadius: 4, overflow: 'hidden' },
  catBar: { height: 8, borderRadius: 4 },
  catPct: { color: colors.muted, fontSize: 11, fontWeight: '700', width: 36, textAlign: 'right' },
});
