import { createApi } from '@/service/api.config';

const api = createApi('live/sessions');

export type PublicLiveSession = {
  id: number;
  ownerId: number;
  boutiqueId: number;
  tiktokUrl: string;
  startedAt: string;
  endedAt: string | null;
};

class LiveService {
  async getCreatorLive(ownerId: number): Promise<PublicLiveSession | null> {
    const response = await api.get<PublicLiveSession | null>(`/public/creator/${ownerId}`);
    return response.data;
  }
}

export const liveService = new LiveService();
