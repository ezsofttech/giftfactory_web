import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/orders", "/profile", "/settings", "/cart"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/checkout", "/orders", "/profile", "/settings", "/cart"] },
    ],
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
