import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { BottomTabInset, Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { supportService, type AboutTeamMember } from "@/features/support/content";
import { uploadedImageUrl } from "@/features/redesign/mappers";

const PILLARS = [
  { title: "Découvrir et acheter", copy: "Parcourir des produits proposés par des boutiques et soutenir les commerces qui font vivre leurs communautés." },
  { title: "Développer son activité", copy: "Créer une présence en ligne, présenter ses produits et gérer son activité depuis un espace dédié." },
  { title: "Saisir des opportunités", copy: "Publier ou rejoindre des missions, entrer en contact et transformer une intention en collaboration." },
];

const COMMITMENTS = [
  { title: "Accessibilité", copy: "Faciliter l’accès aux outils numériques pour les activités locales." },
  { title: "Confiance", copy: "Favoriser des échanges clairs entre les membres de la communauté." },
  { title: "Évolution", copy: "Faire évoluer ORION à partir des besoins et des retours de ses utilisateurs." },
];

/** À propos — équivalent mobile de /a-propos (équipe gérée depuis l'admin web). */
export default function AboutScreen() {
  const router = useRouter();
  const [team, setTeam] = useState<AboutTeamMember[]>([]);
  useEffect(() => { supportService.getAboutTeam().then(setTeam).catch(() => setTeam([])); }, []);

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader variant="back" title="À propos d’Orion" />
      <ScrollView contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>À PROPOS D’ORION</Text>
          <Text style={styles.heroTitle}>Faire grandir les idées, ensemble.</Text>
          <Text style={styles.heroCopy}>ORION réunit le commerce, les talents et les opportunités au sein d’un même espace numérique, pensé pour accompagner celles et ceux qui entreprennent.</Text>
        </View>

        <Text style={styles.sectionTitle}>Ce que vous pouvez faire</Text>
        {PILLARS.map((pillar, index) => (
          <View key={pillar.title} style={styles.card}>
            <Text style={styles.index}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.cardTitle}>{pillar.title}</Text>
            <Text style={styles.cardCopy}>{pillar.copy}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Nos engagements</Text>
        {COMMITMENTS.map((item) => (
          <View key={item.title} style={styles.card}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardCopy}>{item.copy}</Text></View>
        ))}

        <Text style={styles.sectionTitle}>Les personnes derrière Orion</Text>
        {team.length ? team.map((member) => {
          const photo = uploadedImageUrl(member.photo);
          return (
            <View key={member.id} style={[styles.card, styles.member]}>
              {photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : (
                <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.avatarText}>{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</Text></View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.role}>{member.role}</Text>
                <Text style={styles.cardTitle}>{member.name}</Text>
                {member.bio ? <Text style={styles.cardCopy}>{member.bio}</Text> : null}
              </View>
            </View>
          );
        }) : <Text style={styles.empty}>ORION se construit progressivement avec sa communauté. Les profils de l’équipe seront présentés ici au fur et à mesure.</Text>}

        <View style={styles.join}>
          <Button title="Découvrir le marketplace" variant="primary" fullWidth onPress={() => router.push("/(client)/search")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  hero: { margin: Spacing.four, padding: Spacing.six, borderRadius: Radius.lg, backgroundColor: Palette.primary[500] },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: "rgba(255,255,255,0.8)" },
  heroTitle: { fontSize: Typography.h2.fontSize, fontWeight: "800", color: "#fff", marginTop: Spacing.two },
  heroCopy: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.9)", marginTop: Spacing.two },
  sectionTitle: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.text, marginHorizontal: Spacing.four, marginTop: Spacing.five, marginBottom: Spacing.three },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.two, padding: Spacing.four, backgroundColor: Palette.surface, borderRadius: Radius.md, ...Shadows.sm },
  index: { fontSize: 11, fontWeight: "800", color: Palette.primary[500] },
  cardTitle: { fontSize: 14, fontWeight: "800", color: Palette.text, marginTop: Spacing.one },
  cardCopy: { fontSize: 13, lineHeight: 19, color: Palette.textSecondary, marginTop: Spacing.one },
  member: { flexDirection: "row", gap: Spacing.three, alignItems: "flex-start" },
  avatar: { width: 52, height: 52, borderRadius: Radius.pill },
  avatarFallback: { backgroundColor: Palette.primary[50], alignItems: "center", justifyContent: "center" },
  avatarText: { fontWeight: "800", color: Palette.primary[500] },
  role: { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: Palette.primary[500] },
  empty: { marginHorizontal: Spacing.four, fontSize: 13, color: Palette.textSecondary },
  join: { margin: Spacing.four },
});
