import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export const metadata: Metadata = {
  title: "Sell on Gift Factory",
  description:
    "Register as a vendor on Gift Factory. Reach thousands of buyers looking for gifts, hampers and corporate gifting solutions.",
  openGraph: {
    title: "Sell on Gift Factory",
    description: "Join Gift Factory as a vendor and grow your business.",
    url: `${SITE_URL}/sell`,
  },
  alternates: { canonical: `${SITE_URL}/sell` },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
