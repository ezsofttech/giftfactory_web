import { coolveticaFont } from "@/lib/fonts";
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { QueryProvider, CustomerThemeProvider } from "@/provider";
import { AuthApiProvider } from "@/provider/auth-api-provider";
import { AuthModalProvider } from "@/provider/auth-modal-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header, Footer, MobileBottomNav, SiteBreadcrumbs } from "@/components/layout";
import { GuestCartSync } from "@/components/guest-cart-sync";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://giftfactory.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gift Factory – Gifts, Hampers & Corporate Gifting",
    template: "%s | Gift Factory",
  },
  description:
    "Shop gifts, hampers and corporate gifting. Find the perfect present with curated collections, deals and reliable delivery.",
  keywords: ["gifts", "hampers", "corporate gifting", "online gifts", "gift delivery"],
  authors: [{ name: "Gift Factory", url: SITE_URL }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Gift Factory",
    title: "Gift Factory – Gifts, Hampers & Corporate Gifting",
    description: "Shop gifts, hampers and corporate gifting. Find the perfect present.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Factory – Gifts, Hampers & Corporate Gifting",
    description: "Shop gifts, hampers and corporate gifting.",
  },
  icons: {
    icon: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${coolveticaFont.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <AuthApiProvider>
              <CustomerThemeProvider>
                <AuthModalProvider>
                  <GuestCartSync />
                  <Header />
                  <SiteBreadcrumbs />
                  <main className="min-h-screen flex flex-col pb-14 md:pb-0">{children}</main>
                  <Footer />
                  <MobileBottomNav />
                </AuthModalProvider>
              </CustomerThemeProvider>
            </AuthApiProvider>
          </QueryProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
