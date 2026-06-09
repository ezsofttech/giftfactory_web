import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    const base = (
      process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
      (process.env.NODE_ENV === "development" ? "http://localhost:9873" : "")
    ).replace(/\/+$/, "");
    if (!base) return { afterFiles: [] };
    return {
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${base}/api/v1/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu",
    ],
  },
};

export default nextConfig;
