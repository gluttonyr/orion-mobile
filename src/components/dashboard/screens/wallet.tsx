import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ordersApi } from '@/features/orders/api';
import { colors, radius, spacing } from '../theme';

type SellerRemise = {
  remiseId: number;
  venteId: number;
  montant: number;
  montantBrut: number;
  commissionMontant: number;
  commissionPourcentage: number;
  statut: string;
  articles: Array<{ nom: string; quantite: number }>;
};

type SellerWalletData = { disponible: number; bloque: number; rembourse: number; messageVersement: string };

export function WalletScreen({ onNavigate: _onNavigate, ordersOnly = false }: { onNavigate?: (screen: 'withdrawal-methods') => void; ordersOnly?: boolean }) {
  const [wallet, setWallet] = useState<SellerWalletData | null>(null);
  const [orders, setOrders] = useState<SellerRemise[]>([]);
  const [qr, setQr] = useState<{ qrDataUrl: string; venteId: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = () => {
    setLoading(true);
    Promise.all([ordersApi.getSellerWallet(), ordersApi.getSellerRemises()])
      .then(([balance, remises]) => { setWallet(balance); setOrders(remises); setError(''); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Impossible de charger le portefeuille.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);
  const format = (amount: number) => `${Number(amount ?? 0).toLocaleString('fr-FR')} FCFA`;
  return <View style={styles.content}>
    <View style={styles.header}><Text style={styles.title}>{ordersOnly ? 'Commandes reçues' : 'Portefeuille'}</Text><Text style={styles.subtitle}>{ordersOnly ? 'Suivez les commandes payées et les remises à confirmer.' : 'Montants issus de vos commandes Orion.'}</Text></View>
    {!ordersOnly ? <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.walletCard}>
      <Text style={styles.walletLabel}>SOLDE LIBÉRÉ DANS ORION</Text>
      <Text style={styles.walletAmount}>{format(wallet?.disponible ?? 0)}</Text>
      <Text style={styles.walletSubtext}>En attente de remise : {format(wallet?.bloque ?? 0)}</Text>
      <Text style={styles.walletSubtext}>{wallet?.messageVersement ?? 'Le versement Mobile Money nécessite l’activation des payouts FedaPay.'}</Text>
    </LinearGradient> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {!ordersOnly ? <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Commandes et remises</Text><Pressable onPress={refresh}><Text style={styles.refresh}>Actualiser</Text></Pressable></View> : <Pressable style={styles.refreshButton} onPress={refresh}><Text style={styles.refresh}>Actualiser les commandes</Text></Pressable>}
    {qr ? <View style={styles.qrCard}><Text style={styles.orderTitle}>QR pour la commande #{qr.venteId}</Text><Image source={{ uri: qr.qrDataUrl }} style={styles.qrImage} /><Text style={styles.copy}>Présentez ce code au client connecté pour confirmer la remise.</Text><Pressable onPress={() => setQr(null)}><Text style={styles.refresh}>Fermer</Text></Pressable></View> : null}
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 20 }} /> : orders.length === 0 ? <Text style={styles.empty}>Aucune commande payée pour le moment.</Text> : orders.map((order) => <View key={order.remiseId} style={styles.orderCard}>
      <Text style={styles.orderTitle}>Commande #{order.venteId} · {format(order.montant)}</Text>
      {order.commissionMontant > 0 ? <Text style={styles.copy}>Montant brut : {format(order.montantBrut)} · Commission {order.commissionPourcentage}% : {format(order.commissionMontant)} · Net vendeur : {format(order.montant)}</Text> : null}
      <Text style={styles.copy}>{order.articles.map((item) => `${item.nom} × ${item.quantite}`).join(', ')}</Text>
      <Text style={styles.copy}>{order.statut === 'bloquee' ? 'Payée · fonds bloqués' : order.statut === 'liberee' ? 'Remise confirmée · fonds libérés' : 'Remboursée'}</Text>
      {order.statut === 'bloquee' ? <Pressable style={styles.button} onPress={async () => {
        try { const generated = await ordersApi.generateHandoverQr(order.remiseId); setQr({ qrDataUrl: generated.qrDataUrl, venteId: generated.venteId }); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'Génération du QR impossible.'); }
      }}><Text style={styles.buttonText}>Générer le QR de remise</Text></Pressable> : null}
    </View>)}
  </View>;
}

export function SellerOrdersScreen() {
  return <WalletScreen ordersOnly />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 36, gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  walletCard: { borderRadius: radius.lg, padding: 22, gap: 8 },
  walletLabel: { color: '#F7CBD5', fontSize: 10, letterSpacing: 1.1, fontWeight: '700' },
  walletAmount: { color: 'white', fontWeight: '800', fontSize: 28, marginTop: 7 },
  walletSubtext: { color: '#F7CBD5', fontSize: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  refresh: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  refreshButton: { alignSelf: 'flex-end', paddingVertical: 8 },
  orderCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: 15, gap: 8, borderWidth: 1, borderColor: colors.line },
  orderTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, fontSize: 13, paddingVertical: 20, textAlign: 'center' },
  qrCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: 16, gap: 8 },
  qrImage: { width: 240, height: 240 },
  button: { alignSelf: 'flex-start', backgroundColor: colors.burgundy, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '800' },
  error: { color: '#A23B42', backgroundColor: '#F9E8E8', padding: 12, borderRadius: radius.sm, fontSize: 12 },
});
