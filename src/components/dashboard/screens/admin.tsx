import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createApi } from '@/service/api.config';
import { uploadedImageUrl } from '@/features/redesign/mappers';
import { colors, radius, spacing } from '../theme';
import type { DashboardScreen } from '../shared';
import { boutiqueCategorieService, type BoutiqueCategorie } from '@/service/boutique-categorie.service';

const adminApi = createApi('admin');
const publicSettingsApi = createApi('site-settings');
type AdminUser = { id: number; nom: string; prenom: string; email: string; role: string; localisation?: string };
type AdminOrder = { id: number; reference: string; date_achat: string; prix_total: number; statut: string; utilisateur?: { email?: string; prenom?: string; nom?: string }; produits?: Array<{ nom: string }> };
type AdminWallet = { solde: number; totalCommissions: number; totalRemboursements: number };
type SiteSettings = { heroImages: string[]; carouselImages: string[] };
type Props = { screen: DashboardScreen };

export function AdminScreen({ screen }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [wallet, setWallet] = useState<AdminWallet | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({ heroImages: [], carouselImages: [] });
  const [storeCategories, setStoreCategories] = useState<BoutiqueCategorie[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [heroFiles, setHeroFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [carouselFiles, setCarouselFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const money = (amount: number) => `${Number(amount ?? 0).toLocaleString('fr-FR')} FCFA`;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        if (screen === 'admin-users') setUsers((await adminApi.get<AdminUser[]>('/users')).data);
        else if (screen === 'admin-orders') setOrders((await adminApi.get<AdminOrder[]>('/orders')).data);
        else if (screen === 'admin-wallet') setWallet((await adminApi.get<AdminWallet>('/wallet')).data);
        else if (screen === 'admin-settings') setSettings((await publicSettingsApi.get<SiteSettings>('/')).data);
        else if (screen === 'admin-store-categories') setStoreCategories(await boutiqueCategorieService.getAll());
      } catch (reason) { if (mounted) setError((reason as any)?.response?.data?.message ?? 'Impossible de charger les informations.'); }
      finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, [screen]);

  const chooseImages = async (group: 'hero' | 'carousel') => {
    const limit = group === 'hero' ? 3 : 10;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: limit, quality: 0.9 });
    if (result.canceled) return;
    const selected = result.assets.slice(0, limit);
    if (group === 'hero' && selected.length !== 3) { Alert.alert('Trois images requises', 'Sélectionnez exactement trois images pour l’en-tête.'); return; }
    if (group === 'hero') setHeroFiles(selected); else setCarouselFiles(selected);
  };

  const saveImages = async () => {
    setSaving(true); setError('');
    try {
      const body = new FormData();
      heroFiles.forEach((file, index) => body.append('heroImagesFiles', { uri: file.uri, name: file.fileName ?? `hero-${index}.jpg`, type: file.mimeType ?? 'image/jpeg' } as any));
      carouselFiles.forEach((file, index) => body.append('carouselImagesFiles', { uri: file.uri, name: file.fileName ?? `carousel-${index}.jpg`, type: file.mimeType ?? 'image/jpeg' } as any));
      const result = (await adminApi.put<SiteSettings>('/site-settings', body, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
      setSettings(result); setHeroFiles([]); setCarouselFiles([]); Alert.alert('Enregistré', 'Les images de la page d’accueil ont été mises à jour.');
    } catch (reason) { setError((reason as any)?.response?.data?.message ?? 'Impossible d’enregistrer les images.'); }
    finally { setSaving(false); }
  };

  const addStoreCategory = async () => {
    const nom = newCategoryName.trim();
    if (!nom) return;
    setSaving(true); setError('');
    try {
      await boutiqueCategorieService.create(nom);
      setStoreCategories(await boutiqueCategorieService.getAll());
      setNewCategoryName('');
      Alert.alert('Ajoutée', 'La catégorie sera proposée lors de la création des boutiques.');
    } catch (reason) { setError((reason as any)?.response?.data?.message ?? 'Impossible d’ajouter cette catégorie.'); }
    finally { setSaving(false); }
  };

  const deleteStoreCategory = (category: BoutiqueCategorie) => Alert.alert('Supprimer la catégorie ?', category.nom, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: () => { void (async () => {
      setSaving(true); setError('');
      try { await boutiqueCategorieService.delete(category.id); setStoreCategories(await boutiqueCategorieService.getAll()); }
      catch (reason) { setError((reason as any)?.response?.data?.message ?? 'Impossible de supprimer cette catégorie.'); }
      finally { setSaving(false); }
    })(); } },
  ]);

  const title = screen === 'admin-users' ? 'Utilisateurs' : screen === 'admin-orders' ? 'Commandes' : screen === 'admin-wallet' ? 'Portefeuille plateforme' : screen === 'admin-store-categories' ? 'Catégories boutique' : 'Réglages du site';
  return <View style={styles.content}>
    <Text style={styles.eyebrow}>ADMINISTRATION</Text><Text style={styles.title}>{title}</Text>
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : null}
    {error ? <Text style={styles.error}>{String(error)}</Text> : null}
    {!loading && screen === 'admin-users' ? <>{users.map((user) => <View key={user.id} style={styles.card}><Text style={styles.cardTitle}>{[user.prenom, user.nom].filter(Boolean).join(' ') || 'Sans nom'}</Text><Text style={styles.copy}>{user.email}</Text><Text style={styles.tag}>{user.role === 'ADMIN' ? 'Administrateur' : user.role === 'COMMERCANT' ? 'Commerçant' : 'Utilisateur'} · {user.localisation || '—'}</Text></View>)}</> : null}
    {!loading && screen === 'admin-orders' ? <>{orders.map((order) => <View key={order.id} style={styles.card}><Text style={styles.cardTitle}>{order.reference || `Commande #${order.id}`}</Text><Text style={styles.copy}>{[order.utilisateur?.prenom, order.utilisateur?.nom].filter(Boolean).join(' ') || order.utilisateur?.email || 'Client invité'}</Text><Text style={styles.copy}>{order.produits?.map((product) => product.nom).join(', ') || '—'}</Text><Text style={styles.cardTitle}>{money(order.prix_total)} · {order.statut}</Text><Text style={styles.copy}>{order.date_achat ? new Date(order.date_achat).toLocaleDateString('fr-FR') : 'Date indisponible'}</Text></View>)}</> : null}
    {!loading && screen === 'admin-wallet' && wallet ? <><View style={styles.metric}><Text style={styles.copy}>Solde plateforme</Text><Text style={styles.amount}>{money(wallet.solde)}</Text></View><View style={styles.metric}><Text style={styles.copy}>Commissions cumulées</Text><Text style={styles.amount}>{money(wallet.totalCommissions)}</Text></View><View style={styles.metric}><Text style={styles.copy}>Remboursements de commission</Text><Text style={styles.amount}>{money(wallet.totalRemboursements)}</Text></View></> : null}
    {!loading && screen === 'admin-store-categories' ? <>
      <Text style={styles.copy}>Deux catégories sont déjà disponibles par défaut. Ajoute celles qui conviennent aux boutiques Orion.</Text>
      <View style={styles.card}><TextInput style={styles.categoryInput} value={newCategoryName} onChangeText={setNewCategoryName} placeholder="Nom de la catégorie" maxLength={100} /><Pressable style={[styles.button, saving && styles.disabled]} disabled={saving || !newCategoryName.trim()} onPress={() => void addStoreCategory()}><Text style={styles.buttonText}>Ajouter</Text></Pressable></View>
      {storeCategories.map((category) => <View key={category.id} style={styles.categoryRow}><Text style={styles.cardTitle}>{category.nom}</Text><Pressable onPress={() => deleteStoreCategory(category)} disabled={saving}><Text style={styles.deleteText}>Supprimer</Text></Pressable></View>)}
    </> : null}
    {!loading && screen === 'admin-settings' ? <>
      <View style={styles.card}><Text style={styles.cardTitle}>Trois images d’en-tête</Text><Text style={styles.copy}>{heroFiles.length ? `${heroFiles.length} nouvelles images sélectionnées` : `${settings.heroImages.length}/3 enregistrées`}</Text><View style={styles.images}>{(heroFiles.length ? heroFiles.map((file) => file.uri) : settings.heroImages.map(uploadedImageUrl)).map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.preview} />)}</View><Pressable style={styles.button} onPress={() => void chooseImages('hero')}><Text style={styles.buttonText}>Choisir 3 images</Text></Pressable></View>
      <View style={styles.card}><Text style={styles.cardTitle}>Carrousel de la page d’accueil</Text><Text style={styles.copy}>{carouselFiles.length ? `${carouselFiles.length} nouvelles images sélectionnées` : `${settings.carouselImages.length} enregistrées`}</Text><View style={styles.images}>{(carouselFiles.length ? carouselFiles.map((file) => file.uri) : settings.carouselImages.map(uploadedImageUrl)).slice(0, 6).map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.preview} />)}</View><Pressable style={styles.button} onPress={() => void chooseImages('carousel')}><Text style={styles.buttonText}>Choisir des images</Text></Pressable></View>
      <Pressable style={[styles.button, saving && styles.disabled]} disabled={saving} onPress={() => void saveImages()}><Text style={styles.buttonText}>{saving ? 'Enregistrement…' : 'Enregistrer les images'}</Text></Pressable>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 36, gap: spacing.sm },
  eyebrow: { color: colors.burgundy, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: spacing.sm },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginBottom: spacing.sm },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 15, gap: 7 },
  cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  tag: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
  metric: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 17, gap: 8 },
  amount: { color: colors.burgundy, fontSize: 22, fontWeight: '900' },
  images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 7 },
  preview: { width: 88, height: 78, borderRadius: 9, backgroundColor: colors.soft },
  button: { alignSelf: 'flex-start', backgroundColor: colors.burgundy, borderRadius: radius.sm, paddingHorizontal: 13, paddingVertical: 10 },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  categoryInput: { minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 12, color: colors.ink, backgroundColor: colors.white },
  categoryRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 14 },
  deleteText: { color: '#A23B42', fontSize: 12, fontWeight: '700' },
  error: { color: '#A23B42', backgroundColor: '#F9E8E8', padding: 12, borderRadius: radius.sm, fontSize: 12 },
});
