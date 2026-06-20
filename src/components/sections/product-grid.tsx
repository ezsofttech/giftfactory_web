import { mockProducts } from "@/lib/mock";
import { ProductCard } from "@/components/card/main-product-card";
import type { ProductDisplay } from "@/types/api";

export function ProductGrid() {
  const products: ProductDisplay[] = mockProducts.map((p) => ({
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
