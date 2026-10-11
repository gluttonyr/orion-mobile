import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth/hooks";
import { useMyOrders } from "@/features/orders/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Spacing, Typography } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, Chip, EmptyState } from "@/components/ui";

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, loading } = useMyOrders();

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="public" />
        <EmptyState
          icon="lock-closed-outline"
          title="Connectez-vous pour voir vos achats"
          description="Retrouvez ici l'historique de toutes vos commandes."
        />
        <View style={styles.authActions}>
          <Button title="Se connecter" onPress={() => router.push("/login")} variant="primary" fullWidth />
          <Button title="Créer un compte" onPress={() => router.push("/register")} variant="ghost" fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes achats</Text>
          <Text style={styles.subtitle}>Historique de vos commandes</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Palette.primary[500]} size="large" style={styles.loader} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="bag-outline"
            title="Aucun achat pour le moment"
            actionLabel="Découvrir le marketplace"
            onAction={() => router.push("/search")}
          />
        ) : (
          <View style={styles.list}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderRef}>{order.reference ?? `Commande #${order.id}`}</Text>
                  <Chip label={order.statut ?? "En cours"} tone="success" size="sm" />
                </View>
                <Text style={styles.orderDate}>{order.date_achat ?? ""}</Text>
                <Text style={styles.orderTotal}>{formatCurrency(order.prix_total ?? 0)}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  header: { padding: Spacing.five, paddingBottom: Spacing.three },
  title: { fontSize: Typography.h1.fontSize, fontWeight: "800", color: Palette.text },
  subtitle: { fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
  authActions: { paddingHorizontal: Spacing.six, gap: Spacing.three },
  loader: { marginVertical: Spacing.nine },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  orderCard: {},
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.two },
  orderRef: { fontSize: 14, fontWeight: "700", color: Palette.text },
  orderDate: { fontSize: 12, color: Palette.textSecondary, marginBottom: Spacing.two },
  orderTotal: { fontSize: 18, fontWeight: "800", color: Palette.primary[500] },
});
