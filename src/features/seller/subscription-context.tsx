import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Plan } from "@/model/model";
import planService, { type CurrentPlanResponse } from "@/service/plan.service";
import { useAuth } from "@/features/auth/hooks";

interface SubscriptionContextType {
  subscription: Plan | null;
  plans: Plan[];
  usage: CurrentPlanResponse["usage"] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  canCreateStore: () => boolean;
  canCreateProduct: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<CurrentPlanResponse["usage"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalog, current] = await Promise.all([planService.getAll(), planService.getCurrent()]);
      setPlans(catalog);
      setSubscription(current.subscription);
      setUsage(current.usage);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de charger l’abonnement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "COMMERCANT") void refresh();
    else { setSubscription(null); setUsage(null); setPlans([]); setLoading(false); }
  }, [user?.id, user?.role]);

  return (
    <SubscriptionContext.Provider value={{
      subscription, plans, usage, loading, error, refresh,
      canCreateStore: () => !!subscription?.active && (usage?.boutiques ?? 0) < (subscription.nombreBoutiques ?? 1),
      canCreateProduct: () => !!subscription?.active && (usage?.produits ?? 0) < (subscription.nombreProduits ?? 40),
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription doit être utilisé dans un SubscriptionProvider");
  return context;
}
