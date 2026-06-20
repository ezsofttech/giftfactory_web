"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/provider/auth-modal-provider";

function SignupPageContent() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();
  const openedRef = useRef(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "business") {
      window.location.href = "https://vendor.giftfactory.com/login";
      return;
    }
    if (openedRef.current) return;
    openedRef.current = true;

    const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
    const initialTab = tabParam === "signup" ? ("signup" as const) : ("signin" as const);
    openAuthModal({ callbackUrl, initialTab });
  }, [searchParams, openAuthModal]);

  return (
    <div className="min-h-dvh container max-w-md mx-auto px-4 pt-10 pb-10 text-center space-y-6">
      <p className="text-muted-foreground">
        Use the sign-in dialog to continue. If it did not open, choose an option below.
      </p>
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => openAuthModal({ initialTab: "signin" })}>
          Sign in
        </Button>
        <Button variant="outline" className="w-full" onClick={() => openAuthModal({ initialTab: "signup" })}>
          Create account
        </Button>
        <Button variant="outline" asChild className="w-full">
          <a href="https://vendor.giftfactory.com/login">Business / vendor login</a>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh container max-w-md mx-auto px-4 pt-10 pb-10 animate-pulse bg-muted/20 rounded-lg" />
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
