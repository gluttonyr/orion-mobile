import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { ReportSheet } from "@/components/ReportSheet";
import { EmptyState, ProductCard } from "@/components/ui";
import { BottomTabInset, Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { boutiqueService } from "@/service/boutique.service";
import { useProducts } from "@/features/products/hooks";
import { getSellingProductPrice } from "@/features/products/pricing";
import { uploadedImageUrl } from "@/features/redesign/mappers";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/features/auth/hooks";
import type { Boutique } from "@/model/model";

/** Vitrine publique d'une boutique — équivalent mobile de /store/:id sur le web. */
export default function StorefrontScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { products, loading: productsLoading } = useProducts();
  const [store, setStore] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    boutiqueService.getById(Number(id))
      .then((record) => { if (active) setStore(record); })
      .catch(() => { if (active) setStore(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const storeProducts = useMemo(
    () => store?.proprietaireId == null ? [] : products.filter((product) => product.proprietaireId === store.proprietaireId),
    [products, store?.proprietaireId],
  );

  if (loading) {
    return <SafeAreaView style={styles.flex} edges={["top"]}><ActivityIndicator color={Palette.primary[500]} size="large" style={{ flex: 1 }} /></SafeAreaView>;
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="back" title="Boutique" />
        <EmptyState icon="storefront-outline" title="Boutique introuvable" description="Cette boutique n’est pas disponible actuellement." actionLabel="Retour au marketplace" onAction={() => router.replace("/(client)/search")} />
      </SafeAreaView>
    );
  }

  const mapsLink = store.location && /^https?:\/\//i.test(store.location) ? store.location : null;
  const logo = uploadedImageUrl(store.logo);

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title={store.nom} subtitle="Boutique Orion" />
      <ScrollView contentContainerStyle={{ paddingBottom: BottomTabInset }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={[styles.logo, styles.logoFallback]}><Ionicons name="storefront" size={30} color={Palette.primary[500]} /></View>}
          <Text style={styles.eyebrow}>{(store.category || "Créateur indépendant").toUpperCase()}</Text>
          <Text style={styles.name}>{store.nom}</Text>
          {store.description ? <Text style={styles.description}>{store.description}</Text> : null}
          {store.address ? (
            <View style={styles.addressRow}><Ionicons name="location-outline" size={15} color={Palette.textSecondary} /><Text style={styles.address}>{store.address}</Text></View>
          ) : null}
          {mapsLink ? (
            <TouchableOpacity style={styles.mapsButton} onPress={() => void Linking.openURL(mapsLink)}>
              <Ionicons name="map-outline" size={15} color={Palette.primary[500]} />
              <Text style={styles.mapsText}>Voir sur Google Maps</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.reportRow}>
          <Text style={styles.reportText}>Un problème avec cette boutique ?</Text>
          {isAuthenticated
            ? <ReportSheet target={{ type: "store", id: store.id, name: store.nom }} />
            : <TouchableOpacity onPress={() => router.push("/login")}><Text style={styles.mapsText}>Se connecter pour signaler</Text></TouchableOpacity>}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Nos produits</Text>
          <Text style={styles.sectionCount}>{storeProducts.length} produit{storeProducts.length === 1 ? "" : "s"}</Text>
        </View>

        {productsLoading ? <ActivityIndicator color={Palette.primary[500]} style={{ marginTop: Spacing.six }} /> : storeProducts.length === 0 ? (
          <EmptyState icon="cube-outline" title="Aucun produit publié" description="Cette boutique n’a pas encore de produit disponible." />
        ) : (
          <View style={styles.grid}>
            {storeProducts.map((product) => {
              const price = getSellingProductPrice(product);
              return (
                <ProductCard
                  key={product.id}
                  style={styles.card}
                  imageUri={uploadedImageUrl(product.image)}
                  title={product.nom}
                  category={store.nom}
                  price={price}
                  originalPrice={price < Number(product.prix ?? 0) ? Number(product.prix) : null}
                  addToCartDone={addedId === product.id}
                  onPress={() => router.push(`/(client)/product/${product.id}` as any)}
                  onAddToCart={() => {
                    addToCart({ id: String(product.id), name: product.nom, price, image: uploadedImageUrl(product.image), seller: store.nom });
                    setAddedId(product.id);
                    setTimeout(() => setAddedId(null), 1500);
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  hero: { alignItems: "center", padding: Spacing.six, margin: Spacing.four, backgroundColor: Palette.surface, borderRadius: Radius.lg, ...Shadows.sm },
  logo: { width: 84, height: 84, borderRadius: Radius.pill, marginBottom: Spacing.three },
  logoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: Palette.primary[50] },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: Palette.primary[500] },
  name: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text, marginTop: Spacing.one, textAlign: "center" },
  description: { fontSize: 13, lineHeight: 19, color: Palette.textSecondary, textAlign: "center", marginTop: Spacing.two },
  addressRow: { flexDirection: "row", alignItems: "center", gap: Spacing.one, marginTop: Spacing.three },
  address: { fontSize: 12, color: Palette.textSecondary },
  mapsButton: { flexDirection: "row", alignItems: "center", gap: Spacing.one, marginTop: Spacing.three },
  mapsText: { fontSize: 12, fontWeight: "700", color: Palette.primary[500] },
  reportRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: Spacing.four, gap: Spacing.three },
  reportText: { flex: 1, fontSize: 12, color: Palette.textSecondary },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginHorizontal: Spacing.four, marginTop: Spacing.six, marginBottom: Spacing.three },
  sectionTitle: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.text },
  sectionCount: { fontSize: 12, color: Palette.textSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: Spacing.four, rowGap: Spacing.four },
  card: { width: "48%" },
});
