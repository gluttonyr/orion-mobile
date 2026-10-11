import { produitService } from "@/service/produit.service";
import { categorieService } from "@/service/categorie.service";

export const productsApi = {
  getAll: produitService.getAll.bind(produitService),
  getById: produitService.getById.bind(produitService),
  create: produitService.create.bind(produitService),
  update: produitService.update.bind(produitService),
  delete: produitService.delete.bind(produitService),
  getCategories: categorieService.getAll.bind(categorieService),
};
