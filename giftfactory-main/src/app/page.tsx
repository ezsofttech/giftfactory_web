"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { CheckCircle2, Loader2, MailOpen, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  fetchCategories,
  fetchProductDeals,
  fetchFeaturedProducts,
  fetchProductRecommended,
  fetchCustomerRecommended,
  subscribeNewsletter,
  fetchFaqs
} from "@/lib/api";
import type { ApiCategory, ApiProduct } from "@/types/api";

import { BannerSection, PopupBanner, BrandShowcase, ProductCarouselSection } from "@/components/sections";
import { 
  ServicesGrid, 
  CategoryRibbon, 
  FlashDeals, 
  PromoGrid, 
  TrendingAndWhy, 
  HomeFaqSection 
} from "@/components/sections/custom-sections";

const MIN_DEALS = 5;

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
      await subscribeNewsletter(trimmed, "FOOTER");
      setNlSuccess(true);
      setNlEmail("");
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? "Something went wrong.";
      setNlError(msg.toLowerCase().includes("already subscribed") ? "You're already subscribed! 🎉" : msg);
    } finally {
      setNlLoading(false);
    }
  };

  // 1. Fetch categories
  const { data: catRes } = useQuery({
    queryKey: ["web", "categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });
  const categories = (catRes?.data ?? []) as ApiCategory[];

  // 2. Fetch product deals
  const { data: dealsRes, isLoading: dealsLoading } = useQuery({
    queryKey: ["web", "products", "deals"],
    queryFn: () => fetchProductDeals({ limit: 12 }),
  });
  const rawDeals = (dealsRes?.data ?? []) as ApiProduct[];

  // 3. Fetch featured products
  const { data: featuredRes, isLoading: featuredLoading } = useQuery({
    queryKey: ["web", "products", "featured"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60_000,
  });
  const featuredProducts = (featuredRes?.data ?? []) as ApiProduct[];

  // Merge deals + featured (deduplicated)
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

  // 4. Fetch FAQs
  const { data: faqRes } = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });
  
  const faqs = faqRes?.data && faqRes.data.length > 0 ? faqRes.data : [
    {
      question: "How do I track my order?",
      answer: "After placing an order, you will receive a tracking link via email to monitor its shipping progress."
    },
    {
      question: "What is your return policy?",
      answer: "We offer an easy 30-day hassle-free return policy on most items. Please refer to our returns page for more info."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to selected international destinations. Delivery charges and times vary based on location."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us through our 24/7 customer support email or help center contact form."
    }
  ];

  // 5. Fetch recommended products
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
      {/* 1. Hero banner slider */}
      <BannerSection position="HOME_HERO" />

      {/* 2. Services grid info */}
      <ServicesGrid />

      {/* 3. Shop by Category circle ribbon scroll */}
      <CategoryRibbon categories={categories} />

      {/* 4. Flash Deals countdown carousel */}
      <FlashDeals products={deals} isLoading={dealsLoading} />

      {/* 5. Promotional Banners grid
      <PromoGrid /> */}
      <BannerSection position="HOME_MIDDLE" />

      {/* 6. Featured Brands Cards */}
      <BrandShowcase />

      {/* Recommended for you */}
      <ProductCarouselSection
        title="Recommended for you"
        products={recommended}
        isLoading={recLoading}
        viewAllHref="/products"
        expandVariants
        reason={recReason}
      />
      <BannerSection position="CATEGORY_TOP" />

      {/* 7. Trending Products side-by-side with Why Shop With Us */}
      <TrendingAndWhy products={featuredProducts} categories={categories} />

      {/* 8. Stay Updated (Newsletter Banner) */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#cc176b] via-[#7c3aed] to-[#2563eb] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shrink-0 border border-white/10 flex items-center justify-center">
                <MailOpen className="h-8 w-8 text-white stroke-[1.5]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Stay Updated</h2>
                <p className="text-white/80 text-xs md:text-sm mt-1 max-w-md font-medium leading-relaxed">
                  Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>
              </div>
            </div>

            {nlSuccess ? (
              <div className="flex flex-col items-center lg:items-end gap-1.5 text-center lg:text-right shrink-0">
                <div className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span className="font-semibold text-sm">You're subscribed! Check your inbox.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNlSuccess(false)}
                  className="text-xs text-white/70 hover:text-white underline cursor-pointer"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md shrink-0">
                <form onSubmit={handleNewsletterSubmit} className="flex items-center bg-white rounded-xl p-1.5 shadow-md border border-white/10">
                  <div className="flex items-center pl-3 text-gray-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={nlEmail}
                    onChange={(e) => { setNlEmail(e.target.value); setNlError(null); }}
                    disabled={nlLoading}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0 text-gray-800 placeholder-gray-400 text-sm px-3 py-2 font-medium"
                  />
                  <Button
                    type="submit"
                    disabled={nlLoading}
                    className="bg-[#cc176b] hover:bg-[#b0135c] text-white text-sm font-bold px-6 py-2.5 rounded-lg shrink-0 transition-colors shadow-sm cursor-pointer border-none h-auto flex items-center justify-center min-w-[100px]"
                  >
                    {nlLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                  </Button>
                </form>
                {nlError && (
                  <p className="text-red-200 text-xs mt-2 font-medium text-left pl-2">
                    {nlError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Frequently Asked Questions grid */}
      <HomeFaqSection faqs={faqs} />

      {/* 10. Popup Banner (e.g. promo modals) */}
      <PopupBanner />
    </div>
  );
}
