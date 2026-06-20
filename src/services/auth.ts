import { useMutation } from "@tanstack/react-query";
import { loginCustomer } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export function useLoginCustomer() {
  return useMutation({
    mutationKey: ["customer-auth", "login"],
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await loginCustomer(payload);
      return res as ApiResponse<unknown> & { accessToken?: string; refreshToken?: string; data?: unknown };
    },
  });
}
