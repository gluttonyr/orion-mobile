import { useEffect, useState } from "react";
import { ordersApi } from "./api";
import type { Vente } from "./types";

export function useMyOrders() {
  const [orders, setOrders] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    ordersApi.getAll()
      .then(setOrders)
      .catch((reason: unknown) => {
        setOrders([]);
        setError(reason instanceof Error ? reason.message : 'Impossible de charger vos commandes.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  return { orders, loading, error, refresh };
}
