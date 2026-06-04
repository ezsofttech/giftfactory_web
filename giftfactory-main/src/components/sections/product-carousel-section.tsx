"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/card/main-product-card";
import { ProductCardSkeleton } from "@/components/skeleton";
import { mapApiProductToDisplay, flatMapApiProductsToCards } from "@/types/api";
import type { ApiProduct } from "@/types/api";

interface ProductCarouselSectionProps {
  title: string;
  products: ApiProduct[];
  isLoading?: boolean;
  viewAllHref?: string;
  /** When true, expands variants into individual cards (like the product listing page). */
  expandVariants?: boolean;
  /** Optional personalization hint shown under the title, e.g. "Based on your browsing history". */
  reason?: string;
}

export function ProductCarouselSection({
  title,
  products,
  isLoading,
  viewAllHref,
  expandVariants = false,
  reason,
}: ProductCarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  const displayProducts = expandVariants
    ? flatMapApiProductsToCards(products)
    : products.map(mapApiProductToDisplay);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            {reason && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Sparkles className="h-3 w-3 text-primary" />
                {reason}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9 shrink-0"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9 shrink-0"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {viewAllHref && (
              <a
                href={viewAllHref}
                className="text-sm text-primary hover:underline ml-2 hidden sm:inline"
              >
                View all
              </a>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          style={{ scrollSnapType: "x proximity" }}
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="w-[280px] sm:w-[300px] flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <ProductCardSkeleton />
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <div
                key={product.preVariantId ? `${product.id}-${product.preVariantId}` : product.id}
                className="w-[280px] sm:w-[300px] flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
                <ProductCard product={product} className="w-full" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
