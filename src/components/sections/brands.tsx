"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/api";
import { type ApiBrand, getValidImageUrl } from "@/types/api";
import Link from "next/link";

export function BrandsCarousel() {
  const { data: res, isLoading } = useQuery({
    queryKey: ["web", "brands"],
    queryFn: fetchBrands,
  });
  const brands = (res?.data ?? []) as ApiBrand[];

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-8 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 bg-white p-4 rounded-lg shadow-sm h-20 w-24 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!brands.length) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto gap-8 py-4 scrollbar-hide">
          {brands.map((brand) => {
            const rawLogo = brand.imageUrl ?? brand.icon?.secure_url ?? brand.logoUrl;
            const logo = rawLogo ? getValidImageUrl(rawLogo) : null;
            return (
              <Link
                key={brand._id}
                href={`/products?brandId=${brand._id}`}
                className="flex-shrink-0 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={brand.name}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
