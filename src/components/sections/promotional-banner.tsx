"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchAdminBanners } from "@/lib/api";
import type { ApiBanner } from "@/types/api";
import Link from "next/link";
function resolveBannerHref(banner: ApiBanner): string {
  if (banner.redirectUrl) return banner.redirectUrl;
  if (banner.product && typeof banner.product === "object") {
    return `/products/${banner.product._id}`;
  }
  if (banner.product) return `/products/${banner.product}`;
  return "/products";
}

export const PromotionalBanners = () => {
  const { data: res } = useQuery({
    queryKey: ["web", "admin", "banners", "home"],
    queryFn: () => fetchAdminBanners({ order: "desc", sortBy: "createdAt" }),
    staleTime: 5 * 60_000,
  });

  const banners = ((res?.data ?? []) as ApiBanner[]).slice(0, 3);

  if (banners.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((banner, index) => {
            const title = banner.title?.trim() || "Special Offer";
            const subtitle = (banner as ApiBanner & { sub_title?: string }).sub_title?.trim();
            const description = (banner as ApiBanner & { description?: string }).description?.trim() || "Shop now to explore the latest collection.";
            const ctaText = (banner as ApiBanner & { ctaText?: string }).ctaText?.trim() || "Shop Now";
            const highlightText = (banner as ApiBanner & { highlightText?: string }).highlightText?.trim();
            const imageUrl = banner.imageUrl || (banner as ApiBanner & { path?: string }).path;
            const isLight = index === 0;

            return (
              <div
                key={banner._id}
                className={`relative p-8 rounded-xl overflow-hidden shadow-sm border border-gray-100 min-h-[180px] flex flex-col justify-center transition-transform duration-200 hover:-translate-y-0.5 ${
                  isLight ? "bg-white text-gray-900" : "text-white"
                }`}
                style={
                  isLight
                    ? undefined
                    : {
                        backgroundImage: imageUrl ? `linear-gradient(rgba(194,24,91,0.86), rgba(194,24,91,0.86)), url(${imageUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                }
              >
                {!isLight && (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-700/30 via-transparent to-black/20" />
                )}
                <div className="relative z-10 flex-1 max-w-[78%]">
                  <h3 className="text-xl font-bold mb-1 line-clamp-2">
                    {title}
                  </h3>
                  {subtitle && (
                    <h4 className="text-xl font-bold mb-1 line-clamp-2">
                      {subtitle}
                    </h4>
                  )}
                  {highlightText && (
                    <p className="text-3xl font-bold mb-2">
                      {highlightText}
                    </p>
                  )}
                  <p className={`mb-5 text-sm font-medium ${isLight ? "text-gray-700" : "text-white/90"}`}>
                    {description}
                  </p>

                  <Link href="/products">
                    <Button
                      variant="outline"
                      className={`rounded-full px-6 h-9 text-xs font-medium bg-transparent backdrop-blur-sm ${
                        isLight
                          ? "border-gray-800 border-opacity-80 text-gray-800 hover:bg-gray-100 transition-colors"
                          : "border-white text-white border-opacity-40 hover:bg-white hover:text-[#C2185B] transition-colors"
                      }`}
                    >
                      {ctaText}
                    </Button>
                  </Link>
                </div>

                <div
                  className={`absolute -right-12 -bottom-16 w-40 h-40 rounded-full ${isLight ? "bg-pink-100/70" : "bg-white/10"}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
