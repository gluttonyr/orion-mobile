import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi } from "@/service/api.config";

// Mêmes clés et même logique que le web (PublicPages.tsx : visitorId + favoris locaux).
const VISITOR_ID_KEY = "orion-visitor-id";
const FAVORITES_KEY = "orion-favorite-products";
const api = createApi("produits");

async function getVisitorId(): Promise<string> {
  let id = await AsyncStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

async function readFavorites(): Promise<string[]> {
  try {
    const saved: unknown = JSON.parse((await AsyncStorage.getItem(FAVORITES_KEY)) ?? "[]");
    return Array.isArray(saved) ? saved.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function useFavoriteProduct(productId?: number) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    readFavorites().then((ids) => { if (active) setIsFavorite(ids.includes(String(productId))); });
    return () => { active = false; };
  }, [productId]);

  const toggleFavorite = useCallback(async () => {
    if (!productId || saving) return;
    const key = String(productId);
    const favorites = await readFavorites();
    const liked = !favorites.includes(key);
    setSaving(true);
    try {
      const result = (await api.put<{ count: number; liked: boolean }>(`/${productId}/likes`, { visitorId: await getVisitorId(), liked })).data;
      const next = liked ? [...favorites, key] : favorites.filter((id) => id !== key);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setIsFavorite(liked);
      if (typeof result?.count === "number") setCount(result.count);
      return liked;
    } finally {
      setSaving(false);
    }
  }, [productId, saving]);

  return { isFavorite, count, saving, toggleFavorite };
}
