import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/store/cart-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, EmptyState } from "@/components/ui";

export default function CartScreen() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleClearCart = () => {
    Alert.alert("Vider le panier", "Êtes-vous sûr de vouloir vider votre panier ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Vider", style: "destructive", onPress: clearCart },
    ]);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="back" title="Mon Panier" />
        <View style={styles.emptyCenter}>
          <EmptyState
            icon="bag-outline"
            title="Votre panier est vide"
            description="Découvrez nos produits et commencez vos achats !"
            actionLabel="Voir le marketplace"
            onAction={() => router.push("/search")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title={`Panier • ${items.length} article${items.length > 1 ? "s" : ""}`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <Card key={item.id} style={styles.cartItem}>
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/80" }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <View style={styles.itemNameBox}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemSeller}>Vendu par : {item.seller}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={Palette.danger.base} />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemBottom}>
                  {/* Quantity */}
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={Palette.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={Palette.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Price */}
                  <View style={styles.priceBox}>
                    <Text style={styles.unitPrice}>{formatCurrency(item.price)} × {item.quantity}</Text>
                    <Text style={styles.totalItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {/* Clear cart */}
          <Button
            title="Vider le panier"
            onPress={handleClearCart}
            variant="danger"
            size="sm"
            icon="trash-outline"
            style={styles.clearBtn}
          />
        </View>

        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(getTotalPrice())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={[styles.summaryValue, { color: Palette.secondary[600] }]}>Gratuite</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(getTotalPrice())}</Text>
          </View>

          <Button
            title="Passer au paiement"
            onPress={() => router.push("/checkout" as any)}
            variant="secondary"
            size="lg"
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
            style={styles.checkoutBtn}
          />

          <Button
            title="Continuer mes achats"
            onPress={() => router.push("/search")}
            variant="outline"
            fullWidth
            style={styles.continueBtn}
          />

          {/* Trust badges */}
          <View style={styles.trustSection}>
            {[
              "Paiement 100% sécurisé",
              "Livraison gratuite",
              "Garantie satisfait ou remboursé",
            ].map((t) => (
              <View key={t} style={styles.trustRow}>
                <Ionicons name="checkmark-circle" size={16} color={Palette.secondary[500]} />
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  emptyCenter: { flex: 1, justifyContent: "center", paddingBottom: BottomTabInset },
  itemsList: { paddingHorizontal: Spacing.four, gap: Spacing.three, marginTop: Spacing.three },
  cartItem: { flexDirection: "row", gap: Spacing.three },
  itemImage: { width: 80, height: 80, borderRadius: Radius.md },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.three },
  itemNameBox: { flex: 1, marginRight: Spacing.two },
  itemName: { fontSize: 14, fontWeight: "700", color: Palette.text, lineHeight: 20 },
  itemSeller: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 4 },
  itemBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  qtyBtn: { width: 32, height: 32, backgroundColor: Palette.neutral[100], borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  qtyValue: { fontSize: 16, fontWeight: "700", color: Palette.text, minWidth: 24, textAlign: "center" },
  priceBox: { alignItems: "flex-end" },
  unitPrice: { fontSize: 11, color: Palette.textSecondary },
  totalItemPrice: { fontSize: 16, fontWeight: "800", color: Palette.primary[500] },
  clearBtn: { alignSelf: "flex-start", marginTop: Spacing.two },
  summaryCard: { margin: Spacing.four, marginTop: Spacing.five },
  summaryTitle: { fontSize: Typography.h3.fontSize, fontWeight: "700", color: Palette.text, marginBottom: Spacing.four },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.three },
  summaryLabel: { fontSize: 14, color: Palette.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: "600", color: Palette.text },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.three, marginBottom: Spacing.four },
  totalLabel: { fontSize: 16, fontWeight: "700", color: Palette.text },
  totalValue: { fontSize: 22, fontWeight: "800", color: Palette.primary[500] },
  checkoutBtn: { marginBottom: Spacing.two },
  continueBtn: { marginBottom: Spacing.five },
  trustSection: { borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.four, gap: Spacing.three },
  trustRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  trustText: { fontSize: 13, color: Palette.textSecondary },
});
