"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, User, Lock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api";
import { ThemeCustomizer } from "@/components/theme-customizer";

const changePasswordSchema = z
  .object({
    password: z.string().min(6, "At least 6 characters").max(12, "At most 12 characters"),
    newPassword: z.string().min(6, "At least 6 characters").max(12, "At most 12 characters"),
    rePassword: z.string(),
  })
  .refine((data) => data.newPassword === data.rePassword, {
    message: "New passwords do not match",
    path: ["rePassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to access settings", callbackUrl: "/settings" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", newPassword: "", rePassword: "" },
  });

  const onSubmit = async (values: ChangePasswordForm) => {
    try {
      await changePassword({
        currentPassword: values.password,
        newPassword: values.newPassword,
      });
      toast.success("Password updated successfully");
      form.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
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

          {/* Change password */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" /> Change Password
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Set a new password for your account.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="rounded-full px-8" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating…" : "Update password"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Theme Customizer Section */}
          <div className="pt-6 border-t border-border">
            <ThemeCustomizer />
          </div>
        </div>
      </div>
    </div>
  );
}
