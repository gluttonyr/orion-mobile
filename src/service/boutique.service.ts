import { createApi } from "./api.config";
import type { Boutique } from "../model/model";

const api = createApi("boutique");

class BoutiqueService {
  async create(data: FormData): Promise<Boutique> {
    const res = await api.post("/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async getAll(): Promise<Boutique[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getMine(): Promise<Boutique[]> {
    const res = await api.get('/mine');
    return res.data;
  }

  async getById(id: number): Promise<Boutique> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, data: FormData): Promise<Boutique> {
    const res = await api.put(`/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const boutiqueService = new BoutiqueService();
