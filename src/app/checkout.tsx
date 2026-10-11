import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/store/cart-store';
import { checkFedaPayPayment, initFedaPayPayment } from '@/service/paiement.service';

type PaymentResult = 'SUCCESS' | 'FAILED' | 'PENDING' | null;

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fedapay_reference?: string; purpose?: string }>();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace({ pathname: '/login', params: { returnTo: 'checkout' } } as any);
  }, [authLoading, isAuthenticated, router]);

  const verifyPayment = useCallback(async (paymentReference: string) => {
    setBusy(true);
    setError('');
    try {
      for (let attempt = 0; attempt < 12; attempt++) {
        const payment = await checkFedaPayPayment(paymentReference);
        if (payment.purpose === 'MISSION_PUBLICATION') {
          if (payment.status === 'SUCCESS' && payment.mission?.publicationPayee) {
            setResult('SUCCESS');
            return;
          }
          if (payment.status === 'FAILED' || payment.status === 'REFUNDED') {
            setResult('FAILED');
            return;
          }
        }
        if (payment.status === 'SUCCESS' || payment.vente?.statut === 'payee') {
          clearCart();
          setResult('SUCCESS');
          return;
        }
        if (
          payment.status === 'FAILED' || payment.status === 'REFUNDED' ||
          payment.vente?.statut === 'echouee' || payment.vente?.statut === 'remboursee'
        ) {
          setResult('FAILED');
          return;
        }
        if (attempt < 11) await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setResult('PENDING');
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Vérification temporairement indisponible.');
      setResult('PENDING');
    } finally {
      setBusy(false);
    }
  }, [clearCart]);

  useEffect(() => {
    const returnedReference = params.fedapay_reference;
    if (authLoading || !isAuthenticated || typeof returnedReference !== 'string' || !returnedReference) return;
    setReference(returnedReference);
    void verifyPayment(returnedReference);
  }, [authLoading, isAuthenticated, params.fedapay_reference, verifyPayment]);

  const reopenPayment = async () => {
    if (!paymentUrl || !reference) return;
    setBusy(true);
    setError('');
    try {
      await WebBrowser.openAuthSessionAsync(paymentUrl, 'orionmobile://checkout');
      await verifyPayment(reference);
    } catch (browserError) {
      setError(browserError instanceof Error ? browserError.message : 'Impossible d’ouvrir FedaPay.');
      setBusy(false);
    }
  };

  const startPayment = async () => {
    if (!user?.prenom?.trim() || !user?.nom?.trim() || !user?.email?.trim() || !user?.adresse?.trim()) {
      setError('Complète ton prénom, ton nom, ton e-mail et ton adresse dans ton profil avant de commander.');
      return;
    }
    if (!items.length) {
      setError('Ton panier est vide.');
      return;
    }

    setBusy(true);
    setError('');
    let createdPayment: { reference: string; payment_url: string } | null = null;
    try {
      const payment = await initFedaPayPayment({
        produitIds: items.map((item) => Number(item.id)),
        quantites: items.map((item) => item.quantity),
        platform: 'mobile',
      });
      createdPayment = payment;
      setReference(payment.reference);
      setPaymentUrl(payment.payment_url);
      const browserResult = await WebBrowser.openAuthSessionAsync(payment.payment_url, 'orionmobile://checkout');
      if (browserResult.type === 'success' || browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        void verifyPayment(payment.reference);
      }
    } catch (paymentError) {
      const errorRecord = paymentError as { response?: { data?: { message?: string | string[] } } };
      const responseMessage = errorRecord.response?.data?.message;
      const errorMessage = Array.isArray(responseMessage) ? responseMessage.join(" ") : responseMessage;
      if (/token invalide|token.*expir|jwt expired/i.test(`${errorMessage ?? ""} ${paymentError instanceof Error ? paymentError.message : ""}`)) {
        await logout();
        router.replace({ pathname: "/login", params: { returnTo: "checkout" } } as any);
        setBusy(false);
        return;
      }
      if (createdPayment) {
        setReference(createdPayment.reference);
        setPaymentUrl(createdPayment.payment_url);
        setResult('PENDING');
      }
      setError(paymentError instanceof Error ? paymentError.message : 'Impossible d’initialiser le paiement FedaPay.');
      setBusy(false);
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return <SafeAreaView style={styles.root}><ActivityIndicator color={Palette.primary[500]} style={styles.loading} /></SafeAreaView>;
  }

  if (result) {
    const success = result === 'SUCCESS';
    const pending = result === 'PENDING';
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AppHeader variant="back" title="État du paiement" />
        <View style={styles.resultWrap}>
          <Card style={styles.card}>
            <Text style={styles.resultTitle}>{success ? 'Paiement confirmé' : pending ? 'Confirmation en attente' : 'Paiement non confirmé'}</Text>
            <Text style={styles.muted}>
              {params.purpose === 'mission' ? (success ? 'FedaPay a confirmé les frais. Ta mission est maintenant publiée.' : pending ? 'La confirmation des frais est en attente. Relance la vérification dans quelques instants.' : 'Le paiement a échoué ou a été annulé. Ta mission reste en brouillon.') : (success ? 'FedaPay a confirmé ta commande. Tu peux la retrouver dans Mes achats.' : pending ? 'Le statut n’est pas encore définitif. Tu peux reprendre le paiement ou relancer la vérification.' : 'Le paiement a échoué ou a été annulé. Ton panier est conservé pour réessayer.')}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {pending && paymentUrl ? <Button title="Reprendre le paiement FedaPay" onPress={() => void reopenPayment()} disabled={busy} fullWidth /> : null}
            {pending && reference ? <Button title="Vérifier à nouveau" onPress={() => void verifyPayment(reference)} disabled={busy} variant="outline" fullWidth /> : null}
            <Button title={params.purpose === 'mission' ? 'Retour au tableau de bord' : success ? 'Voir mes achats' : 'Retour au panier'} onPress={() => router.replace(params.purpose === 'mission' ? '/' as any : success ? '/(client)/orders' : '/(client)/cart')} variant={pending ? 'outline' : 'secondary'} fullWidth />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader variant="back" title="Finaliser la commande" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Confirmer tes informations</Text>
        <Text style={styles.muted}>Ces informations viennent de ton compte Orion et seront utilisées pour la commande.</Text>
        <Card style={styles.card}>
          <ProfileLine label="Nom" value={`${user.prenom} ${user.nom}`} />
          <ProfileLine label="E-mail" value={user.email} />
          <ProfileLine label="Téléphone" value={user.contact || 'Non renseigné'} />
          <ProfileLine label="Adresse de livraison" value={user.adresse || 'Non renseignée'} />
        </Card>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.summaryLine}>
              <Text style={styles.muted} numberOfLines={1}>{item.name} × {item.quantity}</Text>
              <Text style={styles.lineTotal}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.sectionTitle}>Total</Text>
            <Text style={styles.total}>{formatCurrency(getTotalPrice())}</Text>
          </View>
          <Text style={styles.muted}>Tu seras redirigé vers la page sécurisée de FedaPay pour choisir et confirmer le paiement.</Text>
        </Card>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Button title={busy ? 'Ouverture de FedaPay…' : 'Payer avec FedaPay'} onPress={() => void startPayment()} disabled={busy || items.length === 0} variant="secondary" size="lg" fullWidth icon="lock-closed-outline" />
        {busy ? <ActivityIndicator color={Palette.primary[500]} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.profileLine}><Text style={styles.label}>{label}</Text><Text style={styles.profileValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  loading: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.eight, gap: Spacing.three },
  heading: { fontSize: Typography.h2.fontSize, fontWeight: '800', color: Palette.text },
  muted: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19 },
  card: { gap: Spacing.three },
  profileLine: { gap: 4 },
  label: { fontSize: 12, fontWeight: '700', color: Palette.textSecondary },
  profileValue: { color: Palette.text, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Palette.text },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  lineTotal: { fontSize: 13, fontWeight: '700', color: Palette.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.three },
  total: { fontSize: 18, fontWeight: '900', color: Palette.primary[500] },
  error: { color: Palette.danger.base, fontSize: 13, lineHeight: 19 },
  resultWrap: { flex: 1, justifyContent: 'center', padding: Spacing.four },
  resultTitle: { fontSize: 21, fontWeight: '900', color: Palette.text },
});
