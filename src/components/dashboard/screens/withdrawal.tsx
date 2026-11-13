import { ArrowUpRight, CheckCircle2, Clock3, RefreshCw, Smartphone, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { withdrawalsApi, type Withdrawal, type WithdrawalOptions } from '@/features/orders/api';
import { useToast } from '@/store/toast-store';

const money = (value: number) => `${Number(value ?? 0).toLocaleString('fr-FR')} FCFA`;
const errorMessage = (reason: unknown, fallback: string) => {
  const message = (reason as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === 'string' && message ? message : fallback;
};
const STATUS = {
  en_cours: { label: 'En cours', color: colors.gold, bg: colors.goldSoft, icon: Clock3 },
  envoye: { label: 'Envoyé', color: colors.green, bg: colors.greenSoft, icon: CheckCircle2 },
  echoue: { label: 'Échoué', color: colors.error, bg: colors.burgundySoft, icon: XCircle },
} as const;

/** Retrait des gains libérés vers le Mobile Money du commerçant (payout FedaPay) — même logique que le web. */
export function WithdrawalMethodsScreen() {
  const { showToast } = useToast();
  const [options, setOptions] = useState<WithdrawalOptions | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [opts, data] = await Promise.all([withdrawalsApi.options(), withdrawalsApi.list()]);
      setOptions(opts);
      setMode((current) => current || opts.modes[0]?.mode || '');
      setWithdrawals(data.retraits);
      setAvailable(data.soldes.disponible);
      setError('');
    } catch (reason) {
      setError(errorMessage(reason, 'Impossible de charger vos retraits.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pending = withdrawals.some((item) => item.statut === 'en_cours');
  const value = Number(amount);
  const operator = options?.modes.find((item) => item.mode === mode)?.label ?? '';

  const validate = () => {
    if (!options) return 'Les retraits ne sont pas disponibles pour le moment.';
    if (pending) return 'Un retrait est déjà en cours. Attendez sa confirmation.';
    if (!Number.isInteger(value) || value < options.minimum) return `Le montant minimum est de ${money(options.minimum)}.`;
    if (value > available) return `Vous pouvez retirer au maximum ${money(available)}.`;
    if (value > options.maximum) return `Le maximum par retrait est de ${money(options.maximum)}.`;
    if (!mode) return 'Choisissez votre opérateur Mobile Money.';
    const digits = phone.replace(/\D/g, '');
    if (!digits || (options.longueurNumero && digits.length !== options.longueurNumero)) return `Saisissez un numéro de ${options.longueurNumero ?? ''} chiffres, sans l’indicatif.`;
    return '';
  };

  const send = async () => {
    setSubmitting(true);
    try {
      const created = await withdrawalsApi.request({ montant: value, mode, telephone: phone });
      showToast(created.statut === 'envoye' ? 'Retrait envoyé sur votre Mobile Money.' : 'Retrait lancé. Vous serez notifié dès sa réception.');
      setAmount('');
      await load();
    } catch (reason) {
      const message = errorMessage(reason, 'Le retrait n’a pas pu être lancé.');
      setError(message);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const confirm = () => {
    const message = validate();
    setError(message);
    if (message) return;
    Alert.alert(
      `Retirer ${money(value)} ?`,
      `Envoi via ${operator} au ${options?.indicatif} ${phone}.\nVérifiez bien le numéro : un envoi vers un mauvais numéro ne peut pas être annulé.`,
      [{ text: 'Annuler', style: 'cancel' }, { text: 'Confirmer', onPress: () => void send() }],
    );
  };

  const refresh = async (item: Withdrawal) => {
    setRefreshingId(item.id);
    try {
      const updated = await withdrawalsApi.refresh(item.id);
      if (updated.statut !== 'en_cours') await load();
      else setWithdrawals((list) => list.map((entry) => entry.id === item.id ? updated : entry));
    } catch (reason) {
      showToast(errorMessage(reason, 'Impossible de vérifier ce retrait.'), 'error');
    } finally {
      setRefreshingId(null);
    }
  };

  if (loading) return <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Retirer mes gains</Text>
        <Text style={styles.subtitle}>Envoyez vos montants libérés vers votre Mobile Money</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>DISPONIBLE AU RETRAIT</Text>
        <Text style={styles.balanceAmount}>{money(available)}</Text>
        <Text style={styles.balanceHint}>Minimum {money(options?.minimum ?? 500)} par retrait</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Montant à retirer</Text>
        <View style={styles.amountRow}>
          <TextInput style={styles.amountInput} value={amount} onChangeText={(text) => { setAmount(text.replace(/\D/g, '')); setError(''); }} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.muted} />
          <Text style={styles.currency}>FCFA</Text>
          <Pressable style={styles.allButton} onPress={() => { setAmount(String(Math.min(available, options?.maximum ?? available))); setError(''); }} disabled={!available}>
            <Text style={styles.allText}>Tout</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Opérateur</Text>
        <View style={styles.operators}>
          {options?.modes.map((item) => {
            const active = mode === item.mode;
            return (
              <Pressable key={item.mode} style={[styles.operator, active && styles.operatorActive]} onPress={() => setMode(item.mode)} accessibilityRole="radio" accessibilityState={{ checked: active }}>
                <Smartphone size={15} color={active ? colors.burgundy : colors.muted} />
                <Text style={[styles.operatorText, active && styles.operatorTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Numéro Mobile Money</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.dial}>{options?.indicatif ?? '+228'}</Text>
          <TextInput style={styles.phoneInput} value={phone} onChangeText={(text) => { setPhone(text); setError(''); }} keyboardType="phone-pad" placeholder={options?.longueurNumero === 8 ? '90 00 00 00' : 'Numéro local'} placeholderTextColor={colors.muted} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.submit, (submitting || pending || !available) && styles.submitDisabled]} onPress={confirm} disabled={submitting || pending || !available}>
          {submitting ? <ActivityIndicator color="white" /> : <><Text style={styles.submitText}>{pending ? 'Un retrait est en cours…' : 'Retirer'}</Text><ArrowUpRight size={17} color="white" /></>}
        </Pressable>
        <Text style={styles.note}>Le virement est effectué par FedaPay, généralement en quelques minutes. En cas d’échec, le montant revient automatiquement dans votre solde.</Text>
      </View>

      <Text style={styles.sectionTitle}>Historique des retraits</Text>
      {withdrawals.length === 0 ? <Text style={styles.empty}>Aucun retrait pour le moment.</Text> : withdrawals.map((item) => {
        const status = STATUS[item.statut] ?? STATUS.en_cours;
        const Icon = status.icon;
        return (
          <View key={item.id} style={styles.historyRow}>
            <View style={[styles.historyIcon, { backgroundColor: status.bg }]}><Icon size={16} color={status.color} /></View>
            <View style={styles.historyBody}>
              <Text style={styles.historyAmount}>{money(item.montant)}</Text>
              <Text style={styles.historyMeta} numberOfLines={1}>{options?.modes.find((entry) => entry.mode === item.mode)?.label ?? item.mode} · {item.telephone} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
              {item.statut === 'echoue' && item.erreur ? <Text style={styles.historyError}>{item.erreur}</Text> : null}
            </View>
            <View style={[styles.pill, { backgroundColor: status.bg }]}><Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text></View>
            {item.statut === 'en_cours' ? (
              <Pressable style={styles.refreshButton} onPress={() => void refresh(item)} disabled={refreshingId === item.id} accessibilityLabel="Vérifier le statut">
                {refreshingId === item.id ? <ActivityIndicator size="small" color={colors.burgundy} /> : <RefreshCw size={15} color={colors.burgundy} />}
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, paddingBottom: 30 },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  balanceCard: { backgroundColor: '#841438', borderRadius: radius.lg, padding: 20 },
  balanceLabel: { color: '#EAC494', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  balanceAmount: { color: '#FFF5E8', fontSize: 30, fontWeight: '800', marginTop: 6 },
  balanceHint: { color: 'rgba(255,245,232,0.75)', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 10 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingLeft: 12, paddingRight: 6, paddingVertical: 4 },
  amountInput: { flex: 1, color: colors.ink, fontSize: 24, fontWeight: '800', paddingVertical: 8 },
  currency: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  allButton: { borderRadius: 9, backgroundColor: colors.burgundySoft, paddingHorizontal: 12, paddingVertical: 8 },
  allText: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  operators: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  operator: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  operatorActive: { borderColor: colors.burgundy, backgroundColor: colors.burgundySoft },
  operatorText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  operatorTextActive: { color: colors.burgundy },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: 'hidden' },
  dial: { color: colors.ink, fontSize: 14, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 13, backgroundColor: colors.soft },
  phoneInput: { flex: 1, color: colors.ink, fontSize: 15, paddingHorizontal: 12, paddingVertical: 12 },
  error: { color: colors.error, fontSize: 12 },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 12, backgroundColor: '#841438', marginTop: 6 },
  submitDisabled: { opacity: 0.55 },
  submitText: { color: 'white', fontSize: 15, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: spacing.md },
  empty: { color: colors.muted, fontSize: 13 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12 },
  historyIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyBody: { flex: 1, gap: 2 },
  historyAmount: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  historyMeta: { color: colors.muted, fontSize: 11 },
  historyError: { color: colors.error, fontSize: 11 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: '800' },
  refreshButton: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
