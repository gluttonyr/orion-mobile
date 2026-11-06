import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Flag, X } from 'lucide-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { boutiqueService } from '@/service/boutique.service';
import { productsApi } from '@/features/products/api';
import { Button } from '@/components/ui';

type ReportTarget = { type: 'store' | 'product'; id: number; name: string };

export function ReportSheet({ target }: { target: ReportTarget }) {
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (target.type === 'store') await boutiqueService.report(target.id, reason.trim());
      else await productsApi.report(target.id, reason.trim());
      setVisible(false);
      setReason('');
      Alert.alert('Signalement envoyé', 'L’équipe Orion va examiner ce signalement.');
    } catch (error) {
      const message = (error as any)?.response?.data?.message ?? (error instanceof Error ? error.message : 'Impossible d’envoyer le signalement.');
      Alert.alert('Envoi impossible', Array.isArray(message) ? message.join(' ') : String(message));
    } finally {
      setSaving(false);
    }
  };

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Signaler ${target.name}`} style={styles.trigger} onPress={() => setVisible(true)}>
      <Flag size={15} color={Palette.primary[500]} /><Text style={styles.triggerText}>Signaler</Text>
    </Pressable>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && setVisible(false)} accessibilityLabel="Fermer" />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.icon}><Flag size={18} color={Palette.primary[500]} /></View>
            <View style={styles.flex}><Text style={styles.eyebrow}>MODÉRATION ORION</Text><Text style={styles.title}>Signaler {target.type === 'store' ? 'cette boutique' : 'ce produit'}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => !saving && setVisible(false)} hitSlop={8}><X size={20} color={Palette.textSecondary} /></Pressable>
          </View>
          <Text style={styles.targetLabel}>{target.name}</Text>
          <Text style={styles.label}>Motif <Text style={styles.optional}>· facultatif</Text></Text>
          <TextInput value={reason} onChangeText={setReason} placeholder="Ajoute un détail si tu le souhaites" placeholderTextColor={Palette.textMuted} multiline maxLength={1000} textAlignVertical="top" style={styles.input} />
          <Text style={styles.hint}>Tu peux envoyer le signalement sans commentaire.</Text>
          <View style={styles.actions}>
            <Button title="Annuler" variant="outline" onPress={() => setVisible(false)} disabled={saving} style={styles.actionButton} />
            <Button title={saving ? 'Envoi…' : 'Envoyer'} onPress={() => void submit()} disabled={saving} loading={saving} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  trigger: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.md, backgroundColor: Palette.surface, paddingHorizontal: Spacing.three },
  triggerText: { color: Palette.primary[500], fontSize: 12, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,12,15,0.42)' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: Palette.surface, padding: Spacing.five, paddingBottom: Spacing.eight, gap: Spacing.three },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary[50] },
  flex: { flex: 1 },
  eyebrow: { color: Palette.primary[500], fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: Palette.text, fontSize: 18, fontWeight: '800', marginTop: 3 },
  targetLabel: { color: Palette.textSecondary, fontSize: 13, fontWeight: '700', padding: Spacing.three, borderLeftWidth: 3, borderLeftColor: Palette.primary[500], backgroundColor: Palette.neutral[50] },
  label: { color: Palette.text, fontSize: 12, fontWeight: '700' },
  optional: { color: Palette.textMuted, fontWeight: '500' },
  input: { minHeight: 100, borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.md, padding: Spacing.three, color: Palette.text, fontSize: 13, backgroundColor: Palette.surface },
  hint: { color: Palette.textMuted, fontSize: 11 },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  actionButton: { flex: 1 },
});
