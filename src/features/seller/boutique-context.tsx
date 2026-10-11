import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Boutique } from "@/model/model";
import { boutiqueService } from "@/service/boutique.service";
import { API_BASE_URL } from "@/service/api.config";

interface StoreContextType {
  stores: Boutique[];
  activeStore: Boutique | null;
  loading: boolean;
  error: string | null;
  setActiveStore: (store: Boutique) => void;
  refreshStores: () => Promise<void>;
  deleteStore: (id: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function toStore(b: Boutique): Boutique {
  return {
    id: b.id,
    nom: b.nom,
    description: b.description ?? "",
    category: b.category ?? "",
    location: b.location ?? "",
    logo: b.logo ? (b.logo.startsWith("/") ? `${API_BASE_URL}${b.logo}` : b.logo) : undefined,
    dateCreation: b.dateCreation ? new Date(b.dateCreation) : null,
    active: b.active ?? true,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Boutique[]>([]);
  const [activeStore, setActiveStoreState] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boutiques = await boutiqueService.getMine();
      const mapped = boutiques.map(toStore);
      const savedId = await AsyncStorage.getItem("orion-active-store");
      const selected = (savedId ? mapped.find((s) => s.id === Number(savedId)) : undefined)
        ?? mapped.find((s) => s.active)
        ?? mapped[0]
        ?? null;
      if (savedId && !mapped.some((s) => s.id === Number(savedId))) await AsyncStorage.removeItem("orion-active-store");
      setStores(mapped.map((store) => ({ ...store, active: store.id === selected?.id })));
      setActiveStoreState(selected);
    } catch {
      setError("Impossible de charger les boutiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshStores(); }, [refreshStores]);

  const setActiveStore = useCallback(async (store: Boutique) => {
    setActiveStoreState(store);
    setStores((current) => current.map((item) => ({ ...item, active: item.id === store.id })));
    await AsyncStorage.setItem("orion-active-store", store.id.toString());
  }, []);

  const deleteStore = useCallback(async (id: number) => {
    await boutiqueService.delete(id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    if (activeStore?.id === id) {
      setActiveStoreState(null);
      await AsyncStorage.removeItem("orion-active-store");
    }
  }, [activeStore]);

  return (
    <StoreContext.Provider value={{ stores, activeStore, loading, error, setActiveStore, refreshStores, deleteStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans un StoreProvider");
  return context;
}
