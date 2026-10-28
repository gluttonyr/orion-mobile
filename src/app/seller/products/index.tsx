import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "@/features/products/hooks";
import { productsApi } from "@/features/products/api";
import { useStore } from "@/features/seller/boutique-context";
import { useImage } from "@/store/image-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, Typography, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Chip, EmptyState, PriceTag, ProductCard, StatTile, type ChipTone } from "@/components/ui";
import { getSellingProductPrice } from "@/features/products/pricing";

function statutTone(statut?: string): ChipTone {
  if (statut === "En stock") return "success";
  if (statut === "Stock limité") return "warning";
  return "neutral";
}

export default function SellerProductsScreen() {
  const router = useRouter();
  const { activeStore } = useStore();
  const { getBoutiqueImageUrl } = useImage();
  const { products, loading } = useProducts();
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products
    .filter((p) => !deletedIds.includes(p.id))
    .filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalValue = filtered.reduce((sum, p) => sum + getSellingProductPrice(p) * (p.stock ?? 0), 0);
  const lowStock = filtered.filter((p) => (p.stock ?? 0) < 10).length;

  const handleDelete = (id: number) => {
    Alert.alert("Supprimer le produit", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await productsApi.delete(id);
            setDeletedIds((prev) => [...prev, id]);
          } catch {
            Alert.alert("Erreur", "Impossible de supprimer ce produit.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="authenticated" title="Mes Produits" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Add button */}
        <View style={styles.addRow}>
          <View>
            <Text style={styles.storeLabel}>{activeStore?.nom ?? "Gérez votre catalogue"}</Text>
            <Text style={styles.countLabel}>{filtered.length} produit{filtered.length !== 1 ? "s" : ""}</Text>
          </View>
          <Button
            title="Ajouter"
            icon="add"
            size="sm"
            onPress={() => router.push("/seller/products/new")}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatTile icon="cube-outline" label="Total" value={filtered.length.toString()} tone="primary" style={styles.statTile} />
          <StatTile icon="trending-up-outline" label="Valeur stock" value={formatCurrency(totalValue)} tone="secondary" style={styles.statTile} />
          <StatTile icon="alert-circle-outline" label="Stock faible" value={lowStock.toString()} tone="warning" style={styles.statTile} />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={Palette.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={Palette.primary[500]} size="large" style={{ marginVertical: Spacing.eight }} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title="Aucun produit trouvé"
            description="Ajoutez votre premier produit pour commencer à vendre."
            actionLabel="Ajouter un produit"
            onAction={() => router.push("/seller/products/new")}
          />
        ) : (
          <View style={styles.grid}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                imageUri={product.image ? getBoutiqueImageUrl(product.image) : ""}
                title={product.nom}
                category={product.description}
                price={getSellingProductPrice(product)}
                originalPrice={product.prixPromotionnel != null ? Number(product.prix ?? 0) : undefined}
                style={styles.gridItem}
                footer={
                  <View>
                    <View style={styles.footerTopRow}>
                      <View><PriceTag amount={getSellingProductPrice(product)} size="sm" />{product.prixPromotionnel != null ? <Text style={styles.originalPrice}>{formatCurrency(Number(product.prix ?? 0))}</Text> : null}</View>
                      <Chip
                        label={`${product.stock ?? 0} u.`}
                        tone={(product.stock ?? 0) < 10 ? "warning" : "neutral"}
                        size="sm"
                      />
                    </View>
                    <Chip label={product.statut ?? ""} tone={statutTone(product.statut)} size="sm" style={{ marginTop: 6 }} />
                    <View style={styles.footerActions}>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => router.push(`/seller/products/new?id=${product.id}` as any)}
                        hitSlop={6}
                      >
                        <Ionicons name="create-outline" size={16} color={Palette.primary[500]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, styles.iconBtnDanger]}
                        onPress={() => handleDelete(product.id)}
                        hitSlop={6}
                      >
                        <Ionicons name="trash-outline" size={16} color={Palette.danger.base} />
                      </TouchableOpacity>
                    </View>
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
  originalPrice: { fontSize: 10, color: Palette.textMuted, textDecorationLine: "line-through" },
  addRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  storeLabel: { fontSize: 14, fontWeight: "600", color: Palette.text },
  countLabel: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  statTile: { flex: 1 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: Spacing.two,
    backgroundColor: Palette.surface, marginHorizontal: Spacing.four, marginBottom: Spacing.four,
    borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Palette.text },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.four, gap: Spacing.three },
  gridItem: { width: "47%" },
  footerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  footerActions: { flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three },
  iconBtn: {
    flex: 1, height: 32, borderRadius: Radius.sm, backgroundColor: Palette.primary[50],
    alignItems: "center", justifyContent: "center",
  },
  iconBtnDanger: { backgroundColor: Palette.danger.bg },
});
