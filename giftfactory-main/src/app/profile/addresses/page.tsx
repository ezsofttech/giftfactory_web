"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { AddressBook } from "@/components/sections";
import { ArrowLeft } from "lucide-react";

export default function AddressesPage() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to manage your address", callbackUrl: "/profile/addresses" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Your Addresses</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your delivery and billing address for faster checkout.</p>
        </div>
        <div className="p-4 sm:p-6">
          <AddressBook />
        </div>
      </div>
    </div>
  );
}
