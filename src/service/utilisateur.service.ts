import { createApi } from "./api.config";
import type { Utilisateur } from "../model/model";

const api = createApi("utilisateur");

class UserService {
  async register(userData: Partial<Utilisateur>) {
    const res = await api.post("/register", userData);
    return res.data;
  }

  async login(email: string, password: string) {
    const res = await api.post("/login", { email, password });
    return res.data;
  }

  async getAll(): Promise<Utilisateur[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Utilisateur> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, userData: Partial<Utilisateur>, imageUri?: string) {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    if (imageUri) {
      const name = imageUri.split('/').pop() || 'profil.jpg';
      const extension = name.split('.').pop()?.toLowerCase();
      formData.append('image', { uri: imageUri, name, type: extension === 'png' ? 'image/png' : 'image/jpeg' } as any);
    }
    const res = await api.put(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async getCurrent(token?: string): Promise<Utilisateur> {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    const res = await api.get("auth/me", config);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const userService = new UserService();
