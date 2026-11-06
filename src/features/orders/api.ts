import { createApi } from "@/service/api.config";
import type { Vente } from "@/model/model";

const api = createApi("vente");
const notificationsApi = createApi("notifications");

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
  getSellerAnalytics: async (from: string, to: string): Promise<SellerAnalytics> => (await api.get('/seller/analytics', { params: { from, to } })).data,
  getSellerWallet: async () => (await api.get('/seller/wallet')).data,
  getSellerRemises: async () => (await api.get('/seller/remises')).data,
  generateHandoverQr: async (remiseId: number) => (await api.post(`/seller/remises/${remiseId}/qr`)).data,
  confirmHandover: async (content: string, venteId: number) => (await api.post('/remise/confirm', { content, venteId })).data,
};

export type OrionNotification = { id: number; type: string; title: string; message: string; referenceId: number | null; createdAt: string; readAt: string | null };
export type NotificationList = { items: OrionNotification[]; unreadCount: number };

export const notificationsService = {
  getAll: async (): Promise<NotificationList> => (await notificationsApi.get('/')).data,
  markRead: async (id: number): Promise<NotificationList> => (await notificationsApi.patch(`/${id}/read`)).data,
  markAllRead: async (): Promise<NotificationList> => (await notificationsApi.post('/read-all')).data,
};

export type SellerAnalytics = {
  from: string;
  to: string;
  summary: { revenue: number; orderCount: number; unitsSold: number; averageOrderValue: number };
  series: Array<{ date: string; revenue: number; orders: number; units: number }>;
  topProducts: Array<{ produitId: number; name: string; quantity: number; revenue: number; orders: number }>;
  recentOrders: Array<{ venteId: number; reference: string; date: string; montant: number; statut: string; articles: Array<{ produitId: number; nom: string; quantite: number; prixUnitaire: number }> }>;
};
