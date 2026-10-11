import { createApi } from "./api.config";
import type { produits } from "../model/model";

const api = createApi("produits");

class ProduitService {
  private toFormData(produitData: Partial<produits>, imageUri?: string) {
    const formData = new FormData();
    Object.entries(produitData).forEach(([key, value]) => {
      if (value == null || key === 'image' || key === 'categorie' || key === 'images_secondaires') return;
      formData.append(key, String(value));
    });
    if (imageUri) {
      const filename = decodeURIComponent(imageUri.split("/").pop()?.split('?')[0] || "image.jpg");
      const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase() || 'jpg';
      const type = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
      formData.append("image", { uri: imageUri, name: filename, type } as any);
    }
    return formData;
  }

  async create(produitData: Partial<produits>, imageUri?: string) {
    const formData = this.toFormData(produitData, imageUri);
    const res = await api.post("/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async getAll(): Promise<produits[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<produits> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async getByOwner(userId: number): Promise<produits[]> {
    const res = await api.get(`/owner/${userId}`);
    return res.data;
  }

  async update(id: number, userData: Partial<produits>, imageUri?: string) {
    const formData = this.toFormData(userData, imageUri);
    const res = await api.patch(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const produitService = new ProduitService();
