import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProduct } from "@/features/products/hooks";
import { useCart } from "@/store/cart-store";
import { useImage } from "@/store/image-store";
import { useAuth } from "@/features/auth/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { getSellingProductPrice } from "@/features/products/pricing";
import { productsApi, type ProductReviewList } from "@/features/products/api";
import { Button, Chip } from "@/components/ui";
import { ReportSheet } from "@/components/ReportSheet";
import { ReviewComposer } from "@/components/ReviewComposer";
import { useFavoriteProduct } from "@/features/products/favorites";
import { useToast } from "@/store/toast-store";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const favorite = useFavoriteProduct(Number(id) || undefined);
  const toggleFavorite = async () => {
    try {
      const liked = await favorite.toggleFavorite();
      if (liked !== undefined) showToast(liked ? "Produit ajouté à vos favoris." : "Produit retiré de vos favoris.");
    } catch {
      showToast("Impossible d’enregistrer votre like.", "error");
    }
  };
  const { getBoutiqueImageUrl } = useImage();
  const { isAuthenticated } = useAuth();
  const { product, loading } = useProduct(Number(id));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReviewList>({ moyenne: 0, nombre: 0, avis: [] });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsReload, setReviewsReload] = useState(0);

  useEffect(() => {
    setSelectedImage(null);
    if (!product) return;
    let active = true;
    setReviewsLoading(true);
    productsApi.getReviews(product.id)
      .then((result) => { if (active) setReviews(result); })
      .catch(() => { if (active) setReviews({ moyenne: 0, nombre: 0, avis: [] }); })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [product?.id, reviewsReload]);

  const gallery = [product?.image, ...(product?.images_secondaires ?? [])].filter((image): image is string => Boolean(image));

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id.toString(),
        name: product.nom,
        price: getSellingProductPrice(product),
        image: getBoutiqueImageUrl(product.image ?? ""),
        seller: product.categorie?.libellé ?? "Vendeur",
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ActivityIndicator color={Palette.primary[500]} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.errorCenter}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.danger.base} />
          <Text style={styles.errorTitle}>Produit non trouvé</Text>
          <Button title="Retour" onPress={() => router.back()} variant="primary" size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Détail produit" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        <View style={styles.imageBox}>
          {selectedImage || product.image ? (
            <Image
              source={{ uri: getBoutiqueImageUrl(selectedImage || product.image || "") }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={80} color={Palette.neutral[300]} />
            </View>
          )}
        </View>

        {gallery.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryThumbs}>{gallery.map((image, index) => <TouchableOpacity key={`${image}-${index}`} accessibilityRole="button" accessibilityLabel={`Afficher l’image ${index + 1}`} onPress={() => setSelectedImage(image)} style={[styles.galleryThumb, (selectedImage || product.image) === image && styles.galleryThumbActive]}><Image source={{ uri: getBoutiqueImageUrl(image) }} style={styles.galleryThumbImage} /></TouchableOpacity>)}</ScrollView> : null}

        <View style={styles.infoCard}>
          {product.boutiqueId ? <TouchableOpacity style={styles.storeLink} onPress={() => router.push(`/(client)/store/${product.boutiqueId}` as any)}><Ionicons name="storefront-outline" size={17} color={Palette.primary[500]} /><Text style={styles.storeLinkText}>{product.boutiqueNom || 'Voir la boutique'}</Text><Ionicons name="chevron-forward" size={16} color={Palette.primary[500]} /></TouchableOpacity> : null}
          <View style={styles.infoHeader}>
            <View style={styles.titleRow}>
            <Text style={[styles.productName, { flex: 1 }]}>{product.nom}</Text>
            <TouchableOpacity onPress={() => void toggleFavorite()} disabled={favorite.saving} hitSlop={8} accessibilityLabel={favorite.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} style={styles.likeButton}>
              <Ionicons name={favorite.isFavorite ? "heart" : "heart-outline"} size={22} color={favorite.isFavorite ? Palette.danger.base : Palette.textSecondary} />
              {favorite.count != null ? <Text style={styles.likeCount}>{favorite.count}</Text> : null}
            </TouchableOpacity>
            </View>
            {product.categorie && (
              <Chip label={product.categorie.libellé} tone="primary" size="sm" />
            )}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{formatCurrency(getSellingProductPrice(product))}</Text>
              {product.prixPromotionnel != null ? <Text style={styles.originalPrice}>{formatCurrency(Number(product.prix ?? 0))}</Text> : null}
              <Text style={styles.priceLabel}>Prix unitaire</Text>
            </View>
            <Chip
              icon="cube-outline"
              label={`${product.stock} en stock`}
              tone={product.stock! > 0 ? "success" : "warning"}
              size="sm"
            />
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantité</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={Palette.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.min(product.stock ?? 99, quantity + 1))}
              >
                <Ionicons name="add" size={18} color={Palette.textSecondary} />
              </TouchableOpacity>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(getSellingProductPrice(product) * quantity)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Button
              title={added ? "✓ Ajouté !" : "Ajouter au panier"}
              onPress={handleAddToCart}
              variant="outline"
              icon="cart-outline"
              style={styles.actionBtn}
            />
            <Button
              title={isAuthenticated ? "Acheter" : "Se connecter pour acheter"}
              onPress={() => router.push(isAuthenticated ? "/cart" : "/login")}
              variant="primary"
              icon="card-outline"
              style={styles.actionBtn}
            />
          </View>
          <View style={styles.communityActions}>
            <ReviewComposer productId={product.id} productName={product.nom} onSaved={() => setReviewsReload((value) => value + 1)} />
            <ReportSheet target={{ type: 'product', id: product.id, name: product.nom }} />
          </View>
        </View>

        <View style={styles.reviewsCard}>
          <View style={styles.reviewsHeading}>
            <View><Text style={styles.reviewsKicker}>AVIS CLIENTS</Text><Text style={styles.reviewsTitle}>{reviews.nombre ? `${reviews.moyenne.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} / 5` : 'Pas encore noté'}</Text></View>
            <Text style={styles.reviewsCount}>{reviewsLoading ? 'Chargement…' : `${reviews.nombre} avis`}</Text>
          </View>
          {reviews.avis.length ? reviews.avis.map((review) => <View key={review.id} style={styles.reviewRow}><View style={styles.reviewTop}><Text style={styles.reviewAuthor}>{review.auteur}</Text><View style={styles.reviewStars}>{Array.from({ length: 5 }, (_, index) => <Ionicons key={index} name={index < review.note ? 'star' : 'star-outline'} size={12} color={Palette.warning.text} />)}</View><Text style={styles.reviewDate}>{new Date(review.dateCreation).toLocaleDateString('fr-FR')}</Text></View>{review.commentaire ? <Text style={styles.reviewComment}>{review.commentaire}</Text> : null}</View>) : <Text style={styles.noReviews}>Aucun avis publié. Sois le premier à noter ce produit.</Text>}
        </View>

        <View style={styles.descCard}>
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{product.description || "Aucune description disponible."}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  imageBox: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, overflow: "hidden", marginBottom: Spacing.four, marginTop: Spacing.three, ...Shadows.sm },
  image: { width: "100%", height: 280 },
  galleryThumbs: { paddingHorizontal: Spacing.four, gap: Spacing.two, marginTop: -Spacing.two, marginBottom: Spacing.four },
  galleryThumb: { borderWidth: 2, borderColor: 'transparent', borderRadius: Radius.md, overflow: 'hidden' },
  galleryThumbActive: { borderColor: Palette.primary[500] },
  galleryThumbImage: { width: 58, height: 58 },
  imagePlaceholder: { height: 280, alignItems: "center", justifyContent: "center", backgroundColor: Palette.neutral[100] },
  infoCard: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, padding: Spacing.five, marginBottom: Spacing.four, ...Shadows.sm },
  infoHeader: { marginBottom: Spacing.four, gap: Spacing.two },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.two },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.one },
  likeCount: { fontSize: 12, fontWeight: "700", color: Palette.textSecondary },
  productName: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: Spacing.four, borderTopWidth: 1, borderTopColor: Palette.border, marginBottom: Spacing.five },
  price: { fontSize: 28, fontWeight: "800", color: Palette.primary[500] },
  priceLabel: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  originalPrice: { fontSize: 13, color: Palette.textMuted, textDecorationLine: "line-through", marginTop: 2 },
  quantitySection: { marginBottom: Spacing.five },
  quantityLabel: { fontSize: 14, fontWeight: "600", color: Palette.textSecondary, marginBottom: Spacing.three },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  quantityBtn: { width: 40, height: 40, backgroundColor: Palette.neutral[100], borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  quantityValue: { fontSize: 18, fontWeight: "800", color: Palette.text, minWidth: 32, textAlign: "center" },
  totalBox: { marginLeft: "auto", alignItems: "flex-end" },
  totalLabel: { fontSize: 12, color: Palette.textSecondary },
  totalValue: { fontSize: 18, fontWeight: "800", color: Palette.text },
  actionRow: { flexDirection: "row", gap: Spacing.three },
  actionBtn: { flex: 1 },
  descCard: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, padding: Spacing.five, ...Shadows.sm },
  descTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text, marginBottom: Spacing.three },
  descText: { fontSize: 14, color: Palette.textSecondary, lineHeight: 22 },
  storeLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingBottom: Spacing.three, borderBottomWidth: 1, borderBottomColor: Palette.border, marginBottom: Spacing.three },
  storeLinkText: { flex: 1, color: Palette.primary[500], fontSize: 13, fontWeight: '700' },
  communityActions: { gap: Spacing.two, marginTop: Spacing.four },
  reviewsCard: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, padding: Spacing.five, marginBottom: Spacing.four, ...Shadows.sm },
  reviewsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Spacing.three },
  reviewsKicker: { color: Palette.primary[500], fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  reviewsTitle: { color: Palette.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  reviewsCount: { color: Palette.textSecondary, fontSize: 11 },
  reviewRow: { borderTopWidth: 1, borderTopColor: Palette.border, paddingVertical: Spacing.three, gap: Spacing.two },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reviewAuthor: { color: Palette.text, fontSize: 12, fontWeight: '700' },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewDate: { marginLeft: 'auto', color: Palette.textMuted, fontSize: 10 },
  reviewComment: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18 },
  noReviews: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18, paddingVertical: Spacing.two },
  errorCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.eight, gap: Spacing.four },
  errorTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text },
});
