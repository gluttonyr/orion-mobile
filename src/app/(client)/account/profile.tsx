import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth/hooks";
import { accountApi } from "@/features/account/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing } from "@/constants/theme";
import { Button, Card, Input } from "@/components/ui";

export default function AccountProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom ?? "",
    prenom: user?.prenom ?? "",
    email: user?.email ?? "",
    contact: user?.contact ?? "",
    localisation: user?.localisation ?? "",
  });

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await accountApi.update(user.id, form);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour avec succès !");
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Prénom", field: "prenom", icon: "person-outline" as const },
    { label: "Nom", field: "nom", icon: "person-outline" as const },
    { label: "Email", field: "email", icon: "mail-outline" as const },
    { label: "Téléphone", field: "contact", icon: "call-outline" as const },
    { label: "Localisation", field: "localisation", icon: "location-outline" as const },
  ];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title="Mon profil"
        subtitle="Gérez vos informations personnelles"
        rightIcon={!isEditing ? "create-outline" : undefined}
        onRight={!isEditing ? () => setIsEditing(true) : undefined}
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: BottomTabInset }}>
        <Card style={styles.card}>
          {fields.map(({ label, field, icon }) => (
            <View key={field} style={styles.fieldRow}>
              {isEditing ? (
                <Input
                  label={label}
                  icon={icon}
                  value={(form as any)[field]}
                  onChangeText={(v) => updateField(field, v)}
                />
              ) : (
                <>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.fieldDisplay}>
                    <Ionicons name={icon} size={18} color={Palette.primary[500]} />
                    <Text style={styles.fieldValue}>{(form as any)[field] || "—"}</Text>
                  </View>
                </>
              )}
            </View>
          ))}
        </Card>

        {isEditing && (
          <View style={styles.saveRow}>
            <Button title="Annuler" onPress={() => setIsEditing(false)} variant="outline" style={styles.cancelBtn} />
            <Button
              title={loading ? "Enregistrement..." : "Enregistrer"}
              onPress={handleSave}
              disabled={loading}
              loading={loading}
              variant="primary"
              style={styles.saveBtn}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  card: { margin: Spacing.four, gap: Spacing.four },
  fieldRow: {},
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary, marginBottom: 6 },
  fieldDisplay: { flexDirection: "row", alignItems: "center", gap: Spacing.three, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  fieldValue: { fontSize: 14, fontWeight: "600", color: Palette.text, flex: 1 },
  saveRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});
