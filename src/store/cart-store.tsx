import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/features/auth/hooks";
import { API_BASE_URL, createApi } from "@/service/api.config";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  seller: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

type ServerProduct = {
  id: number;
  nom: string;
  prix: number;
  prixPromotionnel?: number | null;
  stock?: number;
  image?: string;
  statut?: string;
};
type ServerCart = { items: Array<{ product: ServerProduct; quantity: number }> };

const api = createApi("panier");
const guestCartKey = "orion-cart:guest";
const userCartKey = (userId: number) => `orion-cart:user:${userId}`;

function imageUrl(image?: string) {
  if (!image) return "";
  if (/^(https?:|file:|content:|data:)/i.test(image)) return image;
  if (image.startsWith("/")) return `${API_BASE_URL}${image}`;
  return `${API_BASE_URL}/upload/${image.replace(/^\/+/, "")}`;
}

function fromServerCart(cart: ServerCart): CartItem[] {
  return (cart.items ?? []).map(({ product, quantity }) => {
    const regularPrice = Number(product.prix ?? 0);
    const promotionalPrice = Number(product.prixPromotionnel);
    const price = Number.isFinite(promotionalPrice) && promotionalPrice > 0 && promotionalPrice < regularPrice
      ? promotionalPrice
      : regularPrice;
    return {
      id: String(product.id),
      name: product.nom,
      price,
      image: imageUrl(product.image),
      quantity: Math.min(quantity, Number(product.stock ?? quantity)),
      seller: "Orion",
    };
  });
}

function mergeCarts(...carts: CartItem[][]): CartItem[] {
  const byProduct = new Map<string, CartItem>();
  for (const cart of carts) {
    for (const item of cart) {
      const existing = byProduct.get(item.id);
      byProduct.set(item.id, {
        ...item,
        quantity: Math.max(existing?.quantity ?? 0, item.quantity),
      });
    }
  }
  return [...byProduct.values()];
}

async function readCart(key: string): Promise<CartItem[]> {
  try {
    const value = await AsyncStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string" && Number(item.quantity) > 0) : [];
  } catch {
    return [];
  }
}

async function writeCartToServer(items: CartItem[]) {
  await api.put("/me", {
    items: items.map((item) => ({ productId: Number(item.id), quantity: item.quantity })),
  });
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const readyUserId = useRef<number | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    readyUserId.current = null;
    setHydrated(false);

    const hydrate = async () => {
      const localKey = user?.id ? userCartKey(user.id) : guestCartKey;
      const localCart = await readCart(localKey);
      if (!user?.id) {
        if (active) {
          setItems(localCart);
          setHydrated(true);
        }
        return;
      }

      const guestCart = await readCart(guestCartKey);
      try {
        const { data } = await api.get<ServerCart>("/me");
        if (!active) return;
        const remoteCart = fromServerCart(data);
        const merged = mergeCarts(remoteCart, localCart, guestCart);
        setItems(merged);
        readyUserId.current = user.id;
        setHydrated(true);
        await writeCartToServer(merged);
        await AsyncStorage.removeItem(guestCartKey);
      } catch (error) {
        console.warn("Impossible de charger le panier synchronisé.", error);
        if (active) {
          setItems(localCart.length ? localCart : guestCart);
          setHydrated(true);
        }
      }
    };

    void hydrate();
    return () => { active = false; };
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!hydrated) return;
    const storageKey = user?.id ? userCartKey(user.id) : guestCartKey;
    void AsyncStorage.setItem(storageKey, JSON.stringify(items));
    if (!user?.id || readyUserId.current !== user.id) return;

    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(() => writeCartToServer(items))
      .catch((error) => console.warn("Impossible d’enregistrer le panier côté serveur.", error));
  }, [hydrated, items, user?.id]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);
  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
