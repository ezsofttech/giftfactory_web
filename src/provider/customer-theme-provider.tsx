"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchWebTheme } from "@/lib/api";

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  // Fetch the default website theme (hitting /api/v1/web/theme) for all users
  const { data: themeRes } = useQuery({
    queryKey: ["theme"],
    queryFn: fetchWebTheme,
    staleTime: 5 * 60 * 1000,
  });

  const themeData = themeRes?.data;

  useEffect(() => {
    const root = document.documentElement;

    if (themeData) {
      // 1. Map color properties
      if (themeData.primaryColor) root.style.setProperty("--primary", themeData.primaryColor);
      if (themeData.primaryForeground) root.style.setProperty("--primary-foreground", themeData.primaryForeground);
      if (themeData.secondaryColor) root.style.setProperty("--secondary", themeData.secondaryColor);
      if (themeData.secondaryForeground) root.style.setProperty("--secondary-foreground", themeData.secondaryForeground);
      if (themeData.backgroundColor) root.style.setProperty("--background", themeData.backgroundColor);
      if (themeData.textColor) root.style.setProperty("--foreground", themeData.textColor);
      
      if (themeData.borderColor) {
        root.style.setProperty("--border", themeData.borderColor);
        root.style.setProperty("--input", themeData.borderColor);
      }

      // 2. Component Mappings
      if (themeData.headerPromoBg) root.style.setProperty("--header-promo-bg", themeData.headerPromoBg);
      if (themeData.headerPromoText) root.style.setProperty("--header-promo-fg", themeData.headerPromoText);
      if (themeData.headerCategoryPillBg) root.style.setProperty("--header-category-pill-bg", themeData.headerCategoryPillBg);
      if (themeData.headerCategoryPillText) root.style.setProperty("--header-category-pill-fg", themeData.headerCategoryPillText);
      if (themeData.footerBg) root.style.setProperty("--footer-bg", themeData.footerBg);
      if (themeData.footerText) root.style.setProperty("--footer-fg", themeData.footerText);
      if (themeData.footerBorder) root.style.setProperty("--footer-border", themeData.footerBorder);
      if (themeData.cartBadgeBg) root.style.setProperty("--cart-badge-bg", themeData.cartBadgeBg);
      if (themeData.cartBadgeText) root.style.setProperty("--cart-badge-fg", themeData.cartBadgeText);

      // 3. Font Family mapping (if it's not a color hex code)
      const isValidFont = (font?: string) => font && !font.startsWith("#") && font.trim().length > 0;
      if (isValidFont(themeData.fontFamily)) {
        root.style.setProperty("--font-sans", themeData.fontFamily!);
      }

      // 4. Custom CSS injection
      if (themeData.customCss && !themeData.customCss.startsWith("#")) {
        if (!styleTagRef.current) {
          const style = document.createElement("style");
          style.id = "customer-custom-css";
          document.head.appendChild(style);
          styleTagRef.current = style;
        }
        styleTagRef.current.innerHTML = themeData.customCss;
      } else {
        if (styleTagRef.current) {
          styleTagRef.current.remove();
          styleTagRef.current = null;
        }
      }
    } else {
      // Revert all properties to default values by removing inline properties
      const propsToRemove = [
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--secondary-foreground",
        "--background",
        "--foreground",
        "--border",
        "--input",
        "--header-promo-bg",
        "--header-promo-fg",
        "--header-category-pill-bg",
        "--header-category-pill-fg",
        "--footer-bg",
        "--footer-fg",
        "--footer-border",
        "--cart-badge-bg",
        "--cart-badge-fg",
        "--font-sans",
      ];
      propsToRemove.forEach((prop) => root.style.removeProperty(prop));

      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    }

    return () => {
      // Clean up dynamic styling when unmounting or if themeData changes
      const propsToRemove = [
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--secondary-foreground",
        "--background",
        "--foreground",
        "--border",
        "--input",
        "--header-promo-bg",
        "--header-promo-fg",
        "--header-category-pill-bg",
        "--header-category-pill-fg",
        "--footer-bg",
        "--footer-fg",
        "--footer-border",
        "--cart-badge-bg",
        "--cart-badge-fg",
        "--font-sans",
      ];
      const docRoot = document.documentElement;
      propsToRemove.forEach((prop) => docRoot.style.removeProperty(prop));

      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    };
  }, [themeData, status]);

  return <>{children}</>;
}
