"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { ArrowLeft, CreditCard, Clock, Package, Star, Store, User, MessageSquare } from "lucide-react";
import { fetchOrders, fetchProductById, fetchProductReviews, submitReview, updateReview } from "@/lib/api";
import type { ApiOrder, ApiOrderItem, ApiProduct } from "@/types/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function getStatusVariant(status: string) {
  if (status === "DELIVERED" || status === "CONFIRMED") return "default";
  if (status === "CANCELLED" || status === "FAILED") return "destructive";
  return "secondary";
}

function formatStatus(status?: string) {
  return (status ?? "CREATED").replace(/_/g, " ");
}

function getVendorName(order: ApiOrder): string {
  if (order.vendorId && typeof order.vendorId === "object" && "name" in order.vendorId) {
    return order.vendorId.name || "Unknown Vendor";
  }
  const franchise = (order as any).franchise;
  if (franchise && typeof franchise === "object") {
    return franchise.name || franchise.businessName || "Unknown Vendor";
  }
  return "Unknown Vendor";
}

function getCustomerName(order: ApiOrder): string {
  if (order.customerId && typeof order.customerId === "object" && "fullName" in order.customerId) {
    return order.customerId.fullName || "Customer";
  }
  return "Customer";
}

function getOrderItemTitle(item: ApiOrderItem): string {
  const name = (item as any).productName || (item as any).product?.title || (item as any).product?.name;
  if (name) return name;

  const variant = item.variantId && typeof item.variantId === "object" ? item.variantId : null;
  const variantProduct = variant?.productId;
  if (variantProduct && typeof variantProduct === "object" && "title" in variantProduct) {
    return (variantProduct as ApiProduct).title || "Product";
  }

  const product = item.productId;
  if (product && typeof product === "object" && "title" in product) {
    return (product as ApiProduct).title || "Product";
  }

  return "Product";
}

function getOrderItemSubtitle(item: ApiOrderItem): string | null {
  const variant = item.variantId && typeof item.variantId === "object" ? item.variantId : null;
  if (!variant) return null;

  if (variant.explicitAttributes?.length) {
    return variant.explicitAttributes
      .map((a) => `${a.label}: ${a.value}`)
      .join(" | ");
  }

  if (variant.title) return variant.title;
  return null;
}

function getOrderItemProductId(item: ApiOrderItem): string | undefined {
  const fromProduct =
    typeof item.productId === "string"
      ? item.productId
      : (item.productId as { _id?: string } | undefined)?._id;
  if (fromProduct) return fromProduct;
  const variant = item.variantId && typeof item.variantId === "object" ? item.variantId : null;
  const fromVariantProduct =
    typeof variant?.productId === "string"
      ? variant.productId
      : (variant?.productId as { _id?: string } | undefined)?._id;
  return fromVariantProduct;
}

function getOrderItemImage(item: ApiOrderItem, fallbackProduct?: ApiProduct): string {
  const img = (item as any).imageUrl || (item as any).product?.thumbnail || (item as any).product?.imageUrl || (item as any).product?.baseImageUrl?.[0];
  if (img) return img;

  const variant = item.variantId && typeof item.variantId === "object" ? item.variantId : null;
  if (Array.isArray(variant?.images) && variant.images.length && typeof variant.images[0] === "string") {
    return variant.images[0];
  }

  const fromProductLike = (p: unknown): string | undefined => {
    if (!p || typeof p !== "object") return undefined;
    const rec = p as Record<string, unknown>;
    const base = rec.baseImageUrl;
    if (Array.isArray(base) && base.length > 0 && typeof base[0] === "string") return base[0];
    if (typeof base === "string" && base) return base;
    if (typeof rec.thumbnail === "string" && rec.thumbnail) return rec.thumbnail;
    if (typeof rec.imageUrl === "string" && rec.imageUrl) return rec.imageUrl;
    if (typeof rec.image === "string" && rec.image) return rec.image;
    return undefined;
  };

  const variantProduct = variant?.productId;
  const variantImage = fromProductLike(variantProduct);
  if (variantImage) return variantImage;

  const product = item.productId;
  const productImage = fromProductLike(product);
  if (productImage) return productImage;

  const fallbackImage = fromProductLike(fallbackProduct);
  if (fallbackImage) return fallbackImage;

  return "https://picsum.photos/seed/gift/400/400";
}

