import { createApi } from "@/service/api.config";

const api = createApi("utilisateur");

export type ForgotPasswordResponse = { message: string; expiresInMinutes: number; resendInSeconds: number };

/** Même parcours que le web : 1. code par e-mail, 2. vérification, 3. nouveau mot de passe. */
export const passwordResetApi = {
  request: async (email: string): Promise<ForgotPasswordResponse> => (await api.post("/password/forgot", { email })).data,
  verify: async (email: string, code: string): Promise<{ resetToken: string; expiresInMinutes: number }> => (await api.post("/password/verify", { email, code })).data,
  reset: async (email: string, resetToken: string, password: string): Promise<{ message: string }> => (await api.post("/password/reset", { email, resetToken, password })).data,
};

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message) return message;
  return fallback;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name[0] ?? ""}${"•".repeat(Math.max(2, name.length - 2))}${name.length > 1 ? name[name.length - 1] : ""}@${domain}`;
}

/** Règles identiques au backend : 8 caractères, une lettre, un chiffre. */
export function passwordStrength(password: string) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une lettre", ok: /[A-Za-z]/.test(password) },
    { label: "Un chiffre", ok: /\d/.test(password) },
    { label: "Une majuscule ou un symbole", ok: /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((check) => check.ok).length + (password.length >= 12 ? 1 : 0);
  const level = password ? Math.min(4, Math.max(1, score - 1)) : 0;
  return { checks, level, label: ["", "Faible", "Moyen", "Bon", "Excellent"][level], valid: checks.slice(0, 3).every((check) => check.ok) };
}
