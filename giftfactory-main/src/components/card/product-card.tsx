// components/cards/product-card.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProductById, addCartItem, mergeCartIntoCache, productQueryKey, PRODUCT_STALE_TIME_MS, addGuestCartItem } from "@/lib/api";
import { addToGuestCart, saveGuestCartId } from "@/lib/guest-cart";
import type { ProductDisplay } from "@/types/api";

export function ProductCard({ product }: { product: ProductDisplay }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  // Build ordered image list: thumbnail first, then remaining images (deduplicated)
  const allImages: string[] = [];
  if (product.thumbnail) allImages.push(product.thumbnail);
  if (product.images?.length) {
    for (const img of product.images) {
      if (img && !allImages.includes(img)) allImages.push(img);
    }
  }
  const displayImage = allImages[imgIdx] || "https://picsum.photos/seed/gift/400/400";

  const showMrp = product.mrp != null && product.mrp > product.price;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      addToGuestCart({
        productId: String(product.id),
        quantity: 1,
        priceAtAddition: product.price,
        title: product.title,
        thumbnail: product.thumbnail,
      });
      // Call backend guest cart API in background to sync
      addGuestCartItem({
        item: {
          productId: String(product.id),
          quantity: 1,
        },
      }).then((res) => {
        const cartId = (res as any)?.data?._id ?? (res as any)?._id ?? (res as any)?.data?.id ?? (res as any)?.id;
        if (cartId) {
          saveGuestCartId(cartId);
          queryClient.invalidateQueries({ queryKey: ["guest", "cart"] });
        }
      }).catch((err) => {
        console.error("Failed to sync guest cart item add to backend:", err);
      });
      toast.success("Added to cart — sign in to checkout");
      return;
    }
    setAdding(true);
    try {
      // Fast path: pre-selected variant carried on this card
      if (product.preVariantId) {
        const res = await addCartItem({
          item: { productId: String(product.id), variantId: product.preVariantId, quantity: 1 },
        });
        mergeCartIntoCache(queryClient, res);
        queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
        toast.success("Added to cart");
        return;
      }

      // Use cached product when possible to avoid GET on every add-to-cart
      const prodRes = await queryClient.fetchQuery({
        queryKey: productQueryKey(String(product.id)),
        queryFn: () => fetchProductById(String(product.id)),
        staleTime: PRODUCT_STALE_TIME_MS,
      });
      const prod = prodRes?.data as any;
      let variantId: string | undefined = undefined;
      if (Array.isArray(prod?.variantIds) && prod.variantIds.length > 0) {
        // Allow pending + approved; only skip deleted or rejected
        const usableVariant = prod.variantIds.find(
          (v: any) =>
            typeof v === "object" &&
            (v._id || v.id) &&
            !v.isDeleted &&
            v.status !== "rejected"
        );
        const chosen = usableVariant ?? null;
        if (chosen) {
          variantId = chosen._id ?? chosen.id;
        } else if (typeof prod.variantIds[0] === "string") {
          variantId = prod.variantIds[0];
        }
      }
      if (!variantId) {
        toast.error("This product has no available variant to add to cart");
        return;
      }
      const res = await addCartItem({
        item: {
          productId: String(product.id),
          variantId,
          quantity: 1,
        },
      });
      mergeCartIntoCache(queryClient, res);
      queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
      toast.success("Added to cart");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to add to cart";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
        {product.availabilityStatus === "out_of_stock" && (
          <span className="bg-destructive text-white text-xs px-2 py-1 rounded-full font-bold">
            Out of Stock
          </span>
        )}
        {product.availabilityStatus === "Low Stock" && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            Low Stock
          </span>
        )}
        {showMrp && product.discountPercentage > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="h-4 w-4" />
      </button>

      {/* Product image with thumbnail dots */}
      <Link
        href={`/products/${encodeURIComponent(product.id)}${product.preVariantId ? `?variantId=${product.preVariantId}` : ""}`}
        className="block relative aspect-square overflow-hidden"
      >
        <Image
          src={displayImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Image switcher dots (only if multiple images) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {allImages.slice(0, 5).map((_, i) => (
              <button
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/60"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIdx(i);
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip on hover */}
        {allImages.length > 1 && (
          <div className="absolute inset-x-0 top-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1">
            {allImages.slice(0, 4).map((img, i) => (
              <button
                key={i}
                className={`relative flex-1 h-1 rounded-full transition-all ${i === imgIdx ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIdx(i);
                }}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="p-3">
        <Link href={`/products/${encodeURIComponent(product.id)}${product.preVariantId ? `?variantId=${product.preVariantId}` : ""}`}>
          <h3 className="font-medium text-sm mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2 gap-1 flex-wrap">
          {(product.reviewCount ?? 0) > 0 ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                    }`}
                />
              ))}
              <span className="ml-0.5 text-xs">
                {product.rating.toFixed(1)}{" "}
                <span className="text-muted-foreground text-[10px]">({product.reviewCount})</span>
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">Be the first to review</span>
          )}
          {product.stock != null && (
            <span className={`ml-1 text-[10px] font-medium ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-bold text-base">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {showMrp && product.mrp != null && (
            <span className="text-xs text-gray-500 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {showMrp && product.discountPercentage > 0 && (
            <span className="text-xs font-semibold text-red-500">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Variant label badge */}
        {product.variantTitle && (
          <div className="mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {product.variantTitle}
            </span>
          </div>
        )}

        {/* Hover actions */}
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={adding}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {adding ? "Adding…" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
