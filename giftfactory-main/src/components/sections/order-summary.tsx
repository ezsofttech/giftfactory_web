"use client";

import { useState } from "react";
import { ShoppingBag, Truck, Tag } from "lucide-react";
import type { ApiCart, ApiCartItem, ApiProduct } from "@/types/api";
import { mapApiProductToDisplay } from "@/types/api";
import type { ApiCoupon } from "@/lib/api";

function getProductImageUrl(p: Record<string, unknown>): string {
  const base = p.baseImageUrl;
  if (Array.isArray(base) && base.length > 0 && typeof base[0] === "string") return base[0];
  if (typeof base === "string" && base) return base;
  const img = p.imageUrl ?? p.image ?? p.thumbnail;
  if (typeof img === "string" && img) return img;
  if (Array.isArray(img) && img.length > 0 && typeof img[0] === "string") return img[0];
  return "";
}

function getItemDisplay(
  item: ApiCartItem,
  productMap: Map<string, ApiProduct>
): { title: string; thumbnail: string } {
  const productId = typeof item.productId === "string" ? item.productId : (item.productId as ApiProduct)?._id;
  const fromMap = productId ? productMap.get(productId) : undefined;
  if (fromMap) {
    const p = fromMap as ApiProduct & Record<string, unknown>;
    const d = mapApiProductToDisplay(fromMap);
    const thumb = getProductImageUrl(p) || d.thumbnail || "";
    return { title: d.title, thumbnail: thumb.trim() || "https://picsum.photos/seed/gift/400/400" };
  }
  const p = item.productId;
  if (typeof p === "object" && p && "title" in p) {
    const d = mapApiProductToDisplay(p as ApiProduct);
    return { title: d.title, thumbnail: d.thumbnail || "https://picsum.photos/seed/gift/400/400" };
  }
  return { title: "Product", thumbnail: "https://picsum.photos/seed/gift/400/400" };
}

function OrderSummaryItemImage({ src, alt }: { src: string; alt: string }) {
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

interface OrderSummaryProps {
  carts: ApiCart[];
  productMap?: Map<string, ApiProduct>;
  appliedCoupon?: ApiCoupon | null;
}

export function OrderSummary({ carts, productMap = new Map(), appliedCoupon }: OrderSummaryProps) {
  const subtotal = carts.reduce((sum, cart) => {
    if (cart.totalAmount != null) return sum + cart.totalAmount;
    const itemsSum = cart.items?.reduce((s, item) => s + (item.priceAtAddition ?? 0) * (item.quantity ?? 1), 0) ?? 0;
    return sum + itemsSum;
  }, 0);
  const shipping: number = 0;

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min(
          Math.round((subtotal * appliedCoupon.discountValue) / 100),
          appliedCoupon.maxDiscountAmount > 0 ? appliedCoupon.maxDiscountAmount : Infinity
        )
      : Math.min(appliedCoupon.discountValue, appliedCoupon.maxDiscountAmount > 0 ? appliedCoupon.maxDiscountAmount : appliedCoupon.discountValue)
    : 0;

  const total = Math.max(0, subtotal - discountAmount + shipping);

  const allItems: { title: string; thumbnail: string; productId: string | null; quantity: number; price: number }[] = [];
  for (const cart of carts) {
    for (const item of cart.items ?? []) {
      const productId = typeof item.productId === "string" ? item.productId : (item.productId as ApiProduct)?._id ?? null;
      const price = item.priceAtAddition ?? 0;
      const qty = item.quantity ?? 1;
      const display = getItemDisplay(item, productMap);
      allItems.push({
        title: display.title,
        thumbnail: display.thumbnail,
        productId,
        quantity: qty,
        price: price * qty,
      });
    }
  }

  const itemCount = allItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-base">
          Order Summary
        </h2>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items */}
      <div className="max-h-60 divide-y overflow-y-auto sm:max-h-72 md:max-h-[min(28rem,calc(100dvh-14rem))]">
        {allItems.map((item, idx) => (
          <div key={idx} className="flex gap-3 px-5 py-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
              <OrderSummaryItemImage src={item.thumbnail} alt={item.title} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
              <span className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</span>
              <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
            </div>
            <div className="text-sm font-semibold shrink-0 self-center">
              ₹{item.price.toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 space-y-2.5 border-t bg-muted/20">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5 text-green-600">
              <Tag className="h-3.5 w-3.5" />
              Coupon ({appliedCoupon.code})
              {appliedCoupon.discountType === "percentage" && (
                <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  {appliedCoupon.discountValue}% off
                </span>
              )}
            </span>
            <span className="font-medium text-green-600">
              −₹{discountAmount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Shipping
          </span>
          {shipping === 0 ? (
            <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">
              FREE
            </span>
          ) : (
            <span className="font-medium">₹{shipping.toLocaleString("en-IN")}</span>
          )}
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t">
          <span>Total</span>
          <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Secure checkout note */}
      <div className="px-5 py-3 border-t bg-muted/10 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Secure &amp; encrypted checkout
        </p>
      </div>
    </div>
  );
}
