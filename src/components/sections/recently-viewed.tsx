"use client";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { ProductCard } from "@/components/card/product-card";
import { useEffect, useState } from "react";

const PLACEHOLDER = "https://picsum.photos/seed/gift/400/400";

export function RecentlyViewedProducts() {
    const { items } = useRecentlyViewed();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || items.length === 0) return null;

    return (
        <section className="py-10 sm:py-14 mt-8 sm:mt-12 bg-muted/10 border-t">
            <div className="container mx-auto px-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Recently Viewed</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {items.map((item) => (
                        <ProductCard
                            key={item.id}
                            product={{
                                id: item.id,
                                title: item.title,
                                price: item.price,
                                mrp: item.mrp,
                                discountPercentage: item.discountPercentage ?? 0,
                                rating: item.rating ?? 0,
                                reviewCount: item.reviewCount ?? 0,
                                thumbnail:
                                    item.thumbnail &&
                                    item.thumbnail !== "PLACEHOLDER_IMAGE" &&
                                    item.thumbnail !== "undefined"
                                        ? item.thumbnail
                                        : PLACEHOLDER,
                                slug: item.slug,
                                availabilityStatus: "in_stock",
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
