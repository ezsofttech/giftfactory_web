import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchSubCategories } from "@/lib/api";
import type { ApiCategory } from "@/types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["web", "categories"],
    queryFn: async () => {
      const res = await fetchCategories();
      return (res.data ?? []) as ApiCategory[];
    },
  });
}

export function useSubCategories(rootId: string | null) {
  return useQuery({
    queryKey: ["web", "categories", "sub", rootId],
    queryFn: async () => {
      if (!rootId) return [];
      const res = await fetchSubCategories(rootId);
      return (res.data ?? []) as ApiCategory[];
    },
    enabled: !!rootId,
  });
}
