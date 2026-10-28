import { useEffect, useState } from "react";
import { opportunitiesApi } from "./api";
import type { Mission } from "./types";
import { useAuth } from "@/features/auth/hooks";
import { UserRole } from "@/model/model";
import type { MissionApplication } from "@/service/mission.service";

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

export function useMyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<MissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user || user.role !== UserRole.UTILISATEUR) {
      setApplications([]);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    opportunitiesApi.getMyApplications()
      .then((items) => { if (!cancelled) setApplications(items); })
      .catch((reason: unknown) => { if (!cancelled) { setApplications([]); setError(reason instanceof Error ? reason.message : "Impossible de charger les candidatures."); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  return { applications, loading, error };
}
