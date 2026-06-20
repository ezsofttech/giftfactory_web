import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Manage your account details, addresses and preferences on Gift Factory.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your Profile | Gift Factory",
    description: "Manage your Gift Factory account.",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
