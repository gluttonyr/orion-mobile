import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing } from "@/constants/theme";
import { CONDITIONS, CONDITIONS_LAST_UPDATE } from "@/features/support/content";
import { SupportContact } from "@/features/support/SupportContact";

/** Conditions d'utilisation — même texte que /conditions sur le web. */
export default function ConditionsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Conditions d’utilisation" subtitle={`Mise à jour : ${CONDITIONS_LAST_UPDATE}`} />
      <ScrollView contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        <Text style={styles.intro}>Les règles d’Orion protègent les acheteurs, les commerçants et la plateforme.</Text>
        {CONDITIONS.map((article, index) => (
          <View key={article.id} style={styles.article}>
            <Text style={styles.index}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.title}>{article.title}</Text>
            {article.paragraphs.map((paragraph) => <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>)}
          </View>
        ))}
        <SupportContact title="Une question sur ces conditions ?" copy="Notre équipe peut t’expliquer n’importe quel point." secondary={{ label: "Voir le centre d’aide", onPress: () => router.push("/(client)/support/help" as any) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  intro: { margin: Spacing.four, fontSize: 13, color: Palette.textSecondary },
  article: { marginHorizontal: Spacing.four, marginBottom: Spacing.three, padding: Spacing.four, backgroundColor: Palette.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Palette.border },
  index: { fontSize: 11, fontWeight: "800", color: Palette.primary[500] },
  title: { fontSize: 15, fontWeight: "800", color: Palette.text, marginTop: Spacing.one, marginBottom: Spacing.two },
  paragraph: { fontSize: 13, lineHeight: 20, color: Palette.textSecondary, marginBottom: Spacing.two },
});
