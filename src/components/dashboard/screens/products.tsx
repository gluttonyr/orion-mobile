import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FormField, FormSelect } from '../form';
import { EmptyState, SectionHeader, StatusBadge } from '../ui';
import { colors, radius, spacing } from '../theme';
import { type Product } from '../shared';
import { produitService } from '@/service/produit.service';
import { toDesignProduct } from '@/features/redesign/mappers';
import type { produits } from '@/model/model';
import { categorieService } from '@/service/categorie.service';
import type { Categorie } from '@/model/model';
import { useAuth } from '@/features/auth/hooks';
import { uploadedImageUrl } from '@/features/redesign/mappers';
import { useToast } from '@/store/toast-store';

export function ProductsScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [productList, setProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [publishingProductId, setPublishingProductId] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (!user?.id) { setProductList([]); return; }
      setProductList((await produitService.getByOwner(user.id)).map(toDesignProduct)); setError('');
    }
    catch (e: any) { setError(e?.response?.data?.message || 'Impossible de charger les produits.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    void loadProducts();
    void categorieService.getAll().then(setCategories).catch(() => setCategories([]));
  }, [user?.id]);

  const filtered = productList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (product: Product) => { setEditingProduct(product); setShowForm(true); };

  const handleSave = async (product: Product, imageUri: string | null, secondaryImageUris: string[], clearSecondaryImages: boolean) => {
    const payload: Partial<produits> = {
      nom: product.name,
      description: product.description || '',
      prix: Number(product.price.replace(/[^0-9]/g, '')),
      prixPromotionnel: product.promotionalPrice ?? null,
      stock: product.stock,
      categorieId: product.categoryId,
    };
    setSaving(true);
    try {
      if (editingProduct) await produitService.update(Number(product.id), payload, imageUri?.startsWith('http') ? undefined : imageUri ?? undefined, secondaryImageUris, clearSecondaryImages);
      else await produitService.create(payload, imageUri ?? undefined, secondaryImageUris);
      await loadProducts(); setShowForm(false); showToast(editingProduct ? 'Votre produit a été modifié.' : 'Votre produit a été créé.');
    } catch (e: any) { Alert.alert('Produit non enregistré', e?.response?.data?.message || 'Vérifiez les informations puis réessayez.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string) => Alert.alert('Supprimer le produit ?', 'Cette action est définitive.', [
    { text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: async () => {
      try { await produitService.delete(Number(id)); setDetailProduct(null); await loadProducts(); }
      catch (e: any) { Alert.alert('Suppression impossible', e?.response?.data?.message || 'Réessayez plus tard.'); }
    } },
  ]);

  const handlePublish = async (product: Product) => {
    setPublishingProductId(product.id);
    try {
      const published = await produitService.publish(Number(product.id));
      setProductList((current) => current.map((item) => item.id === product.id ? toDesignProduct(published) : item));
      showToast('Votre produit est maintenant publié.');
    } catch (e: any) {
      Alert.alert('Publication impossible', e?.response?.data?.message || 'Vérifiez votre connexion puis réessayez.');
    } finally { setPublishingProductId(null); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes produits</Text>
          <Text style={styles.subtitle}>{productList.length}/40 produits du forfait Standard</Text>
        </View>
        <Pressable style={[styles.primaryBtn, productList.length >= 40 && { opacity: 0.5 }]} onPress={openAdd} disabled={productList.length >= 40}>
          <Plus size={18} color="white" />
          <Text style={styles.primaryBtnText}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un produit..."
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statValue}>{productList.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{productList.filter((p) => p.status === 'Disponible').length}</Text><Text style={styles.statLabel}>Disponibles</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{productList.filter((p) => p.status === 'Rupture de stock').length}</Text><Text style={styles.statLabel}>Rupture de stock</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{productList.filter((p) => p.status === 'Brouillon').length}</Text><Text style={styles.statLabel}>Brouillons</Text></View>
      </View>

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 28 }} /> : error ? <Text style={styles.error}>{error}</Text> : filtered.length === 0 ? (
        <EmptyState title="Aucun produit" message="Ajoutez votre premier produit pour commencer à vendre." actionLabel="Ajouter un produit" onAction={openAdd} />
      ) : (
        <View style={styles.list}>
          {filtered.map((product) => (
            <Pressable key={product.id} style={styles.productRow} onPress={() => setDetailProduct(product)}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productBody}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productMeta}>{product.category} · {product.price}</Text>
                <View style={styles.productInfoRow}>
                  <StatusBadge status={product.status} />
                  <Text style={styles.stockInfo}>Stock : {product.stock}</Text>
                </View>
              </View>
              <View style={styles.productActions}>
                {product.status === 'Brouillon' ? <Pressable style={styles.publishAction} onPress={(event) => { event.stopPropagation(); void handlePublish(product); }} disabled={publishingProductId !== null}><Text style={styles.publishActionText}>{publishingProductId === product.id ? '…' : 'Publier'}</Text></Pressable> : null}
                <Pressable style={styles.iconAction} onPress={() => openEdit(product)}>
                  <Pencil size={15} color={colors.burgundy} />
                </Pressable>
                <Pressable style={styles.iconActionDanger} onPress={() => handleDelete(product.id)}>
                  <Trash2 size={15} color={colors.error} />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <ProductFormModal key={editingProduct?.id ?? 'new-product'} visible={showForm} saving={saving} categories={categories} onClose={() => setShowForm(false)} onSave={handleSave} product={editingProduct} />
      <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} onEdit={(p) => { setDetailProduct(null); openEdit(p); }} onDelete={handleDelete} />
    </View>
  );
}

