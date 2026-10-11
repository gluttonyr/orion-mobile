import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/features/seller/boutique-context";
import { boutiqueService } from "@/service/boutique.service";
import { useImage } from "@/store/image-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Palette, Radius, Shadows, Spacing, BottomTabInset } from "@/constants/theme";
import { Chip, EmptyState } from "@/components/ui";

export default function ShopScreen() {
  const router = useRouter();
  const { stores, activeStore, setActiveStore, deleteStore, refreshStores } = useStore();
  const { getBoutiqueImageUrl } = useImage();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      deleteStore(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const toggleStatus = async (store: any) => {
    try {
      const fd = new FormData();
      fd.append("nom", store.nom);
      fd.append("active", String(!store.active));
      await boutiqueService.update(store.id, fd);
      await refreshStores();
    } catch {
      Alert.alert("Erreur", "Impossible de modifier le statut.");
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <AppHeader
        variant="back"
        title="Mes Boutiques"
        subtitle="Gérez toutes vos boutiques"
        rightIcon="add-outline"
        onRight={() => router.push("/seller/shop/new")}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: BottomTabInset }}>

        {/* Active Store Banner */}
        {activeStore && (
          <LinearGradient colors={[Palette.primary[500], Palette.secondary[500]]} style={styles.activeBanner}>
            <Ionicons name="storefront" size={22} color={Palette.surface} />
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerLabel}>Boutique active</Text>
              <Text style={styles.activeBannerName}>{activeStore.nom}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Stores List */}
        {stores.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            title="Aucune boutique"
            description="Commencez par créer votre première boutique"
            actionLabel="Créer une boutique"
            onAction={() => router.push("/seller/shop/new")}
          />
        ) : (
          <View style={styles.list}>
            {stores.map((store) => {
              const isActive = activeStore?.id === store.id;
              return (
                <View
                  key={store.id}
                  style={[styles.storeCard, isActive && styles.storeCardActive]}
                >
                  <View style={styles.storeTop}>
                    {/* Logo */}
                    <TouchableOpacity
                      style={[styles.storeLogoBox, isActive && styles.storeLogoBoxActive]}
                      onPress={() => setActiveStore(store)}
                    >
                      {store.logo ? (
                        <Image
                          source={{ uri: getBoutiqueImageUrl(store.logo) }}
                          style={styles.storeLogo}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="storefront" size={28} color={Palette.surface} />
                      )}
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={styles.storeInfo}>
                      <View style={styles.storeNameRow}>
                        <Text style={styles.storeName} numberOfLines={1}>{store.nom}</Text>
                        {isActive && <Chip label="ACTIVE" tone="primary" size="sm" />}
                      </View>
                      <Text style={styles.storeDesc} numberOfLines={2}>{store.description}</Text>

                      <View style={styles.storeMeta}>
                        {store.location && (
                          <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={13} color={Palette.textSecondary} />
                            <Text style={styles.metaText}>{store.location}</Text>
                          </View>
                        )}
                        {store.category && (
                          <View style={styles.metaRow}>
                            <Ionicons name="pricetag-outline" size={13} color={Palette.textSecondary} />
                            <Text style={styles.metaText}>{store.category}</Text>
                          </View>
                        )}
                        {store.dateCreation && (
                          <View style={styles.metaRow}>
                            <Ionicons name="calendar-outline" size={13} color={Palette.textSecondary} />
                            <Text style={styles.metaText}>
                              {new Date(store.dateCreation).toLocaleDateString("fr-FR")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Toggle Active */}
                    <TouchableOpacity
                      style={styles.toggleBtn}
                      onPress={() => toggleStatus(store)}
                    >
                      <Ionicons
                        name={store.active ? "checkmark-circle" : "close-circle"}
                        size={22}
                        color={store.active ? Palette.secondary[500] : Palette.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Actions */}
                  <View style={styles.storeActions}>
                    {!isActive && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setActiveStore(store)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color={Palette.secondary[600]} />
                        <Text style={[styles.actionText, { color: Palette.secondary[600] }]}>Activer</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => router.push(`/seller/shop/new?id=${store.id}` as any)}
                    >
                      <Ionicons name="create-outline" size={16} color={Palette.primary[500]} />
                      <Text style={[styles.actionText, { color: Palette.primary[500] }]}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        deleteConfirm === store.id && styles.actionBtnDangerConfirm,
                      ]}
                      onPress={() => handleDelete(store.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={deleteConfirm === store.id ? Palette.surface : Palette.danger.base} />
                      <Text style={[
                        styles.actionText,
                        { color: deleteConfirm === store.id ? Palette.surface : Palette.danger.base },
                      ]}>
                        {deleteConfirm === store.id ? "Confirmer ?" : "Supprimer"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  activeBanner: { flexDirection: "row", alignItems: "center", gap: Spacing.three, marginHorizontal: Spacing.four, marginTop: Spacing.three, marginBottom: Spacing.four, padding: Spacing.four, borderRadius: Radius.lg, ...Shadows.md },
  activeBannerText: { flex: 1 },
  activeBannerLabel: { fontSize: 12, color: Palette.primary[100] },
  activeBannerName: { fontSize: 16, fontWeight: "700", color: Palette.surface },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.four },
  storeCard: { backgroundColor: Palette.surface, borderRadius: Radius.lg, overflow: "hidden", ...Shadows.sm },
  storeCardActive: { borderWidth: 1.5, borderColor: Palette.primary[400] },
  storeTop: { flexDirection: "row", padding: Spacing.four, gap: Spacing.three },
  storeLogoBox: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Palette.neutral[400], alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  storeLogoBoxActive: { backgroundColor: Palette.primary[500] },
  storeLogo: { width: 56, height: 56 },
  storeInfo: { flex: 1 },
  storeNameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two, marginBottom: 4 },
  storeName: { fontSize: 17, fontWeight: "700", color: Palette.text, flex: 1 },
  storeDesc: { fontSize: 13, color: Palette.textSecondary, lineHeight: 19, marginBottom: Spacing.three },
  storeMeta: { gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: Palette.textSecondary },
  toggleBtn: { alignSelf: "flex-start" },
  storeActions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: Palette.border },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: Spacing.three },
  actionBtnDangerConfirm: { backgroundColor: Palette.danger.base },
  actionText: { fontSize: 13, fontWeight: "600" },
});
