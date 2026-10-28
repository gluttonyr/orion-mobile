import { createApi } from './api.config';

export type BoutiqueCategorie = { id: number; nom: string };
const api = createApi('boutique-categories');

export const boutiqueCategorieService = {
  async getAll(): Promise<BoutiqueCategorie[]> { return (await api.get<BoutiqueCategorie[]>('/')).data; },
  async create(nom: string): Promise<BoutiqueCategorie> { return (await api.post<BoutiqueCategorie>('/', { nom })).data; },
  async update(id: number, nom: string): Promise<BoutiqueCategorie> { return (await api.put<BoutiqueCategorie>(`/${id}`, { nom })).data; },
  async delete(id: number): Promise<void> { await api.delete(`/${id}`); },
};
