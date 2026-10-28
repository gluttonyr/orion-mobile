import { BriefcaseBusiness, CheckCircle2, ChevronRight, Clock3, MessageCircle, ShoppingBag, TrendingUp, Wallet, XCircle } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { buildClientDashboardStats } from '@/features/orders/client-stats';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/features/auth/hooks';
import { useMyOrders } from '@/features/orders/hooks';
import { useMyApplications, useOpportunities } from '@/features/opportunities/hooks';
import { formatFcfa } from '@/features/redesign/mappers';
import type { DashboardScreen } from '../shared';
import { colors, radius, spacing } from '../theme';
import { ordersApi } from '@/features/orders/api';

export function ClientDashboardHome({ onNavigate }: { onNavigate: (screen: DashboardScreen) => void }) {
  const { user } = useAuth();
  const { orders, loading: ordersLoading } = useMyOrders();
  const { applications, loading: applicationsLoading } = useMyApplications();
  const { opportunities, loading: opportunitiesLoading } = useOpportunities();
  const stats = useMemo(() => buildClientDashboardStats(orders, applications, opportunities), [orders, applications, opportunities]);
  const maxSpent = Math.max(1, ...stats.monthly.map((month) => month.spent));
  const loading = ordersLoading || applicationsLoading || opportunitiesLoading;
  const firstName = user?.prenom || 'Bienvenue';
  return <View style={styles.container}>
    <LinearGradient colors={['#811633', '#5D0E28']} style={styles.hero}>
      <Text style={styles.eyebrow}>VOTRE ESPACE PERSONNEL</Text>
      <Text style={styles.heroTitle}>Bonjour, {firstName}</Text>
      <Text style={styles.heroCopy}>Retrouvez vos achats, vos candidatures et vos conversations au même endroit.</Text>
      <View style={styles.heroOrnament}><View /></View>
    </LinearGradient>
    <View style={styles.metrics}>
      <View style={styles.metricCard}><View style={styles.metricIcon}><Wallet size={19} color={colors.burgundy} /></View><Text style={styles.metricLabel}>Total dépensé</Text><Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{loading ? '…' : formatFcfa(stats.totalSpent)}</Text><Text style={styles.metricHint}>Achats payés sur Orion</Text></View>
      <Pressable style={styles.metricCard} onPress={() => onNavigate('orders')}><View style={styles.metricIcon}><ShoppingBag size={19} color={colors.burgundy} /></View><Text style={styles.metricLabel}>Commandes payées</Text><Text style={styles.metricValue}>{loading ? '…' : stats.paidOrders}</Text><Text style={styles.metricLink}>Retrouver mes achats <ChevronRight size={13} /></Text></Pressable>
    </View>
    <View style={styles.metrics}>
      <Pressable style={styles.metricCard} onPress={() => onNavigate('applications')}><View style={styles.metricIcon}><BriefcaseBusiness size={19} color={colors.burgundy} /></View><Text style={styles.metricLabel}>Candidatures</Text><Text style={styles.metricValue}>{loading ? '…' : stats.applications}</Text><Text style={styles.metricHint}>{stats.applicationStatuses[1].value} acceptée{stats.applicationStatuses[1].value > 1 ? 's' : ''} · {stats.applicationStatuses[0].value} en attente</Text></Pressable>
      <View style={styles.metricCard}><View style={styles.metricIcon}><TrendingUp size={19} color={colors.burgundy} /></View><Text style={styles.metricLabel}>Opportunités ouvertes</Text><Text style={styles.metricValue}>{loading ? '…' : stats.openOpportunities}</Text><Text style={styles.metricHint}>Moyenne {formatFcfa(stats.averagePay)}</Text></View>
    </View>
    <View style={styles.chartCard}>
      <Text style={styles.chartKicker}>VOS ACHATS · 6 MOIS</Text>
      <Text style={styles.chartTitle}>Dépenses et commandes</Text>
      <View style={styles.barChart}>
        {stats.monthly.map((month) => <View key={month.key} style={styles.barCol}>
          <Text style={styles.barValue}>{month.orders ? `${month.orders} cmd` : ''}</Text>
          <View style={styles.barTrack}><View style={[styles.bar, { height: `${Math.max(4, (month.spent / maxSpent) * 100)}%` }, !month.spent && styles.barEmpty]} /></View>
          <Text style={styles.barLabel}>{month.label}</Text>
        </View>)}
      </View>
    </View>
    <View style={styles.chartCard}>
      <Text style={styles.chartKicker}>VOS PROJETS</Text>
      <Text style={styles.chartTitle}>Candidatures par statut</Text>
      <View style={styles.stackedBar}>{stats.applications ? stats.applicationStatuses.filter((status) => status.value).map((status) => <View key={status.name} style={{ flex: status.value, backgroundColor: status.color }} />) : <View style={[styles.flex, { backgroundColor: colors.burgundySoft }]} />}</View>
      {stats.applicationStatuses.map((status) => <View key={status.name} style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: status.color }]} /><Text style={styles.legendLabel}>{status.name}</Text><Text style={styles.legendValue}>{status.value}</Text></View>)}
    </View>
    <View style={styles.chartCard}>
      <Text style={styles.chartKicker}>OPPORTUNITÉS</Text>
      <Text style={styles.chartTitle}>Les mieux rémunérées</Text>
      {stats.topOpportunities.length ? stats.topOpportunities.map((mission, index) => <Pressable key={mission.id} style={styles.rankRow} onPress={() => onNavigate('opportunities')}>
        <Text style={styles.rankIndex}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={styles.flex}><Text style={styles.rankTitle} numberOfLines={1}>{mission.title}</Text><View style={styles.rankTrack}><View style={[styles.rankFill, { width: `${Math.max(5, (mission.amount / stats.topOpportunities[0].amount) * 100)}%` }]} /></View></View>
        <Text style={styles.rankAmount}>{formatFcfa(mission.amount)}</Text>
      </Pressable>) : <Text style={styles.chartEmpty}>Les opportunités rémunérées apparaîtront ici.</Text>}
    </View>
    <View style={styles.shortcuts}>
      <Text style={styles.sectionTitle}>Mon espace</Text>
      <Shortcut icon={<BriefcaseBusiness size={18} color={colors.burgundy} />} title="Mes candidatures" subtitle="État et réponses des missions" onPress={() => onNavigate('applications')} />
      <Shortcut icon={<ShoppingBag size={18} color={colors.burgundy} />} title="Mes commandes" subtitle="Historique de mes achats" onPress={() => onNavigate('orders')} />
      <Shortcut icon={<MessageCircle size={18} color={colors.burgundy} />} title="Messages" subtitle="Conversations avec les boutiques" onPress={() => onNavigate('messages')} />
    </View>
    <View style={styles.recentHeader}><Text style={styles.sectionTitle}>Candidatures récentes</Text><Pressable onPress={() => onNavigate('applications')}><Text style={styles.link}>Tout voir</Text></Pressable></View>
    {applicationsLoading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 18 }} /> : applications.length === 0 ? <Text style={styles.empty}>Les missions auxquelles vous postulerez s’afficheront ici.</Text> : applications.slice(0, 3).map((item) => <View key={item.id} style={styles.applicationRow}><View style={styles.applicationIcon}><BriefcaseBusiness size={17} color={colors.burgundy} /></View><View style={styles.flex}><Text style={styles.rowTitle} numberOfLines={1}>{item.titre}</Text><Text style={styles.rowMeta}>{item.type ?? 'Mission'} · {item.localisation ?? 'Afrique'}</Text></View><ApplicationStatus value={item.candidature.statut} /></View>)}
  </View>;
}

