import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { mockProducts } from "@/lib/mock";
import { ProductCard } from "@/components/card/main-product-card";
import type { ProductDisplay } from "@/types/api";

interface RelatedProductsProps {
  category: string;
}

export function RelatedProducts({ category }: RelatedProductsProps) {
  const relatedProducts: ProductDisplay[] = mockProducts
    .filter((p) => p.category === category)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description,
      price: p.price,
      mrp: undefined,
      discountPercentage: 0,
      rating: p.rating,
      thumbnail: p.thumbnail ?? p.images?.[0] ?? "https://picsum.photos/seed/gift/400/400",
      images: p.images,
      category: p.category,
      brand: p.brand,
      slug: p.slug,
      availabilityStatus: p.stock > 0 ? "in_stock" : "out_of_stock",
      stock: p.stock,
    }));

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You may also like</h2>
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {relatedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </section>
  );
}
