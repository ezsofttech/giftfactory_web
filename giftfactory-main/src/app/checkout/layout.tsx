import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase securely on Gift Factory.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Checkout | Gift Factory",
    description: "Complete your purchase securely.",
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
