"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, User, MapPin, UserX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deactivateProfile } from "@/lib/api";

export default function SettingsPage() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to access settings", callbackUrl: "/settings" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivateProfile();
      toast.success("Profile deactivated successfully");
      setShowDeactivateDialog(false);
      await signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to deactivate profile";
      toast.error(message);
    } finally {
      setIsDeactivating(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded-xl" />
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
        {/* Page header */}
        <div className="p-4 sm:p-6 border-b border-border">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your account and preferences.</p>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
          {/* Profile section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Profile
            </h3>
            <p className="text-sm text-muted-foreground mb-3">Update your name and email from the profile page.</p>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/profile">Edit profile</Link>
            </Button>
          </div>

          {/* Address section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Address
            </h3>
            <p className="text-sm text-muted-foreground mb-3">Manage your delivery and billing address.</p>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/profile/addresses">Manage address</Link>
            </Button>
          </div>

          {/* Deactivate account */}
          <div>
            <h3 className="text-sm font-semibold text-destructive mb-3 pb-1 border-b border-border flex items-center gap-2">
              <UserX className="h-4 w-4 text-destructive" /> Deactivate Account
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deactivating your profile will permanently delete your account, order history, and preferences. This action is irreversible.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full px-6 font-medium"
              onClick={() => setShowDeactivateDialog(true)}
            >
              Deactivate profile
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border bg-card p-6 shadow-xl gap-0">
          <DialogHeader className="flex flex-col items-center text-center gap-2">
            <div className="h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Deactivate your profile?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to de-register? This will permanently delete your account and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              className="rounded-full w-full sm:w-auto"
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              className="rounded-full w-full sm:w-auto"
              disabled={isDeactivating}
            >
              {isDeactivating ? "Deactivating..." : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
