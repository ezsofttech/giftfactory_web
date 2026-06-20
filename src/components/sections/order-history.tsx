"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Truck, Check } from "lucide-react";
import Link from "next/link";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { fetchOrders } from "@/lib/api";
import type { ApiOrder, ApiProduct } from "@/types/api";
import { mapApiProductToDisplay } from "@/types/api";

const statusIcons: Record<string, React.ReactNode> = {
  PROCESSING: <Package className="h-4 w-4" />,
  PACKED: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  DELIVERED: <Check className="h-4 w-4" />,
  CANCELLED: <Check className="h-4 w-4" />,
  CREATED: <Package className="h-4 w-4" />,
  CONFIRMED: <Package className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  CREATED: "bg-gray-100 text-gray-800",
};

export function OrderHistory() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const { data: res, isLoading } = useQuery({
    queryKey: ["customer", "orders"],
    queryFn: () => fetchOrders({ page: 1, limit: 10 }),
    enabled: status === "authenticated",
  });
  const orders = (res?.data ?? []) as ApiOrder[];

  if (status !== "authenticated") {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Sign in to view your orders</p>
        <Button
          className="rounded-full px-6"
          onClick={() => openAuthModal({ message: "Sign in to view your orders", callbackUrl: "/profile" })}
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 bg-muted/10 rounded-2xl border border-dashed border-border mt-4">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-primary/60" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't placed any orders yet. Start exploring our collection of gifts!
        </p>
        <Button asChild className="rounded-full px-8 h-12 text-base shadow-sm">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <h3 className="text-sm font-semibold text-foreground pb-1 border-b border-border flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" /> Order History
      </h3>
      {orders.map((order) => {
        const firstItem = order.items?.[0];
        const product = firstItem?.productId;
        const displayProduct =
          product && typeof product === "object" && "title" in product
            ? mapApiProductToDisplay(product as ApiProduct)
            : null;
        const total = order.totalAmount ?? 0;
        const status = order.status || "CREATED";

        return (
          <div
            key={order._id}
            className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 hover:border-border/80 transition-colors"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">
                  Order #{order.orderNumber ?? order._id.slice(-6)}
                </h3>
                {order.createdAt && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Placed on {new Date(order.createdAt).toLocaleString("en-IN", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit flex items-center gap-1.5 shrink-0 ${statusColors[status] ?? "bg-muted text-muted-foreground"
                  }`}
              >
                {statusIcons[status]}
                <span>{status.replace(/_/g, " ")}</span>
              </span>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              {order.items?.map((item, index) => {
                const p = item.productId;
                const name =
                  typeof p === "object" && p && "title" in p ? (p as ApiProduct).title : "Product";
                return (
                  <div key={index} className="flex justify-between text-sm gap-2">
                    <div className="min-w-0 truncate">
                      <span className="text-foreground">{name}</span>
                      <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                    </div>
                    <div className="shrink-0 font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                );
              })}
              <div className="flex justify-between font-semibold pt-3 mt-3 border-t border-border">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
