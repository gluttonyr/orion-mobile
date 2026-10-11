import { createApi } from "./api.config";
import type { Plan } from "../model/model";

const api = createApi("plan");

class PlanService {
  async getAll(): Promise<Plan[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getCurrent(): Promise<CurrentPlanResponse> {
    const res = await api.get("/current");
    return res.data;
  }
}

export type CurrentPlanResponse = { subscription: Plan; usage: { boutiques: number; produits: number } };

const planService = new PlanService();
export default planService;