function ProductFormModal({
  visible,
  onClose,
  onSave,
  saving,
  product,
  categories,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (product: Product, imageUri: string | null, secondaryImageUris: string[], clearSecondaryImages: boolean) => void | Promise<void>;
  saving: boolean;
  product: Product | null;
  categories: Categorie[];
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.regularPrice || product?.price || '');
  const [promotionalPrice, setPromotionalPrice] = useState(product?.promotionalPrice == null ? '' : String(product.promotionalPrice));
  const [stock, setStock] = useState(product ? String(product.stock) : '');
  const [category, setCategory] = useState(product?.category || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(product?.categoryId);
  const [imageUri, setImageUri] = useState<string | null>(product?.image || null);
  const [secondaryImageUris, setSecondaryImageUris] = useState<string[]>([]);
  const [clearSecondaryImages, setClearSecondaryImages] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Accès requis', 'Autorise l’accès à la galerie pour choisir une photo du produit.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };
  const pickSecondaryImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Accès requis', 'Autorise l’accès à la galerie pour choisir les photos.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 3, quality: 0.85 });
    if (!result.canceled) { setSecondaryImageUris(result.assets.slice(0, 3).map((asset) => asset.uri)); setClearSecondaryImages(false); }
  };

  const handleSave = () => {
    if (!name.trim() || !price.trim()) return;
    const regularPrice = Number(price.replace(/[^0-9]/g, ''));
    const promo = promotionalPrice.trim() ? Number(promotionalPrice) : null;
    if (promo !== null && (!Number.isSafeInteger(promo) || promo <= 0 || promo >= regularPrice)) {
      Alert.alert('Prix promotionnel invalide', 'Le prix promotionnel doit être un montant positif inférieur au prix normal.'); return;
    }
    if (!categories.length) { Alert.alert('Categories indisponibles', 'Impossible de charger les categories. Verifie la connexion puis reessaie.'); return; }
    if (!categoryId) { Alert.alert('Categorie requise', 'Choisis une categorie pour ce produit.'); return; }
    if (!imageUri) { Alert.alert('Photo requise', 'Choisis une photo du produit dans ta galerie.'); return; }
    void onSave({
      id: product?.id || '',
      name,
      price,
      promotionalPrice: promo ?? undefined,
      regularPrice: promo !== null ? price : undefined,
      stock: parseInt(stock) || 0,
      status: product?.status || 'Brouillon',
      category,
      image: imageUri ?? '',
      categoryId,
      description,
      sold: product?.sold || 0,
      views: product?.views || '0',
    }, imageUri, secondaryImageUris, clearSecondaryImages);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{product ? 'Modifier le produit' : 'Nouveau produit'}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <FormField label="Nom du produit" value={name} onChangeText={setName} placeholder="Ex : Nike Air Max" />
            <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Décrivez votre produit" multiline />
            <FormField label="Prix normal (FCFA)" value={price} onChangeText={setPrice} placeholder="Ex : 25 000 FCFA" keyboardType="numeric" />
            <FormField label="Prix promotionnel (FCFA)" value={promotionalPrice} onChangeText={setPromotionalPrice} placeholder="Facultatif" keyboardType="numeric" />
            <FormField label="Stock" value={stock} onChangeText={setStock} placeholder="Ex : 10" keyboardType="numeric" />
            {categories.length ? <FormSelect label="Catégorie" value={category} options={categories.map((item) => (item as any)["libell" + String.fromCharCode(233)])} onSelect={(name) => { setCategory(name); setCategoryId(categories.find((item) => (item as any)["libell" + String.fromCharCode(233)] === name)?.id); }} /> : <Text style={styles.noCategories}>Aucune catégorie disponible. Vérifie la connexion au serveur.</Text>}
            <Text style={styles.imageLabel}>Photo du produit</Text>
            <Pressable style={styles.imagePicker} onPress={() => { void pickImage(); }}>
              {imageUri ? <Image source={{ uri: imageUri.startsWith('file:') || imageUri.startsWith('content:') ? imageUri : uploadedImageUrl(imageUri) }} style={styles.pickedImage} /> : <Text style={styles.pickImageText}>Choisir une photo dans la galerie</Text>}
            </Pressable>
            <Pressable style={styles.secondaryPicker} onPress={() => { void pickSecondaryImages(); }}><Text style={styles.secondaryPickerText}>Choisir jusqu’à 3 images secondaires</Text></Pressable>
            {secondaryImageUris.length ? <Text style={styles.promoHint}>{secondaryImageUris.length} image(s) secondaire(s) sélectionnée(s)</Text> : product?.secondaryImagePaths?.length && !clearSecondaryImages ? <Text style={styles.promoHint}>{product.secondaryImagePaths.length} image(s) secondaire(s) enregistrée(s)</Text> : null}
            {product?.secondaryImagePaths?.length ? <Pressable onPress={() => { setClearSecondaryImages(true); setSecondaryImageUris([]); }}><Text style={styles.removeSecondaryText}>Supprimer les images secondaires</Text></Pressable> : null}
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>{product ? 'Enregistrer' : 'Créer le produit'}</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProductDetailModal({
  product,
  onClose,
  onEdit,
  onDelete,
}: {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  useEffect(() => { setSelectedImage(product?.image || ''); }, [product?.id, product?.image]);
  if (!product) return null;
  const galleryImages = Array.from(new Set([product.image, ...(product.secondaryImagePaths ?? []).map(uploadedImageUrl)].filter(Boolean)));
  return (
    <Modal visible={!!product} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Détail du produit</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeX}>✕</Text></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <Image source={{ uri: selectedImage || product.image }} style={styles.detailImage} />
            {galleryImages.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailThumbs}>{galleryImages.map((image, index) => <Pressable key={`${image}-${index}`} style={[styles.detailThumb, (selectedImage || product.image) === image && styles.detailThumbActive]} onPress={() => setSelectedImage(image)} accessibilityRole="button" accessibilityLabel={`Afficher l’image ${index + 1} de ${product.name}`}><Image source={{ uri: image }} style={styles.detailThumbImage} /></Pressable>)}</ScrollView> : null}
            <View style={styles.detailInfo}>
              <View style={styles.detailHeaderRow}>
                <Text style={styles.detailName}>{product.name}</Text>
                <StatusBadge status={product.status} />
              </View>
              <Text style={styles.detailPrice}>{product.price}</Text>
              {product.regularPrice ? <Text style={styles.detailRegularPrice}>Prix normal : {product.regularPrice}</Text> : null}
              <View style={styles.detailStats}>
                <View style={styles.detailStat}><Text style={styles.detailStatValue}>{product.stock}</Text><Text style={styles.detailStatLabel}>En stock</Text></View>
                <View style={styles.detailStat}><Text style={styles.detailStatValue}>{product.sold}</Text><Text style={styles.detailStatLabel}>Vendus</Text></View>
                <View style={styles.detailStat}><Text style={styles.detailStatValue}>{product.views}</Text><Text style={styles.detailStatLabel}>Vues</Text></View>
              </View>
              <Text style={styles.detailCategory}>Catégorie : {product.category}</Text>
            </View>
            <View style={styles.detailActions}>
              <Pressable style={styles.editBtn} onPress={() => onEdit(product)}>
                <Pencil size={16} color={colors.burgundy} />
                <Text style={styles.editBtnText}>Modifier</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(product.id)}>
                <Trash2 size={16} color={colors.error} />
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </Pressable>
            </View>
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
  searchBar: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: colors.soft, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 10, marginTop: 4, fontWeight: '600' },
  list: { gap: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 10 },
  productImage: { width: 60, height: 60, borderRadius: radius.sm, marginRight: 12 },
  productBody: { flex: 1 },
  productName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  productMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  promoHint: { color: colors.muted, fontSize: 11, marginTop: 3 },
  secondaryPicker: { alignItems: 'center', padding: 12, marginTop: 10, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  secondaryPickerText: { color: colors.burgundy, fontSize: 12, fontWeight: '700' },
  removeSecondaryText: { color: colors.error, fontSize: 12, marginTop: 8 },
  productInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  stockInfo: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  productActions: { flexDirection: 'row', gap: 8 },
  publishAction: { minHeight: 34, borderRadius: 10, backgroundColor: colors.burgundy, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  publishActionText: { color: 'white', fontSize: 10, fontWeight: '800' },
  iconAction: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.burgundySoft, alignItems: 'center', justifyContent: 'center' },
  iconActionDanger: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FDE8EE', alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  imageLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  imagePicker: { minHeight: 112, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 },
  pickedImage: { width: 112, height: 112, borderRadius: radius.sm },
  pickImageText: { color: colors.burgundy, fontSize: 13, fontWeight: '700', padding: 18 },
  noCategories: { color: colors.error, fontSize: 12, marginBottom: 14 },
  saveBtn: { backgroundColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
  detailImage: { width: '100%', height: 200, borderRadius: radius.lg, marginBottom: 16 },
  detailThumbs: { gap: 8, paddingBottom: 14 },
  detailThumb: { width: 58, height: 58, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, opacity: 0.68 },
  detailThumbActive: { borderColor: colors.burgundy, opacity: 1 },
  detailThumbImage: { width: '100%', height: '100%' },
  detailInfo: { gap: 8 },
  detailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailName: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  detailPrice: { color: colors.burgundy, fontSize: 16, fontWeight: '800' },
  detailRegularPrice: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' },
  detailStats: { flexDirection: 'row', gap: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line, marginVertical: 6 },
  detailStat: { alignItems: 'center' },
  detailStatValue: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  detailStatLabel: { color: colors.muted, fontSize: 10, marginTop: 4 },
  detailCategory: { color: colors.muted, fontSize: 12, marginTop: 6 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.burgundy, borderRadius: radius.md, paddingVertical: 14 },
  editBtnText: { color: colors.burgundy, fontSize: 13, fontWeight: '700' },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.error, borderRadius: radius.md, paddingVertical: 14 },
  deleteBtnText: { color: colors.error, fontSize: 13, fontWeight: '700' },
  error: { color: colors.error, padding: 12 },
});
