import { ArrowDownLeft, ArrowUpRight, CreditCard, Plus, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FormField, FormSelect } from '../form';
import { SectionHeader } from '../ui';
import { colors, radius, spacing } from '../theme';
import { transactions as txData, withdrawalMethods as wmData, type WithdrawalMethod } from '../shared';

export function WalletScreen({ onNavigate }: { onNavigate: (screen: 'withdrawal-methods') => void }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [methods, setMethods] = useState<WithdrawalMethod[]>(wmData);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portefeuille</Text>
        <Text style={styles.subtitle}>Gérez votre solde et vos retraits</Text>
      </View>

      <LinearGradient colors={[colors.burgundy, colors.burgundyDark]} style={styles.walletCard}>
        <View style={styles.walletTop}>
          <Text style={styles.walletLabel}>SOLDE DISPONIBLE</Text>
          <Wallet size={20} color="#F7CBD5" />
        </View>
        <Text style={styles.walletAmount}>125 400 FCFA</Text>
        <Text style={styles.walletSubtext}>En attente : 18 500 FCFA</Text>
        <View style={styles.walletActions}>
          <Pressable style={styles.walletActionBtn} onPress={() => setShowWithdraw(true)}>
            <ArrowUpRight size={17} color={colors.burgundy} />
            <Text style={styles.walletActionText}>Retirer</Text>
          </Pressable>
          <Pressable style={styles.walletActionBtnOutline} onPress={() => onNavigate('withdrawal-methods')}>
            <CreditCard size={17} color="white" />
            <Text style={styles.walletActionOutlineText}>Moyens de retrait</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <SectionHeader title="Historique des transactions" action="Filtrer" />
      <View style={styles.txList}>
        {txData.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? colors.greenSoft : '#FDE8EE' }]}>
              {tx.type === 'credit' ? <ArrowDownLeft size={17} color={colors.green} /> : <ArrowUpRight size={17} color={colors.error} />}
            </View>
            <View style={styles.flex}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'credit' ? colors.green : colors.error }]}>
              {tx.type === 'credit' ? '+' : '-'} {tx.amount}
            </Text>
          </View>
        ))}
      </View>

      <WithdrawModal visible={showWithdraw} onClose={() => setShowWithdraw(false)} methods={methods} />
    </View>
  );
}

function WithdrawModal({
  visible,
  onClose,
  methods,
}: {
  visible: boolean;
  onClose: () => void;
  methods: WithdrawalMethod[];
}) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(methods.find((m) => m.active)?.id || methods[0]?.id || '');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Nouveau retrait</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.balanceInfo}>Solde disponible : 125 400 FCFA</Text>
            <FormField label="Montant à retirer (FCFA)" value={amount} onChangeText={setAmount} placeholder="Ex : 50 000" keyboardType="numeric" />
            <Text style={styles.label}>Moyen de retrait</Text>
            <View style={styles.methodList}>
              {methods.map((method) => {
                const active = selectedMethod === method.id;
                return (
                  <Pressable key={method.id} style={[styles.methodCard, active && styles.methodCardActive]} onPress={() => setSelectedMethod(method.id)}>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodType}>{method.type}</Text>
                      <Text style={styles.methodDetail}>{method.label} · {method.detail}</Text>
                    </View>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.saveBtn} onPress={onClose}>
              <Text style={styles.saveBtnText}>Confirmer le retrait</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  walletCard: { borderRadius: radius.lg, padding: 22, marginBottom: spacing.lg },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: '#F7CBD5', fontSize: 10, letterSpacing: 1.1, fontWeight: '700' },
  walletAmount: { color: 'white', fontWeight: '800', fontSize: 28, marginTop: 14 },
  walletSubtext: { color: '#F7CBD5', fontSize: 12, marginTop: 6 },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  walletActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'white', borderRadius: radius.md, paddingVertical: 14 },
  walletActionText: { color: colors.burgundy, fontSize: 13, fontWeight: '800' },
  walletActionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', borderRadius: radius.md, paddingVertical: 14 },
  walletActionOutlineText: { color: 'white', fontSize: 13, fontWeight: '700' },
  txList: { gap: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  txIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex: { flex: 1 },
  txLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  txDate: { color: colors.muted, fontSize: 11, marginTop: 3 },
  txAmount: { fontSize: 13, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  balanceInfo: { color: colors.muted, fontSize: 12, marginBottom: 16, backgroundColor: colors.soft, padding: 12, borderRadius: radius.sm },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  methodList: { gap: 10, marginBottom: 20 },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14 },
  methodCardActive: { borderColor: colors.burgundy, borderWidth: 1.5 },
  methodInfo: { flex: 1 },
  methodType: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  methodDetail: { color: colors.muted, fontSize: 11, marginTop: 3 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.burgundy },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.burgundy },
  saveBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
});
