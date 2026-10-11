import { API_BASE_URL, createApi } from './api.config';
import type { Short, ShortComment, ShortCommentFeed, ShortCreatorProfile, ShortFeed } from '../model/model';

const api = createApi('shorts');

type LocalMediaFile = {
  uri: string;
  name: string;
  type: string;
};

function mediaFile(uri: string, defaultName: string, defaultType: string): LocalMediaFile {
  const name = decodeURIComponent(uri.split('/').pop()?.split('?')[0] || defaultName);
  const extension = name.split('.').pop()?.toLowerCase();
  const mimeByExtension: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return { uri, name, type: mimeByExtension[extension || ''] || defaultType };
}

function absoluteMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

function uploadedProfileImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/upload/${url.replace(/^\/+/, '')}`;
}

function withAbsoluteMediaUrls(short: Short): Short {
  return {
    ...short,
    videoUrl: absoluteMediaUrl(short.videoUrl) || short.videoUrl,
    coverUrl: absoluteMediaUrl(short.coverUrl),
    auteur: {
      ...short.auteur,
      image: uploadedProfileImageUrl(short.auteur?.image),
    },
    produit: short.produit ? { ...short.produit, image: uploadedProfileImageUrl(short.produit.image) ?? undefined } : null,
  };
}

class ShortService {
  async publish(input: {
    videoUri: string;
    titre: string;
    description?: string;
    produitId?: number;
    coverUri?: string;
    onUploadProgress?: (progress: number) => void;
  }): Promise<Short> {
    const form = new FormData();
    form.append('video', mediaFile(input.videoUri, 'short.mp4', 'video/mp4') as any);
    form.append('titre', input.titre.trim());
    if (input.description?.trim()) form.append('description', input.description.trim());
    if (input.produitId) form.append('produitId', String(input.produitId));
    if (input.coverUri) form.append('cover', mediaFile(input.coverUri, 'short-cover.jpg', 'image/jpeg') as any);

    const response = await api.post<Short>('/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (event) => {
        if (event.total) input.onUploadProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      },
    });
    return withAbsoluteMediaUrls(response.data);
  }

  async getFeed(page = 1, limit = 10): Promise<ShortFeed> {
    const response = await api.get<ShortFeed>('/', { params: { page, limit } });
    return { ...response.data, items: response.data.items.map(withAbsoluteMediaUrls) };
  }

  async getMine(): Promise<Short[]> {
    const response = await api.get<Short[]>('/mine');
    return response.data.map(withAbsoluteMediaUrls);
  }

  async getById(id: number): Promise<Short> {
    const response = await api.get<Short>(`/${id}`);
    return withAbsoluteMediaUrls(response.data);
  }

  async getCreatorProfile(userId: number): Promise<ShortCreatorProfile> {
    const response = await api.get<ShortCreatorProfile>(`/creator/${userId}`);
    return {
      auteur: { ...response.data.auteur, image: uploadedProfileImageUrl(response.data.auteur.image) },
      shorts: response.data.shorts.map(withAbsoluteMediaUrls),
    };
  }

  getVideoUrl(shortOrId: Short | number): string {
    if (typeof shortOrId === 'number') return `${API_BASE_URL}/shorts/${shortOrId}/video`;
    return absoluteMediaUrl(shortOrId.videoUrl) || `${API_BASE_URL}/shorts/${shortOrId.id}/video`;
  }

  getCoverUrl(short: Short): string | null {
    return absoluteMediaUrl(short.coverUrl);
  }

  async registerView(id: number): Promise<{ id: number; vues: number }> {
    const response = await api.post<{ id: number; vues: number }>(`/${id}/view`);
    return response.data;
  }

  async toggleLike(id: number): Promise<{ liked: boolean; likes: number }> {
    const response = await api.post<{ liked: boolean; likes: number }>(`/${id}/likes`);
    return response.data;
  }

  async getComments(id: number, page = 1, limit = 20): Promise<ShortCommentFeed> {
    const response = await api.get<ShortCommentFeed>(`/${id}/comments`, { params: { page, limit } });
    return response.data;
  }

  async addComment(id: number, contenu: string): Promise<ShortComment> {
    const response = await api.post<ShortComment>(`/${id}/comments`, { contenu: contenu.trim() });
    return response.data;
  }

  async deleteComment(id: number, commentId: number): Promise<void> {
    await api.delete(`/${id}/comments/${commentId}`);
  }

  async registerShare(id: number): Promise<{ id: number; partages: number }> {
    const response = await api.post<{ id: number; partages: number }>(`/${id}/share`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/${id}`);
  }
}

export const shortService = new ShortService();
export type { Short, ShortAuthor, ShortComment, ShortCommentFeed, ShortCreatorProfile, ShortFeed } from '../model/model';
