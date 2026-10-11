import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useSubscription } from "@/features/seller/subscription-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { formatCurrency } from "@/lib/format";
import { Button, Card, Chip, Input } from "@/components/ui";

const DEFAULT_FORM = {
  fullName: "Amadou Diallo",
  email: "amadou.diallo@email.com",
  phone: "+221 77 123 45 67",
  location: "Dakar, Sénégal",
  storeName: "Tech Store Dakar",
  description: "Spécialiste en électronique et équipements professionnels. Livraison rapide dans toute la région.",
};

const FIELDS: { icon: keyof typeof Ionicons.glyphMap; label: string; field: keyof typeof DEFAULT_FORM; color: string }[] = [
  { icon: "person-outline", label: "Nom complet", field: "fullName", color: Palette.primary[500] },
  { icon: "mail-outline", label: "Email", field: "email", color: Palette.secondary[600] },
  { icon: "call-outline", label: "Téléphone", field: "phone", color: Palette.info.text },
  { icon: "location-outline", label: "Localisation", field: "location", color: Palette.warning.text },
];

export default function SellerProfileScreen() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Succès", "Profil mis à jour avec succès !");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...DEFAULT_FORM });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles"
        rightIcon={!isEditing ? "create-outline" : undefined}
        onRight={!isEditing ? () => setIsEditing(true) : undefined}
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        <LinearGradient colors={[Palette.primary[500], Palette.secondary[500]]} style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color={Palette.primary[500]} />
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <Ionicons name="camera" size={16} color={Palette.primary[500]} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{formData.fullName}</Text>
            <Text style={styles.profileRole}>Commerçant</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badge}><Text style={styles.badgeText}>Membre depuis Mars 2025</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>87 ventes</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>⭐ 4.8/5</Text></View>
            </View>
          </View>
        </LinearGradient>

        {isEditing && (
          <View style={styles.editingBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Palette.info.text} />
            <Text style={styles.editingBannerText}>
              Mode édition activé. Modifiez vos informations puis appuyez sur Enregistrer.
            </Text>
          </View>
        )}

        {subscription && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <LinearGradient colors={[Palette.primary[500], Palette.secondary[500]]} style={styles.crownBox}>
                <Ionicons name="diamond" size={20} color={Palette.surface} />
              </LinearGradient>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Mon Abonnement</Text>
                <Text style={styles.cardSubtitle}>Gérez votre plan</Text>
              </View>
              <Button
                title="Changer"
                size="sm"
                onPress={() => router.push("/seller/subscription")}
              />
            </View>

            <View style={styles.planCards}>
              <View style={styles.planCard}>
                <Text style={styles.planCardLabel}>Plan actuel</Text>
                <Text style={styles.planCardValue}>{subscription.titre ?? "—"}</Text>
                <Text style={styles.planCardSub}>
                  {formatCurrency(subscription.prix ?? 0)} / mois
                </Text>
              </View>
              <View style={styles.planCard}>
                <Text style={styles.planCardLabel}>Prochaine facturation</Text>
                <Text style={[styles.planCardValue, { color: Palette.secondary[600] }]}>
                  {subscription.dateExpiration
                    ? new Date(subscription.dateExpiration).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                    : "—"}
                </Text>
                <Text style={styles.planCardSub}>
                  {subscription.renouvelement ? "Renouvellement auto" : "Pas de renouvellement"}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          {FIELDS.map(({ icon, label, field, color }) => (
            <View key={field} style={styles.fieldRow}>
              {isEditing ? (
                <Input
                  label={label}
                  value={formData[field]}
                  onChangeText={(v) => updateField(field, v)}
                />
              ) : (
                <>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.fieldDisplay}>
                    <Ionicons name={icon} size={18} color={color} />
                    <Text style={styles.fieldValue}>{formData[field]}</Text>
                  </View>
                </>
              )}
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Informations commerciales</Text>

          <View style={styles.fieldRow}>
            {isEditing ? (
              <Input
                label="Nom de la boutique"
                value={formData.storeName}
                onChangeText={(v) => updateField("storeName", v)}
              />
            ) : (
              <>
                <Text style={styles.fieldLabel}>Nom de la boutique</Text>
                <View style={styles.fieldDisplay}>
                  <Ionicons name="storefront-outline" size={18} color={Palette.primary[500]} />
                  <Text style={styles.fieldValue}>{formData.storeName}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Catégories</Text>
            <View style={styles.tagsRow}>
              <Chip label="Électronique" tone="primary" />
              <Chip label="Équipement" tone="secondary" />
            </View>
          </View>

          <View style={styles.fieldRow}>
            {isEditing ? (
              <Input
                label="Description"
                value={formData.description}
                onChangeText={(v) => updateField("description", v)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textareaField}
              />
            ) : (
              <>
                <Text style={styles.fieldLabel}>Description</Text>
                <Text style={styles.descText}>{formData.description}</Text>
              </>
            )}
          </View>

          {!isEditing && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total des ventes</Text>
                <Text style={[styles.statValue, { color: Palette.primary[500] }]}>2.45M FCFA</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Note moyenne</Text>
                <Text style={[styles.statValue, { color: Palette.secondary[600] }]}>4.8 ⭐</Text>
              </View>
            </View>
          )}
        </Card>

        {isEditing && (
          <View style={styles.saveRow}>
            <Button title="Annuler" variant="outline" icon="close" onPress={handleCancel} style={styles.cancelBtn} />
            <Button title="Enregistrer" variant="secondary" icon="checkmark" onPress={handleSave} style={styles.saveBtn} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  profileHero: { marginHorizontal: Spacing.four, marginTop: Spacing.three, marginBottom: Spacing.four, padding: Spacing.six, borderRadius: Radius.lg, flexDirection: "row", alignItems: "center", gap: Spacing.four, ...Shadows.md },
  avatarContainer: { position: "relative" },
  avatar: { width: 80, height: 80, borderRadius: Radius.pill, borderWidth: 3, borderColor: Palette.surface },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: Radius.pill, backgroundColor: Palette.surface, borderWidth: 3, borderColor: Palette.surface, alignItems: "center", justifyContent: "center" },
  cameraBtn: { position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: Radius.pill, backgroundColor: Palette.surface, alignItems: "center", justifyContent: "center", ...Shadows.sm },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: "800", color: Palette.surface, marginBottom: 2 },
  profileRole: { fontSize: 13, color: Palette.primary[100], marginBottom: Spacing.three },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  badge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: Radius.pill },
  badgeText: { color: Palette.surface, fontSize: 11, fontWeight: "600" },
  editingBanner: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.two, marginHorizontal: Spacing.four, marginBottom: Spacing.four, backgroundColor: Palette.info.bg, borderRadius: Radius.md, padding: Spacing.three },
  editingBannerText: { flex: 1, fontSize: 13, color: Palette.info.text, lineHeight: 19 },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.four },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.three, marginBottom: Spacing.four },
  crownBox: { width: 40, height: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Palette.text },
  cardSubtitle: { fontSize: 12, color: Palette.textSecondary },
  planCards: { flexDirection: "row", gap: Spacing.three },
  planCard: { flex: 1, padding: Spacing.three, backgroundColor: Palette.neutral[50], borderRadius: Radius.md },
  planCardLabel: { fontSize: 12, color: Palette.textSecondary, marginBottom: 4 },
  planCardValue: { fontSize: 18, fontWeight: "800", color: Palette.primary[500], marginBottom: 2 },
  planCardSub: { fontSize: 12, color: Palette.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: Palette.text, marginBottom: Spacing.four },
  fieldRow: { marginBottom: Spacing.four },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary, marginBottom: Spacing.two },
  fieldDisplay: { flexDirection: "row", alignItems: "center", gap: Spacing.three, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  fieldValue: { fontSize: 14, fontWeight: "600", color: Palette.text, flex: 1 },
  textareaField: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  tagsRow: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
  descText: { fontSize: 14, color: Palette.text, lineHeight: 21, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, padding: Spacing.three },
  statsRow: { flexDirection: "row", gap: Spacing.three },
  statBox: { flex: 1, backgroundColor: Palette.neutral[50], borderRadius: Radius.md, padding: Spacing.three },
  statLabel: { fontSize: 12, color: Palette.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "800" },
  saveRow: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});
