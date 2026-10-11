import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth/hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Shadows, Spacing, Typography } from "@/constants/theme";
import { Avatar, Button, Card } from "@/components/ui";

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isSeller, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <AppHeader variant="public" />
        <View style={styles.authPrompt}>
          <Ionicons name="person-circle-outline" size={72} color={Palette.neutral[300]} />
          <Text style={styles.authTitle}>Vous n'êtes pas connecté</Text>
          <Text style={styles.authSubtitle}>
            Connectez-vous pour accéder à votre compte, vos achats et plus encore.
          </Text>
          <Button title="Se connecter" onPress={() => router.push("/login")} variant="primary" fullWidth style={styles.authBtn} />
          <Button title="Créer un compte" onPress={() => router.push("/register")} variant="outline" fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  const initials = `${(user?.prenom ?? "")[0] ?? ""}${(user?.nom ?? "")[0] ?? ""}`.toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="public" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        <View style={styles.profileHero}>
          <Avatar initials={initials} size={72} ring />
          <Text style={styles.name}>{user?.prenom} {user?.nom}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.menu} padded={false}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/account/profile")}>
            <Ionicons name="person-outline" size={20} color={Palette.primary[500]} />
            <Text style={styles.menuText}>Mon profil</Text>
            <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/orders")}>
            <Ionicons name="bag-outline" size={20} color={Palette.primary[500]} />
            <Text style={styles.menuText}>Mes achats</Text>
            <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
          </TouchableOpacity>

          {isSeller && (
            <TouchableOpacity style={[styles.menuItem, styles.sellerItem]} onPress={() => router.push("/seller")}>
              <Ionicons name="storefront-outline" size={20} color={Palette.secondary[600]} />
              <Text style={[styles.menuText, { color: Palette.secondary[600] }]}>Espace vendeur</Text>
              <Ionicons name="chevron-forward" size={18} color={Palette.secondary[600]} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={Palette.danger.base} />
            <Text style={[styles.menuText, { color: Palette.danger.base }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  authPrompt: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.eight },
  authTitle: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: Palette.text, marginTop: Spacing.five, marginBottom: Spacing.two, textAlign: "center" },
  authSubtitle: { fontSize: 14, color: Palette.textSecondary, textAlign: "center", marginBottom: Spacing.six },
  authBtn: { marginBottom: Spacing.three },
  profileHero: { alignItems: "center", padding: Spacing.seven, backgroundColor: Palette.surface, ...Shadows.sm },
  name: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.text, marginTop: Spacing.three },
  email: { fontSize: 13, color: Palette.textSecondary, marginTop: 2 },
  menu: { margin: Spacing.four, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four, borderBottomWidth: 1, borderBottomColor: Palette.border },
  lastMenuItem: { borderBottomWidth: 0 },
  sellerItem: { backgroundColor: Palette.secondary[50] },
  menuText: { flex: 1, fontSize: 14, fontWeight: "600", color: Palette.text },
});
