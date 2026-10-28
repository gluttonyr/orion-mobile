import { useState } from "react";
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
import { Button, Chip } from "@/components/ui";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { getBoutiqueImageUrl } = useImage();
  const { isAuthenticated } = useAuth();
  const { product, loading } = useProduct(Number(id));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
          {product.image ? (
            <Image
              source={{ uri: getBoutiqueImageUrl(product.image) }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={80} color={Palette.neutral[300]} />
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.productName}>{product.nom}</Text>
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
  imagePlaceholder: { height: 280, alignItems: "center", justifyContent: "center", backgroundColor: Palette.neutral[100] },
  infoCard: { backgroundColor: Palette.surface, marginHorizontal: Spacing.four, borderRadius: Radius.lg, padding: Spacing.five, marginBottom: Spacing.four, ...Shadows.sm },
  infoHeader: { marginBottom: Spacing.four, gap: Spacing.two },
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
  errorCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.eight, gap: Spacing.four },
  errorTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text },
});
