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
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const base = getApiBaseUrl();
  if (base) config.baseURL = base;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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
