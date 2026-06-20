"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchBanners } from "@/lib/api";
import type { ApiBanner } from "@/types/api";
import { resolveBannerRedirect } from "@/types/api";

export function PopupBanner() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: res } = useQuery({
    queryKey: ["web", "banners", "POPUP"],
    queryFn: () => fetchBanners("POPUP"),
  });

  const raw = res?.data;
  const banners = Array.isArray(raw) ? (raw as ApiBanner[]) : [];
  const activePopup = banners[0] ?? null;

  useEffect(() => {
    if (activePopup) {
      const isDismissed = sessionStorage.getItem(`gf_popup_dismissed_${activePopup._id}`);
      if (!isDismissed) {
        setIsOpen(true);
      }
    }
  }, [activePopup]);

  const handleClose = () => {
    if (activePopup?._id) {
      sessionStorage.setItem(`gf_popup_dismissed_${activePopup._id}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || !activePopup) return null;

  const imageUrl = activePopup.path ?? activePopup.imageUrl;
  const fullImageUrl = imageUrl
    ? (imageUrl.startsWith("http")
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_AWS_PREFIX_URL || process.env.AWS_PREFIX_URL || "https://d3ori68ve27vyu.cloudfront.net"}/${imageUrl}`)
    : null;

  if (!fullImageUrl) return null;

  const redirectUrl = resolveBannerRedirect(activePopup);

  return (
    <div className="fixed bottom-5 right-5 z-[100] max-w-xs sm:max-w-sm w-[calc(100vw-2.5rem)] transition-all duration-300">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-border animate-in slide-in-from-bottom-5 fade-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white hover:text-white rounded-full p-1.5 transition-colors shadow-md border border-white/20"
          aria-label="Close promotion"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Link */}
        <div className="relative group overflow-hidden">
          <img
            src={fullImageUrl}
            alt={activePopup.title ?? "Special promotion"}
            className="w-full h-auto object-cover max-h-[60vh] transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {redirectUrl && redirectUrl !== "#" ? (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
              <h3 className="font-extrabold text-sm sm:text-base mb-0.5 tracking-tight">{activePopup.title}</h3>
              {(activePopup.subTitle || activePopup.description) && (
                <p className="text-[10px] sm:text-xs text-gray-200 mb-3 line-clamp-2">
                  {activePopup.subTitle || activePopup.description}
                </p>
              )}
              <a
                href={redirectUrl}
                onClick={handleClose}
                className="w-full text-center py-2 bg-primary hover:bg-primary/95 text-white hover:text-white font-bold rounded-lg text-xs transition-all shadow-md active:scale-[0.98]"
              >
                {activePopup.ctaText || "Shop Now"}
              </a>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">{activePopup.title}</h3>
              {(activePopup.subTitle || activePopup.description) && (
                <p className="text-[10px] sm:text-xs text-gray-200 line-clamp-2">
                  {activePopup.subTitle || activePopup.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
