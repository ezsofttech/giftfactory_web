import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In / Sign Up",
  description: "Sign in or create your Gift Factory account to shop, track orders and save your wishlist.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign In | Gift Factory",
    description: "Sign in or create a Gift Factory account.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
