import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your cart, update quantities and proceed to checkout.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your Cart | Gift Factory",
    description: "Review cart items and proceed to checkout.",
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
