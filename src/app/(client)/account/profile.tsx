import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/features/auth/hooks";
import { accountApi } from "@/features/account/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabInset, Palette, Radius, Spacing } from "@/constants/theme";
import { Avatar, Button, Card, Input } from "@/components/ui";
import { uploadedImageUrl } from "@/features/redesign/mappers";

type ProfileForm = {
  prenom: string;
  nom: string;
  email: string;
  contact: string;
  date_naissance: string;
  adresse: string;
  specialite: string;
  localisation: string;
};

const FIELDS: { label: string; field: keyof ProfileForm; icon: keyof typeof Ionicons.glyphMap; placeholder?: string; keyboard?: "email-address" | "phone-pad" }[] = [
  { label: "Prénom", field: "prenom", icon: "person-outline" },
  { label: "Nom", field: "nom", icon: "person-outline" },
  { label: "Email", field: "email", icon: "mail-outline", keyboard: "email-address" },
  { label: "Téléphone", field: "contact", icon: "call-outline", keyboard: "phone-pad" },
  { label: "Date de naissance", field: "date_naissance", icon: "calendar-outline", placeholder: "AAAA-MM-JJ" },
  { label: "Adresse", field: "adresse", icon: "home-outline" },
  { label: "Spécialité", field: "specialite", icon: "ribbon-outline" },
  { label: "Localisation", field: "localisation", icon: "location-outline" },
];

/** Profil — mêmes champs modifiables que /dashboard/profile sur le web (photo et mot de passe inclus). */
export default function AccountProfileScreen() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialForm = (): ProfileForm => ({
    prenom: user?.prenom ?? "",
    nom: user?.nom ?? "",
    email: user?.email ?? "",
    contact: user?.contact ?? "",
    date_naissance: user?.date_naissance ? String(user.date_naissance).slice(0, 10) : "",
    adresse: user?.adresse ?? "",
    specialite: user?.specialite ?? "",
    localisation: user?.localisation ?? "",
  });
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [password, setPassword] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const updateField = (field: keyof ProfileForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Accès à la galerie", "Autorisez l’accès à vos photos pour changer votre photo de profil."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const cancel = () => { setForm(initialForm()); setPassword(""); setPhotoUri(null); setIsEditing(false); };

  const handleSave = async () => {
    if (!user) return;
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim()) { Alert.alert("Champs requis", "Le prénom, le nom et l’e-mail sont obligatoires."); return; }
    if (form.date_naissance && !/^\d{4}-\d{2}-\d{2}$/.test(form.date_naissance)) { Alert.alert("Date invalide", "Utilisez le format AAAA-MM-JJ."); return; }
    if (password && password.length < 8) { Alert.alert("Mot de passe trop court", "Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    try {
      const payload: Record<string, string> = { ...form };
      if (!payload.date_naissance) delete payload.date_naissance;
      if (password) payload.password = password;
      const updated = await accountApi.update(user.id, payload, photoUri ?? undefined);
      updateUser({ ...user, ...updated });
      setPassword("");
      setPhotoUri(null);
      setIsEditing(false);
      Alert.alert("Profil mis à jour", "Vos informations ont été enregistrées.");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert("Erreur", Array.isArray(message) ? message.join(" ") : message || "Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  const initials = `${form.prenom[0] ?? ""}${form.nom[0] ?? ""}`.toUpperCase() || "U";
  const photo = photoUri || uploadedImageUrl(user?.image);

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
        <View style={styles.avatarBlock}>
          <TouchableOpacity disabled={!isEditing} onPress={() => void pickPhoto()}>
            {photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : <Avatar initials={initials} size={88} ring />}
            {isEditing ? <View style={styles.avatarBadge}><Ionicons name="camera" size={14} color="#fff" /></View> : null}
          </TouchableOpacity>
          {isEditing ? <Text style={styles.avatarHint}>Touchez la photo pour la changer</Text> : null}
        </View>

        <Card style={styles.card}>
          {FIELDS.map(({ label, field, icon, placeholder, keyboard }) => (
            <View key={field}>
              {isEditing ? (
                <Input label={label} icon={icon} value={form[field]} placeholder={placeholder} keyboardType={keyboard} autoCapitalize={keyboard === "email-address" ? "none" : undefined} onChangeText={(value) => updateField(field, value)} />
              ) : (
                <>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.fieldDisplay}>
                    <Ionicons name={icon} size={18} color={Palette.primary[500]} />
                    <Text style={styles.fieldValue}>{form[field] || "—"}</Text>
                  </View>
                </>
              )}
            </View>
          ))}
          {isEditing ? (
            <Input label="Nouveau mot de passe" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="Laissez vide pour le conserver" />
          ) : null}
        </Card>

        {isEditing && (
          <View style={styles.saveRow}>
            <Button title="Annuler" onPress={cancel} variant="outline" style={styles.cancelBtn} />
            <Button title={loading ? "Enregistrement..." : "Enregistrer"} onPress={handleSave} disabled={loading} loading={loading} variant="primary" style={styles.saveBtn} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  avatarBlock: { alignItems: "center", marginTop: Spacing.five },
  avatar: { width: 88, height: 88, borderRadius: Radius.pill },
  avatarBadge: { position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.primary[500], alignItems: "center", justifyContent: "center" },
  avatarHint: { marginTop: Spacing.two, fontSize: 12, color: Palette.textSecondary },
  card: { margin: Spacing.four, gap: Spacing.four },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary, marginBottom: 6 },
  fieldDisplay: { flexDirection: "row", alignItems: "center", gap: Spacing.three, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  fieldValue: { fontSize: 14, fontWeight: "600", color: Palette.text, flex: 1 },
  saveRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});
