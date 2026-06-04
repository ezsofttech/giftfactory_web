import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your notification, privacy and account settings on Gift Factory.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Settings | Gift Factory",
    description: "Manage your Gift Factory account settings.",
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
