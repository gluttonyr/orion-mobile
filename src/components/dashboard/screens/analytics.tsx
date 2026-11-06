import { BarChart3, TrendingUp, Package, ShoppingBag, Receipt } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../ui';
import { colors, radius, spacing } from '../theme';
import { ordersApi, type SellerAnalytics } from '@/features/orders/api';
import { formatFcfa } from '@/features/redesign/mappers';

const PERIODS = [
  { key: '7', label: '7 jours', days: 7 },
  { key: '30', label: '30 jours', days: 30 },
  { key: 'month', label: 'Ce mois', days: 0 },
  { key: '90', label: '90 jours', days: 90 },
] as const;
type PeriodKey = (typeof PERIODS)[number]['key'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function periodRange(key: PeriodKey) {
  const now = new Date();
  const period = PERIODS.find((item) => item.key === key) ?? PERIODS[1];
  const start = period.days ? new Date(now.getTime() - (period.days - 1) * 86400000) : new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: dateKey(start), to: dateKey(now) };
}

/** Analyses commerçant — mêmes données réelles que /dashboard/analytics sur le web. */
export function AnalyticsScreen() {
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const { from, to } = periodRange(period);
    setLoading(true);
    ordersApi.getSellerAnalytics(from, to)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((reason: any) => { if (active) setError(reason?.response?.data?.message || 'Impossible de charger vos analyses.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period]);

  // Regroupe la série quotidienne en au plus 8 barres lisibles.
  const bars = useMemo(() => {
    const series = data?.series ?? [];
    if (!series.length) return [];
    const size = Math.max(1, Math.ceil(series.length / 8));
    const groups: { label: string; value: number }[] = [];
    for (let index = 0; index < series.length; index += size) {
      const chunk = series.slice(index, index + size);
      const date = new Date(`${chunk[0].date}T00:00:00`);
      groups.push({ label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), value: chunk.reduce((total, row) => total + row.revenue, 0) });
    }
    return groups;
  }, [data]);
  const maxVal = Math.max(1, ...bars.map((bar) => bar.value));
  const summary = data?.summary ?? { revenue: 0, orderCount: 0, unitsSold: 0, averageOrderValue: 0 };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyses</Text>
        <Text style={styles.subtitle}>Ventes payées de vos boutiques</Text>
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map((item) => (
          <Pressable key={item.key} style={[styles.periodChip, period === item.key && styles.periodChipActive]} onPress={() => setPeriod(item.key)}>
            <Text style={[styles.periodText, period === item.key && styles.periodTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : error ? <Text style={styles.errorText}>{error}</Text> : <>
        <View style={styles.kpiRow}>
          {[
            { label: 'Chiffre d’affaires', value: formatFcfa(summary.revenue), icon: TrendingUp },
            { label: 'Commandes', value: String(summary.orderCount), icon: Receipt },
            { label: 'Articles vendus', value: String(summary.unitsSold), icon: ShoppingBag },
            { label: 'Panier moyen', value: formatFcfa(summary.averageOrderValue), icon: Package },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <View key={kpi.label} style={styles.kpiCard}>
                <View style={styles.kpiIconRow}><View style={styles.kpiIcon}><Icon size={16} color={colors.burgundy} /></View></View>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            );
          })}
        </View>

        <SectionHeader title="Évolution des ventes" action={PERIODS.find((item) => item.key === period)?.label} />
        <View style={styles.chartCard}>
          {bars.length === 0 ? <Text style={styles.emptyText}>Aucune vente sur cette période.</Text> : (
            <View style={styles.chartArea}>
              {bars.map((bar, index) => (
                <View key={index} style={styles.barCol}>
                  <View style={styles.barWrap}><View style={[styles.bar, { height: `${Math.max(2, (bar.value / maxVal) * 100)}%` }]} /></View>
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <SectionHeader title="Top produits" />
        <View style={styles.topList}>
          {data?.topProducts.length ? data.topProducts.slice(0, 5).map((product, index) => (
            <View key={product.produitId} style={styles.topRow}>
              <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.topName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.topSales}>{product.quantity} vendu{product.quantity > 1 ? 's' : ''} · {formatFcfa(product.revenue)}</Text>
              </View>
              <BarChart3 size={18} color={colors.muted} />
            </View>
          )) : <Text style={styles.emptyText}>Vos meilleurs produits apparaîtront après vos premières ventes.</Text>}
        </View>

        <SectionHeader title="Commandes récentes" />
        <View style={styles.topList}>
          {data?.recentOrders.length ? data.recentOrders.slice(0, 5).map((order) => (
            <View key={order.venteId} style={styles.topRow}>
              <View style={styles.flex}>
                <Text style={styles.topName} numberOfLines={1}>{order.reference || `Commande #${order.venteId}`}</Text>
                <Text style={styles.topSales} numberOfLines={1}>{new Date(order.date).toLocaleDateString('fr-FR')} · {order.articles.map((article) => `${article.nom} × ${article.quantite}`).join(', ')}</Text>
              </View>
              <Text style={styles.topName}>{formatFcfa(order.montant)}</Text>
            </View>
          )) : <Text style={styles.emptyText}>Aucune commande sur cette période.</Text>}
        </View>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  periodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  periodChipActive: { backgroundColor: colors.burgundy, borderColor: colors.burgundy },
  periodText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  periodTextActive: { color: colors.white },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.sm },
  kpiCard: { flex: 1, minWidth: '47%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  kpiIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 10 },
  kpiLabel: { color: colors.muted, fontSize: 11, marginTop: 4 },
  chartCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20, marginBottom: spacing.lg },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { flex: 1, alignItems: 'center' },
  barWrap: { flex: 1, width: 28, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 22, backgroundColor: colors.burgundy, borderRadius: 6 },
  barLabel: { color: colors.muted, fontSize: 10, marginTop: 8, fontWeight: '600' },
  topList: { marginBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  rankText: { color: colors.burgundy, fontSize: 13, fontWeight: '800' },
  flex: { flex: 1 },
  topName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  topSales: { color: colors.muted, fontSize: 11, marginTop: 3 },
  emptyText: { color: colors.muted, fontSize: 13, paddingVertical: 12 },
  errorText: { color: colors.burgundy, fontSize: 13, paddingVertical: 12 },
});
