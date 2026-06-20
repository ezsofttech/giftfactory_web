import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get answers to your questions about orders, returns, payments and delivery on Gift Factory.",
  openGraph: {
    title: "Help & Support | Gift Factory",
    description: "Find answers, track orders and contact our support team.",
    url: `${SITE_URL}/help`,
  },
  alternates: { canonical: `${SITE_URL}/help` },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
