import { Heart, Search, ShoppingBag } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../ui';
import { colors, radius, spacing } from '../theme';
import { useProducts } from '@/features/products/hooks';
import { getSellingProductPrice } from '@/features/products/pricing';
import { toDesignProduct } from '@/features/redesign/mappers';
import { useCart } from '@/store/cart-store';
import { useToast } from '@/store/toast-store';

/** Marketplace du tableau de bord : vrais produits publiés (auparavant des données d'exemple). */
export function MarketplaceScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { products: apiProducts, loading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [favorites, setFavorites] = useState<string[]>([]);

  const products = useMemo(() => apiProducts.map(toDesignProduct), [apiProducts]);
  const categories = useMemo(() => ['Tout', ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const openProduct = (id: string) => router.push(`/(client)/product/${id}` as any);
  const addProduct = (id: string) => {
    const item = apiProducts.find((entry) => String(entry.id) === id);
    if (!item) return;
    addToCart({ id, name: item.nom, price: getSellingProductPrice(item), image: toDesignProduct(item).image, seller: item.boutiqueNom ?? 'Orion' });
    showToast(`${item.nom} a été ajouté au panier.`);
  };
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Tout' || p.category === category;
    return matchSearch && matchCat;
  });

  const toggleFav = (id: string) => {
    setFavorites((list) => list.includes(id) ? list.filter((f) => f !== id) : [...list, id]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Trouvez ce qui vous ressemble</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={colors.muted} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Rechercher un produit, une boutique..." placeholderTextColor={colors.muted} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((cat) => {
          const active = category === cat;
          return (
            <Text key={cat} style={[styles.chip, active && styles.chipActive]} onPress={() => setCategory(cat)}>
              {cat}
            </Text>
          );
        })}
      </ScrollView>

      <SectionTitle title={`Produits populaires (${filtered.length})`} />

      {loading ? <ActivityIndicator color={colors.burgundy} style={{ marginVertical: 28 }} /> : error ? (
        <View style={styles.empty}><Text style={styles.emptyText}>{error}</Text></View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Aucun produit trouvé.</Text></View>
      ) : (
        <View style={styles.productGrid}>
          {filtered.map((product) => {
            const isFav = favorites.includes(product.id);
            return (
              <View key={product.id} style={styles.productCard}>
                <Pressable onPress={() => openProduct(product.id)} accessibilityRole="button" accessibilityLabel={`Voir ${product.name}`}>
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Pressable style={styles.favoriteBtn} onPress={() => toggleFav(product.id)}>
                    <Heart size={16} color={colors.burgundy} fill={isFav ? colors.burgundy : 'transparent'} />
                  </Pressable>
                </View>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productShop}>{product.category}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
                </Pressable>
                <Pressable style={styles.addToCartBtn} onPress={() => addProduct(product.id)}>
                  <ShoppingBag size={13} color={colors.burgundy} />
                  <Text style={styles.addToCartText}>Ajouter</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  searchBar: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  chips: { gap: 8, paddingBottom: 18 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9, color: colors.muted, fontSize: 12, overflow: 'hidden', fontWeight: '600' },
  chipActive: { backgroundColor: colors.burgundy, borderColor: colors.burgundy, color: 'white', fontWeight: '700' },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: 14 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: '47%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 10, overflow: 'hidden' },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 140, borderRadius: radius.md, marginBottom: 8 },
  favoriteBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  productName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  productShop: { color: colors.muted, fontSize: 11, marginTop: 2 },
  productPrice: { color: colors.burgundy, fontSize: 14, fontWeight: '800', marginTop: 6 },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: colors.burgundy, borderRadius: radius.sm, paddingVertical: 8, marginTop: 8 },
  addToCartText: { color: colors.burgundy, fontSize: 11, fontWeight: '700' },
});
