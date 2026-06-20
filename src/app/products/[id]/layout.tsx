import type { Metadata } from "next";
import { getApiBaseUrl } from "@/constants/api";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

async function getProduct(id: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/web/products/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data ?? json;
  if (!data) return null;

  return {
    ...data,
    _id: data.id || data._id,
    title: data.name || data.title || "",
    baseImageUrl: data.imageUrls || data.images || (data.imageUrl ? [data.imageUrl] : []) || data.baseImageUrl || [],
    defaultPrice: data.price != null ? Number(data.price) : data.defaultPrice,
    categoryId: data.category ? {
      _id: data.category.id,
      name: data.category.name,
      slug: data.category.slug,
    } : data.categoryId,
    brandId: data.brandRef ? {
      _id: data.brandRef.id,
      name: data.brandRef.name,
      slug: data.brandRef.slug,
    } : data.brandId,
  } as {
    _id: string;
    title: string;
    sub_title?: string;
    description?: string;
    slug?: string;
    defaultPrice?: number;
    mrp?: number;
    baseImageUrl?: string[];
    seo?: { title?: string; sub_title?: string };
    categoryId?: { name?: string };
    brandId?: { name?: string };
  } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product not found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";
  const canonicalSlug = product._id || id;
  const title = product.seo?.title || product.title;
  const description =
    product.seo?.sub_title ||
    product.sub_title ||
    (product.description ? product.description.slice(0, 160) : undefined) ||
    `${product.title} – ${product.brandId && typeof product.brandId === "object" ? product.brandId.name : ""} ${product.categoryId && typeof product.categoryId === "object" ? product.categoryId.name : ""}`.trim();
  const image =
    Array.isArray(product.baseImageUrl) && product.baseImageUrl[0]
      ? product.baseImageUrl[0].startsWith("http")
        ? product.baseImageUrl[0]
        : `${siteUrl}${product.baseImageUrl[0].startsWith("/") ? "" : "/"}${product.baseImageUrl[0]}`
      : undefined;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: "website",
      url: `${siteUrl}/products/${canonicalSlug}`,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 160),
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/products/${canonicalSlug}`,
    },
  };
}

export default async function ProductDetailLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";
  const canonicalSlug = product?._id || id;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description:
          product.seo?.sub_title || product.sub_title || product.description || product.title,
        sku: product.slug,
        url: `${siteUrl}/products/${canonicalSlug}`,
        image:
          Array.isArray(product.baseImageUrl) && product.baseImageUrl.length
            ? product.baseImageUrl.map((u) =>
                u.startsWith("http") ? u : `${siteUrl}${u.startsWith("/") ? "" : "/"}${u}`
              )
            : undefined,
        offers:
          product.defaultPrice != null
            ? {
                "@type": "Offer",
                price: Number(product.defaultPrice),
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              }
            : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
