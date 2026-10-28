import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts, useCategories } from "@/features/products/hooks";
import { useImage } from "@/store/image-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { Chip, EmptyState, Input, ProductCard } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { getSellingProductPrice } from "@/features/products/pricing";

export default function SearchScreen() {
  const router = useRouter();
  const { getBoutiqueImageUrl } = useImage();
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const params = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(params.category || "Tous");
  const [sortBy, setSortBy] = useState("popular");

  const filtered = products
    .filter((p) => {
      const matchSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "Tous" || p.categorie?.libellé === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return getSellingProductPrice(a) - getSellingProductPrice(b);
      if (sortBy === "price-desc") return getSellingProductPrice(b) - getSellingProductPrice(a);
      return 0;
    });

  const sortOptions = [
    { value: "popular", label: "Popularité" },
    { value: "price-asc", label: "Prix ↑" },
    { value: "price-desc", label: "Prix ↓" },
  ];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Search */}
        <View style={styles.searchBox}>
          <Input
            icon="search-outline"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            rightElement={
              searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {["Tous", ...categories.map((c) => c.libellé)].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Trier par :</Text>
          {sortOptions.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              size="sm"
              selected={sortBy === s.value}
              onPress={() => setSortBy(s.value)}
            />
          ))}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={Palette.danger.text} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={Palette.primary[500]} size="large" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="Aucun produit trouvé"
            description="Essayez de modifier vos critères de recherche"
          />
        ) : (
          <View style={styles.grid}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                imageUri={product.image ? getBoutiqueImageUrl(product.image) : "https://via.placeholder.com/200"}
                title={product.nom}
                category={product.categorie?.libellé}
                price={getSellingProductPrice(product)}
                originalPrice={product.prixPromotionnel != null ? Number(product.prix ?? 0) : undefined}
                badge={product.statut === "Stock limité" ? { label: "Stock limité", tone: "warning" } : undefined}
                onPress={() => router.push(`/product/${product.id}` as any)}
                style={styles.card}
                footer={
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>{formatCurrency(getSellingProductPrice(product))}</Text>
                    {product.prixPromotionnel != null ? <Text style={styles.originalPrice}>{formatCurrency(Number(product.prix ?? 0))}</Text> : null}
                    <Text style={styles.cardStock}>{product.stock} en stock</Text>
                  </View>
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  searchBox: { marginHorizontal: Spacing.five, marginTop: Spacing.three, marginBottom: Spacing.three },
  catScroll: { marginBottom: Spacing.three },
  catContent: { paddingHorizontal: Spacing.five, gap: Spacing.two },
  sortRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", paddingHorizontal: Spacing.five, marginBottom: Spacing.four, gap: Spacing.two },
  sortLabel: { fontSize: 13, color: Palette.textSecondary, fontWeight: "600" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: Spacing.two, backgroundColor: Palette.danger.bg, marginHorizontal: Spacing.five, padding: Spacing.four, borderRadius: Radius.md, marginBottom: Spacing.four },
  errorText: { color: Palette.danger.text, fontSize: 13 },
  loader: { marginVertical: Spacing.nine },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.four, paddingHorizontal: Spacing.five },
  card: { width: "47%" },
  cardFooter: { marginTop: 4 },
  cardPrice: { fontSize: Typography.subtitle.fontSize, fontWeight: "800", color: Palette.primary[500] },
  originalPrice: { fontSize: 11, color: Palette.textMuted, textDecorationLine: "line-through" },
  cardStock: { fontSize: 11, color: Palette.textSecondary, marginTop: 2 },
});
