"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setApiAccessToken } from "@/lib/axios";

/**
 * Sets the backend API access token from NextAuth session so that
 * axiosInstance automatically sends Authorization header on requests.
 */
export function AuthApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    const token = (session as { accessToken?: string } | null)?.accessToken ?? null;
    setApiAccessToken(token);
  }, [session, status]);

  return <>{children}</>;
}
