"use client";

import {
  BannerSection,
  BrandShowcase,
  ProductCarouselSection,
  PromotionalBanners,
  PopupBanner,
} from "@/components/sections";
import { FeaturedProductsHome } from "@/components/sections/featured-products-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Dumbbell,
  Glasses,
  Home,
  Shield,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { fetchCategories, fetchProductDeals, fetchFeaturedProducts, fetchProductRecommended, fetchCustomerRecommended, subscribeNewsletter } from "@/lib/api";
import type { ApiCategory, ApiProduct } from "@/types/api";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FaqSection } from "@/components/sections/faq-section";

const MIN_DEALS = 5;

const categoryIcons: Record<string, React.ReactNode> = {
  clothing: <Shirt className="w-8 h-8 p-1.5" fill="currentColor" />,
  electronics: <Smartphone className="w-8 h-8 p-1.5" fill="currentColor" />,
  home: <Home className="w-8 h-8 p-1.5" fill="currentColor" />,
  beauty: <Sparkles className="w-8 h-8 p-1.5" fill="currentColor" />,
  sports: <Dumbbell className="w-8 h-8 p-1.5" fill="currentColor" />,
  books: <BookOpen className="w-8 h-8 p-1.5" fill="currentColor" />,
  accessories: <Glasses className="w-8 h-8 p-1.5" fill="currentColor" />,
  shoes: <Shield className="w-8 h-8 p-1.5" fill="currentColor" />,
};

export default function HomePage() {
  const { data: session, status } = useSession();

  // Newsletter state
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nlEmail.trim();
    if (!trimmed) { setNlError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setNlError("Please enter a valid email address."); return; }
    setNlLoading(true);
    setNlError(null);
    try {
      await subscribeNewsletter(trimmed);
      setNlSuccess(true);
      setNlEmail("");
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? "Something went wrong.";
      setNlError(msg.toLowerCase().includes("already subscribed") ? "You're already subscribed! 🎉" : msg);
    } finally {
      setNlLoading(false);
    }
  };
  const { data: catRes } = useQuery({
    queryKey: ["web", "categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000, // categories rarely change
  });
  const categories = (catRes?.data ?? []) as ApiCategory[];

  const { data: dealsRes, isLoading: dealsLoading } = useQuery({
    queryKey: ["web", "products", "deals"],
    queryFn: () => fetchProductDeals({ limit: 12 }),
  });

  const rawDeals = (dealsRes?.data ?? []) as ApiProduct[];

  // Fetch featured products in parallel (not gated on deals) so both
  // requests fire simultaneously and we pad seamlessly with no waterfall.
  const { data: featuredRes, isLoading: featuredLoading } = useQuery({
    queryKey: ["web", "products", "featured"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60_000,
  });
  const featuredProducts = (featuredRes?.data ?? []) as ApiProduct[];

  // Merge deals + featured (deduplicated) to ensure at least MIN_DEALS products
  const deals = useMemo(() => {
    if (rawDeals.length >= MIN_DEALS) return rawDeals;
    const merged = [...rawDeals];
    const existingIds = new Set(rawDeals.map((p) => p._id));
    for (const prod of featuredProducts) {
      if (!existingIds.has(prod._id)) {
        merged.push(prod);
        existingIds.add(prod._id);
      }
      if (merged.length >= 12) break;
    }
    return merged;
  }, [rawDeals, featuredProducts]);

  const { data: recRes, isLoading: recLoading } = useQuery({
    queryKey: status === "authenticated" ? ["customer", "recommended", session?.userId] : ["web", "products", "recommended"],
    queryFn: () =>
      status === "authenticated"
        ? fetchCustomerRecommended({ limit: 12, customerId: session?.userId })
        : fetchProductRecommended({ limit: 12 }),
  });

  const recData = recRes?.data;
  const recommended = (recData?.products ?? []) as ApiProduct[];
  const recReason = recData?.reason ?? (status === "authenticated" ? "Based on your browsing history" : "Trending products");

  return (
    <div className="min-h-screen bg-white antialiased">
      <BannerSection />
      <ProductCarouselSection
        title="Top deals"
        products={deals}
        isLoading={dealsLoading || (rawDeals.length < MIN_DEALS && featuredLoading)}
        viewAllHref="/products"
      />
      <ProductCarouselSection
        title="Recommended for you"
        products={recommended}
        isLoading={recLoading}
        viewAllHref="/products"
        expandVariants
        reason={recReason}
      />
      <BannerSection position="HOME_MIDDLE" />
      <BrandShowcase />
      <PromotionalBanners />

      <BannerSection position="CATEGORY_TOP" />

      {/* Categories from API */}
      <section className="relative py-16 bg-white bg-[url(https://images.unsplash.com/photo-1673479590411-853c4c035091?q=80&w=1064&auto=format&fit=crop)]">
        <div className="absolute inset-0 bg-white/40 z-0" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-sm font-medium mb-3">Collections</span>
            <h2 className="text-3xl font-bold mb-4 text-jet-black">Shop by Category</h2>
            <p className="text-dark-gray max-w-2xl mx-auto">
              Curated collections designed to make you look and feel your most confident self.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((category) => {
              const icon =
                categoryIcons[category.name?.toLowerCase()] ?? (
                  <ShoppingCart className="w-8 h-8 p-1.5" fill="currentColor" />
                );
              return (
                <Link
                  key={category._id}
                  href={`/products?categoryId=${category._id}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-50 hover:bg-dusty-rose hover:bg-opacity-10 transition-colors border border-opacity-10"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                    <div className="rounded-full bg-primary/10 text-primary p-3 group-hover:bg-primary group-hover:text-white transition-colors">
                      {icon}
                    </div>
                    <h3 className="font-medium text-jet-black group-hover:text-primary transition-colors mt-4">
                      {category.name}
                    </h3>
                    <span className="text-xs text-dark-gray mt-1">Shop Now →</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dusty-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedProductsHome />

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-br from-burgundy to-dark-maroon text-white bg-[url(https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-dusty-rose text-sm font-medium mb-3">
              Stay Updated
            </span>
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new collections, special offers, and styling tips.
            </p>

            {nlSuccess ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <p className="text-base font-medium text-white">You're subscribed! Check your inbox for a welcome email.</p>
                <button onClick={() => setNlSuccess(false)} className="text-sm text-gray-300 hover:text-white underline">
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={nlEmail}
                  onChange={(e) => { setNlEmail(e.target.value); setNlError(null); }}
                  disabled={nlLoading}
                  className="bg-white/10 border-white/30 text-white placeholder:text-gray-300 rounded-full px-6 py-5 flex-1 focus-visible:ring-white/50"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={nlLoading}
                  className="bg-primary hover:bg-primary/90 rounded-full px-8 whitespace-nowrap"
                >
                  {nlLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {nlLoading ? "Subscribing…" : "Subscribe"}
                </Button>
              </form>
            )}

            {nlError && <p className="mt-3 text-sm text-red-300">{nlError}</p>}
          </div>
        </div>
        
      </section>
      <FaqSection />
      <PopupBanner />
    </div>
  );
}
