import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000").replace(/\/$/, "");

const SENSITIVE_KEYS = /password|token|authorization|secret/i;

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object" || value instanceof FormData) return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, SENSITIVE_KEYS.test(key) ? "***" : entry]));
}

function parseBody(data: unknown) {
  if (typeof data !== "string") return data;
  try { return JSON.parse(data); } catch { return data; }
}

/** Logs réseau uniquement en développement, jamais de jeton ni de mot de passe. */
const log = (...args: unknown[]) => { if (__DEV__) console.log(...args); };

export function createApi(resource: string) {
  const api = axios.create({
    baseURL: `${API_BASE_URL}/${resource}`,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // REQUEST INTERCEPTOR
  api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      (config as any).metadata = {
        startTime: Date.now(),
      };

      const fullUrl = `${config.baseURL || ""}${config.url || ""}`;

      log("\n🚀 =============================");
      log(`🚀 ${config.method?.toUpperCase()} ${fullUrl}`);
      log("📍 URL :", fullUrl);
      log("🔧 Method :", config.method?.toUpperCase());
      log("📦 Headers :", redact({ ...config.headers }));

      if (config.params) {
        log("🔍 Query Params :", config.params);
      }

      if (config.data) {
        log("📤 Body :", redact(parseBody(config.data)));
      }

      log("🚀 =============================\n");

      return config;
    },
    (error) => {
      log("❌ REQUEST ERROR :", error);
      return Promise.reject(error);
    }
  );

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any).metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      const fullUrl = `${response.config.baseURL || ""}${
        response.config.url || ""
      }`;

      log("\n✅ =============================");
      log(
        `✅ ${response.status} ${response.config.method?.toUpperCase()} ${fullUrl}`
      );
      log("⏱️ Duration :", `${duration} ms`);
      log("📊 Status :", response.status);
      log("📥 Response :", redact(response.data));
      log("✅ =============================\n");

      return response;
    },
    async (error) => {
      const config = error.config;

      const fullUrl = config
        ? `${config.baseURL || ""}${config.url || ""}`
        : "Unknown URL";

      const startTime = config?.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      log("\n❌ =============================");
      log(`❌ ERROR ${fullUrl}`);
      log("⏱️ Duration :", `${duration} ms`);
      log("📊 Status :", error.response?.status);
      log("📝 Message :", error.message);
      log("📥 Response :", error.response?.data);
      log("❌ =============================\n");

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
      }

      return Promise.reject(error);
    }
  );

  return api;
}
