"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { CheckoutForm } from "@/components/form/checkout-form";
import { OrderSummary } from "@/components/sections";
import { fetchCart, fetchProductById, productQueryKey, PRODUCT_STALE_TIME_MS } from "@/lib/api";
import type { ApiCoupon } from "@/lib/api";
import type { ApiCart, ApiProduct } from "@/types/api";

function buildBuyNowCart(productId: string | undefined, variantId: string | undefined, quantity: number, price: number): ApiCart[] {
  return [
    {
      _id: "buy-now",
      customerId: "buy-now",
      items: [
        {
          // include both productId (if available) and variantId (preferred)
          productId: productId || "",
          variantId: variantId,
          quantity,
          priceAtAddition: price,
        },
      ],
      itemsCount: quantity,
      totalAmount: quantity * price,
    },
  ];
}

function CheckoutPageContent() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCoupon | null>(null);
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get("productId");
  const buyNowVariantId = searchParams.get("variantId");
  const buyNowQuantity = Math.max(1, parseInt(searchParams.get("quantity") ?? "1", 10));
  const buyNowPrice = parseFloat(searchParams.get("price") ?? "0");
  const cartIdParam = searchParams.get("cartId");

  const isBuyNow = (!!buyNowProductId || !!buyNowVariantId) && buyNowPrice > 0;

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({
        message: "Sign in to complete checkout",
        callbackUrl: "/checkout",
      });
      router.replace("/cart");
    }
  }, [status, openAuthModal, router]);

  const { data: cartRes, isLoading: cartLoading } = useQuery({
    queryKey: ["customer", "cart"],
    queryFn: () => fetchCart(),
    enabled: status === "authenticated" && !isBuyNow,
  });

  const carts: ApiCart[] = useMemo(() => {
    if (isBuyNow) {
      return buildBuyNowCart(buyNowProductId ?? undefined, buyNowVariantId ?? undefined, buyNowQuantity, buyNowPrice);
    }
    const list = (cartRes?.data ?? []) as ApiCart[];
    if (cartIdParam) {
      const found = list.find((c) => c._id === cartIdParam);
      return found ? [found] : list;
    }
    return list;
  }, [isBuyNow, buyNowProductId, buyNowVariantId, buyNowQuantity, buyNowPrice, cartRes?.data, cartIdParam]);
  const singleCartId = !isBuyNow && carts.length === 1 ? carts[0]._id : undefined;

  const productIds = useMemo(() => {
    const set = new Set<string>();
    carts.forEach((cart) =>
      cart.items?.forEach((item) => {
        if (typeof item.productId === "string" && item.productId) set.add(item.productId);
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

  const totalItems = carts.reduce((sum, c) => sum + (c.itemsCount ?? c.items?.length ?? 0), 0);
  const isEmpty = !isBuyNow && totalItems === 0;
  const isLoading = status === "authenticated" && !isBuyNow && cartLoading;

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 py-6 sm:py-10 xl:max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_min(20rem,38vw)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
              <div className="space-y-4">
                <div className="h-28 bg-muted rounded-xl" />
                <div className="h-48 bg-muted rounded-xl" />
                <div className="h-40 bg-muted rounded-xl" />
              </div>
              <div className="h-72 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 py-6 sm:py-10 xl:max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_min(20rem,38vw)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10 items-start">
          {/* Form — left column */}
          <div className="min-w-0">
            <CheckoutForm
              carts={carts}
              cartId={singleCartId}
              productMap={productMap}
              appliedCoupon={appliedCoupon}
              onCouponChange={setAppliedCoupon}
            />
          </div>

          {/* Order summary — right column, sticky from tablet (clears sticky header) */}
          <div className="min-w-0 md:sticky md:top-28 md:self-start lg:top-32">
            <OrderSummary carts={carts} productMap={productMap} appliedCoupon={appliedCoupon} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30">
          <div className="container mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 py-6 sm:py-10 xl:max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-40 bg-muted rounded-lg" />
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_min(20rem,38vw)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
                <div className="space-y-4">
                  <div className="h-28 bg-muted rounded-xl" />
                  <div className="h-48 bg-muted rounded-xl" />
                  <div className="h-40 bg-muted rounded-xl" />
                </div>
                <div className="h-72 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
