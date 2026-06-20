"use client";

import { ProductCard } from "@/components/card/main-product-card";
import { ProductCardSkeleton } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Store,
  Package,
  Globe,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
} from "lucide-react";
import { fetchSellerById, fetchProducts } from "@/lib/api";
import { mapApiProductToDisplay } from "@/types/api";
import type { ApiProduct } from "@/types/api";

const LIMIT = 16;

const BADGE_STYLES: Record<string, string> = {
  verified: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  top_rated: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  fast_delivery: "bg-green-500/10 text-green-600 border-green-500/20",
  money_back_guarantee: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  premium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  new_seller: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  dropshipping: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const BADGE_LABELS: Record<string, string> = {
  verified: "✓ Verified",
  top_rated: "★ Top Rated",
  fast_delivery: "⚡ Fast Delivery",
  money_back_guarantee: "🛡 Money Back",
  premium: "💎 Premium",
  new_seller: "🆕 New Seller",
  dropshipping: "📦 Dropshipping",
};

const ELIGIBILITY_LABELS: Record<string, string> = {
  b2c: "B2C",
  b2b: "B2B",
  "b2c_&_b2b": "B2C & B2B",
};

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹500", min: undefined, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "Over ₹5,000", min: 5000, max: undefined },
] as const;

type SortKey = "newest" | "price_asc" | "price_desc" | "name_asc";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

function sortKeyToParams(k: SortKey) {
  switch (k) {
    case "price_asc": return { sortBy: "price", order: "asc" as const };
    case "price_desc": return { sortBy: "price", order: "desc" as const };
    case "name_asc": return { sortBy: "title", order: "asc" as const };
    default: return { sortBy: "createdAt", order: "desc" as const };
  }
}

export default function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sellerId = use(params).id as string;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortParams = sortKeyToParams(sortKey);
  const priceRange = PRICE_RANGES[priceRangeIdx];

  const { data: sellerRes, isLoading: sellerLoading, isError: sellerError, error: sellerErr } = useQuery({
    queryKey: ["web", "seller", sellerId],
    queryFn: () => fetchSellerById(sellerId),
    enabled: !!sellerId,
  });

  const seller = sellerRes?.data;

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
  } = useInfiniteQuery({
    queryKey: ["web", "products", "vendor", sellerId, categoryFilter, sortParams.sortBy, sortParams.order],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchProducts({
        page: pageParam,
        limit: LIMIT,
        vendorId: sellerId,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        sortBy: sortParams.sortBy,
        order: sortParams.order,
      });
      return {
        data: (res.data ?? []) as ApiProduct[],
        meta: res.meta,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta || meta.page >= meta.totalPages) return undefined;
      return meta.page + 1;
    },
    enabled: !!sellerId,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = productsData?.pages.flatMap((p) => p.data) ?? [];

  // Client-side price + search filter
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const productPrice =
        typeof p.price === "object" && p.price !== null
          ? Number((p.price as { sellingPrice?: number }).sellingPrice ?? 0)
          : typeof p.defaultPrice === "number"
          ? p.defaultPrice
          : Number(p.defaultPrice ?? 0);
      const inPriceRange =
        (priceRange.min == null || productPrice >= priceRange.min) &&
        (priceRange.max == null || productPrice <= priceRange.max);
      const matchesSearch =
        !search ||
        (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (typeof p.categoryId === "object" && p.categoryId?.name
          ? p.categoryId.name.toLowerCase().includes(search.toLowerCase())
          : false);
      return inPriceRange && matchesSearch;
    });
  }, [allProducts, priceRange, search]);

  const displayProducts = useMemo(() => filteredProducts.map(mapApiProductToDisplay), [filteredProducts]);

  const hasActiveFilters = categoryFilter !== "all" || priceRangeIdx !== 0 || !!search;

  const clearFilters = () => {
    setCategoryFilter("all");
    setPriceRangeIdx(0);
    setSearch("");
  };

  if (sellerError || !sellerId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-destructive mb-4">
          {sellerError ? (sellerErr as Error).message : "Invalid seller."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  if (sellerLoading || !seller) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/products"><ChevronLeft className="mr-2 h-4 w-4" /> Back to products</Link>
          </Button>
        </div>
        <div className="animate-pulse rounded-xl bg-muted/50 h-52 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/products"><ChevronLeft className="mr-2 h-4 w-4" /> Back to products</Link>
        </Button>
      </div>

      {/* ── Seller profile banner ──────────────────────────────── */}
      <header className="rounded-2xl border border-border bg-card overflow-hidden mb-8 shadow-sm">
        {/* Top band */}
        <div className="h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="px-6 md:px-8 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo / avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-primary/10 text-primary overflow-hidden shadow">
              {seller.logo ? (
                <Image src={seller.logo} alt={`${seller.name} logo`} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-10 w-10" />
              )}
            </div>

            {/* Name & badges */}
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{seller.name}</h1>
                {seller.eligibility && seller.eligibility !== "b2c" && (
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-semibold">
                    {ELIGIBILITY_LABELS[seller.eligibility] ?? seller.eligibility}
                  </span>
                )}
              </div>
              {/* Vendor badges */}
              {seller.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {seller.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGE_STYLES[badge] ?? "bg-muted text-muted-foreground border-border"}`}
                    >
                      {BADGE_LABELS[badge] ?? badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {seller.description && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{seller.description}</p>
          )}

          {/* Stats + website row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="font-medium text-foreground">{seller.productCount}</span> product{seller.productCount !== 1 ? "s" : ""}
            </span>
            {seller.categories?.length > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <LayoutGrid className="h-4 w-4" />
                <span className="font-medium text-foreground">{seller.categories.length}</span> categor{seller.categories.length !== 1 ? "ies" : "y"}
              </span>
            )}
            {seller.website && (
              <a
                href={seller.website.startsWith("http") ? seller.website : `https://${seller.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline underline-offset-2"
              >
                <Globe className="h-4 w-4" />
                {seller.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Filter / sort toolbar ──────────────────────────────── */}
      <div className="mb-6 space-y-3">
        {/* Top row: search + sort + filter toggle */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search in this store…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={filtersOpen ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Expanded filter row: price range */}
        {filtersOpen && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPriceRangeIdx(i)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      priceRangeIdx === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category pills */}
        {seller.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              All
            </button>
            {seller.categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setCategoryFilter(cat._id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  categoryFilter === cat._id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Products grid ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Products from this seller
          </h2>
          {!productsLoading && (
            <p className="text-sm text-muted-foreground">{displayProducts.length} shown</p>
          )}
        </div>

        {productsLoading && displayProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} className="w-full" />
              ))}
            </div>
            <div ref={loadMoreRef} className="h-12 my-4 flex items-center justify-center">
              {isFetchingNextPage && (
                <span className="text-sm text-muted-foreground">Loading more…</span>
              )}
            </div>
            {!hasNextPage && displayProducts.length > 0 && (
              <p className="text-center text-muted-foreground mt-4 pb-8 text-sm">
                You&apos;ve seen all products from this seller
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {hasActiveFilters ? "No products match the selected filters." : "No products listed yet."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            ) : (
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Browse all products</Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
