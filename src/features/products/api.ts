import { produitService } from "@/service/produit.service";
import { categorieService } from "@/service/categorie.service";
import { createApi } from "@/service/api.config";

const api = createApi("produits");

export type ProductReview = {
  id: number;
  note: number;
  commentaire: string | null;
  dateCreation: string;
  auteur: string;
};

export type ProductReviewList = { moyenne: number; nombre: number; avis: ProductReview[] };

export const productsApi = {
  getAll: produitService.getAll.bind(produitService),
  getById: produitService.getById.bind(produitService),
  create: produitService.create.bind(produitService),
  update: produitService.update.bind(produitService),
  delete: produitService.delete.bind(produitService),
  getCategories: categorieService.getAll.bind(categorieService),
  getReviews: async (id: number): Promise<ProductReviewList> => (await api.get(`/${id}/avis`)).data,
  saveReview: async (id: number, note: number, commentaire: string): Promise<ProductReviewList> => (await api.post(`/${id}/avis`, { note, commentaire })).data,
  report: async (id: number, motif = '') => (await api.post(`/${id}/signaler`, { motif })).data,
};
