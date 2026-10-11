import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { createApi } from '@/service/api.config';
import { UserRole, type Boutique, type produits } from '@/model/model';

const api = createApi('live/sessions');

export type LiveSession = {
  id: number;
  ownerId: number;
  boutiqueId: number;
  boutique: Boutique;
  produits?: produits[] | null;
  tiktokUrl: string;
  startedAt: string;
  endedAt: string | null;
  results: { visits: number; orders: number; revenue: number };
};

type LiveContextValue = {
  session: LiveSession | null;
  ready: boolean;
  error: string;
  refreshSession: () => Promise<void>;
  startLive: (tiktokUrl: string, boutiqueId: number, productIds: number[]) => Promise<void>;
  finishLive: () => Promise<void>;
};

const LiveContext = createContext<LiveContextValue | null>(null);

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join('\n');
    if (message) return message;
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const refreshSession = useCallback(async () => {
    if (!user?.id || user.role !== UserRole.COMMERCANT) {
      setSession(null);
      setReady(true);
      setError('');
      return;
    }
    try {
      const response = await api.get<LiveSession | null>('/current');
      setSession(response.data);
      setError('');
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    } finally {
      setReady(true);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (isLoading) return;
    if (!user?.id || user.role !== UserRole.COMMERCANT) {
      setSession(null);
      setReady(true);
      setError('');
      return;
    }
    setReady(false);
    void refreshSession().catch(() => undefined);
    const interval = setInterval(() => {
      void refreshSession().catch(() => undefined);
    }, 15000);
    return () => clearInterval(interval);
  }, [isLoading, refreshSession, user?.id]);

  const startLive = async (tiktokUrl: string, boutiqueId: number, productIds: number[]) => {
    try {
      const response = await api.post<LiveSession>('/start', { tiktokUrl, boutiqueId, productIds });
      setSession(response.data);
      setError('');
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  };

  const finishLive = async () => {
    if (!session) return;
    try {
      await api.post(`/${session.id}/finish`);
      setSession(null);
      setError('');
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  };

  return (
    <LiveContext.Provider value={{ session, ready, error, refreshSession, startLive, finishLive }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLiveSession() {
  const context = useContext(LiveContext);
  if (!context) throw new Error('useLiveSession must be used within LiveProvider');
  return context;
}
