import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Orders",
  description: "Track and manage your orders, returns and exchanges on Gift Factory.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your Orders | Gift Factory",
    description: "View order history and track deliveries.",
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
