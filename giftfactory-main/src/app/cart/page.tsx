"use client";

import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchCart, fetchProductById, updateCartItem, removeCartItem, productQueryKey, PRODUCT_STALE_TIME_MS, updateGuestCartItemApi, updateGuestCartItemAltApi, fetchGuestCart } from "@/lib/api";
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, type GuestCartItem, getGuestCartId, saveGuestCart } from "@/lib/guest-cart";
import type { ApiCart, ApiCartItem, ApiProduct, ApiProductVariant, ApiResponse } from "@/types/api";
import { mapApiProductToDisplay } from "@/types/api";
import { toast } from "sonner";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

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
      className="h-full w-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function CartPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const { openAuthModal } = useAuthModal();

  // ── Guest cart (unauthenticated) ──────────────────────────────────────────
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  useEffect(() => {
    setGuestItems(getGuestCart());
  }, []);

  const guestTotal = guestItems.reduce((s, i) => s + i.priceAtAddition * i.quantity, 0);

  const updateGuest = (productId: string, variantId: string | undefined, quantity: number) => {
    updateGuestCartItem(productId, variantId, quantity);
    setGuestItems(getGuestCart());

    const cartId = getGuestCartId();
    if (cartId) {
      const payload = { itemId: productId, quantity };
      updateGuestCartItemApi(cartId, payload).catch((err) => {
        console.error("Failed to sync guest cart item via standard endpoint:", err);
      });
      updateGuestCartItemAltApi(cartId, payload).catch((err) => {
        console.error("Failed to sync guest cart item via alt endpoint:", err);
      });
    }
  };
  const removeGuest = (productId: string, variantId: string | undefined) => {
    removeFromGuestCart(productId, variantId);
    setGuestItems(getGuestCart());
    toast.success("Item removed");
  };
  // ─────────────────────────────────────────────────────────────────────────
  const guestCartId = getGuestCartId();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: status === "authenticated" ? ["customer", "cart"] : ["guest", "cart", guestCartId],
    queryFn: async (): Promise<ApiResponse<ApiCart[]>> => {
      if (status === "authenticated") {
        return fetchCart();
      }
      const response = await fetchGuestCart(guestCartId!);
      const cartData = response?.data ?? response;
      return {
        ...response,
        data: cartData ? [cartData as ApiCart] : [],
      };
    },
    enabled: status === "authenticated" || (status === "unauthenticated" && !!guestCartId),
  });

  useEffect(() => {
    if (status !== "authenticated" && res?.data) {
      const cartData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (cartData?.items) {
        const mappedItems: GuestCartItem[] = cartData.items.map((item: any) => {
          const p = item.productId;
          const productId = typeof p === "object" ? p?._id ?? p?.id : p;
          const title = typeof p === "object" ? p?.title : undefined;
          const thumbnail = typeof p === "object" ? p?.thumbnail : undefined;
          return {
            productId,
            variantId: typeof item.variantId === "object" ? item.variantId?._id : item.variantId,
            quantity: item.quantity,
            priceAtAddition: item.priceAtAddition ?? 0,
            title,
            thumbnail,
          };
        });
        setGuestItems(mappedItems);
        saveGuestCart(mappedItems);
      }
    }
  }, [res, status]);

  // Only show active carts with items — filter out abandoned/empty ones
  const carts = ((res?.data ?? []) as ApiCart[]).filter(
    (c) =>
      (!c.status || c.status.toLowerCase() === "active") &&
      ((c.itemsCount ?? 0) > 0 || (c.items && c.items.length > 0))
  );
  const productIds = useMemo(() => {
    const set = new Set<string>();
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
    return Array.from(set);
  }, [carts]);

  const productQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: productQueryKey(id),
      queryFn: () => fetchProductById(id),
      enabled: !!id && status === "authenticated",
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

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    if (guestItems.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="mb-4">Your cart is empty</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{guestItems.length} item(s)</span>
              <span className="font-medium">Subtotal: ₹{guestTotal.toLocaleString()}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {guestItems.map((item, idx) => (
              <div key={`${item.productId}-${item.variantId ?? idx}`} className="flex gap-3 items-start border-b pb-4 last:border-0">
                <Link href={`/products/${item.productId}`} className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted block">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title ?? "Product"} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 m-auto mt-4 text-muted-foreground opacity-40" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base line-clamp-2">
                    <Link href={`/products/${item.productId}`} className="hover:text-primary">
                      {item.title ?? "Product"}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ₹{item.priceAtAddition.toLocaleString()} × {item.quantity} = <span className="font-medium text-foreground">₹{(item.priceAtAddition * item.quantity).toLocaleString()}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8"
                      disabled={item.quantity <= 1}
                      onClick={() => updateGuest(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => updateGuest(item.productId, item.variantId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 ml-auto text-destructive hover:text-destructive"
                      onClick={() => removeGuest(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
          <p className="text-lg font-semibold">Total: ₹{guestTotal.toLocaleString()}</p>
          <div className="flex gap-3 flex-wrap justify-end">
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button
              onClick={() =>
                openAuthModal({ message: "Sign in to complete checkout", callbackUrl: "/checkout" })
              }
            >
              Sign In to Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        Error loading cart
      </div>
    );
  }

  const totalItems = carts.reduce((sum, c) => sum + (c.itemsCount ?? c.items?.length ?? 0), 0);
  const grandTotal = carts.reduce((sum, c) => {
    if (c.totalAmount != null) return sum + c.totalAmount;
    const itemsSum = c.items?.reduce((s, item) => s + (item.priceAtAddition ?? 0) * (item.quantity ?? 1), 0) ?? 0;
    return sum + itemsSum;
  }, 0);

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="mb-4">Your cart is empty</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-6">
        {carts.map((cart) => (
          <Card key={cart._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {cart.items?.length ?? 0} item(s)
                </span>
                <span className="font-medium">
                  Subtotal: ₹{(cart.totalAmount ?? cart.items?.reduce((s, item) => s + (item.priceAtAddition ?? 0) * (item.quantity ?? 1), 0) ?? 0).toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items?.map((item, itemIndex) => {
                const productId =
                  typeof item.productId === "object" && item.productId && "_id" in item.productId
                    ? (item.productId as { _id: string })._id
                    : typeof item.productId === "string"
                      ? item.productId
                      : (item.productId as ApiProduct)?._id ?? "";
                const productSlug =
                  typeof item.productId === "object" && item.productId && "slug" in item.productId
                    ? (item.productId as { slug?: string }).slug
                    : undefined;
                const fromCart = getProductDisplay(item);
                const fetchedProduct = productId ? productMap.get(productId) : undefined;
                const display = fetchedProduct
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
                  : fromCart;

                // Extract populated variant data (API returns variantId as an object)
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

                return (
                  <div
                    key={`${cart._id}-${productId}-${itemIndex}`}
                    className="flex gap-3 items-start border-b pb-4 last:border-0"
                  >
                    <Link
                      href={productHref}
                      className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted block"
                    >
                      <CartItemImage
                        src={display?.thumbnail ?? "https://picsum.photos/seed/gift/400/400"}
                        alt={display?.title ?? "Item"}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base line-clamp-2">
                        {productId ? (
                          <Link href={productHref} className="hover:text-primary">
                            {display?.title ?? "Product"}
                          </Link>
                        ) : (
                          display?.title ?? "Product"
                        )}
                      </p>
                      {(variantTitle || variantSku) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 mb-0.5">
                          {variantTitle && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {variantTitle}
                            </span>
                          )}
                          {variantSku && (
                            <span className="text-[11px] text-muted-foreground">
                              SKU: {variantSku}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ₹{price.toLocaleString()} × {qty} = <span className="font-medium text-foreground">₹{(price * qty).toLocaleString()}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          disabled={qty <= 1 || updateMutation.isPending}
                          onClick={() => {
                            const resolvedCartId = cart._id ?? (cart as any).id;
                            const itemId = item._id ?? item.id ?? "";
                            updateMutation.mutate({
                              cartId: resolvedCartId,
                              itemId,
                              quantity: Math.max(1, qty - 1),
                            });
                          }}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-7 text-center text-sm font-medium">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            const resolvedCartId = cart._id ?? (cart as any).id;
                            const itemId = item._id ?? item.id ?? "";
                            updateMutation.mutate({
                              cartId: resolvedCartId,
                              itemId,
                              quantity: qty + 1,
                            });
                          }}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 ml-auto text-destructive hover:text-destructive"
                          disabled={removeMutation.isPending}
                          onClick={() => {
                            const resolvedCartId = cart._id ?? (cart as any).id;
                            const itemId = item._id ?? item.id ?? "";
                            removeMutation.mutate({ cartId: resolvedCartId, itemId });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <div className="px-6 pb-4 pt-0">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href={`/checkout?cartId=${cart._id}`}>Proceed to checkout</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-6 sticky bottom-0 bg-background py-4 sm:static sm:py-0 sm:bg-transparent">
        <p className="text-lg font-semibold">Total: ₹{grandTotal.toLocaleString()}</p>
        <Button asChild className="w-full sm:w-auto" size="lg">
          <Link href={carts.length > 0 ? `/checkout?cartId=${carts[0]._id}` : "/checkout"}>
            Proceed to checkout
          </Link>
        </Button>
      </div>
    </div>
  );
}
