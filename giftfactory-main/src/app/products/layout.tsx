import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse all gifts, hampers and products. Filter by category, brand and price. Free delivery on orders.",
  openGraph: {
    title: "All Products | Gift Factory",
    description: "Browse gifts, hampers and products. Filter by category and brand.",
    url: `${SITE_URL}/products`,
  },
  alternates: { canonical: `${SITE_URL}/products` },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
