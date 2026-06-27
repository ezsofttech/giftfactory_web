"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AddressBook,
  OrderHistory,
  ProfileInfo,
  Wishlist,
} from "@/components/sections";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile, fetchWishlistIds } from "@/lib/api";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { useCustomerSegments } from "@/store/notification-store";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to view your profile", callbackUrl: "/profile" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["customer", "profile", session?.user?.email],
    queryFn: () => getCustomerProfile(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
  });

  const customerId = session?.userId;
  const { data: wishlistIdsRes } = useQuery({
    queryKey: ["customer", "wishlist", "ids", customerId],
    queryFn: () => fetchWishlistIds(customerId as string),
    enabled: status === "authenticated" && !!customerId,
  });
  
  const wishlistCount = (wishlistIdsRes?.data ?? []).length;

  const { data: segments = [] } = useCustomerSegments({
    enabled: status === "authenticated",
  });

  const rawProfile = (profileData?.data || profileData) as any;
  const backendProfile = rawProfile?.customer ? rawProfile.customer : rawProfile;
  const userName = backendProfile?.name || backendProfile?.fullName || session?.user?.name || "User";
  const userEmail = rawProfile?.email || backendProfile?.email || session?.user?.email;
  const userAvatar = backendProfile?.avatar || session?.user?.image || undefined;

  const profileUser = backendProfile ? {
    name: userName,
    email: userEmail || "",
    avatar: userAvatar || "",
    phone:  backendProfile.phone || "",
    gender: backendProfile.gender,
    dob: backendProfile.dob,
    gstin: backendProfile.gstin,
    isEmailVerified: backendProfile.isEmailVerified,
    isPhoneVerified: backendProfile.isPhoneVerified,
    orderCount: backendProfile.orderCount,
    wishlistCount: backendProfile.wishlistCount,
    reviewCount: backendProfile.reviewCount,
    addressCount: backendProfile.addressCount,
  } : { name: userName, email: userEmail || "", avatar: userAvatar || "" };

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "orders", label: "Orders", icon: Package },
    { value: "addresses", label: "Address", icon: MapPin },
    { value: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
      {/* Greeting / header card */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-6">
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 ring-4 ring-background shadow-md shrink-0">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              Hello, {userName}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-base mt-0.5 truncate">
              {userEmail}
            </p>
            {segments && segments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {segments.map((seg: string) => (
                  <span
                    key={seg}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-accent text-accent-foreground border border-primary/20 shadow-xs"
                  >
                    {seg.toUpperCase() === "VIP" 
                      ? "VIP" 
                      : seg.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                    }
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="shrink-0 gap-1.5 text-destructive bg-pink-300 border-pink-300  transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        {/* Tabs: pill strip on mobile, sidebar on desktop */}
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
          <div className="w-full lg:w-56 shrink-0">
            <h2 className="sr-only lg:not-sr-only text-sm font-medium text-muted-foreground mb-3">
              Your Account
            </h2>
            <TabsList className="w-full lg:w-auto h-auto p-0 bg-transparent flex flex-row lg:flex-col gap-1 lg:gap-0 rounded-xl lg:rounded-none border-b-0 lg:border-0 overflow-x-auto overflow-y-hidden scrollbar-hide">
              {tabs.map(({ value, label, icon: Icon, badge }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 lg:flex-none min-w-[72px] lg:min-w-[12rem] flex-col lg:flex-row justify-center lg:justify-start gap-1 lg:gap-2 rounded-xl lg:rounded-lg border border-transparent py-2.5 px-2 lg:py-2.5 lg:px-4 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/8 data-[state=active]:text-primary lg:data-[state=active]:bg-accent lg:data-[state=active]:text-accent-foreground transition-all"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="leading-tight text-center lg:text-left">{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 w-full mt-3 lg:mt-0">
            <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-6 lg:p-8 shadow-sm min-h-[320px]">
              <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                <ProfileInfo
                  user={profileUser}
                  isLoading={isProfileLoading}
                />
              </TabsContent>
              <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
                <OrderHistory />
              </TabsContent>
              <TabsContent value="addresses" className="mt-0 focus-visible:outline-none">
                <AddressBook />
              </TabsContent>
              <TabsContent value="wishlist" className="mt-0 focus-visible:outline-none">
                <Wishlist />
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