function getOrderItemCount(order: ApiOrder): number {
  return (order.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

function isB2bOrder(order: ApiOrder): boolean {
  const maybeB2b = order as ApiOrder & { isRfqOrder?: boolean; orderType?: string };
  if (maybeB2b.isRfqOrder) return true;

  const orderType = (maybeB2b.orderType ?? "").toLowerCase();
  if (orderType.includes("b2b") || orderType.includes("rfq")) return true;

  const orderNumber = order.orderNumber ?? "";
  return orderNumber.startsWith("ORD-B2B-");
}



function OrderHistoryPageContent() {
  const { status, data: sessionData } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openAuthModal } = useAuthModal();
  const authOpenedRef = useRef(false);
  const [page, setPage] = useState(1);
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [submittingReviewProductId, setSubmittingReviewProductId] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeReviewProduct, setActiveReviewProduct] = useState<{
    productId: string;
    productTitle: string;
    productImage: string;
    orderId: string;
  } | null>(null);
  const [activeRating, setActiveRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    const userId = sessionData?.userId;
    if (!userId || typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(`giftfactory-review-ratings:${userId}`);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Record<string, number>;
      setSelectedRatings((prev) => ({ ...prev, ...parsed, ...prev }));
    } catch {
      // Ignore malformed storage and continue with empty ratings.
    }
  }, [sessionData?.userId]);

  useEffect(() => {
    const userId = sessionData?.userId;
    if (!userId || typeof window === "undefined") return;
    window.localStorage.setItem(`giftfactory-review-ratings:${userId}`, JSON.stringify(selectedRatings));
  }, [selectedRatings, sessionData?.userId]);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({
        message: "Sign in to view your orders",
        callbackUrl: "/orders",
      });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["customer", "orders", page, limit],
    queryFn: () =>
      fetchOrders({
        page,
        limit,
        order: "desc",
      }),
    enabled: status === "authenticated",
  });

  const orders = (res?.data ?? []) as ApiOrder[];
  const meta = res?.meta;
  const productIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach((o) => {
      (o.items ?? []).forEach((it) => {
        const id = getOrderItemProductId(it);
        if (id) ids.add(id);
      });
    });
    return Array.from(ids);
  }, [orders]);
  const productQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["web", "product", id],
      queryFn: () => fetchProductById(id),
      enabled: !!id && status === "authenticated",
    })),
  });
  const reviewQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["web", "product", id, "reviews"],
      queryFn: () => fetchProductReviews(id),
      enabled: !!id && status === "authenticated",
    })),
  });
  const productMap = useMemo(() => {
    const map = new Map<string, ApiProduct>();
    productQueries.forEach((q, i) => {
      const raw = q.data;
      const product = (raw as { data?: ApiProduct } | undefined)?.data;
      if (product?._id && productIds[i]) map.set(productIds[i], product);
    });
    return map;
  }, [productQueries, productIds]);

  const reviewQueriesSerialized = JSON.stringify(
    reviewQueries.map((q) => {
      const reviews = (q.data?.data ?? []) as any[];
      return reviews.map((r) => ({
        id: r._id || r.id,
        rating: Number(r.rating) || 0,
        comment: r.comment,
        cust: typeof r.customerId === "object" ? r.customerId?._id : r.customerId,
        userId: r.userId,
        orderId: r.orderId,
      }));
    })
  );

  const userReviewsMap = useMemo(() => {
    const userId = sessionData?.userId;
    if (!userId) return {} as Record<string, { id: string; rating: number; comment: string }>;

    const next: Record<string, { id: string; rating: number; comment: string }> = {};
    reviewQueries.forEach((query, index) => {
      const productId = productIds[index];
      if (!productId) return;

      const reviews = (query.data?.data ?? []) as Array<{
        _id?: string;
        id?: string;
        rating?: number;
        comment?: string;
        customerId?: string | { _id?: string } | null;
        userId?: string;
        orderId?: string;
      }>;

      const userReviews = reviews.filter((review) => {
        if (typeof review.customerId === "string") return review.customerId === userId;
        if (review.customerId && typeof review.customerId === "object") return review.customerId._id === userId;
        if (typeof review.userId === "string") return review.userId === userId;
        return false;
      });

      userReviews.forEach((review) => {
        const oId = review.orderId;
        const ratingVal = Number(review.rating);
        const rId = review._id || review.id;
        if (oId && !isNaN(ratingVal) && rId) {
          next[`${oId}_${productId}`] = {
            id: rId,
            rating: ratingVal,
            comment: review.comment || "",
          };
        }
      });
    });

    return next;
  }, [productIds, sessionData?.userId, reviewQueriesSerialized]);

  useEffect(() => {
    if (Object.keys(userReviewsMap).length === 0) return;
    setSelectedRatings((prev) => {
      let changed = false;
      const nextRatings = { ...prev };
      for (const key of Object.keys(userReviewsMap)) {
        if (prev[key] !== userReviewsMap[key].rating) {
          nextRatings[key] = userReviewsMap[key].rating;
          changed = true;
        }
      }
      if (!changed) return prev;
      return nextRatings;
    });
  }, [userReviewsMap]);

  const canPrev = page > 1;
  const canNext = page < (meta?.totalPages ?? 1);

  const totalCountLabel = useMemo(() => {
    const count = meta?.count ?? orders.length;
    return `${count} order${count === 1 ? "" : "s"}`;
  }, [meta?.count, orders.length]);

  const handleReviewSubmit = async (productId: string, rating: number, orderId: string, comment?: string) => {
    try {
      setSubmittingReviewProductId(productId);
      if (activeReviewId) {
        await updateReview(activeReviewId, { rating, comment });
        toast.success("Review updated successfully");
      } else {
        await submitReview({ productId, rating, orderId, comment });
        toast.success("Review submitted successfully");
      }
      const ratingKey = `${orderId}_${productId}`;
      setSelectedRatings((prev) => ({ ...prev, [ratingKey]: rating }));
      await queryClient.invalidateQueries({ queryKey: ["web", "product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["web", "product", productId, "reviews"] });
      setReviewDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setSubmittingReviewProductId(null);
    }
  };

  const renderOrderCard = (order: ApiOrder) => {
    const total = order.totalAmount ?? 0;
    const vendorName = getVendorName(order);
    const customerName = getCustomerName(order);
    const paymentStatusText = formatStatus(order.paymentStatus);
    const orderDate = order.createdAt ? new Date(order.createdAt) : null;
    const orderDateStr = orderDate ? orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

    return (
      <Card key={order._id} className="overflow-hidden border border-gray-200 bg-white rounded-xl shadow-xs">
        {/* Order Header Summary */}
        <div className="bg-[#f9fafb] px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
          <div className="space-y-1">
            <Link
              href={`/orders/${order._id}`}
              className="font-bold text-sm sm:text-base text-gray-900 hover:text-primary transition-colors hover:underline"
            >
              {order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order._id.slice(-8).toUpperCase()}`}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {order.createdAt && (
                <span>
                  Ordered on: {orderDateStr}
                </span>
              )}
              <span>•</span>
              <span>Vendor: {vendorName}</span>
              <span>•</span>
              <span>Customer: {customerName}</span>
              {isB2bOrder(order) && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-[10px] h-4 border-primary/40 text-primary py-0 px-1">
                    B2B
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Order Total</p>
              <p className="font-bold text-sm sm:text-base text-gray-950">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold rounded-lg">
              <Link href={`/orders/${order._id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Items List */}
        <div className="divide-y divide-gray-150 bg-white">
          {order.items?.map((item, idx) => {
            const title = getOrderItemTitle(item);
            const subtitle = getOrderItemSubtitle(item);
            const quantity = item.quantity ?? 1;
            const unitPrice = item.price ?? 0;
            const lineTotal = unitPrice * quantity;

            const itemProduct = productMap.get(getOrderItemProductId(item) ?? "");
            const image = getOrderItemImage(item, itemProduct);
            const productId = getOrderItemProductId(item);

            const variantId = item.variantId && typeof item.variantId === "object" ? item.variantId._id : undefined;
            const productUrl = productId
              ? (variantId
                ? `/products/${encodeURIComponent(productId)}?variantId=${variantId}`
                : `/products/${encodeURIComponent(productId)}`)
              : null;

            const isDelivered = order.status === "DELIVERED";
            const isCancelled = order.status === "CANCELLED" || order.status === "FAILED";

            // Determine status display details
            const dotColor = isDelivered ? "bg-emerald-500" : (isCancelled ? "bg-red-500" : "bg-amber-500");
            const statusTitle = isDelivered
              ? `Delivered on ${orderDateStr}`
              : (isCancelled
                ? `Cancelled on ${orderDateStr}`
                : `Ordered on ${orderDateStr}`);

            const statusDesc = isDelivered
              ? "Your item has been delivered"
              : (isCancelled
                ? "Your item was cancelled"
                : `Your item is in progress (Payment: ${paymentStatusText})`);

            const ratingKey = `${order._id}_${productId}`;
            const selectedRating = selectedRatings[ratingKey] ?? 0;

            return (
              <div
                key={`${order._id}-item-${idx}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-gray-50/30 transition-colors"
              >
                {/* Left: Product Image & Details */}
                <div className="flex gap-4 items-start min-w-0 flex-1">
                  {productUrl ? (
                    <Link
                      href={productUrl}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-50 group block"
                    >
                      <img src={image} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      {quantity > 1 && (
                        <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                          x{quantity}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-50">
                      <img src={image} alt={title} className="object-cover w-full h-full" />
                      {quantity > 1 && (
                        <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                          x{quantity}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-950 line-clamp-2 leading-snug">
                      {productUrl ? (
                        <Link href={productUrl} className="hover:text-primary hover:underline">
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </h4>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Middle: Price */}
                <div className="shrink-0 sm:w-24 text-left sm:text-center">
                  <span className="font-bold text-sm sm:text-base text-gray-900">₹{lineTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Right: Status & Actions */}
                <div className="w-full sm:w-64 flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <span className="font-bold text-sm text-gray-900">{statusTitle}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{statusDesc}</p>

                  {isDelivered && productId && (
                    <button
                      type="button"
                      onClick={() => {
                        const ratingKey = `${order._id}_${productId}`;
                        const existing = userReviewsMap[ratingKey];
                        setActiveReviewProduct({
                          productId: productId || "",
                          productTitle: title,
                          productImage: image,
                          orderId: order._id,
                        });
                        setActiveRating(selectedRating || 5);
                        setCommentText(existing?.comment || "");
                        setActiveReviewId(existing?.id || null);
                        setReviewDialogOpen(true);
                      }}
                      className="flex items-center gap-1.5  font-semibold  text-xs sm:text-sm mt-1 focus:outline-none cursor-pointer"
                    >
                      <Star className="h-4 w-4 text-pink-600 shrink-0" />
                      <p className="text-pink-600">Rate & Review Product</p>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  if (isError) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 text-center text-destructive">
        Error loading orders
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">You haven&apos;t placed any orders yet.</p>
            <Button asChild className="rounded-full px-8">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      <div className="rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">My Orders</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Sorted by latest ({totalCountLabel})</p>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-6">
          <div className="space-y-4">
            {orders.map((order) => renderOrderCard(order))}
          </div>
        </div>

        {(meta?.totalPages ?? 1) > 1 && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">Page {meta?.page ?? page} of {meta?.totalPages ?? 1}</p>
            <Button variant="outline" size="sm" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
      {/* Review Dialog with comment field */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-background border border-border shadow-xl">
          {activeReviewProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReviewSubmit(
                  activeReviewProduct.productId,
                  activeRating,
                  activeReviewProduct.orderId,
                  commentText
                );
              }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {activeReviewId ? "Edit Product Review" : "Write a Product Review"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Share your experience with this item.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Product Detail */}
                <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-muted shrink-0">
                    <Image
                      src={activeReviewProduct.productImage}
                      alt={activeReviewProduct.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Reviewing product:</p>
                    <p className="text-xs font-semibold truncate text-foreground">{activeReviewProduct.productTitle}</p>
                  </div>
                </div>

                {/* Stars selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Rating *</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const active = hoverRating !== null ? hoverRating >= val : activeRating >= val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setActiveRating(val)}
                          onMouseEnter={() => setHoverRating(val)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 ${active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold ml-2 text-muted-foreground">
                      {activeRating} Star{activeRating > 1 && "s"}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="orders-review-comment" className="text-sm font-semibold">
                    Review Comment
                  </Label>
                  <Textarea
                    id="orders-review-comment"
                    placeholder="What did you like or dislike? Write your review here..."
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="rounded-xl focus-visible:ring-primary/20 resize-none text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  className="rounded-xl h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReviewProductId === activeReviewProduct.productId}
                  className="bg-[#cc176b] hover:bg-[#cc176b]/95 text-white rounded-xl h-10 px-5 font-semibold"
                >
                  {submittingReviewProductId === activeReviewProduct.productId
                    ? "Saving..."
                    : activeReviewId
                      ? "Update Review"
                      : "Submit Review"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersPageFallback() {
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrderHistoryPageContent />
    </Suspense>
  );
}
