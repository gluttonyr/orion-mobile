import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Switch, Alert, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useStore } from "@/features/seller/boutique-context";
import { boutiqueService } from "@/service/boutique.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { Button, Card, Chip, Input } from "@/components/ui";

const CATEGORIES = [
  "Électronique",
  "Mode & Accessoires",
  "Alimentation",
  "Beauté & Santé",
  "Maison & Jardin",
  "Sport & Loisirs",
  "Automobile",
  "Autre",
];

export default function ShopFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { stores, refreshStores } = useStore();

  const isEditing = !!id;
  const existingStore = stores.find((s) => s.id === Number(id));

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && existingStore) {
      setNom(existingStore.nom ?? "");
      setDescription(existingStore.description ?? "");
      setCategory(existingStore.category ?? "");
      setLocation(existingStore.location ?? "");
      setActive(existingStore.active ?? true);
      if (existingStore.logo) setLogoUri(existingStore.logo);
    }
  }, [isEditing, existingStore]);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim()) { Alert.alert("Erreur", "Le nom est requis."); return; }
    if (!category) { Alert.alert("Erreur", "Sélectionnez une catégorie."); return; }
    if (!location.trim()) { Alert.alert("Erreur", "La localisation est requise."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nom", nom);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("location", location);
      fd.append("active", String(active));

      if (logoUri && logoUri.startsWith("file://")) {
        const filename = logoUri.split("/").pop() ?? "logo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        fd.append("logo", {
          uri: logoUri,
          name: filename,
          type: match ? `image/${match[1]}` : "image/jpeg",
        } as any);
      }

      if (isEditing && id) {
        await boutiqueService.update(Number(id), fd);
      } else {
        await boutiqueService.create(fd);
      }

      await refreshStores();
      router.push("/seller/shop");
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title={isEditing ? "Modifier la boutique" : "Créer une boutique"}
        subtitle={isEditing ? "Mettez à jour les informations" : "Ajoutez un nouveau point de vente"}
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Form */}
        <Card style={styles.card}>
          {/* Logo */}
          <Text style={styles.label}>Logo de la boutique</Text>
          <View style={styles.logoSection}>
            {logoUri ? (
              <View style={styles.logoContainer}>
                <Image source={{ uri: logoUri }} style={styles.logoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeLogoBtn} onPress={() => setLogoUri(null)}>
                  <Ionicons name="close" size={14} color={Palette.surface} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
                <Ionicons name="camera-outline" size={28} color={Palette.textMuted} />
                <Text style={styles.logoPickerText}>Télécharger un logo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Nom */}
          <View style={styles.field}>
            <Input
              label="Nom de la boutique *"
              value={nom}
              onChangeText={setNom}
              placeholder="ex: Boutique Central Market"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre boutique..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={styles.textarea}
            />
          </View>

          {/* Catégorie */}
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>

          {/* Localisation */}
          <View style={styles.field}>
            <Input
              label="Localisation *"
              value={location}
              onChangeText={setLocation}
              placeholder="ex: Dakar Central"
            />
          </View>

          {/* Statut actif */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Boutique active</Text>
              <Text style={styles.switchSub}>Rend la boutique visible aux clients</Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: Palette.neutral[300], true: Palette.primary[500] }}
              thumbColor={Palette.surface}
            />
          </View>
        </Card>

        {/* Info tip */}
        <View style={styles.tip}>
          <Ionicons name="information-circle-outline" size={18} color={Palette.info.text} />
          <Text style={styles.tipText}>
            Chaque boutique aura ses propres produits, commandes et statistiques.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Annuler" variant="outline" onPress={() => router.back()} style={styles.cancelBtn} />
          <Button
            title={isEditing ? "Mettre à jour" : "Créer la boutique"}
            icon="storefront-outline"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.four },
  label: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary, marginBottom: Spacing.three },
  field: { marginBottom: Spacing.four },
  textarea: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  logoSection: { marginBottom: Spacing.five },
  logoPicker: {
    borderWidth: 1.5, borderColor: Palette.border, borderStyle: "dashed", borderRadius: Radius.md,
    alignItems: "center", paddingVertical: Spacing.six, backgroundColor: Palette.neutral[50],
  },
  logoPickerText: { fontSize: 14, color: Palette.textSecondary, marginTop: Spacing.two },
  logoContainer: { position: "relative", alignSelf: "flex-start" },
  logoPreview: { width: 100, height: 100, borderRadius: Radius.md, backgroundColor: Palette.neutral[100] },
  removeLogoBtn: {
    position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: Radius.pill,
    backgroundColor: Palette.danger.base, alignItems: "center", justifyContent: "center", ...Shadows.sm,
  },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, marginBottom: Spacing.four },
  switchRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.three,
    backgroundColor: Palette.neutral[50], borderRadius: Radius.md,
  },
  switchLabel: { fontSize: 14, fontWeight: "600", color: Palette.text },
  switchSub: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  tip: {
    flexDirection: "row", alignItems: "flex-start", gap: Spacing.two, marginHorizontal: Spacing.four,
    marginBottom: Spacing.four, backgroundColor: Palette.info.bg, borderRadius: Radius.md, padding: Spacing.three,
  },
  tipText: { flex: 1, fontSize: 13, color: Palette.info.text, lineHeight: 20 },
  actions: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});
