import { createApi } from "./api.config";
import type { Discussion } from "@/model/model";

const api = createApi("api/discussion");

class DiscussionService {
  async create(data: Partial<Discussion>) {
    const res = await api.post("/", data);
    return res.data;
  }
  async getAll(): Promise<Discussion[]> {
    const res = await api.get("/");
    return res.data;
  }
  async getById(id: number): Promise<Discussion> {
    const res = await api.get(`/${id}`);
    return res.data;
  }
  async update(id: number, data: Partial<Discussion>) {
    const res = await api.put(`/${id}`, data);
    return res.data;
  }
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const discussionService = new DiscussionService();
