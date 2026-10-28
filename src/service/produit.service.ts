import { createApi } from "./api.config";
import type { produits } from "../model/model";

const api = createApi("produits");

class ProduitService {
  private toFormData(produitData: Partial<produits>, imageUri?: string, secondaryImageUris: string[] = [], clearSecondaryImages = false) {
    const formData = new FormData();
    Object.entries(produitData).forEach(([key, value]) => {
      if (value == null) {
        if (key === 'prixPromotionnel') formData.append(key, '');
        return;
      }
      if (key === 'image' || key === 'categorie' || key === 'images_secondaires') return;
      formData.append(key, String(value));
    });
    if (imageUri) {
      const filename = decodeURIComponent(imageUri.split("/").pop()?.split('?')[0] || "image.jpg");
      const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase() || 'jpg';
      const type = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
      formData.append("image", { uri: imageUri, name: filename, type } as any);
    }
    secondaryImageUris.slice(0, 3).forEach((uri) => {
      const filename = decodeURIComponent(uri.split("/").pop()?.split('?')[0] || "image.jpg");
      const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase() || 'jpg';
      const type = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
      formData.append("images_secondaires", { uri, name: filename, type } as any);
    });
    if (clearSecondaryImages) formData.append('clearImagesSecondaires', 'true');
    return formData;
  }

  async create(produitData: Partial<produits>, imageUri?: string, secondaryImageUris: string[] = []) {
    const formData = this.toFormData(produitData, imageUri, secondaryImageUris);
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

  async update(id: number, userData: Partial<produits>, imageUri?: string, secondaryImageUris: string[] = [], clearSecondaryImages = false) {
    const formData = this.toFormData(userData, imageUri, secondaryImageUris, clearSecondaryImages);
    const res = await api.patch(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  async publish(id: number) {
    const res = await api.patch(`/${id}/publish`);
    return res.data as produits;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const produitService = new ProduitService();
