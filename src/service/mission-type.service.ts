import { createApi } from "./api.config";

export type MissionType = { id: number; nom: string };

const api = createApi("mission-types");

/** Types de mission gérés par l'administration (lecture seule sur mobile). */
export const missionTypeService = {
  getAll: async (): Promise<MissionType[]> => (await api.get("/")).data,
};