export function ClientOrdersScreen() {
  const { orders, loading, error, refresh } = useMyOrders();
  return <View style={styles.container}>
    <View style={styles.pageHeading}><Text style={styles.sectionTitle}>Mes commandes</Text><Text style={styles.pageCopy}>Les achats liés à votre compte Orion.</Text></View>
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : error ? <Text style={styles.error}>{error}</Text> : orders.length === 0 ? <Text style={styles.empty}>Aucune commande pour le moment. Vos achats confirmés apparaîtront ici.</Text> : orders.map((order, index) => <View key={order.id ?? index} style={styles.orderCard}>
      <View style={styles.orderHeader}><View style={styles.orderIcon}><ShoppingBag size={18} color={colors.burgundy} /></View><View style={styles.flex}><Text style={styles.rowTitle}>{order.reference || `Commande #${order.id ?? index + 1}`}</Text><Text style={styles.rowMeta}>{order.date_achat ? new Date(order.date_achat).toLocaleDateString('fr-FR') : 'Date non renseignée'}</Text></View><Text style={styles.orderTotal}>{formatFcfa(Number(order.prix_total ?? 0))}</Text></View>
      <View style={styles.orderProducts}>{(order.produits ?? []).map((product) => <Text key={product.id} style={styles.rowMeta}>• {product.nom}</Text>)}</View>
      <Text style={styles.orderStatus}>{order.statut ?? 'En traitement'}</Text>
      {(order.remises ?? []).map((remise) => <View key={remise.id} style={styles.handoverBox}><Text style={styles.rowTitle}>{remise.articles.map((item) => `${item.nom} × ${item.quantite}`).join(', ')}</Text><Text style={styles.rowMeta}>{formatFcfa(remise.montant)} · {remise.statut === 'bloquee' ? 'Fonds bloqués' : remise.statut === 'liberee' ? 'Remise confirmée' : 'Remboursée'}</Text>{remise.statut === 'bloquee' ? <ClientHandoverScan venteId={Number(order.id)} onConfirmed={refresh} /> : null}</View>)}
    </View>)}
  </View>;
}

