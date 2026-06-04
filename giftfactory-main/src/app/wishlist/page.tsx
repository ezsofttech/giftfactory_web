"use client";

import { ProductCard } from "@/components/card/main-product-card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchWishlist, fetchProductById, toggleWishlistItem } from "@/lib/api";
import { mapApiProductToDisplay } from "@/types/api";
import type { ApiWishlistItem, ApiProduct, ApiProductVariant, ProductDisplay } from "@/types/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";


export default function WishlistPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to view your wishlist", callbackUrl: "/wishlist" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["customer", "wishlist"],
    queryFn: () => fetchWishlist(),
    enabled: status === "authenticated",
  });

  const removeMutation = useMutation({
    mutationFn: (body: { productId: string; variantId?: string }) => toggleWishlistItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist", "ids"] });
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });

  const items = (res?.data ?? []) as ApiWishlistItem[];

  const productIdsToFetch = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((item) => {
      const p = item.productId;
      if (typeof p === "string" && p) ids.add(p);
      else if (typeof p === "object" && p && "_id" in p) ids.add((p as ApiProduct)._id);
    });
    return Array.from(ids);
  }, [items]);

  const productQueries = useQueries({
    queries: productIdsToFetch.map((id) => ({
      queryKey: ["web", "product", id],
      queryFn: () => fetchProductById(id),
      enabled: !!id && status === "authenticated",
    })),
  });

  const productMap = useMemo(() => {
    const map = new Map<string, ApiProduct>();
    productQueries.forEach((q, i) => {
      const raw = q.data;
      const product = (raw as { data?: ApiProduct })?.data ?? (raw as ApiProduct);
      const id = productIdsToFetch[i];
      if (product?._id && id) map.set(id, product);
    });
    return map;
  }, [productQueries, productIdsToFetch]);

  const getProductDisplay = (item: ApiWishlistItem): ProductDisplay | null => {
    const p = item.productId;
    let productId: string | null = null;

    if (typeof p === "string" && p) {
      productId = p;
    } else if (typeof p === "object" && p && "_id" in p) {
      productId = (p as ApiProduct)._id;
    }

    if (!productId) return null;

    // Only show products that were successfully fetched — this ensures the card
    // link points to a product the backend will actually serve (approved + public).
    // Products that returned 404 (not approved / not public) are excluded.
    const apiProduct = productMap.get(productId);
    if (!apiProduct) return null;

    // mapApiProductToDisplay already resolves images correctly via getValidImageUrl
    const display = mapApiProductToDisplay(apiProduct);

    // Wire in variant-specific overrides when this wishlist entry targets a specific variant
    const variantData = item.variantId && typeof item.variantId === "object" ? item.variantId as ApiProductVariant : null;
    const variantId = typeof item.variantId === "string" ? item.variantId : variantData?._id;

    return {
      ...display,
      // Pass the specific variant so AddToCart and the heart icon match correctly
      ...(variantId ? { preVariantId: variantId } : {}),
      // Show variant label as badge (e.g. "Red / L")
      ...(variantData?.title ? { variantTitle: variantData.title } : {}),
    };
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading your wishlist...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        Error loading wishlist
      </div>
    );
  }

  const productsLoading = productIdsToFetch.length > 0 && productQueries.some((q) => q.isLoading || q.isFetching);
  const displayItems = productsLoading
    ? []
    : items.map((item) => ({ item, product: getProductDisplay(item) })).filter((x) => x.product);

  return (
    <div className="flex min-h-screen container mx-auto">
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Wishlist</h1>
        </div>

        {productsLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Loading your wishlist items...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Your wishlist is empty</p>
            <Button className="mt-4" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map(({ item, product }) => (
              product && (
                <div key={item._id} className="relative">
                  <ProductCard product={product} className="w-full" />
                  <button
                    type="button"
                    className="absolute top-1.5 right-10 sm:top-2 sm:right-12 z-20 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500 transition-colors disabled:opacity-70"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const prodId = typeof item.productId === "string" ? item.productId : (item.productId as ApiProduct)?._id;
                      const varId = typeof item.variantId === "string" ? item.variantId : (item.variantId as ApiProductVariant)?._id;
                      if (prodId) {
                        removeMutation.mutate({ productId: prodId, variantId: varId });
                      }
                    }}
                    disabled={removeMutation.isPending}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
