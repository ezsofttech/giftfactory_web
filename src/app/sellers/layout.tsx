import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export const metadata: Metadata = {
  title: "Sellers",
  description: "Browse trusted sellers and vendors on Gift Factory offering gifts, hampers and more.",
  openGraph: {
    title: "Sellers | Gift Factory",
    description: "Discover verified sellers and their product collections.",
    url: `${SITE_URL}/sellers`,
  },
  alternates: { canonical: `${SITE_URL}/sellers` },
};

export default function SellersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
