"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, X, Gift, ArrowRight, Copy, Check } from "lucide-react";
import { useActiveAbandonedCart } from "@/store/notification-store";
import { toast } from "sonner";

export function AbandonedCartRecovery() {
  const router = useRouter();
  const { status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only run query if customer is authenticated
  const { data: abandonedCart, isLoading } = useActiveAbandonedCart({
    enabled: status === "authenticated" && !isDismissed,
  });

  useEffect(() => {
    if (!abandonedCart || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Check if user has already dismissed this specific recovery cart in the current session
    const storageKey = `gf_dismissed_cart_recovery_${abandonedCart.id}`;
    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    // Trigger slide-in animation after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [abandonedCart, isDismissed]);

  if (!abandonedCart || !isVisible || isDismissed) {
    return null;
  }

  const { couponCode, id } = abandonedCart;

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Mark as dismissed for the rest of the session
    sessionStorage.setItem(`gf_dismissed_cart_recovery_${id}`, "true");
  };

  const handleCopyCoupon = async () => {
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      setIsCopied(true);
      toast.success("Coupon code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon:", err);
      toast.error("Failed to copy coupon code.");
    }
  };

  const handleCheckout = () => {
    handleDismiss();
    router.push(`/checkout?coupon=${encodeURIComponent(couponCode || "")}`);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5 shadow-2xl shadow-primary/10 transition-all duration-500 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
      }`}
    >
      {/* Background glowing blobs */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-inner">
            <Gift className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
              We Saved Your Cart! 🎁
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Items are waiting for you
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="mt-4 relative z-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-normal">
          Get back to your items and enjoy an exclusive discount on your order. Use this checkout code:
        </p>

        {/* Coupon Display Box */}
        {couponCode && (
          <div className="mt-3 flex items-center justify-between gap-2 p-2 px-3 bg-zinc-50/50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
            <code className="text-sm font-mono font-bold text-primary dark:text-pink-400 tracking-wider">
              {couponCode}
            </code>
            <button
              onClick={handleCopyCoupon}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-primary dark:hover:text-pink-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Copy Coupon"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-5 flex gap-2.5 relative z-10">
        <button
          onClick={handleDismiss}
          className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-200"
        >
          Maybe Later
        </button>
        <button
          onClick={handleCheckout}
          className="flex-[1.5] flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Checkout Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
