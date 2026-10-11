import { userService } from "@/service/utilisateur.service";

export const authApi = {
  login: userService.login.bind(userService),
  register: userService.register.bind(userService),
  getCurrent: userService.getCurrent.bind(userService),
};
