import { createApi } from "./api.config";
import type { Categorie } from "../model/model";

const api = createApi("categorie");

class CategorieService {
  async create(data: Partial<Categorie>): Promise<Categorie> {
    const res = await api.post("/", data);
    return res.data;
  }

  async getAll(): Promise<Categorie[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Categorie> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, data: Partial<Categorie>): Promise<Categorie> {
    const res = await api.put(`/${id}`, data);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const categorieService = new CategorieService();
