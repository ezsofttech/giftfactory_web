"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setApiAccessToken } from "@/lib/axios";
import { getGuestCart, saveGuestCart, getGuestCartId, clearGuestCart, getGuestSessionId } from "@/lib/guest-cart";
import { mergeGuestCart } from "@/lib/api";

/**
 * Invisible component mounted at the root layout.
 * When the user logs in, syncs any guest-cart items to their server cart
 * then clears the guest cart from localStorage.
 */
export function GuestCartSync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const syncedRef = useRef(false);

  useEffect(() => {
    // Run only once when the session first becomes "authenticated" with a valid token
    if (status !== "authenticated" || !session || syncedRef.current) return;
    
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!token) return;

    syncedRef.current = true;
    setApiAccessToken(token);

    const items = getGuestCart();
    if (items.length === 0) return;

    (async () => {
      try {
        const sessionId = getGuestSessionId() || getGuestCartId() || "";
        if (!sessionId) {
          clearGuestCart();
          return;
        }

        await mergeGuestCart(sessionId, token);

        // Invalidate customer cart queries to force a refetch of the merged cart
        queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });

        // Clear local guest cart (clears items, cartId, and sessionId)
        clearGuestCart();
        toast.success("Your cart has been saved");
      } catch (err) {
        console.error("Failed to merge guest cart:", err);
        syncedRef.current = false;
        toast.error("Failed to sync some items to your cart");
      }
    })();
  }, [status, session, queryClient]);

  // Reset so if user logs out and back in it syncs again
  useEffect(() => {
    if (status === "unauthenticated") {
      syncedRef.current = false;
    }
  }, [status]);

  return null;
}
