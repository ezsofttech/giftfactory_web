"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchCustomerTheme, fetchWebTheme } from "@/lib/api";

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  // Fetch either customer custom theme (authenticated) or the default website theme (anonymous)
  const { data: themeRes } = useQuery({
    queryKey: ["theme", status],
    queryFn: () => (status === "authenticated" ? fetchCustomerTheme() : fetchWebTheme()),
    staleTime: 5 * 60 * 1000,
  });

  const themeData = themeRes?.data;

  useEffect(() => {
    const root = document.documentElement;

    if (themeData) {
      // 1. Map color properties
      if (themeData.primaryColor) root.style.setProperty("--primary", themeData.primaryColor);
      if (themeData.secondaryColor) root.style.setProperty("--secondary", themeData.secondaryColor);
      if (themeData.backgroundColor) root.style.setProperty("--background", themeData.backgroundColor);
      
      if (themeData.surfaceColor) {
        root.style.setProperty("--card", themeData.surfaceColor);
        root.style.setProperty("--popover", themeData.surfaceColor);
      }
      
      if (themeData.borderColor) {
        root.style.setProperty("--border", themeData.borderColor);
        root.style.setProperty("--input", themeData.borderColor);
      }
      
      if (themeData.textColor) {
        root.style.setProperty("--foreground", themeData.textColor);
      }
      
      if (themeData.mutedColor) {
        root.style.setProperty("--muted-foreground", themeData.mutedColor);
      }

      // 2. Sidebar styling mapping
      if (themeData.sidebarBgColor) {
        root.style.setProperty("--sidebar", themeData.sidebarBgColor);
      }
      if (themeData.sidebarTextColor) {
        root.style.setProperty("--sidebar-foreground", themeData.sidebarTextColor);
      }
      if (themeData.sidebarActiveBgColor) {
        root.style.setProperty("--sidebar-primary", themeData.sidebarActiveBgColor);
      }
      if (themeData.sidebarActiveTextColor) {
        root.style.setProperty("--sidebar-primary-foreground", themeData.sidebarActiveTextColor);
      }
      if (themeData.sidebarHoverBgColor) {
        root.style.setProperty("--sidebar-accent", themeData.sidebarHoverBgColor);
      }
      if (themeData.sidebarHoverTextColor) {
        root.style.setProperty("--sidebar-accent-foreground", themeData.sidebarHoverTextColor);
      }

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
        "--secondary",
        "--background",
        "--card",
        "--popover",
        "--border",
        "--input",
        "--foreground",
        "--muted-foreground",
        "--sidebar",
        "--sidebar-foreground",
        "--sidebar-primary",
        "--sidebar-primary-foreground",
        "--sidebar-accent",
        "--sidebar-accent-foreground",
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
        "--secondary",
        "--background",
        "--card",
        "--popover",
        "--border",
        "--input",
        "--foreground",
        "--muted-foreground",
        "--sidebar",
        "--sidebar-foreground",
        "--sidebar-primary",
        "--sidebar-primary-foreground",
        "--sidebar-accent",
        "--sidebar-accent-foreground",
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