function ClientHandoverScan({ venteId, onConfirmed }: { venteId: number; onConfirmed: () => void }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) { setError('Autorise l’accès à la caméra pour scanner le QR.'); return; }
    }
    setError(''); setVisible(true);
  };
  const process = async (content: string) => {
    if (!content.startsWith('ORION-HANDOVER:')) { setError('Ce QR ne correspond pas à une remise Orion.'); return; }
    setBusy(true); setError('');
    try { await ordersApi.confirmHandover(content, venteId); setDone(true); setVisible(false); onConfirmed(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de confirmer la remise.'); }
    finally { setBusy(false); }
  };
  const importImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Autorise l’accès aux photos pour importer le QR.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    try {
      const decoded = await scanFromURLAsync(result.assets[0].uri, ['qr']);
      if (!decoded.length) { setError('Aucun QR lisible dans cette image.'); return; }
      await process(decoded[0].data);
    } catch { setError('Impossible de lire ce QR. Essaie avec une image plus nette.'); }
  };
  return <View style={styles.scanActions}><Pressable style={styles.scanButton} onPress={() => void openScanner()}><Text style={styles.scanButtonText}>{done ? 'Remise confirmée' : 'Scanner le QR du vendeur'}</Text></Pressable><Pressable style={styles.scanButtonSecondary} onPress={() => void importImage()}><Text style={styles.scanButtonSecondaryText}>Importer une photo du QR</Text></Pressable>{error ? <Text style={styles.error}>{error}</Text> : null}<Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}><View style={styles.scannerModal}><Text style={styles.sectionTitle}>Scanner la remise</Text><Text style={styles.rowMeta}>Scanne le QR fourni par le vendeur pour la commande #{venteId}.</Text><CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={busy ? undefined : (result) => void process(result.data)} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={styles.scanButtonSecondary} onPress={() => setVisible(false)}><Text style={styles.scanButtonSecondaryText}>Fermer</Text></Pressable></View></Modal></View>;
}

export function ClientApplicationsScreen() {
  const { applications, loading, error } = useMyApplications();
  return <View style={styles.container}>
    <View style={styles.pageHeading}><Text style={styles.sectionTitle}>Mes candidatures</Text><Text style={styles.pageCopy}>Suivez les missions auxquelles vous avez postulé et les réponses reçues.</Text></View>
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : error ? <Text style={styles.error}>{error}</Text> : applications.length === 0 ? <Text style={styles.empty}>Vous n’avez pas encore postulé à une mission. Vos candidatures apparaîtront ici.</Text> : applications.map((item) => <View key={item.id} style={styles.orderCard}>
      <View style={styles.orderHeader}><View style={styles.applicationIcon}><BriefcaseBusiness size={18} color={colors.burgundy} /></View><View style={styles.flex}><Text style={styles.rowTitle}>{item.titre}</Text><Text style={styles.rowMeta}>{item.type ?? 'Mission'} · {item.localisation ?? 'Afrique'}</Text></View><ApplicationStatus value={item.candidature.statut} /></View>
      <View style={styles.applicationDetails}><Text style={styles.orderTotal}>{formatFcfa(Number(item.montant ?? 0))}</Text><Text style={styles.rowMeta}>Postulé le {new Date(item.candidature.dateCandidature).toLocaleDateString('fr-FR')}</Text></View>
      {item.commercant ? <Text style={styles.rowMeta}>Organisation : {[item.commercant.prenom, item.commercant.nom].filter(Boolean).join(' ') || item.commercant.email}</Text> : null}
    </View>)}
  </View>;
}

function Shortcut({ icon, title, subtitle, onPress }: { icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable style={styles.shortcut} onPress={onPress}><View style={styles.shortcutIcon}>{icon}</View><View style={styles.flex}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowMeta}>{subtitle}</Text></View><ChevronRight size={18} color={colors.muted} /></Pressable>;
}

