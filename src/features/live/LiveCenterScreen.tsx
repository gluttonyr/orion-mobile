import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ExternalLink, Package, Radio, Sparkles, Video, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LiveAvatar } from '@/components/LiveAvatar';
import { useAuth } from '@/features/auth/hooks';
import { useLiveSession } from '@/features/live/LiveContext';
import { formatFcfa, uploadedImageUrl } from '@/features/redesign/mappers';
import { produitService } from '@/service/produit.service';
import { boutiqueService } from '@/service/boutique.service';
import { UserRole, type Boutique, type produits } from '@/model/model';
import { getSellingProductPrice } from '@/features/products/pricing';

const colors = { ink: '#171717', muted: '#737373', line: '#E9E9EC', burgundy: '#8B0A24', soft: '#F9E9ED', navy: '#07121E', white: '#FFFFFF', green: '#147A57' };
const webUrl = (process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(/\/$/, '');

export function LiveCenterScreen({ onCreateClip, onOpenProfile }: { onCreateClip: () => void; onOpenProfile: () => void }) {
  const { user } = useAuth();
  const { session, ready, error: sessionError, startLive, finishLive } = useLiveSession();
  const [products, setProducts] = useState<produits[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [startVisible, setStartVisible] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState('');

  useEffect(() => {
    if (!user?.id || user.role !== UserRole.COMMERCANT) { setProducts([]); setBoutiques([]); setLoading(false); return; }
    setLoading(true);
    setLoadError('');
    void Promise.all([produitService.getByOwner(user.id), boutiqueService.getMine()])
      .then(([ownedProducts, ownedBoutiques]) => {
        setProducts(ownedProducts);
        setBoutiques(ownedBoutiques);
        const defaultBoutique = ownedBoutiques[0];
        setSelectedBoutiqueId(defaultBoutique?.id ?? null);
        setSelectedProductIds([]);
      })
      .catch((error: any) => setLoadError(error?.response?.data?.message || 'Impossible de charger tes produits.'))
      .finally(() => setLoading(false));
  }, [user?.id, user?.role]);

  const canManageLive = user?.role === UserRole.COMMERCANT;
  const sessionProductIds = new Set((session?.produits ?? []).map((product) => product.id));
  const selectableProducts = products.filter((product) => product.proprietaireId === user?.id);

  const copyLink = async (product: produits) => {
    if (!session) {
      Alert.alert('Live requis', 'Démarre un Live et ajoute ce produit à la sélection pour copier un lien suivi.');
      return;
    }
    if (!sessionProductIds.has(product.id)) {
      Alert.alert('Produit non associé', 'Ce produit ne fait pas partie de la sélection enregistrée pour ce Live.');
      return;
    }
    if (!webUrl) {
      Alert.alert('Lien web non configuré', 'Renseigne EXPO_PUBLIC_WEB_URL dans le fichier .env de l’application mobile.');
      return;
    }
    await Clipboard.setStringAsync(`${webUrl}/product/${product.id}?liveSession=${session.id}`);
    Alert.alert('Lien copié', `Le lien public de « ${product.nom} » est prêt à être collé dans ton Live TikTok.`);
  };

  const confirmStart = async () => {
    const value = tiktokUrl.trim();
    if (!/^https?:\/\//i.test(value) || !/tiktok\.com/i.test(value)) {
      Alert.alert('Lien TikTok invalide', 'Colle le lien de ton Live ou de ton profil TikTok.');
      return;
    }
    if (!selectedBoutiqueId) {
      Alert.alert('Boutique requise', 'Choisis une boutique avant de démarrer ton Live.');
      return;
    }
    try {
      await startLive(value, selectedBoutiqueId, selectedProductIds);
      setTiktokUrl('');
      setStartVisible(false);
    } catch (error) {
      Alert.alert('Démarrage impossible', error instanceof Error ? error.message : 'Réessaie après avoir vérifié ta connexion.');
    }
  };

  const confirmFinish = () => Alert.alert('Terminer le Live ?', 'Ton profil ne sera plus marqué comme en direct.', [
    { text: 'Continuer le Live', style: 'cancel' },
    { text: 'Terminer', style: 'destructive', onPress: () => { void finishLive().catch((error) => Alert.alert('Fin impossible', error instanceof Error ? error.message : 'Réessaie après avoir vérifié ta connexion.')); } },
  ]);

  const elapsedMinutes = session ? Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000)) : 0;
  const selectBoutique = (boutique: Boutique) => {
    setSelectedBoutiqueId(boutique.id);
  };
  const toggleProduct = (productId: number) => {
    setSelectedProductIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  };

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.title}>Live Center</Text><Text style={styles.subtitle}>Prépare tes liens et redirige tes clients</Text></View><LiveAvatar size={42} onOfflinePress={onOpenProfile} /></View>
    {sessionError ? <Text style={styles.error}>{sessionError}</Text> : null}
    {!ready ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 10 }} /> : null}
    <View style={styles.statusCard}><LinearGradient colors={[colors.navy, '#102A3D']} style={styles.statusInner}>
      <View style={styles.statusTop}><View style={styles.liveFlag}><View style={[styles.dot, !session && styles.offDot]} /><Text style={styles.liveFlagText}>{session ? 'LIVE EN COURS' : 'AUCUN LIVE EN COURS'}</Text></View><Text style={styles.platform}>TikTok</Text></View>
      <Text style={styles.statusTitle}>{session ? 'Ton Live TikTok est actif' : 'Lance ton Live TikTok'}</Text>
      <Text style={styles.statusDescription}>{session ? `Depuis ${elapsedMinutes} min · ${session.boutique?.nom ?? 'ta boutique'} · démarré le ${new Date(session.startedAt).toLocaleString('fr-FR')}` : 'Colle le lien de ton Live pour le partager depuis Orion.'}</Text>
      {session ? <Pressable style={styles.openTikTok} onPress={() => { void Linking.openURL(session.tiktokUrl).catch(() => Alert.alert('Ouverture impossible', 'Vérifie le lien TikTok enregistré.')); }}><ExternalLink size={16} color={colors.white} /><Text style={styles.openTikTokText}>Ouvrir le Live TikTok</Text></Pressable> : null}
      {session ? <View style={styles.resultsRow}><View><Text style={styles.resultValue}>{session.results?.visits ?? 0}</Text><Text style={styles.resultLabel}>visites</Text></View><View><Text style={styles.resultValue}>{session.results?.orders ?? 0}</Text><Text style={styles.resultLabel}>commandes payées</Text></View><View><Text style={styles.resultValue}>{formatFcfa(session.results?.revenue ?? 0)}</Text><Text style={styles.resultLabel}>chiffre d’affaires</Text></View></View> : null}
    </LinearGradient></View>

    {canManageLive && session ? <Pressable style={styles.finishButton} onPress={confirmFinish}><Text style={styles.finishText}>J’ai terminé mon Live</Text></Pressable> : canManageLive ? <Pressable style={styles.startButton} onPress={() => setStartVisible(true)}><Radio size={18} color={colors.white} /><Text style={styles.startButtonText}>Ajouter le lien de mon Live TikTok</Text></Pressable> : <Text style={styles.empty}>Connecte-toi avec un compte commerçant pour gérer un Live.</Text>}

    <Text style={styles.sectionTitle}>Mes produits et leurs liens publics</Text>
    <Text style={styles.hint}>Copie un lien puis colle-le dans ton Live TikTok pour diriger tes clients vers la fiche produit sur Orion.</Text>
    {!webUrl ? <Text style={styles.configHint}>Configure EXPO_PUBLIC_WEB_URL dans `orion-mobile/.env` pour activer les liens.</Text> : null}
    {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 24 }} /> : loadError ? <Text style={styles.empty}>{loadError}</Text> : products.length === 0 ? <Text style={styles.empty}>Aucun produit créé sur ton compte pour le moment.</Text> : products.map((product) => <View key={product.id} style={styles.productRow}>
      {product.image ? <Image source={{ uri: uploadedImageUrl(product.image) }} style={styles.productImage} /> : <View style={[styles.productImage, styles.imageFallback]}><Package size={22} color={colors.burgundy} /></View>}
      <View style={styles.productCopy}><Text style={styles.productName} numberOfLines={1}>{product.nom}</Text><Text style={styles.price}>{formatFcfa(getSellingProductPrice(product))}</Text>{product.prixPromotionnel != null ? <Text style={styles.stock}>{formatFcfa(Number(product.prix ?? 0))}</Text> : null}<Text style={styles.stock}>{Number(product.stock ?? 0) > 0 ? `${product.stock} en stock` : 'Rupture de stock'}</Text></View>
      <Pressable style={[styles.copyButton, (!webUrl || !session || !sessionProductIds.has(product.id)) && styles.disabled]} disabled={!webUrl || !session || !sessionProductIds.has(product.id)} onPress={() => { void copyLink(product); }}><Text style={styles.copyText}>Lien Live</Text></Pressable>
    </View>)}

    {session ? <><View style={styles.shortHint}><Sparkles size={20} color={colors.burgundy} /><View style={{ flex: 1 }}><Text style={styles.shortHintTitle}>Ton Live est terminé ?</Text><Text style={styles.hint}>Transforme tes meilleurs moments en Shorts.</Text></View></View><Pressable style={styles.startButton} onPress={onCreateClip}><Video size={18} color={colors.white} /><Text style={styles.startButtonText}>Créer un Short à partir du Live</Text></Pressable></> : null}
    <View style={{ height: 30 }} />

    <Modal visible={startVisible} transparent animationType="slide" onRequestClose={() => setStartVisible(false)}>
      <View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.handle} /><View style={styles.sheetHeader}><View style={{ flex: 1 }}><Text style={styles.sheetTitle}>Démarrer ton Live</Text><Text style={styles.hint}>Copie le lien dans TikTok puis colle-le ici.</Text></View><Pressable onPress={() => setStartVisible(false)} hitSlop={10}><X size={21} color={colors.ink} /></Pressable></View>
        <Text style={styles.sectionTitle}>Boutique</Text>
        {boutiques.length === 0 ? <Text style={styles.empty}>Crée une boutique et associe-lui des produits avant de démarrer.</Text> : <View style={styles.selectionWrap}>{boutiques.map((boutique) => <Pressable key={boutique.id} style={[styles.selectionChip, selectedBoutiqueId === boutique.id && styles.selectionChipActive]} onPress={() => selectBoutique(boutique)}><Text style={[styles.selectionText, selectedBoutiqueId === boutique.id && styles.selectionTextActive]}>{boutique.nom}</Text></Pressable>)}</View>}
        <Text style={styles.sectionTitle}>Produits du Live <Text style={styles.optional}>(facultatif)</Text></Text>
        <Text style={styles.hint}>Tu peux démarrer sans produit et en ajouter à un autre Live plus tard.</Text>
        <ScrollView style={styles.productPicker} nestedScrollEnabled>
          {selectableProducts.map((product) => <Pressable key={product.id} style={styles.productPickerRow} onPress={() => toggleProduct(product.id)}><View style={[styles.checkbox, selectedProductIds.includes(product.id) && styles.checkboxActive]}>{selectedProductIds.includes(product.id) ? <Check size={13} color={colors.white} /> : null}</View><Text style={styles.productPickerName}>{product.nom}</Text></Pressable>)}
          {selectableProducts.length === 0 ? <Text style={styles.hint}>Aucun produit rattaché à ton compte commerçant pour le moment. Tu peux démarrer le Live sans produit.</Text> : null}
        </ScrollView>
        <TextInput value={tiktokUrl} onChangeText={setTiktokUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://www.tiktok.com/..." placeholderTextColor={colors.muted} style={styles.urlInput} />
        <Pressable style={styles.startButton} onPress={() => { void confirmStart(); }}><Radio size={18} color={colors.white} /><Text style={styles.startButtonText}>Confirmer mon Live</Text></Pressable>
      </View></View>
    </Modal>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 110 },
  header: { minHeight: 54, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { color: colors.ink, fontSize: 23, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  statusCard: { borderRadius: 19, overflow: 'hidden', marginBottom: 13 },
  statusInner: { padding: 18 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveFlag: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E14D67' },
  offDot: { backgroundColor: '#84919B' },
  liveFlagText: { color: '#F1A5B4', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  platform: { color: '#B8CCD9', fontSize: 11, fontWeight: '700' },
  statusTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginTop: 22 },
  statusDescription: { color: '#B8CCD9', fontSize: 11, lineHeight: 17, marginTop: 6 },
  openTikTok: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 15, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 9 },
  openTikTokText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  startButton: { minHeight: 48, borderRadius: 13, backgroundColor: colors.burgundy, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 13 },
  startButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  finishButton: { minHeight: 48, borderWidth: 1, borderColor: colors.burgundy, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  finishText: { color: colors.burgundy, fontSize: 12, fontWeight: '800' },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 24 },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  configHint: { color: colors.burgundy, backgroundColor: colors.soft, borderRadius: 10, padding: 10, fontSize: 11, lineHeight: 16, marginTop: 12 },
  empty: { color: colors.muted, fontSize: 12, textAlign: 'center', paddingVertical: 25 },
  error: { color: colors.burgundy, backgroundColor: colors.soft, borderRadius: 10, padding: 10, fontSize: 11, marginBottom: 10 },
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)', paddingTop: 14 },
  resultValue: { color: colors.white, fontSize: 14, fontWeight: '800' },
  resultLabel: { color: '#B8CCD9', fontSize: 9, marginTop: 3 },
  productRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 9, marginTop: 10 },
  productImage: { width: 58, height: 62, borderRadius: 10, backgroundColor: colors.soft },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  productCopy: { flex: 1, minWidth: 0 },
  productName: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  price: { color: colors.burgundy, fontSize: 11, fontWeight: '800', marginTop: 4 },
  stock: { color: colors.muted, fontSize: 9, marginTop: 3 },
  copyButton: { borderRadius: 9, backgroundColor: colors.soft, paddingHorizontal: 9, paddingVertical: 9 },
  copyText: { color: colors.burgundy, fontSize: 10, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  shortHint: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: '#F7F8FA', padding: 13, marginTop: 25, marginBottom: 10 },
  shortHintTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  selectionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 6 },
  selectionChip: { borderRadius: 10, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, paddingVertical: 8 },
  selectionChipActive: { backgroundColor: colors.soft, borderColor: colors.burgundy },
  selectionText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  selectionTextActive: { color: colors.burgundy },
  productPicker: { maxHeight: 170, marginVertical: 7 },
  productPickerRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkbox: { width: 19, height: 19, borderRadius: 5, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.burgundy, borderColor: colors.burgundy },
  productPickerName: { color: colors.ink, fontSize: 12, flex: 1 },
  optional: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(7,18,30,0.48)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  urlInput: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 12, color: colors.ink, marginBottom: 14 },
});
