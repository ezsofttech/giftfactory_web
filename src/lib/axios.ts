import axios, { type InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";
import { getApiBaseUrl } from "@/constants/api";

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function getApiAccessToken(): string | null {
  return accessToken;
}

export const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const base = getApiBaseUrl();
  if (base) config.baseURL = base;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Attach guest session ID if present in localStorage, otherwise generate a UUID v4
  if (typeof window !== "undefined") {
    let sessionId = localStorage.getItem("gf_guest_session_id");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!sessionId || !uuidRegex.test(sessionId)) {
      const cartId = localStorage.getItem("gf_guest_cart_id");
      if (cartId && uuidRegex.test(cartId)) {
        sessionId = cartId;
      } else {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          sessionId = crypto.randomUUID();
        } else {
          sessionId = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
            (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
          );
        }
      }
      localStorage.setItem("gf_guest_session_id", sessionId);
    }
    config.headers["x-session-id"] = sessionId;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      setApiAccessToken(null);
      signOut({ redirectTo: "/signup" });
    }
    return Promise.reject(error);
  }
);

/** Request config with optional auth (for server or when token is passed explicitly) */
export function authHeaders(token: string | null | undefined): { Authorization?: string } {
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}
