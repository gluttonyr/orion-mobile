import { MapPin, Pencil, Plus, Store as StoreIcon, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField, FormSelect } from '../form';
import { EmptyState, RowCard, StatusBadge } from '../ui';
import { colors, radius, spacing } from '../theme';
import { type Store } from '../shared';
import { boutiqueService } from '@/service/boutique.service';
import { useStore } from '@/features/seller/boutique-context';
import { toDesignStore } from '@/features/redesign/mappers';

export function StoresScreen() {
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { refreshStores, setActiveStore, stores } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const openAdd = () => { setEditingStore(null); setShowForm(true); };
  const openEdit = (store: Store) => { setEditingStore(store); setShowForm(true); };
  const closeForm = () => setShowForm(false);

  const loadStores = async () => {
    setLoading(true);
    try { setStoreList((await boutiqueService.getMine()).map(toDesignStore)); setError(''); }
    catch (e: any) { setError(e?.response?.data?.message || 'Impossible de charger vos boutiques.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadStores(); }, []);

  const handleSave = async (store: Store) => {
    const data = new FormData();
    data.append('nom', store.name);
    data.append('description', store.description);
    data.append('category', store.category);
    data.append('location', store.location);
    if (store.logo) data.append('logo', store.logo);
    setSaving(true);
    try {
      if (editingStore) await boutiqueService.update(Number(store.id), data);
      else await boutiqueService.create(data);
      await loadStores(); await refreshStores(); setShowForm(false);
    } catch (e: any) { Alert.alert('Boutique non enregistrée', e?.response?.data?.message || 'Vérifiez votre connexion puis réessayez.'); }
    finally { setSaving(false); }
  };

  const setActive = (id: string) => {
    const selected = stores.find((s) => String(s.id) === id);
    if (selected) void setActiveStore(selected);
  };

  const handleDelete = (id: string) => Alert.alert('Supprimer la boutique ?', 'Cette action est définitive.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => {
      try { await boutiqueService.delete(Number(id)); await loadStores(); await refreshStores(); }
      catch (e: any) { Alert.alert('Suppression impossible', e?.response?.data?.message || 'Réessayez plus tard.'); }
    } },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes boutiques</Text>
          <Text style={styles.subtitle}>Gérez vos points de vente</Text>
        </View>
        {storeList.length === 0 ? <Pressable style={styles.primaryBtn} onPress={openAdd}>
          <Plus size={18} color="white" />
          <Text style={styles.primaryBtnText}>Ajouter</Text>
        </Pressable> : null}
      </View>

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 28 }} /> : error ? <Text style={styles.error}>{error}</Text> : storeList.length === 0 ? (
        <EmptyState
          title="Aucune boutique"
          message="Créez votre première boutique pour commencer à vendre."
          actionLabel="Ajouter une boutique"
          onAction={openAdd}
        />
      ) : (
        <View style={styles.list}>
          {storeList.map((store) => (
            <View key={store.id} style={styles.storeCard}>
              <Image source={{ uri: store.logo }} style={styles.storeLogo} />
              <View style={styles.storeBody}>
                <View style={styles.storeHeaderRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.active ? <StatusBadge status="Actif" /> : null}
                </View>
                <Text style={styles.storeMeta}>{store.category} · {store.location}</Text>
                <Text style={styles.storeDesc} numberOfLines={2}>{store.description}</Text>
                <View style={styles.storeStats}>
                  <View style={styles.statPill}><StoreIcon size={13} color={colors.burgundy} /><Text style={styles.statText}>{store.products} produits</Text></View>
                  <View style={styles.statPill}><Text style={styles.statText}>{store.sales}</Text></View>
                </View>
                <View style={styles.storeActions}>
                  {!store.active ? (
                    <Pressable style={styles.outlineAction} onPress={() => setActive(store.id)}>
                      <Text style={styles.outlineActionText}>Définir active</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.outlineAction} onPress={() => openEdit(store)}>
                    <Pencil size={13} color={colors.burgundy} />
                    <Text style={styles.outlineActionText}>Modifier</Text>
                  </Pressable>
                  <Pressable style={styles.outlineAction} onPress={() => handleDelete(store.id)}><Trash2 size={13} color={colors.error} /><Text style={[styles.outlineActionText, { color: colors.error }]}>Supprimer</Text></Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <StoreFormModal key={editingStore?.id ?? 'new-store'} visible={showForm} saving={saving} onClose={closeForm} onSave={handleSave} store={editingStore} />
    </View>
  );
}

function StoreFormModal({
  visible,
  onClose,
  onSave,
  saving,
  store,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (store: Store) => void | Promise<void>;
  saving: boolean;
  store: Store | null;
}) {
  const [name, setName] = useState(store?.name || '');
  const [description, setDescription] = useState(store?.description || '');
  const [category, setCategory] = useState(store?.category || 'Mode');
  const [location, setLocation] = useState(store?.location || '');
  const [logo, setLogo] = useState(store?.logo || 'https://images.pexels.com/photos/36463718/pexels-photo-36463718.jpeg?auto=compress&cs=tinysrgb&h=400&w=400');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: store?.id || '',
      name,
      description,
      category,
      location: location || 'Lomé, Togo',
      logo,
      active: store?.active || false,
      products: store?.products || 0,
      sales: store?.sales || '0 FCFA',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{store ? 'Modifier la boutique' : 'Nouvelle boutique'}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <FormField label="Nom de la boutique" value={name} onChangeText={setName} placeholder="Ex : Koffi Shoes" />
            <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Décrivez votre boutique" multiline />
            <FormSelect label="Catégorie" value={category} options={['Mode', 'Électronique', 'Beauté', 'Maison', 'Artisanat', 'Alimentation']} onSelect={setCategory} />
            <FormField label="Localisation" value={location} onChangeText={setLocation} placeholder="Ex : Lomé, Togo" />
            <FormField label="URL du logo" value={logo} onChangeText={setLogo} placeholder="https://..." helper="Lien vers une image carrée" />
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>{store ? 'Enregistrer' : 'Créer la boutique'}</Text>}
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
  list: { gap: 14 },
  storeCard: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, overflow: 'hidden' },
  storeLogo: { width: 72, height: 72, borderRadius: radius.md, marginRight: 14 },
  storeBody: { flex: 1 },
  storeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  storeMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  storeDesc: { color: colors.muted, fontSize: 11, marginTop: 6, lineHeight: 16 },
  storeStats: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.burgundySoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statText: { color: colors.burgundy, fontSize: 10, fontWeight: '700' },
  storeActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  outlineAction: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  outlineActionText: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
  error: { color: colors.error, padding: 12 },
});
