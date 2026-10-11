import { createApi } from "./api.config";
import type { Message } from "@/model/model";

const api = createApi("api/message");

class MessageService {
  async create(data: Partial<Message>) {
    const res = await api.post("/", data);
    return res.data;
  }
  async getAll(): Promise<Message[]> {
    const res = await api.get("/");
    return res.data;
  }
  async getById(id: number): Promise<Message> {
    const res = await api.get(`/${id}`);
    return res.data;
  }
  async update(id: number, data: Partial<Message>) {
    const res = await api.put(`/${id}`, data);
    return res.data;
  }
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const messageService = new MessageService();
