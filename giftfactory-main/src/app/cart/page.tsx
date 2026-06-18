"use client";

import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchCart, fetchProductById, updateCartItem, removeCartItem, productQueryKey, PRODUCT_STALE_TIME_MS, updateGuestCartItemApi, updateGuestCartItemAltApi, removeGuestCartItem, fetchGuestCart, fetchProductRecommended, fetchGuestCartsList, deleteGuestCartComplete } from "@/lib/api";
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, type GuestCartItem, getGuestCartId, saveGuestCart, saveGuestCartId } from "@/lib/guest-cart";
import type { ApiCart, ApiCartItem, ApiProduct, ApiProductVariant, ApiResponse } from "@/types/api";
import { mapApiProductToDisplay } from "@/types/api";
import { toast } from "sonner";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { Trash2, Minus, Plus, ShoppingBag, Truck, ShieldCheck, ArrowRight, Lock, Percent, Sparkles, Loader2, Award, Gift, ArrowUpRight, ChevronDown } from "lucide-react";

/** Get first image URL from product (handles various API shapes) */
function getProductImageUrl(p: Record<string, unknown>): string {
  const base = p.baseImageUrl;
  if (Array.isArray(base) && base.length > 0 && typeof base[0] === "string") return base[0];
  if (typeof base === "string" && base) return base;
  const img = p.imageUrl ?? p.image ?? p.thumbnail;
  if (typeof img === "string" && img) return img;
  if (Array.isArray(img) && img.length > 0 && typeof img[0] === "string") return img[0];
  return "";
}

function getProductDisplay(item: ApiCartItem): { id: string; title: string; thumbnail: string } | null {
  const p = item.productId;
  if (typeof p === "object" && p !== null && "title" in p) {
    const product = p as ApiProduct & Record<string, unknown>;
    const display = mapApiProductToDisplay(p as ApiProduct);
    const thumb = getProductImageUrl(product) || display.thumbnail || "";
    return {
      id: display.id,
      title: display.title || "Product",
      thumbnail: thumb.trim() || "https://picsum.photos/seed/gift/400/400",
    };
  }
  const id = typeof p === "string" ? p : (p as Record<string, unknown>)?.id ?? (p as Record<string, unknown>)?._id ?? "";
  if (id) return { id: String(id), title: "Product", thumbnail: "https://picsum.photos/seed/gift/400/400" };
  return null;
}

function CartItemImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const effectiveSrc = error || !src ? "https://picsum.photos/seed/gift/400/400" : src;
  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      onError={() => setError(true)}
    />
  );
}

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 text-green-600">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-[15px] leading-none select-none">
          {i < rounded ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function getDeliveryDateString(): string {
  const deliveryDate = new Date();
  // Est delivery in 3 days
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  return deliveryDate.toLocaleDateString("en-US", options);
}

export default function CartPage() {
  const { status, data: session } = useSession();
  const queryClient = useQueryClient();
  const { openAuthModal } = useAuthModal();

  // ── Guest cart (unauthenticated) ──────────────────────────────────────────
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  useEffect(() => {
    setGuestItems(getGuestCart());
  }, []);

  const guestCartId = getGuestCartId();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: status === "authenticated" ? ["customer", "cart"] : ["guest", "cart", guestCartId],
    queryFn: async (): Promise<ApiResponse<ApiCart[]>> => {
      if (status === "authenticated") {
        return fetchCart();
      }
      
      let resolvedCartId = guestCartId;
      if (!resolvedCartId) {
        try {
          const listRes = await fetchGuestCartsList();
          const activeCarts = listRes?.data ?? listRes;
          if (Array.isArray(activeCarts) && activeCarts.length > 0) {
            const activeCart = activeCarts.find(
              (c: any) => !c.status || c.status.toLowerCase() === "active"
            );
            if (activeCart) {
              resolvedCartId = activeCart._id;
              if (resolvedCartId) {
                saveGuestCartId(resolvedCartId);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch guest carts list:", err);
        }
      }

      if (!resolvedCartId) {
        return { data: [] };
      }

      const response = await fetchGuestCart(resolvedCartId);
      const cartData = response?.data ?? response;
      return {
        ...response,
        data: cartData ? [cartData as ApiCart] : [],
      };
    },
    enabled: status === "authenticated" || status === "unauthenticated",
    staleTime: 0,
    refetchOnMount: true,
  });

  // Only show active carts with items — filter out abandoned/empty ones
  const carts = useMemo(() => {
    return ((res?.data ?? []) as ApiCart[]).filter(
      (c) =>
        (!c.status || c.status.toLowerCase() === "active") &&
        ((c.itemsCount ?? 0) > 0 || (c.items && c.items.length > 0))
    );
  }, [res]);

  const productIds = useMemo(() => {
    const set = new Set<string>();
    if (status === "authenticated") {
      carts.forEach((cart) =>
        cart.items?.forEach((item) => {
          const id =
            typeof item.productId === "object" && item.productId && "_id" in item.productId
              ? (item.productId as { _id: string })._id
              : typeof item.productId === "string"
                ? item.productId
                : "";
          if (id) set.add(id);
        })
      );
    } else {
      guestItems.forEach((item) => {
        if (item.productId) set.add(item.productId);
      });
    }
    return Array.from(set);
  }, [carts, guestItems, status]);

  const productQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: productQueryKey(id),
      queryFn: () => fetchProductById(id),
      enabled: !!id,
      staleTime: PRODUCT_STALE_TIME_MS,
    })),
  });
  const productMap = useMemo(() => {
    const map = new Map<string, ApiProduct>();
    productQueries.forEach((q, i) => {
      const raw = q.data;
      const product = (raw as { data?: ApiProduct })?.data ?? (raw as ApiProduct);
      if (product?._id && productIds[i]) map.set(productIds[i], product);
    });
    return map;
  }, [productQueries, productIds]);

  const guestTotal = useMemo(() => {
    return guestItems.reduce((sum, item) => {
      const fetchedProduct = item.productId ? productMap.get(item.productId) : undefined;
      const variantObj = fetchedProduct?.variantIds?.find((v) => v._id === item.variantId);
      
      const basePrice = fetchedProduct
        ? (fetchedProduct.price?.sellingPrice ?? fetchedProduct.defaultPrice ?? 0)
        : item.priceAtAddition;
        
      const price = variantObj?.price?.sellingPrice ?? basePrice;
      return sum + price * item.quantity;
    }, 0);
  }, [guestItems, productMap]);

  const updateGuest = (productId: string, variantId: string | undefined, quantity: number) => {
    updateGuestCartItem(productId, variantId, quantity);
    const updatedItems = getGuestCart();
    setGuestItems(updatedItems);

    const cartId = getGuestCartId();
    if (cartId) {
      const item = updatedItems.find(
        (i) => i.productId === productId && (!variantId || i.variantId === variantId)
      );
      const dbItemId = item?.id || productId;

      const payload = { itemId: dbItemId, quantity };
      updateGuestCartItemApi(cartId, payload).catch((err) => {
        console.error("Failed to sync guest cart item via standard endpoint:", err);
      });
      updateGuestCartItemAltApi(cartId, payload).catch((err) => {
        console.error("Failed to sync guest cart item via alt endpoint:", err);
      });
    }
  };
  const removeGuest = (productId: string, variantId: string | undefined) => {
    const targetItem = guestItems.find(
      (i) => i.productId === productId && (!variantId || i.variantId === variantId)
    );
    const dbItemId = targetItem?.id || productId;

    removeFromGuestCart(productId, variantId);
    const updatedItems = getGuestCart();
    setGuestItems(updatedItems);

    const cartId = getGuestCartId();
    if (cartId) {
      if (updatedItems.length === 0) {
        deleteGuestCartComplete(cartId)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["guest", "cart"] });
          })
          .catch((err) => {
            console.error("Failed to delete guest cart from backend:", err);
          });
      } else {
        removeGuestCartItem(cartId, { itemId: dbItemId }).catch((err) => {
          console.error("Failed to remove guest cart item from backend:", err);
        });
      }
    }
    toast.success("Item removed");
  };

  // Recommended products for empty state
  const { data: recRes, isLoading: recLoading } = useQuery({
    queryKey: ["web", "products", "recommended", "cart-empty"],
    queryFn: () => fetchProductRecommended({ limit: 4 }),
    staleTime: 10 * 60_000,
  });
  const recommendedProducts = (recRes?.data?.products ?? []) as ApiProduct[];

  useEffect(() => {
    if (status !== "authenticated" && res?.data) {
      const cartData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (cartData?.items) {
        const localItems = getGuestCart();
        const mappedItems: GuestCartItem[] = cartData.items.map((item: any) => {
          const p = item.productId;
          const productId = typeof p === "object" ? p?._id ?? p?.id : p;
          
          const resolvedVariantId = typeof item.variantId === "object" && item.variantId
            ? item.variantId?._id
            : item.variantId;

          const localItem = localItems.find(
            (li) => li.productId === productId && (li.variantId === resolvedVariantId)
          );

          const title = typeof p === "object" ? p?.title : (localItem?.title ?? undefined);
          const thumbnail = typeof p === "object" ? p?.thumbnail : (localItem?.thumbnail ?? undefined);
          const priceAtAddition = item.priceAtAddition || (localItem?.priceAtAddition ?? 0);

          return {
            id: item._id ?? item.id,
            productId,
            variantId: resolvedVariantId,
            quantity: item.quantity,
            priceAtAddition,
            title,
            thumbnail,
          };
        });
        setGuestItems(mappedItems);
        saveGuestCart(mappedItems);
      }
    }
  }, [res, status]);

  const updateMutation = useMutation({
    mutationFn: ({
      cartId,
      itemId,
      quantity,
    }: { cartId: string; itemId: string; quantity: number }) =>
      updateCartItem(cartId, { itemId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
    },
    onError: () => toast.error("Failed to update"),
  });
  const removeMutation = useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string }) =>
      removeCartItem(cartId, { itemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
      toast.success("Item removed");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const deliveryStr = getDeliveryDateString();

  // Loading state (Premium Skeleton)
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
        <p className="text-gray-400 font-semibold animate-pulse">Loading your premium shopping bag...</p>
      </div>
    );
  }

  const isCartEmpty = status === "authenticated" ? carts.length === 0 : guestItems.length === 0;

  // Render Empty State
  if (isCartEmpty) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Empty Bag Graphic */}
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-gray-50/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.04),transparent_50%)]" />
          <div className="relative z-10 max-w-md mx-auto space-y-5">
            <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 shadow-md">
              <ShoppingBag className="h-10 w-10 text-pink-500" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h1>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                Looks like you haven't added anything to your cart yet. Explore our latest custom gifts and collections!
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 cursor-pointer border-none h-12">
              <Link href="/products" className="flex items-center gap-2">
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Empty State Product Recommendations */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              <h2 className="text-xl font-extrabold text-gray-900">Trending Gifts You'll Love</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => {
                const price = product.price?.sellingPrice ?? product.defaultPrice;
                const img = product.thumbnail ?? product.baseImageUrl?.[0];
                return (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="group border border-gray-100 rounded-3xl bg-white p-3 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-50">
                      {img ? (
                        <img
                          src={img}
                          alt={product.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-gray-300 m-auto mt-12" />
                      )}
                    </div>
                    <div className="mt-3 space-y-1 flex-1 flex flex-col justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-pink-500 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        {price != null && (
                          <span className="text-sm font-bold text-pink-600">₹{price.toLocaleString("en-IN")}</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-pink-500 transition-colors">
                          View details <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Calculated totals (authenticated)
  const totalItems = carts.reduce((sum, c) => sum + (c.itemsCount ?? c.items?.length ?? 0), 0);
  const grandTotal = status === "authenticated"
    ? carts.reduce((sum, c) => {
      if (c.totalAmount != null) return sum + Number(c.totalAmount);
      const itemsSum = c.items?.reduce((s, item) => s + (item.priceAtAddition ?? 0) * (item.quantity ?? 1), 0) ?? 0;
      return sum + itemsSum;
    }, 0)
    : guestTotal;

  const activeTotalItems = status === "authenticated" ? totalItems : guestItems.length;

  // Free shipping variables
  const shippingThreshold = 1500;
  const progressPercent = Math.min(100, (grandTotal / shippingThreshold) * 100);
  const neededAmount = Math.max(0, shippingThreshold - grandTotal);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-8 w-8 text-pink-500" />
            Shopping Bag
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Review and checkout the products in your shopping bag.
          </p>
        </div>
        <Link
          href="/products"
          className="text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1.5 group"
        >
          &larr; Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (70% width) */}
        <div className="lg:col-span-8 space-y-6">




          {/* List Section */}
          <div className="space-y-6">
            {/* Authenticated Items */}
            {status === "authenticated" ? (
              carts.map((cart, cartIdx) => (
                <div
                  key={cart._id}
                  className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-3xl p-6 shadow-xl shadow-gray-200/40 space-y-4"
                >
                  {carts.length > 1 && (
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                      <Gift className="h-4 w-4 text-pink-500" />
                      <h2 className="text-sm font-bold text-gray-800">
                        Vendor Group #{cartIdx + 1}
                      </h2>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100/60">
                    {cart.items?.map((item, itemIndex) => {
                      const productId =
                        typeof item.productId === "object" && item.productId && "_id" in item.productId
                          ? (item.productId as { _id: string })._id
                          : typeof item.productId === "string"
                            ? item.productId
                            : (item.productId as ApiProduct)?._id ?? "";
                      const display = getProductDisplay(item);
                      const fetchedProduct = productId ? productMap.get(productId) : undefined;

                      const productInfo = fetchedProduct
                        ? (() => {
                          const p = fetchedProduct as ApiProduct & Record<string, unknown>;
                          const d = mapApiProductToDisplay(fetchedProduct);
                          const thumb = getProductImageUrl(p) || d.thumbnail || "";
                          return {
                            id: d.id,
                            title: d.title,
                            thumbnail: thumb.trim() || "https://picsum.photos/seed/gift/400/400",
                          };
                        })()
                        : display;

                      const variantObj =
                        item.variantId && typeof item.variantId === "object"
                          ? (item.variantId as { _id?: string; title?: string; sku?: string; price?: { sellingPrice?: number } })
                          : null;
                      const variantTitle = variantObj?.title ?? null;
                      const variantSku = variantObj?.sku ?? null;
                      const variantIdStr = variantObj?._id
                        ?? (typeof item.variantId === "string" ? item.variantId : null);
                      const productHref = productId
                        ? `/products/${productId}${variantIdStr ? `?variantId=${variantIdStr}` : ""}`
                        : "#";

                      const price = item.priceAtAddition ?? 0;
                      const qty = item.quantity ?? 1;

                      // Calculations for discount matching screenshot
                      const mrp = fetchedProduct?.mrp || fetchedProduct?.price?.mrp || price * 1.5;
                      const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                      const subDesc = variantTitle || fetchedProduct?.sub_title || "Premium Custom Design, Best Quality Handcrafted Gift";

                      return (
                        <div
                          key={`${cart._id}-${productId}-${itemIndex}`}
                          className="flex gap-5 items-start py-6 first:pt-0 last:pb-0 relative"
                        >
                          {/* Left layout: Image + dropdown Qty */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <Link
                              href={productHref}
                              className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl border border-gray-200 bg-white block shadow-sm"
                            >
                              <CartItemImage
                                src={productInfo?.thumbnail ?? "https://picsum.photos/seed/gift/400/400"}
                                alt={productInfo?.title ?? "Product"}
                              />
                            </Link>

                            {/* Dropdown Qty */}
                            <div className="mt-3 relative w-20 sm:w-24">
                              <select
                                value={qty}
                                onChange={(e) => {
                                  const newQty = Number(e.target.value);
                                  const resolvedCartId = cart._id ?? (cart as any).id;
                                  const itemId = item._id ?? item.id ?? "";
                                  updateMutation.mutate({
                                    cartId: resolvedCartId,
                                    itemId,
                                    quantity: newQty,
                                  });
                                }}
                                disabled={updateMutation.isPending}
                                className="appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-2.5 py-1.5 pr-6 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer shadow-sm"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                                  <option key={q} value={q}>
                                    Qty: {q}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-400">
                                <ChevronDown className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* Right layout: Title, ratings, prices, WOW promo, etc. */}
                          <div className="flex-1 min-w-0 space-y-1.5 pr-12">
                            <p className="font-semibold text-gray-950 text-sm sm:text-base leading-snug line-clamp-2">
                              <Link href={productHref} className="hover:text-pink-500 transition-colors">
                                {productInfo?.title ?? "Product"}
                              </Link>
                            </p>

                            {/* Sub description */}
                            <p className="text-[11px] text-gray-400 font-bold leading-normal">
                              {subDesc}
                            </p>

                            {/* Green Star rating */}
                            <div className="flex items-center gap-1.5">
                              {renderStars(Number(fetchedProduct?.averageRating || 4.0))}
                              <span className="text-xs font-extrabold text-green-600">
                                {Number(fetchedProduct?.averageRating || 4.0).toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400 font-bold">
                                &middot; ({(fetchedProduct?.commentCount || 5568).toLocaleString()})
                              </span>
                            </div>

                            {/* Pricing Section */}
                            <div className="flex items-center gap-2 pt-1">
                              {discountPercent > 0 && (
                                <span className="text-green-600 font-extrabold text-sm flex items-center gap-0.5 select-none">
                                  &darr;{discountPercent}%
                                </span>
                              )}
                              {mrp > price && (
                                <span className="text-gray-400 line-through text-sm font-semibold">
                                  ₹{Math.round(mrp).toLocaleString()}
                                </span>
                              )}
                              <span className="text-gray-900 font-black text-base">
                                ₹{price.toLocaleString()}
                              </span>
                            </div>

                            {/* WOW promo row
                            <div className="flex items-center gap-1.5">
                              <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded italic text-[9px] tracking-wide shadow-sm scale-95 origin-left select-none">
                                WOW!
                              </span>
                              <span className="text-blue-700 font-black text-xs">
                                Buy at ₹{Math.round(price * 0.95).toLocaleString()}
                              </span>
                            </div> */}

                            {/* Protect promise row
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <span>+ ₹36 Protect Promise Fee</span>
                              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-50 border border-gray-300 text-[9px] font-bold text-gray-400 cursor-help hover:bg-gray-100 transition-colors select-none">
                                i
                              </span>
                            </div> */}

                            {/* Delivery Date */}
                            <p className="text-[11px] font-bold text-gray-800 pt-2">
                              Delivery by {deliveryStr}
                            </p>

                            {/* Remove button at top-right */}
                            <button
                              type="button"
                              onClick={() => {
                                const resolvedCartId = cart._id ?? (cart as any).id;
                                const itemId = item._id ?? item.id ?? "";
                                removeMutation.mutate({ cartId: resolvedCartId, itemId });
                              }}
                              disabled={removeMutation.isPending}
                              className="absolute top-4 right-2 text-[10px] sm:text-xs font-bold text-pink-500 hover:text-pink-600 border border-pink-200 hover:border-pink-400 bg-white hover:bg-pink-50/50 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              /* Guest Items */
              <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/40 divide-y divide-gray-100/60">
                {guestItems.map((item, idx) => {
                  const fetchedProduct = item.productId ? productMap.get(item.productId) : undefined;
                  
                  const productInfo = fetchedProduct
                    ? (() => {
                      const p = fetchedProduct as ApiProduct & Record<string, unknown>;
                      const d = mapApiProductToDisplay(fetchedProduct);
                      const thumb = getProductImageUrl(p) || d.thumbnail || "";
                      return {
                        id: d.id,
                        title: d.title,
                        thumbnail: thumb.trim() || "https://picsum.photos/seed/gift/400/400",
                      };
                    })()
                    : {
                      id: item.productId,
                      title: item.title ?? "Product",
                      thumbnail: item.thumbnail ?? "https://picsum.photos/seed/gift/400/400",
                    };

                  const variantObj = fetchedProduct?.variantIds?.find(
                    (v) => v._id === item.variantId
                  );
                  
                  const basePrice = fetchedProduct
                    ? (fetchedProduct.price?.sellingPrice ?? fetchedProduct.defaultPrice ?? 0)
                    : item.priceAtAddition;
                    
                  const baseMrp = fetchedProduct
                    ? (fetchedProduct.price?.mrp ?? fetchedProduct.mrp ?? basePrice * 1.5)
                    : item.priceAtAddition * 1.5;

                  const price = variantObj?.price?.sellingPrice ?? basePrice;
                  const mrp = variantObj?.price?.mrp ?? baseMrp;
                  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 33;
                  const subDesc = variantObj?.title ?? fetchedProduct?.sub_title ?? "Premium Custom Design, Best Quality Handcrafted Gift";

                  return (
                    <div
                      key={`${item.productId}-${item.variantId ?? idx}`}
                      className="flex gap-5 items-start py-6 first:pt-0 last:pb-0 relative"
                    >
                      {/* Left layout: Image + Qty select */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl border border-gray-200 bg-white block shadow-sm"
                        >
                          <CartItemImage src={productInfo.thumbnail} alt={productInfo.title} />
                        </Link>

                        {/* Qty Dropdown */}
                        <div className="mt-3 relative w-20 sm:w-24">
                          <select
                            value={item.quantity}
                            onChange={(e) => updateGuest(item.productId, item.variantId, Number(e.target.value))}
                            className="appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-2.5 py-1.5 pr-6 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer shadow-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                              <option key={q} value={q}>
                                Qty: {q}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-400">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Right layout: Details */}
                      <div className="flex-1 min-w-0 space-y-1.5 pr-12">
                        <p className="font-semibold text-gray-950 text-sm sm:text-base leading-snug line-clamp-2">
                          <Link href={`/products/${item.productId}`} className="hover:text-pink-500 transition-colors">
                            {productInfo.title}
                          </Link>
                        </p>

                        <p className="text-[11px] text-gray-400 font-bold leading-normal">
                          {subDesc}
                        </p>

                        {/* Stars */}
                        <div className="flex items-center gap-1.5">
                          {renderStars(Number(fetchedProduct?.averageRating || 4.2))}
                          <span className="text-xs font-extrabold text-green-600">
                            {Number(fetchedProduct?.averageRating || 4.2).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400 font-bold">
                            &middot; ({(fetchedProduct?.commentCount || 128).toLocaleString()})
                          </span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-2 pt-1">
                          {discountPercent > 0 && (
                            <span className="text-green-600 font-extrabold text-sm flex items-center gap-0.5 select-none">
                              &darr;{discountPercent}%
                            </span>
                          )}
                          {mrp > price && (
                            <span className="text-gray-400 line-through text-sm font-semibold">
                              ₹{Math.round(mrp).toLocaleString()}
                            </span>
                          )}
                          <span className="text-gray-900 font-black text-base">
                            ₹{price.toLocaleString()}
                          </span>
                        </div>

                        {/* WOW */}
                        <div className="flex items-center gap-1.5">
                          <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded italic text-[9px] tracking-wide shadow-sm scale-95 origin-left select-none">
                            WOW!
                          </span>
                          <span className="text-blue-700 font-black text-xs">
                            Buy at ₹{Math.round(price * 0.95).toLocaleString()}
                          </span>
                        </div>

                        {/* Protect promise row */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <span>+ ₹36 Protect Promise Fee</span>
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-50 border border-gray-300 text-[9px] font-bold text-gray-400 cursor-help hover:bg-gray-100 transition-colors select-none">
                            i
                          </span>
                        </div>

                        {/* Delivery Date */}
                        <p className="text-[11px] font-bold text-gray-800 pt-2">
                          Delivery by {deliveryStr}
                        </p>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeGuest(item.productId, item.variantId)}
                          className="absolute top-4 right-2 text-[10px] sm:text-xs font-bold text-pink-500 hover:text-pink-600 border border-pink-200 hover:border-pink-400 bg-white hover:bg-pink-50/50 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Summary Card (30% width) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

          {/* Guest Sign-in Promotion */}
          {status !== "authenticated" && (
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-500/10 space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="relative z-10 space-y-2">
                <h3 className="font-extrabold text-base flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-yellow-300" />
                  Earn Loyalty Points!
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  Log in before check out to earn up to 150 loyalty reward points on this order and redeem them on your next gift!
                </p>
                <button
                  onClick={() => openAuthModal({ message: "Sign in to earn loyalty points", callbackUrl: "/checkout" })}
                  className="text-xs font-bold bg-white text-indigo-700 px-4 py-2 rounded-xl border-none cursor-pointer shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Log In Now
                </button>
              </div>
            </div>
          )}

          {/* Pricing Summary Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-300    rounded-3xl p-6 shadow-xl shadow-gray-200/40 space-y-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-pink-500" />
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm text-gray-600 border-b border-gray-100 pb-5">
              <div className="flex justify-between items-center">
                <span>Subtotal ({activeTotalItems} items)</span>
                <span className="font-bold text-gray-900">₹{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                {neededAmount === 0 ? (
                  <span className="font-bold text-green-600">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹99</span>
                )}
              </div>
            </div>



            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                <span className="text-base font-extrabold text-gray-800">Grand Total</span>
                <span className="text-xl font-black text-pink-600">₹{(grandTotal + (neededAmount === 0 ? 0 : 99)).toLocaleString()}</span>
              </div>

              {status === "authenticated" ? (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 cursor-pointer border-none flex items-center justify-center gap-2 h-12"
                  size="lg"
                >
                  <Link href={carts.length > 0 ? `/checkout?cartId=${carts[0]._id}` : "/checkout"}>
                    <Lock className="h-4 w-4" /> Proceed to Secure Checkout
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 cursor-pointer border-none flex items-center justify-center gap-2 h-12"
                  onClick={() =>
                    openAuthModal({ message: "Sign in to complete checkout", callbackUrl: "/checkout" })
                  }
                >
                  <Lock className="h-4 w-4" /> Sign In to Checkout
                </Button>
              )}
            </div>

            {/* Security Badges */}
            <div className="border-t border-gray-100 pt-5 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                <div className="h-8 w-8 rounded-xl bg-green-50 flex items-center justify-center border border-green-100/50 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <span>Secure 256-bit SSL encrypted payments</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50 shrink-0">
                  <Truck className="h-4 w-4 text-blue-500" />
                </div>
                <span>Fast dispatch & live package tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
