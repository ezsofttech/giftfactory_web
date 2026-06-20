// app/products/search/page.tsx
"use client";

import { ProductCard } from "@/components/card/main-product-card";
import { ProductCardSkeleton } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts as apiFetchProducts, fetchCategories } from "@/lib/api";
import { FilterIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

// Fetch searched products with pagination using backend API
async function fetchSearchedProducts(page: number, query: string) {
  const limit = 12;
  const res = await apiFetchProducts({ page, limit, search: query });
  return { products: res.data ?? [], skip: (page - 1) * limit };
}

// Fetch all product categories from backend
async function fetchAllCategories() {
  const res = await fetchCategories();
  return res.data ?? [];
}

export default function ProductSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const searchQuery = use(searchParams).q || "";
  const [sortBy, setSortBy] = useState<string>("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  const { data: categories } = useInfiniteQuery({
    queryKey: ["categories"],
    queryFn: () => fetchAllCategories(),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });

  // Fetch searched products with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["searched-products", searchQuery, sortBy, order, categoryFilter],
    queryFn: async ({ pageParam = 1 }) => {
      // If category filter is applied, use the products API with category
      if (categoryFilter && categoryFilter !== "all") {
        const res = await apiFetchProducts({ page: pageParam, limit: 12, sortBy, order, categoryId: categoryFilter });
        return { products: res.data ?? [], skip: (pageParam - 1) * 12 };
      }
      // Otherwise use the search endpoint
      return fetchSearchedProducts(pageParam, searchQuery);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const products = lastPage.products ?? [];
      if (products.length < 12) return undefined;
      return (lastPage.skip || 0) / 12 + 2;
    },
    enabled: !!searchQuery, // Only fetch if searchQuery exists
  });

  // Local helper no longer required — backend apiFetchProducts is used

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchQuery]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Filter Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden fixed bottom-4 right-4 z-10">
          <Button size="icon" className="rounded-full shadow-lg">
            <FilterIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] px-3">
          <SheetTitle>Filter</SheetTitle>
          <FilterSidebar
            sortBy={sortBy}
            order={order}
            onSortChange={setSortBy}
            onOrderChange={setOrder}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories?.pages[0] || []}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:block w-64 p-4 border-r">
        <FilterSidebar
          sortBy={sortBy}
          order={order}
          onSortChange={setSortBy}
          onOrderChange={setOrder}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories?.pages[0] || []}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Search Results for "{searchQuery}"
          </h1>
          <div className="md:hidden">
            <Select
              value={`${sortBy}-${order}`}
              onValueChange={(value) => {
                const [newSortBy, newOrder] = value.split("-") as [
                  string,
                  "asc" | "desc"
                ];
                setSortBy(newSortBy);
                setOrder(newOrder);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.pages.map((page, pageIndex) => (
            <div key={pageIndex} className="contents">
              {page.products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="w-full"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Infinite scroll loader */}
        <div
          ref={loadMoreRef}
          className="h-10 my-4 flex items-center justify-center"
        >
          {/* {isFetchingNextPage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from(Array(8)).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          )} */}
        </div>

        {!hasNextPage && data?.pages.length && (
          <p className="text-center text-gray-500 mt-4">
            You've reached the end of products
          </p>
        )}
      </main>
    </div>
  );
}

// Reuse the same FilterSidebar component from your original file
function FilterSidebar({
  sortBy,
  order,
  onSortChange,
  onOrderChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
}: {
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (value: string) => void;
  onOrderChange: (value: "asc" | "desc") => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: any[];
}) {
  return (
    <div className="space-y-6 sticky top-44">
      <div>
        <h3 className="font-medium mb-2">Sort By</h3>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-medium mb-2">Order</h3>
        <Select value={order} onValueChange={onOrderChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-medium mb-2">Category</h3>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
