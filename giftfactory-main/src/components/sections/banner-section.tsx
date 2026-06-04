"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { fetchBanners } from "@/lib/api";
import type { ApiBanner } from "@/types/api";
import { resolveBannerRedirect } from "@/types/api";

export function BannerSection({ position = "HOME_HERO" }: { position?: string }) {
  const [api, setApi] = useState<CarouselApi>();

  const { data: res, isLoading, error } = useQuery({
    queryKey: ["web", "banners", position],
    queryFn: () => fetchBanners(position),
  });

  const raw = res?.data;
  const banners = Array.isArray(raw) ? (raw as ApiBanner[]) : [];

  useEffect(() => {
    if (!api) return;
    api.on("select", () => { });
  }, [api]);

  if (isLoading) {
    return (
      <div className="w-full container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg h-64 md:h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full container mx-auto py-3 px-3">
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        opts={{ align: "start", loop: true }}
      >
        <CarouselContent>
          {banners.map((banner, index) => {
            const redirectUrl = resolveBannerRedirect(banner);
            const bannerImg = banner.path ?? banner.imageUrl;
            const fullImageUrl = bannerImg
              ? (bannerImg.startsWith("http")
                ? bannerImg
                : `${process.env.NEXT_PUBLIC_AWS_PREFIX_URL || process.env.AWS_PREFIX_URL || "https://d3ori68ve27vyu.cloudfront.net"}/${bannerImg}`)
              : "https://picsum.photos/seed/gift/400/400";

            return (
              <CarouselItem key={banner._id ?? index} className="w-full h-[240px] sm:h-[280px] md:h-[350px] overflow-hidden rounded-xl">
                <div className="relative w-full h-full">
                  {/* Background Image */}
                  <img
                    src={fullImageUrl}
                    alt={banner.title ?? ""}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-20 text-white z-10">
                    <div className="max-w-md md:max-w-lg space-y-2 sm:space-y-3 md:space-y-4 animate-in fade-in slide-in-from-left-5 duration-500">
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md leading-tight text-white">
                        {banner.title}
                      </h2>
                      {(banner.subTitle || banner.description) && (
                        <p className="text-[10px] sm:text-xs md:text-base text-gray-200 drop-shadow line-clamp-2 max-w-xs sm:max-w-sm font-medium">
                          {banner.subTitle || banner.description}
                        </p>
                      )}
                      <div className="pt-1 sm:pt-2 md:pt-4">
                        <a
                          href={redirectUrl}
                          className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-2.5 bg-primary hover:bg-primary/95 text-white hover:text-white font-bold rounded-lg text-[10px] sm:text-xs md:text-sm transition-all shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {banner.ctaText || "Shop Now"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    
    </div>
  );
}
