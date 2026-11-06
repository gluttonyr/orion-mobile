import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { supportService, type HelpCategory } from "@/features/support/content";
import { SupportContact } from "@/features/support/SupportContact";

/** Centre d'aide — équivalent mobile de /aide (questions gérées par l'admin sur le web). */
export default function HelpScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<number | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    supportService.getHelpCategories()
      .then((rows) => { if (mounted) setCategories(rows); })
      .catch(() => { if (mounted) setError("Impossible de charger l’aide."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    return categories
      .filter((category) => active === "all" || category.id === active)
      .map((category) => ({ ...category, questions: category.questions.filter((question) => !normalized || `${question.titre} ${question.description}`.toLocaleLowerCase("fr-FR").includes(normalized)) }))
      .filter((category) => category.questions.length > 0);
  }, [categories, query, active]);

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="Centre d’aide" subtitle="Comment pouvons-nous t’aider ?" />
      <ScrollView contentContainerStyle={{ paddingBottom: BottomTabInset }} keyboardShouldPersistTaps="handled">
        <View style={styles.search}>
          <Ionicons name="search" size={17} color={Palette.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Paiement, commande, boutique, compte…" placeholderTextColor={Palette.textMuted} style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {[{ id: "all" as const, titre: "Tout" }, ...categories].map((category) => (
            <TouchableOpacity key={category.id} style={[styles.tab, active === category.id && styles.tabActive]} onPress={() => setActive(category.id)}>
              <Text style={[styles.tabText, active === category.id && styles.tabTextActive]}>{category.titre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? <ActivityIndicator color={Palette.primary[500]} style={{ marginTop: Spacing.six }} /> : error ? <Text style={styles.empty}>{error}</Text> : results.length === 0 ? (
          <Text style={styles.empty}>{query.trim() ? `Aucune réponse ne correspond à « ${query} ». Essaie un autre mot, ou contacte le support ci-dessous.` : "Aucune question d’aide pour le moment. Contacte le support ci-dessous."}</Text>
        ) : results.map((category) => (
          <View key={category.id} style={styles.section}>
            {category.description ? <Text style={styles.kicker}>{category.description.toUpperCase()}</Text> : null}
            <Text style={styles.sectionTitle}>{category.titre}</Text>
            {category.questions.map((question) => {
              const open = openId === question.id;
              return (
                <TouchableOpacity key={question.id} style={styles.question} onPress={() => setOpenId(open ? null : question.id)} activeOpacity={0.8}>
                  <View style={styles.questionHead}>
                    <Text style={styles.questionTitle}>{question.titre}</Text>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={Palette.textSecondary} />
                  </View>
                  {open ? <Text style={styles.answer}>{question.description}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <SupportContact title="Tu n’as pas trouvé ta réponse ?" copy="Notre équipe te répond généralement dans la journée." secondary={{ label: "Conditions d’utilisation", onPress: () => router.push("/(client)/support/conditions" as any) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  search: { flexDirection: "row", alignItems: "center", gap: Spacing.two, margin: Spacing.four, paddingHorizontal: Spacing.four, borderRadius: Radius.pill, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  searchInput: { flex: 1, paddingVertical: Spacing.three, color: Palette.text, fontSize: 14 },
  tabs: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  tab: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surface },
  tabActive: { backgroundColor: Palette.primary[500], borderColor: Palette.primary[500] },
  tabText: { fontSize: 12, fontWeight: "700", color: Palette.textSecondary },
  tabTextActive: { color: "#fff" },
  empty: { margin: Spacing.four, fontSize: 13, color: Palette.textSecondary, textAlign: "center" },
  section: { marginHorizontal: Spacing.four, marginTop: Spacing.six },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: Palette.primary[500] },
  sectionTitle: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.text, marginBottom: Spacing.three },
  question: { backgroundColor: Palette.surface, borderRadius: Radius.md, padding: Spacing.four, marginBottom: Spacing.two, borderWidth: 1, borderColor: Palette.border },
  questionHead: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  questionTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: Palette.text },
  answer: { marginTop: Spacing.two, fontSize: 13, lineHeight: 19, color: Palette.textSecondary },
});
