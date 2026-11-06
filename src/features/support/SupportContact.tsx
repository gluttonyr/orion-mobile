import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Radius, Shadows, Spacing, Typography } from "@/constants/theme";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP_URL } from "./content";

export function SupportContact({ title, copy, secondary }: { title: string; copy: string; secondary?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Ionicons name="help-buoy-outline" size={22} color={Palette.primary[500]} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
      <TouchableOpacity style={[styles.button, styles.primary]} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
        <Ionicons name="mail-outline" size={16} color="#fff" /><Text style={styles.primaryText}>Écrire au support</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => void Linking.openURL(SUPPORT_WHATSAPP_URL)}>
        <Ionicons name="logo-whatsapp" size={16} color={Palette.primary[500]} /><Text style={styles.secondaryText}>WhatsApp · {SUPPORT_PHONE}</Text>
      </TouchableOpacity>
      {secondary ? (
        <TouchableOpacity style={styles.button} onPress={secondary.onPress}>
          <Text style={styles.secondaryText}>{secondary.label}</Text><Ionicons name="arrow-forward" size={15} color={Palette.primary[500]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { margin: Spacing.four, padding: Spacing.five, backgroundColor: Palette.surface, borderRadius: Radius.lg, gap: Spacing.two, ...Shadows.sm },
  icon: { width: 44, height: 44, borderRadius: Radius.pill, backgroundColor: Palette.primary[50], alignItems: "center", justifyContent: "center" },
  title: { fontSize: Typography.h3.fontSize, fontWeight: "800", color: Palette.text, marginTop: Spacing.two },
  copy: { fontSize: 13, color: Palette.textSecondary, marginBottom: Spacing.two },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.two, paddingVertical: Spacing.three, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.border },
  primary: { backgroundColor: Palette.primary[500], borderColor: Palette.primary[500] },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  secondaryText: { color: Palette.primary[500], fontWeight: "700", fontSize: 13 },
});
