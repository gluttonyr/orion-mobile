import { createApi } from "@/service/api.config";
import type { Vente } from "@/model/model";

const api = createApi("vente");

class VenteService {
  async getAll(): Promise<Vente[]> {
    const res = await api.get("/mes-achats");
    return res.data;
  }

  async getById(id: number): Promise<Vente> {
    const res = await api.get(`/${id}`);
    return res.data;
  }
}

export const venteService = new VenteService();

export const ordersApi = {
  getAll: venteService.getAll.bind(venteService),
  getById: venteService.getById.bind(venteService),
};
