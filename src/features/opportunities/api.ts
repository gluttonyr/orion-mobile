import { mission } from "@/service/mission.service";

export const opportunitiesApi = {
  getAll: mission.getAll.bind(mission),
  getById: mission.getById.bind(mission),
  create: mission.create.bind(mission),
  update: mission.update.bind(mission),
  delete: mission.delete.bind(mission),
};
