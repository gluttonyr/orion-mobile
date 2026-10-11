import { useEffect, useState } from "react";
import { opportunitiesApi } from "./api";
import type { Mission } from "./types";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunitiesApi
      .getAll()
      .then(setOpportunities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { opportunities, loading };
}

export function useOpportunity(id: number) {
  const [opportunity, setOpportunity] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunitiesApi
      .getById(id)
      .then(setOpportunity)
      .catch(() => setOpportunity(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { opportunity, loading };
}
