"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/card/main-product-card";
import { fetchFeaturedProducts, fetchProducts, fetchCategories } from "@/lib/api";
import { mapApiProductToDisplay } from "@/types/api";
import type { ApiProduct, ApiCategory } from "@/types/api";
import Link from "next/link";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function sortParams(s: SortValue): { sortBy: string; order: "asc" | "desc" } {
  if (s === "price_asc") return { sortBy: "defaultPrice", order: "asc" };
  if (s === "price_desc") return { sortBy: "defaultPrice", order: "desc" };
  if (s === "name_asc") return { sortBy: "title", order: "asc" };
  return { sortBy: "createdAt", order: "desc" };
}

export function FeaturedProductsHome() {
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const hasFilters = categoryId !== "all" || sort !== "newest";

  const { data: catRes } = useQuery({
    queryKey: ["web", "categories"],
    queryFn: fetchCategories,
  });
  const categories = ((catRes?.data ?? []) as ApiCategory[]).filter((c) => !c.parentId);

  const { data: res, isLoading } = useQuery({
    queryKey: ["web", "products", "featured-home", categoryId, sort],
    queryFn: () => {
      if (!hasFilters) return fetchFeaturedProducts();
      const sp = sortParams(sort);
      return fetchProducts({
        limit: 12,
        categoryId: categoryId !== "all" ? categoryId : undefined,
        sortBy: sp.sortBy,
        order: sp.order,
      });
    },
  });
  const products = (res?.data ?? []) as ApiProduct[];
  const displayProducts = products.map(mapApiProductToDisplay);

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <span className="inline-block text-primary text-xs sm:text-sm font-medium mb-1">Handpicked</span>
            <h2 className="text-xl sm:text-3xl font-bold text-jet-black">Featured Gifts</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent hover:bg-dusty-rose hover:bg-opacity-20 text-xs sm:text-sm"
            asChild
          >
            <Link href="/products">View All</Link>
          </Button>
        </div>

        {/* Filter bar */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          {/* Category pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            <button
              onClick={() => setCategoryId("all")}
              className={`flex-none snap-start px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
                categoryId === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoryId(cat._id)}
                className={`flex-none snap-start px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
                  categoryId === cat._id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort dropdown — right-aligned */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {hasFilters && (
              <button
                onClick={() => { setCategoryId("all"); setSort("newest"); }}
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Clear filters
              </button>
            )}
            <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
              <SelectTrigger className="w-40 sm:w-48 h-8 text-xs sm:text-sm rounded-full border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs sm:text-sm">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="aspect-square sm:aspect-[4/3] bg-gray-200" />
                <CardContent className="p-2 sm:p-4 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} className="w-full" />
            ))}
          </div>
        )}

        {!isLoading && displayProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No gifts found.</p>
        )}
      </div>
    </section>
  );
}
