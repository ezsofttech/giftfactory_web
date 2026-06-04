import { MetadataRoute } from "next";
import { getApiBaseUrl } from "@/constants/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/web/products?limit=5000&page=1`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticRoutes;
    const json = await res.json();
    const data = json?.data ?? json;
    const products = Array.isArray(data) ? data : [];
    const productUrls: MetadataRoute.Sitemap = products.map(
      (p: { _id?: string; id?: string; updatedAt?: string }) => ({
        url: `${baseUrl}/products/${p.id || p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );
    return [...staticRoutes, ...productUrls];
  } catch {
    return staticRoutes;
  }
}
