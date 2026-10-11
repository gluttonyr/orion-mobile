import { ChevronRight, CreditCard, Pencil, Plus, Smartphone, Trash2, University } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField, FormSelect } from '../form';
import { EmptyState } from '../ui';
import { colors, radius, spacing } from '../theme';
import { withdrawalMethods as wmData, type WithdrawalMethod } from '../shared';

export function WithdrawalMethodsScreen() {
  const [methods, setMethods] = useState<WithdrawalMethod[]>(wmData);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<WithdrawalMethod | null>(null);

  const openAdd = () => { setEditingMethod(null); setShowForm(true); };
  const openEdit = (method: WithdrawalMethod) => { setEditingMethod(method); setShowForm(true); };

  const handleSave = (method: WithdrawalMethod) => {
    if (editingMethod) {
      setMethods((list) => list.map((m) => (m.id === method.id ? method : m)));
    } else {
      setMethods((list) => [...list, { ...method, id: 'w' + Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setMethods((list) => list.filter((m) => m.id !== id));
  };

  const handleSetActive = (id: string) => {
    setMethods((list) => list.map((m) => ({ ...m, active: m.id === id })));
  };

  const getIcon = (type: string) => {
    if (type === 'Mobile Money') return <Smartphone size={19} color={colors.burgundy} />;
    if (type === 'Banque') return <University size={19} color={colors.burgundy} />;
    return <CreditCard size={19} color={colors.burgundy} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Moyens de retrait</Text>
          <Text style={styles.subtitle}>Gérez vos comptes de retrait</Text>
        </View>
        <Pressable style={styles.primaryBtn} onPress={openAdd}>
          <Plus size={18} color="white" />
          <Text style={styles.primaryBtnText}>Ajouter</Text>
        </Pressable>
      </View>

      {methods.length === 0 ? (
        <EmptyState title="Aucun moyen de retrait" message="Ajoutez un compte Mobile Money ou bancaire pour retirer vos gains." actionLabel="Ajouter un moyen" onAction={openAdd} />
      ) : (
        <View style={styles.list}>
          {methods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodIcon}>{getIcon(method.type)}</View>
              <View style={styles.methodBody}>
                <View style={styles.methodHeaderRow}>
                  <Text style={styles.methodType}>{method.type}</Text>
                  {method.active ? <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Actif</Text></View> : null}
                </View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDetail}>{method.detail}</Text>
                <View style={styles.methodActions}>
                  {!method.active ? (
                    <Pressable style={styles.outlineAction} onPress={() => handleSetActive(method.id)}>
                      <Text style={styles.outlineActionText}>Définir par défaut</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.outlineAction} onPress={() => openEdit(method)}>
                    <Pencil size={13} color={colors.burgundy} />
                    <Text style={styles.outlineActionText}>Modifier</Text>
                  </Pressable>
                  <Pressable style={styles.outlineActionDanger} onPress={() => handleDelete(method.id)}>
                    <Trash2 size={13} color={colors.error} />
                    <Text style={styles.outlineActionDangerText}>Supprimer</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <MethodFormModal visible={showForm} onClose={() => setShowForm(false)} onSave={handleSave} method={editingMethod} />
    </View>
  );
}

function MethodFormModal({
  visible,
  onClose,
  onSave,
  method,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (method: WithdrawalMethod) => void;
  method: WithdrawalMethod | null;
}) {
  const [type, setType] = useState<WithdrawalMethod['type']>(method?.type || 'Mobile Money');
  const [label, setLabel] = useState(method?.label || '');
  const [detail, setDetail] = useState(method?.detail || '');

  const handleSave = () => {
    if (!label.trim() || !detail.trim()) return;
    onSave({
      id: method?.id || '',
      type,
      label,
      detail,
      active: method?.active || false,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{method ? 'Modifier le moyen' : 'Nouveau moyen de retrait'}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <FormSelect label="Type" value={type} options={['Mobile Money', 'Banque', 'Autre']} onSelect={(v) => setType(v as WithdrawalMethod['type'])} />
            <FormField label={type === 'Mobile Money' ? 'Opérateur' : 'Nom de la banque'} value={label} onChangeText={setLabel} placeholder={type === 'Mobile Money' ? 'Ex : TMo Money' : 'Ex : Ecobank'} />
            <FormField label={type === 'Mobile Money' ? 'Numéro de téléphone' : 'Numéro de compte'} value={detail} onChangeText={setDetail} placeholder={type === 'Mobile Money' ? '+228 90 12 34 56' : 'TG-***-4521'} keyboardType={type === 'Mobile Money' ? 'phone-pad' : 'default'} />
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{method ? 'Enregistrer' : 'Ajouter'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.burgundy, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md },
  primaryBtnText: { color: 'white', fontSize: 12, fontWeight: '800' },
  list: { gap: 12 },
  methodCard: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14 },
  methodIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  methodBody: { flex: 1 },
  methodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodType: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  activeBadge: { backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  activeBadgeText: { color: colors.green, fontSize: 10, fontWeight: '700' },
  methodLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', marginTop: 6 },
  methodDetail: { color: colors.muted, fontSize: 11, marginTop: 3 },
  methodActions: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  outlineAction: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  outlineActionText: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  outlineActionDanger: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  outlineActionDangerText: { color: colors.error, fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
});
