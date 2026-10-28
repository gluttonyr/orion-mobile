import { useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useProducts, useCategories } from "@/features/products/hooks";
import { useAuth } from "@/features/auth/hooks";
import { useCart } from "@/store/cart-store";
import { useImage } from "@/store/image-store";
import type { produits } from "@/features/products/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { Button, Card, Chip, ProductCard, SectionHeader } from "@/components/ui";
import { getSellingProductPrice } from "@/features/products/pricing";

const BANNERS = [
  {
    icon: "storefront" as const,
    title: "Devenez vendeur",
    subtitle: "Lancez votre boutique en ligne en quelques minutes",
    cta: "Commencer",
    target: "/register" as const,
    colors: [Palette.primary[600], Palette.primary[400]],
  },
  {
    icon: "briefcase" as const,
    title: "Opportunités pour vous",
    subtitle: "Missions, formations et financements près de chez vous",
    cta: "Découvrir",
    target: "/opportunities" as const,
    colors: [Palette.secondary[700], Palette.secondary[500]],
  },
  {
    icon: "pricetags" as const,
    title: "Bons plans du moment",
    subtitle: "Explorez tous nos produits et trouvez la bonne affaire",
    cta: "Explorer",
    target: "/search" as const,
    colors: [Palette.primary[500], Palette.secondary[500]],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { getBoutiqueImageUrl } = useImage();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const featuredProducts = products.slice(0, 6);
  const [addedId, setAddedId] = useState<number | null>(null);

  const { width } = useWindowDimensions();
  const bannerWidth = width - Spacing.five * 2 - Spacing.three;
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

  const handleAddToCart = (product: produits) => {
    addToCart({
      id: product.id.toString(),
      name: product.nom,
      price: getSellingProductPrice(product),
      image: getBoutiqueImageUrl(product.image ?? ""),
      seller: product.categorie?.libellé ?? "Vendeur",
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleBannerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + Spacing.three));
    setBannerIndex(index);
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingHello}>{isAuthenticated ? "Bon retour," : "Bienvenue,"}</Text>
          <Text style={styles.greetingName}>
            {isAuthenticated ? (user?.prenom ?? "sur Orion") : "explorez Orion"} 👋
          </Text>
        </View>

        {/* Search bar (opens the dedicated search screen) */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={19} color={Palette.textMuted} />
          <Text style={styles.searchPlaceholder}>Rechercher un produit...</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={17} color={Palette.surface} />
          </View>
        </TouchableOpacity>

        {/* Categories */}
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            <Chip label="Tous" tone="primary" selected onPress={() => router.push("/search")} />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.libellé}
                onPress={() => router.push({ pathname: "/search", params: { category: cat.libellé } })}
              />
            ))}
          </ScrollView>
        )}

        {/* Promo carousel */}
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={bannerWidth + Spacing.three}
          snapToAlignment="start"
          contentContainerStyle={styles.bannerContent}
          onMomentumScrollEnd={handleBannerScrollEnd}
        >
          {BANNERS.map((banner) => (
            <TouchableOpacity key={banner.title} activeOpacity={0.9} onPress={() => router.push(banner.target)}>
              <LinearGradient colors={banner.colors as [string, string]} style={[styles.banner, { width: bannerWidth }]}>
                <View style={styles.bannerIconBox}>
                  <Ionicons name={banner.icon} size={26} color={Palette.surface} />
                </View>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                <View style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>{banner.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Palette.surface} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {BANNERS.map((banner, i) => (
            <View key={banner.title} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <SectionHeader
            title="Produits Populaires"
            subtitle="Les produits les plus demandés"
            actionLabel="Voir tout"
            onAction={() => router.push("/search")}
          />

          {loading ? (
            <ActivityIndicator color={Palette.primary[500]} size="large" style={styles.loader} />
          ) : (
            <View style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  imageUri={getBoutiqueImageUrl(product.image ?? "") || "https://via.placeholder.com/200"}
                  title={product.nom}
                  category={product.categorie?.libellé ?? "Autre"}
                  price={getSellingProductPrice(product)}
                  originalPrice={product.prixPromotionnel != null ? Number(product.prix ?? 0) : undefined}
                  badge={product.stock != null && product.stock <= 5 ? { label: "Stock limité", tone: "warning" } : undefined}
                  onPress={() => router.push(`/product/${product.id}` as any)}
                  onAddToCart={() => handleAddToCart(product)}
                  addToCartDone={addedId === product.id}
                  style={styles.productCard}
                />
              ))}
            </View>
          )}
        </View>

        {/* Marketing content for visitors only — returning shoppers go straight to shopping */}
        {!isAuthenticated && (
          <>
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Pourquoi choisir Orion ?</Text>
              {[
                { icon: "shield-checkmark-outline" as const, title: "Paiement Sécurisé", desc: "Transactions 100% sécurisées avec protection acheteur et vendeur." },
                { icon: "trending-up-outline" as const, title: "Opportunités de Croissance", desc: "Formations, micro-crédits et réseaux pour développer votre activité." },
                { icon: "earth-outline" as const, title: "Réseau Panafricain", desc: "Accédez à des marchés à travers toute l'Afrique." },
              ].map((f) => (
                <Card key={f.title} style={styles.featureCard}>
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconBox}>
                      <Ionicons name={f.icon} size={26} color={Palette.surface} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                      <Text style={styles.featureDesc}>{f.desc}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            <LinearGradient colors={[Palette.primary[600], Palette.secondary[500]]} style={styles.cta}>
              <Text style={styles.ctaTitle}>Prêt à développer votre business ?</Text>
              <Text style={styles.ctaSubtitle}>
                Rejoignez des milliers d'entrepreneurs africains qui font confiance à Orion.
              </Text>
              <View style={styles.ctaButtons}>
                <Button title="Créer un compte" onPress={() => router.push("/register")} variant="ghost" />
                <Button title="Voir les opportunités" onPress={() => router.push("/opportunities")} variant="secondary" />
              </View>
            </LinearGradient>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  greeting: { paddingHorizontal: Spacing.five, paddingTop: Spacing.four, paddingBottom: Spacing.three },
  greetingHello: { fontSize: 14, color: Palette.textSecondary, fontWeight: "600" },
  greetingName: { fontSize: Typography.h1.fontSize, fontWeight: "800", color: Palette.text, marginTop: 2 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: Spacing.three,
    marginHorizontal: Spacing.five, backgroundColor: Palette.surface,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Palette.border,
    paddingHorizontal: Spacing.four, height: 52, ...Shadows.sm,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Palette.textMuted },
  filterBtn: {
    width: 30, height: 30, borderRadius: Radius.sm, backgroundColor: Palette.primary[500],
    alignItems: "center", justifyContent: "center",
  },
  catScroll: { marginTop: Spacing.five },
  catContent: { paddingHorizontal: Spacing.five, gap: Spacing.two },
  bannerContent: { paddingHorizontal: Spacing.five, gap: Spacing.three, marginTop: Spacing.five },
  banner: { borderRadius: Radius.xl, padding: Spacing.five, minHeight: 150, justifyContent: "center", ...Shadows.md },
  bannerIconBox: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: Spacing.three,
  },
  bannerTitle: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.surface, marginBottom: 4 },
  bannerSubtitle: { fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 18, marginBottom: Spacing.three, maxWidth: "90%" },
  bannerCta: { flexDirection: "row", alignItems: "center", gap: 6 },
  bannerCtaText: { fontSize: 13, fontWeight: "700", color: Palette.surface },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: Spacing.three },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.neutral[300] },
  dotActive: { width: 18, backgroundColor: Palette.primary[500] },
  section: { padding: Spacing.five },
  loader: { marginVertical: Spacing.eight },
  productsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.four },
  productCard: { width: "47%" },
  featuresSection: { backgroundColor: Palette.neutral[100], padding: Spacing.five },
  featuresTitle: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text, textAlign: "center", marginBottom: Spacing.five },
  featureCard: { marginBottom: Spacing.three },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.four },
  featureIconBox: { width: 52, height: 52, backgroundColor: Palette.primary[500], borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: Typography.subtitle.fontSize, fontWeight: "700", color: Palette.text, marginBottom: 4 },
  featureDesc: { fontSize: Typography.bodySmall.fontSize, color: Palette.textSecondary, lineHeight: 20 },
  cta: { margin: Spacing.five, padding: Spacing.seven, borderRadius: Radius.xl, ...Shadows.md },
  ctaTitle: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.surface, textAlign: "center", marginBottom: Spacing.three },
  ctaSubtitle: { fontSize: 14, color: Palette.primary[100], textAlign: "center", marginBottom: Spacing.five },
  ctaButtons: { flexDirection: "row", gap: Spacing.three, justifyContent: "center", flexWrap: "wrap" },
});
