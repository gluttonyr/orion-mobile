import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000").replace(/\/$/, "");

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

      console.log("\n🚀 =============================");
      console.log(`🚀 ${config.method?.toUpperCase()} ${fullUrl}`);
      console.log("📍 URL :", fullUrl);
      console.log("🔧 Method :", config.method?.toUpperCase());
      console.log("📦 Headers :", config.headers);

      if (config.params) {
        console.log("🔍 Query Params :", config.params);
      }

      if (config.data) {
        console.log("📤 Body :", config.data);
      }

      console.log("🚀 =============================\n");

      return config;
    },
    (error) => {
      console.log("❌ REQUEST ERROR :", error);
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

      console.log("\n✅ =============================");
      console.log(
        `✅ ${response.status} ${response.config.method?.toUpperCase()} ${fullUrl}`
      );
      console.log("⏱️ Duration :", `${duration} ms`);
      console.log("📊 Status :", response.status);
      console.log("📥 Response :", response.data);
      console.log("✅ =============================\n");

      return response;
    },
    async (error) => {
      const config = error.config;

      const fullUrl = config
        ? `${config.baseURL || ""}${config.url || ""}`
        : "Unknown URL";

      const startTime = config?.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      console.log("\n❌ =============================");
      console.log(`❌ ERROR ${fullUrl}`);
      console.log("⏱️ Duration :", `${duration} ms`);
      console.log("📊 Status :", error.response?.status);
      console.log("📝 Message :", error.message);
      console.log("📥 Response :", error.response?.data);
      console.log("❌ =============================\n");

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
      }

      return Promise.reject(error);
    }
  );

  return api;
}
