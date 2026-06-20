import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Your saved products and gift ideas. Add to cart or share your wishlist.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your Wishlist | Gift Factory",
    description: "View and manage your saved products on Gift Factory.",
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
