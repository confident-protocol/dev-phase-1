import axios, { AxiosError } from "axios";
import { mockGet, ADMIN_USER } from "./mockData";

function resolveApiBase() {
  const explicit = import.meta.env.VITE_API_URL as string | undefined;
  if (explicit) return explicit;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://${host}:4000`;
    }
  }

  return "http://localhost:4000";
}

export const API_BASE = resolveApiBase();

const real = axios.create({ baseURL: API_BASE, timeout: 4000 });

real.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("cp_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

let backendUnreachable = false;

function isNetworkErr(err: unknown) {
  const e = err as AxiosError;
  return !e?.response;
}

async function tryReal<T>(fn: () => Promise<T>): Promise<T | null> {
  if (backendUnreachable) return null;
  try {
    return await fn();
  } catch (err) {
    if (isNetworkErr(err)) {
      backendUnreachable = true;
      console.info("[ConfidentialPay] Backend unreachable — falling back to in-app mock data.");
      return null;
    }
    throw err;
  }
}

export const api = {
  async get(url: string) {
    const res = await tryReal(() => real.get(url));
    if (res) return res;
    const data = mockGet(url);
    if (data === null) throw new Error(`No mock for GET ${url}`);
    return { data };
  },
  async post(url: string, body?: unknown) {
    const res = await tryReal(() => real.post(url, body));
    if (res) return res;
    // Mocked POSTs
    if (url === "/api/auth/login") {
      const { email, password } = (body ?? {}) as { email?: string; password?: string };
      if (email === "admin@confidentialpay.com" && password === "00000") {
        return { data: { token: "mock-" + Math.random().toString(36).slice(2), user: ADMIN_USER } };
      }
      const err: any = new Error("Invalid credentials");
      err.response = { status: 401, data: { error: "Invalid" } };
      throw err;
    }
    if (url === "/api/auth/forgot-password") {
      return { data: { success: true, message: "Reset link sent" } };
    }
    if (url === "/api/employees" || url === "/api/payroll/employees") {
      const b = (body ?? {}) as Record<string, unknown>;
      return {
        data: {
          success: true,
          employee: { id: `e_${Date.now().toString(36)}`, status: "pending", ...b },
        },
      };
    }
    if (url.includes("/approve")) {
      return { data: { success: true, status: "active" } };
    }
    if (url === "/api/payroll/execute" || url.includes("/payroll/scheduled") || url.includes("/templates")) {
      return { data: { success: true, mock: true, ...(body as object), id: `mock_${Date.now().toString(36)}` } };
    }
    if (url === "/api/compliance/screen") {
      return {
        data: {
          success: true,
          screen: { screenId: `aml_${Date.now().toString(36)}`, status: "cleared", riskScore: 8 },
        },
      };
    }
    if (url === "/api/compliance/viewing-key") {
      return {
        data: {
          success: true,
          key: { keyId: `vk_${Date.now().toString(36)}`, status: "active", expiresIn: 3600 },
        },
      };
    }
    if (url.startsWith("/api/treasury/") || url.startsWith("/api/bridge/") || url.startsWith("/api/settings/")) {
      return { data: { success: true, mock: true, ...(body as object) } };
    }
    return { data: { ok: true, mock: true, success: true, ...(body as object) } };
  },
  async put(url: string, body?: unknown) {
    const res = await tryReal(() => real.put(url, body));
    if (res) return res;
    return { data: { ok: true, mock: true, url, ...(body as object) } };
  },
  async delete(url: string) {
    const res = await tryReal(() => real.delete(url));
    if (res) return res;
    return { data: { ok: true, mock: true, url } };
  },
};
