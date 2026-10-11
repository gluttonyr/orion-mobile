import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { productsApi } from "@/features/products/api";
import type { Categorie } from "@/features/products/types";
import { useImage } from "@/store/image-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { Button, Card, Chip, Input } from "@/components/ui";

const STATUTS = ["En stock", "Stock limité", "Sur commande", "Rupture de stock"];

export default function ProductFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { getBoutiqueImageUrl } = useImage();

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [statut, setStatut] = useState("En stock");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    productsApi.getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    productsApi.getById(Number(id))
      .then((data) => {
        setNom(data.nom ?? "");
        setDescription(data.description ?? "");
        setPrix(String(data.prix ?? 0));
        setStock(String(data.stock ?? 0));
        setStatut(data.statut ?? "En stock");
        setSelectedCatId(data.categorie?.id ?? null);
        if (data.image) setImageUri(getBoutiqueImageUrl(data.image));
      })
      .catch(() => Alert.alert("Erreur", "Impossible de charger le produit."))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim()) { Alert.alert("Erreur", "Le nom est requis."); return; }
    if (!prix || isNaN(Number(prix))) { Alert.alert("Erreur", "Entrez un prix valide."); return; }
    if (!stock || isNaN(Number(stock))) { Alert.alert("Erreur", "Entrez un stock valide."); return; }

    setLoading(true);
    try {
      const formData = {
        nom,
        description,
        prix: Number(prix),
        stock: Number(stock),
        statut,
        categorie: selectedCatId
          ? categories.find((c) => c.id === selectedCatId)
          : undefined,
      };

      let imageFile: { uri: string; name: string; type: string } | undefined;
      if (imageUri && imageUri.startsWith("file://")) {
        const filename = imageUri.split("/").pop() ?? "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        imageFile = {
          uri: imageUri,
          name: filename,
          type: match ? `image/${match[1]}` : "image/jpeg",
        };
      }

      if (isEdit && id) {
        await productsApi.update(Number(id), formData, imageFile as any);
      } else {
        await productsApi.create(formData, imageFile as any);
      }
      router.push("/seller/products");
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ActivityIndicator color={Palette.primary[500]} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title={isEdit ? "Modifier le produit" : "Ajouter un produit"}
        subtitle={isEdit ? "Mettez à jour les informations" : "Créez un nouveau produit"}
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Image */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Image du produit</Text>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                <Ionicons name="close" size={16} color={Palette.surface} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={36} color={Palette.textMuted} />
              <Text style={styles.imagePickerText}>Appuyez pour ajouter une image</Text>
              <Text style={styles.imagePickerSub}>PNG, JPG jusqu'à 5MB</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Form */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Informations du produit</Text>

          <View style={styles.field}>
            <Input
              label="Nom du produit *"
              value={nom}
              onChangeText={setNom}
              placeholder="Ex: Samsung Galaxy S24"
            />
          </View>

          <View style={styles.field}>
            <Input
              label="Description *"
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre produit en détail..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textarea}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Input
                label="Prix (XOF) *"
                value={prix}
                onChangeText={setPrix}
                placeholder="150000"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, styles.halfField]}>
              <Input
                label="Stock *"
                value={stock}
                onChangeText={setStock}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Catégorie *</Text>
          {catsLoading ? (
            <ActivityIndicator color={Palette.primary[500]} style={{ marginBottom: Spacing.four }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.four }}>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.libellé}
                    selected={selectedCatId === cat.id}
                    onPress={() => setSelectedCatId(cat.id)}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          <Text style={styles.label}>Statut *</Text>
          <View style={styles.chipRow}>
            {STATUTS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={statut === s}
                onPress={() => setStatut(s)}
              />
            ))}
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Annuler" variant="outline" onPress={() => router.back()} style={styles.cancelBtn} />
          <Button
            title={isEdit ? "Enregistrer" : "Ajouter le produit"}
            icon="checkmark"
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
  sectionTitle: { fontSize: 17, fontWeight: "700", color: Palette.text, marginBottom: Spacing.four },
  label: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary, marginBottom: Spacing.two },
  field: { marginBottom: Spacing.four },
  textarea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  row: { flexDirection: "row", gap: Spacing.three },
  halfField: { flex: 1 },
  imagePicker: {
    borderWidth: 1.5, borderColor: Palette.border, borderStyle: "dashed", borderRadius: Radius.md,
    alignItems: "center", justifyContent: "center", paddingVertical: Spacing.seven, backgroundColor: Palette.neutral[50],
  },
  imagePickerText: { fontSize: 14, color: Palette.textSecondary, fontWeight: "500", marginTop: Spacing.three },
  imagePickerSub: { fontSize: 12, color: Palette.textMuted, marginTop: 4 },
  imageContainer: { position: "relative", alignSelf: "flex-start" },
  previewImage: { width: 140, height: 140, borderRadius: Radius.md, backgroundColor: Palette.neutral[100] },
  removeImageBtn: {
    position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: Radius.pill,
    backgroundColor: Palette.danger.base, alignItems: "center", justifyContent: "center", ...Shadows.sm,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, marginBottom: Spacing.two },
  actions: { flexDirection: "row", gap: Spacing.three, paddingHorizontal: Spacing.four, marginTop: Spacing.one },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
});
