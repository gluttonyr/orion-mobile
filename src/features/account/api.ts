import { userService } from "@/service/utilisateur.service";

export const accountApi = {
  update: userService.update.bind(userService),
};
