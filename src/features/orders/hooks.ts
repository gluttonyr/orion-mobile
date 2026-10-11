import { useEffect, useState } from "react";
import { ordersApi } from "./api";
import type { Vente } from "./types";

export function useMyOrders() {
  const [orders, setOrders] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getAll()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return { orders, loading };
}
