"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignInForm } from "@/components/form";
import { SignupCard } from "@/components/card";

type AuthModalTab = "signin" | "signup";

export interface AuthModalOptions {
  /** Redirect URL after login (used when not using onSuccess) */
  callbackUrl?: string;
  /** Short message shown in modal header, e.g. "Sign in to add to cart" */
  message?: string;
  /** Called after successful sign-in or sign-up; modal closes and this runs (no redirect) */
  onSuccess?: () => void;
  /** Which tab to show when opening (default sign in) */
  initialTab?: AuthModalTab;
}

type AuthModalContextValue = {
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>("signin");
  const [options, setOptions] = useState<AuthModalOptions>({});

  const openAuthModal = useCallback((opts?: AuthModalOptions) => {
    setOptions(opts ?? {});
    setTab(opts?.initialTab ?? "signin");
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
    setOptions({});
  }, []);

  const handleSuccess = useCallback(() => {
    const { onSuccess } = options;
    closeAuthModal();
    if (onSuccess) {
      onSuccess();
    } else if (typeof window !== "undefined" && options.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }, [options, closeAuthModal]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && closeAuthModal()}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-md rounded-2xl border-2 border-border shadow-xl bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">
              {options.message ?? "Sign in or create an account"}
            </DialogTitle>
            <DialogDescription>
              {tab === "signin"
                ? "Enter your details to continue."
                : "Create an account to get started."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant={tab === "signin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTab("signin")}
            >
              Sign In
            </Button>
            <Button
              variant={tab === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTab("signup")}
            >
              Sign Up
            </Button>
          </div>
          <div className="mt-4 min-h-[200px] pb-1">
            {tab === "signin" && (
              <SignInForm
                callbackUrl={options.callbackUrl}
                onSuccess={handleSuccess}
              />
            )}
            {tab === "signup" && (
              <SignupCard onSuccess={handleSuccess} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
