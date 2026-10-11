import {
  Briefcase,
  ChevronRight,
  Package,
  Plus,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { type DashboardScreen } from '../shared';
import { SectionHeader } from '../ui';
import { useAuth } from '@/features/auth/hooks';
import { useProducts } from '@/features/products/hooks';
import { mission } from '@/service/mission.service';
import type { Mission } from '@/model/model';
import { toDesignOpportunity, toDesignProduct } from '@/features/redesign/mappers';
import { useStore } from '@/features/seller/boutique-context';
import { useState, useEffect } from 'react';

export function DashboardHome({ onNavigate }: { onNavigate: (s: DashboardScreen) => void }) {
  const { user } = useAuth();
  const { stores, activeStore } = useStore();
  const { products: backendProducts, loading: productsLoading } = useProducts();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  useEffect(() => { mission.getMine().then(setMissions).catch(() => setMissions([])).finally(() => setMissionsLoading(false)); }, []);
  const firstName = user?.prenom || user?.nom || 'Commerçant';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLocaleUpperCase('fr-FR');
  const displayProducts = backendProducts.map(toDesignProduct);
  const displayOpportunities = missions.map(toDesignOpportunity);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{today}</Text>
          <Text style={styles.title}>Bonjour, {firstName}</Text>
          <Text style={styles.subtitle}>{activeStore ? `Voici l'activité de ${activeStore.nom} aujourd'hui.` : 'Ajoutez une boutique pour commencer à vendre.'}</Text>
        </View>
        <Pressable style={styles.createBtn} onPress={() => onNavigate('products')}>
          <Plus size={20} color="white" strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.kpiGrid}>
        {[
          { label: 'Boutiques', value: String(stores.length) },
          { label: 'Produits', value: productsLoading ? '…' : String(backendProducts.length) },
          { label: 'Opportunités', value: missionsLoading ? '…' : String(missions.length) },
          { label: 'Ventes', value: 'Indisponible' },
        ].map((kpi) => (
          <View key={kpi.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiDelta}>Données du compte</Text>
          </View>
        ))}
      </View>

      <View style={styles.walletCard}>
        <View style={styles.walletTop}>
          <Text style={styles.walletLabel}>SOLDE DU PORTEFEUILLE</Text>
          <Wallet size={18} color="#F7CBD5" />
        </View>
        <Text style={styles.walletAmount}>Solde non disponible</Text>
        <Pressable style={styles.walletFooter} onPress={() => onNavigate('wallet')}>
          <Text style={styles.walletLink}>Voir mon portefeuille</Text>
          <ChevronRight size={18} color="white" />
        </Pressable>
      </View>

      <SectionHeader title="Actions rapides" />
      <View style={styles.quickGrid}>
        {[
          { label: 'Ajouter produit', icon: Package, screen: 'products' as DashboardScreen },
          { label: 'Mes boutiques', icon: Store, screen: 'stores' as DashboardScreen },
          { label: 'Opportunités', icon: Briefcase, screen: 'opportunities' as DashboardScreen },
          { label: 'Analyses', icon: TrendingUp, screen: 'analytics' as DashboardScreen },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Pressable key={item.label} style={styles.quickItem} onPress={() => onNavigate(item.screen)}>
              <View style={styles.quickIcon}>
                <Icon size={20} color={colors.burgundy} strokeWidth={1.8} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Produits récents" action="Voir tout" onAction={() => onNavigate('products')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {displayProducts.slice(0, 4).map((product) => (
          <Pressable key={product.id} style={styles.productMini} onPress={() => onNavigate('products')}>
            <View style={styles.productMiniImage}>
              <Text style={styles.productMiniPrice}>{product.price}</Text>
            </View>
            <Text style={styles.productMiniName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productMiniStock}>Stock : {product.stock}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title="Ventes du mois" action="Analyses" onAction={() => onNavigate('analytics')} />
      <View style={styles.salesCard}>
        <View>
          <Text style={styles.mutedLabel}>Ventes totales</Text>
          <Text style={styles.salesAmount}>Données indisponibles</Text>
          <Text style={styles.positive}>Le service de ventes n'est pas connecté.</Text>
        </View>
      </View>

      <SectionHeader title="Opportunités récentes" action="Voir tout" onAction={() => onNavigate('opportunities')} />
      <View style={styles.oppList}>
        {displayOpportunities.slice(0, 2).map((opp) => (
          <Pressable key={opp.id} style={styles.oppCard} onPress={() => onNavigate('opportunities')}>
            <View style={styles.oppIcon}>
              <Briefcase size={18} color={colors.burgundy} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.oppTitle}>{opp.title}</Text>
              <Text style={styles.oppMeta}>{opp.type} · {opp.location}</Text>
            </View>
            <View style={styles.alignEnd}>
              <Text style={styles.oppBudget}>{opp.budget}</Text>
              <Text style={styles.oppCandidates}>{opp.candidates} candidats</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Commandes récentes" />
      <Text style={styles.positive}>Les commandes ne sont pas encore reliées à cet écran.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  eyebrow: { color: colors.muted, letterSpacing: 1.4, fontSize: 10, fontWeight: '600', marginBottom: 6 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.burgundy,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.sm },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 16,
  },
  kpiLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  kpiValue: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 8 },
  kpiDeltaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  kpiDelta: { fontSize: 11, fontWeight: '700' },
  walletCard: { borderRadius: radius.lg, padding: 18, marginBottom: spacing.lg, backgroundColor: colors.burgundy },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: '#F7CBD5', fontSize: 10, letterSpacing: 1.1, fontWeight: '700' },
  walletAmount: { color: 'white', fontWeight: '800', fontSize: 24, marginTop: 14 },
  walletFooter: { borderTopColor: 'rgba(255,255,255,0.25)', borderTopWidth: 1, marginTop: 18, paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLink: { color: 'white', fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  quickItem: { alignItems: 'center', width: '24%' },
  quickIcon: { width: 44, height: 44, backgroundColor: colors.burgundySoft, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  quickLabel: { color: colors.ink, fontSize: 10, textAlign: 'center', fontWeight: '600' },
  hList: { gap: 12, paddingBottom: 8 },
  productMini: { width: 130 },
  productMiniImage: {
    width: 130,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: colors.burgundySoft,
    marginBottom: 8,
    justifyContent: 'flex-end',
    padding: 8,
  },
  productMiniPrice: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  productMiniName: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  productMiniStock: { color: colors.muted, fontSize: 10, marginTop: 2 },
  salesCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  mutedLabel: { color: colors.muted, fontSize: 11 },
  salesAmount: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 7 },
  positive: { color: colors.green, fontSize: 11, fontWeight: '700', marginTop: 8 },
  chart: { width: 130, height: 76, justifyContent: 'flex-end' },
  chartBars: { flexDirection: 'row', gap: 7, alignItems: 'flex-end', height: 65 },
  bar: { width: 10, backgroundColor: colors.burgundySoft, borderRadius: 4 },
  oppList: { marginBottom: spacing.lg },
  oppCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  oppIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex: { flex: 1 },
  oppTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  oppMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  alignEnd: { alignItems: 'flex-end' },
  oppBudget: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  oppCandidates: { color: colors.muted, fontSize: 10, marginTop: 3 },
  orderList: { marginBottom: spacing.sm },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  orderIcon: { width: 37, height: 37, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  orderId: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  orderLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  orderAmount: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  confirmed: { color: colors.green, fontSize: 9, marginTop: 4, fontWeight: '700' },
});
