import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { AnalyticsScreen as SellerAnalytics } from "@/components/dashboard/screens/analytics";
import { BottomTabInset, Palette, Spacing } from "@/constants/theme";

/** Analyses réelles (/vente/seller/analytics), partagées avec le tableau de bord. */
export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Analyses" subtitle="Vue d'ensemble de votre performance commerciale" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SellerAnalytics />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  content: { padding: Spacing.four, paddingBottom: BottomTabInset },
});