function ApplicationStatus({ value }: { value: string }) {
  const status = String(value).toLowerCase();
  const accepted = status.includes('accept');
  const rejected = status.includes('refus');
  const label = accepted ? 'Acceptée' : rejected ? 'Refusée' : 'En attente';
  const Icon = accepted ? CheckCircle2 : rejected ? XCircle : Clock3;
  return <View style={[styles.status, accepted && styles.statusAccepted, rejected && styles.statusRejected]}><Icon size={13} color={accepted ? '#23714F' : rejected ? '#A23B42' : '#986C20'} /><Text style={[styles.statusText, accepted && styles.statusAcceptedText, rejected && styles.statusRejectedText]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  hero: { minHeight: 170, overflow: 'hidden', borderRadius: radius.lg, padding: 18, justifyContent: 'center' },
  eyebrow: { color: '#F0D39F', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFFAF3', fontSize: 25, fontWeight: '900', marginTop: 11 },
  heroCopy: { color: '#F2DDE0', fontSize: 12, lineHeight: 18, maxWidth: '82%', marginTop: 7 },
  heroOrnament: { position: 'absolute', width: 106, height: 106, borderWidth: 1, borderColor: 'rgba(240,211,159,0.45)', right: -15, top: 35, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, minHeight: 145, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, padding: 13 },
  metricIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 9 },
  metricValue: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 2 },
  metricLink: { color: colors.burgundy, fontSize: 9, fontWeight: '700', flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metricHint: { color: colors.muted, fontSize: 9, marginTop: 4 },
  chartCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, padding: 15 },
  chartKicker: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  chartTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 4, marginBottom: 12 },
  barChart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, height: '100%', alignItems: 'center' },
  barValue: { height: 14, color: colors.burgundy, fontSize: 8, fontWeight: '800' },
  barTrack: { flex: 1, width: '100%', maxWidth: 30, justifyContent: 'flex-end', marginTop: 4 },
  bar: { width: '100%', borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: colors.burgundy },
  barEmpty: { backgroundColor: colors.burgundySoft },
  barLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', marginTop: 7 },
  stackedBar: { height: 14, flexDirection: 'row', gap: 3, overflow: 'hidden', borderRadius: 7, marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { flex: 1, color: colors.muted, fontSize: 12 },
  legendValue: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rankIndex: { width: 20, color: colors.muted, fontSize: 10, fontWeight: '700' },
  rankTitle: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  rankTrack: { height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: colors.burgundySoft },
  rankFill: { height: '100%', borderRadius: 4, backgroundColor: colors.burgundy },
  rankAmount: { color: colors.burgundy, fontSize: 11, fontWeight: '800' },
  chartEmpty: { color: colors.muted, fontSize: 12, lineHeight: 18, paddingVertical: 12, textAlign: 'center' },
  shortcuts: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 13, paddingTop: 14 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  shortcut: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 10, paddingVertical: 9 },
  shortcutIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  rowMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: colors.burgundy, fontSize: 11, fontWeight: '800' },
  empty: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, padding: 16, color: colors.muted, fontSize: 12, lineHeight: 18 },
  applicationRow: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  applicationIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F6EBD3', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  statusText: { color: '#986C20', fontSize: 9, fontWeight: '800' },
  statusAccepted: { backgroundColor: '#E5F2E9' },
  statusAcceptedText: { color: '#23714F' },
  statusRejected: { backgroundColor: '#F9E8E8' },
  statusRejectedText: { color: '#A23B42' },
  pageHeading: { marginBottom: spacing.sm },
  pageCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  orderCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, padding: 14, gap: 10 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  orderTotal: { color: colors.burgundy, fontSize: 12, fontWeight: '900' },
  orderProducts: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8, gap: 3 },
  orderStatus: { color: colors.burgundy, backgroundColor: colors.burgundySoft, alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 9, fontWeight: '800' },
  applicationDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 9 },
  error: { color: '#A23B42', backgroundColor: '#F9E8E8', padding: 12, borderRadius: 10, fontSize: 12 },
  handoverBox: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginTop: 10, gap: 8 },
  scanActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  scanButton: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11 },
  scanButtonText: { color: 'white', fontSize: 12, fontWeight: '800' },
  scanButtonSecondary: { backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11 },
  scanButtonSecondaryText: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  scannerModal: { flex: 1, backgroundColor: colors.white, padding: 20, justifyContent: 'center', gap: 16 },
  camera: { width: '100%', height: 360, borderRadius: radius.lg, overflow: 'hidden' },
});
