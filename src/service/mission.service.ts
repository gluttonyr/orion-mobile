import { createApi } from "./api.config";
import type { Mission } from "../model/model";

export type MissionApplication = Mission & {
  candidature: { userId: number; statut: string; dateCandidature: string | Date; message: string };
};

const api = createApi("mission");

class MissionService {
  async create(missionData: Partial<Mission>) {
    const res = await api.post("/", missionData);
    return res.data;
  }

  async getAll(): Promise<Mission[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getMine(): Promise<Mission[]> {
    const res = await api.get('/mine');
    return res.data;
  }

  async apply(id: number, message: string) {
    const res = await api.post(`/${id}/candidatures`, { message });
    return res.data;
  }

  async getMyApplication(id: number) {
    const res = await api.get(`/${id}/candidatures/me`);
    return res.data;
  }

  async getMyApplications(): Promise<MissionApplication[]> {
    const res = await api.get('/applications/me');
    return res.data;
  }

  async getById(id: number): Promise<Mission> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, missionData: Partial<Mission>) {
    const res = await api.put(`/${id}`, missionData);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const mission = new MissionService();
