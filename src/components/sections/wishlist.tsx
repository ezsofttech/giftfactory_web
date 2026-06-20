import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeartOff } from "lucide-react";
import { ProductCard } from "@/components/card/main-product-card";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, fetchProductById, toggleWishlistItem } from "@/lib/api";
import { useSession } from "next-auth/react";
import { mapApiProductToDisplay, ApiProduct, ApiProductVariant, ApiWishlistItem, ProductDisplay } from "@/types/api";
import { toast } from "sonner";
import { ProductCardSkeleton } from "../skeleton";

export function Wishlist() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  // Fetch wishlist
  const { data: wishlistRes, isLoading, isError } = useQuery({
    queryKey: ["customer", "wishlist"],
    queryFn: () => fetchWishlist(),
    enabled: status === "authenticated",
  });

  const wishlistItems = (wishlistRes?.data ?? []) as ApiWishlistItem[];

  // Fetch detailed product info for each item in the wishlist
  const productIdsToFetch = useMemo(() => {
    const ids = new Set<string>();
    wishlistItems.forEach((item) => {
      const p = item.productId;
      if (typeof p === "string" && p) ids.add(p);
      else if (typeof p === "object" && p && "_id" in p) ids.add((p as ApiProduct)._id);
    });
    return Array.from(ids);
  }, [wishlistItems]);

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

    const apiProduct = productMap.get(productId);
    if (!apiProduct) return null;

    const display = mapApiProductToDisplay(apiProduct);

    const variantData = item.variantId && typeof item.variantId === "object" ? item.variantId as ApiProductVariant : null;
    const variantIdStr = typeof item.variantId === "string" ? item.variantId : variantData?._id;

    return {
      ...display,
      ...(variantIdStr ? { preVariantId: variantIdStr } : {}),
      ...(variantData?.title ? { variantTitle: variantData.title } : {}),
    };
  };

  // Mutation to remove directly by product/variant info
  const removeMutation = useMutation({
    mutationFn: (body: { productId: string; variantId?: string }) => toggleWishlistItem(body),
    onSuccess: () => {
      toast.success("Item removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist", "ids"] });
    },
    onError: () => {
      toast.error("Failed to remove item from wishlist");
    },
  });

  const productsLoading = productIdsToFetch.length > 0 && productQueries.some((q) => q.isLoading || q.isFetching);

  if (isLoading || productsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const displayItems = wishlistItems
    .map((item) => ({ item, product: getProductDisplay(item) }))
    .filter((x): x is { item: ApiWishlistItem; product: ProductDisplay } => x.product !== null);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground pb-1 border-b border-border flex items-center gap-2">
        <HeartOff className="h-4 w-4 text-muted-foreground" /> My Wishlist
      </h3>
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayItems.map(({ item, product }) => {
            return (
              <div key={item._id} className="relative">
                <ProductCard product={product} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10 animate-fade-in"
                  aria-label="Remove from wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const prodId = typeof item.productId === "string" ? item.productId : (item.productId as ApiProduct)?._id;
                    const varId = typeof item.variantId === "string" ? item.variantId : (item.variantId as ApiProductVariant)?._id;
                    if (prodId) {
                      removeMutation.mutate({ productId: prodId, variantId: varId });
                    }
                  }}
                  disabled={removeMutation.isPending}
                >
                  <HeartOff className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 bg-muted/10 rounded-2xl border border-dashed border-border mt-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <HeartOff className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No wishlist items</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Save items you love by clicking the heart icon on product cards while you shop.
          </p>
          <Button className="rounded-full px-8 h-12 text-base shadow-sm" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
